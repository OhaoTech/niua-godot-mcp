import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Agents forget diet controls and then dump a whole editor/runtime tree into
// context. Omitted maxDepth now means a shallow read; 0 still means the full
// tree (up to the probe/editor cap).
export const DEFAULT_TREE_MAX_DEPTH = 2;

export const SAVE_JSON_PATH_PROPERTY = {
  savePath: {
    type: "string",
    description: "Write the full JSON payload to this filesystem path and return a compact summary (savedPath + savedBytes + root/currentScene). Use when you need the complete tree later without paying for it in context."
  }
};

export function resolveTreeMaxDepth(maxDepth) {
  if (maxDepth === undefined || maxDepth === null || maxDepth === "") {
    return DEFAULT_TREE_MAX_DEPTH;
  }
  const numeric = Number(maxDepth);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_TREE_MAX_DEPTH;
  }
  return numeric;
}

export async function persistJsonResult(result, savePath, summarize) {
  if (!savePath || !result || result.ok === false || !result.data) {
    return result;
  }

  const resolved = path.resolve(String(savePath));
  const serialized = JSON.stringify(result.data);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${serialized}\n`, "utf8");

  const summary = typeof summarize === "function" ? summarize(result.data) : {};
  result.data = {
    ...summary,
    savedPath: resolved,
    savedBytes: Buffer.byteLength(serialized)
  };
  return result;
}

export function dietRuntimeStateResult(result) {
  if (!result?.data || result.ok === false) {
    return result;
  }

  // Events have their own tool. Duplicating the log on every snapshot is the
  // single biggest runtime-probe tax after an unbounded tree.
  if ("events" in result.data) {
    delete result.data.events;
  }
  if (Array.isArray(result.data.sessions)) {
    result.data.sessions = result.data.sessions.map(compactRuntimeSession);
    result.data.nodeCount = countRuntimeStateNodes(result.data);
  }
  return result;
}

export function compactRuntimeSession(session) {
  if (!session || typeof session !== "object") {
    return session;
  }
  const compact = {
    id: session.id,
    active: session.active,
    debuggable: session.debuggable,
    breaked: session.breaked,
    hasRuntimeState: Boolean(session.hasRuntimeState || session.runtimeState)
  };
  if (session.runtimeState) {
    compact.runtimeState = session.runtimeState;
  }
  return compact;
}

export function countTreeNodes(node) {
  if (!node || typeof node !== "object") {
    return 0;
  }
  const children = Array.isArray(node.children) ? node.children : [];
  return 1 + children.reduce((sum, child) => sum + countTreeNodes(child), 0);
}

export function countRuntimeStateNodes(data = {}) {
  if (typeof data.nodeCount === "number" && Number.isFinite(data.nodeCount)) {
    return data.nodeCount;
  }
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  return sessions.reduce((sum, session) => sum + countTreeNodes(session?.runtimeState?.root), 0);
}

export function summarizeRuntimeState(data = {}) {
  const session = Array.isArray(data.sessions) ? data.sessions[0] : null;
  const runtimeState = session?.runtimeState ?? {};
  const root = runtimeState.root ?? null;
  return {
    available: data.available,
    requestId: data.requestId,
    pending: data.pending,
    sessionCount: data.sessionCount ?? (Array.isArray(data.sessions) ? data.sessions.length : 0),
    nodeCount: countRuntimeStateNodes(data),
    currentScene: runtimeState.currentScene ?? "",
    root: root
      ? {
          name: root.name,
          path: root.path,
          type: root.type,
          childCount: root.childCount ?? (Array.isArray(root.children) ? root.children.length : 0),
          childrenTruncated: root.childrenTruncated
        }
      : null
  };
}

export function summarizeSceneTree(data = {}) {
  const root = data.root ?? null;
  return {
    currentScene: data.currentScene ?? "",
    root: root
      ? {
          name: root.name,
          path: root.path,
          type: root.type,
          childCount: root.childCount ?? (Array.isArray(root.children) ? root.children.length : 0),
          childrenTruncated: root.childrenTruncated
        }
      : null
  };
}

export function compactRuntimePropertyList(result, { properties, verbose } = {}) {
  const filtered = filterRuntimePropertyAllowlist(result, properties);
  if (verbose || !filtered?.data) {
    return filtered;
  }

  const responses = filtered.data.responses;
  if (!Array.isArray(responses)) {
    return filtered;
  }

  for (const response of responses) {
    if (!response || !Array.isArray(response.properties)) {
      continue;
    }
    response.properties = response.properties.map((property) => ({
      name: property.name,
      type: property.type,
      value: property.value
    }));
  }
  return filtered;
}

export function filterRuntimePropertyAllowlist(result, properties) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return result;
  }

  const allow = new Set(properties.map((name) => String(name)));
  const responses = result?.data?.responses;
  if (!Array.isArray(responses)) {
    return result;
  }

  for (const response of responses) {
    if (!response || !Array.isArray(response.properties)) {
      continue;
    }
    const total = Number.isFinite(response.propertyCount)
      ? response.propertyCount
      : response.properties.length;
    response.properties = response.properties.filter(
      (property) => property && allow.has(property.name)
    );
    response.propertyCount = response.properties.length;
    response.totalPropertyCount = total;
  }

  return result;
}

export function omitInlineScreenshotPayload(result) {
  if (!result?.data || result.ok === false) {
    return result;
  }

  if (isInlineImage(result.data)) {
    omitOneImage(result.data);
  }
  if (Array.isArray(result.data.responses)) {
    for (const response of result.data.responses) {
      if (isInlineImage(response)) {
        omitOneImage(response);
      }
    }
  }
  return result;
}

function isInlineImage(candidate) {
  return Boolean(
    candidate &&
    candidate.available !== false &&
    typeof candidate.data === "string" &&
    candidate.data.length > 0
  );
}

function omitOneImage(payload) {
  const bytes = Buffer.byteLength(payload.data, "base64");
  payload.data = "";
  payload.omitted = true;
  payload.omittedBytes = bytes;
  payload.hint = "pass savePath to write the PNG to disk, or includePayload:true for inline base64";
}
