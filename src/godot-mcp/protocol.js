import path from "node:path";

export function assertProjectPath(projectRoot, candidatePath) {
  if (!projectRoot || !candidatePath) {
    throw new Error("project root and candidate path are required");
  }

  const root = path.resolve(projectRoot);
  const candidate = path.resolve(candidatePath);
  const relative = path.relative(root, candidate);

  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return candidate;
  }

  throw new Error(`${candidatePath} is outside allowed project root ${projectRoot}`);
}

export function normalizeBridgeResponse(response) {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("bridge response must be an object");
  }

  if (response.ok === true) {
    return {
      ok: true,
      data: response.data ?? {}
    };
  }

  return {
    ok: false,
    error: String(response.error ?? response.message ?? "unknown bridge error"),
    data: response.data ?? null
  };
}

export function toolResult(value) {
  // Compact JSON on purpose: pretty-printing added ~37% whitespace to every
  // tool result, and callers are agents parsing JSON, not humans reading it.
  return {
    content: [
      {
        type: "text",
        text: `${JSON.stringify(value)}\n`
      }
    ]
  };
}
