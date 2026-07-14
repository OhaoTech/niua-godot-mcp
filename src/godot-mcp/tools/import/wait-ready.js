import { pickBridgeConnectionArgs } from "../../server/context.js";

/**
 * Poll until a res:// asset appears in import listing / metadata, or timeout.
 * Kills the classic "write file then immediately use" race.
 */
export function createWaitForImportedAsset({ callTool }) {
  return async function waitForImportedAsset(args = {}) {
    const connection = pickBridgeConnectionArgs(args);
    const assetPath = String(args.path ?? args.assetPath ?? "").trim();
    if (!assetPath) {
      return {
        ok: false,
        errorCode: "bad_request",
        error: "path is required (res://… asset to wait for)",
        recovery: { tool: "list_imported_assets", hint: "pass path: \"res://assets/foo.glb\"" }
      };
    }

    const timeoutMs = clamp(args.timeoutMs, 30_000, 500, 180_000);
    const pollMs = clamp(args.pollMs, 400, 100, 5_000);
    const started = Date.now();
    const attempts = [];

    while (Date.now() - started < timeoutMs) {
      const meta = await safeCall(callTool, "get_import_metadata", { ...connection, path: assetPath });
      if (meta.ok) {
        return {
          ok: true,
          data: {
            path: assetPath,
            ready: true,
            waitedMs: Date.now() - started,
            attempts: attempts.length + 1,
            metadata: meta.data ?? null
          }
        };
      }

      const listed = await safeCall(callTool, "list_imported_assets", {
        ...connection,
        path: parentResPath(assetPath),
        recursive: true
      });
      attempts.push({
        t: Date.now() - started,
        metadataOk: meta.ok,
        listOk: listed.ok
      });

      if (listed.ok && assetListed(listed.data, assetPath)) {
        return {
          ok: true,
          data: {
            path: assetPath,
            ready: true,
            waitedMs: Date.now() - started,
            attempts: attempts.length,
            via: "list_imported_assets"
          }
        };
      }

      await sleep(pollMs);
    }

    return {
      ok: false,
      errorCode: "timeout",
      error: `import not ready for ${assetPath} after ${timeoutMs}ms`,
      recovery: {
        tool: "import_project_assets",
        hint: "run import_project_assets or reimport_assets, then wait_for_imported_asset again"
      },
      data: { path: assetPath, attempts: attempts.length, waitedMs: Date.now() - started }
    };
  };
}

function assetListed(data, assetPath) {
  const items = data?.assets ?? data?.files ?? data?.items ?? [];
  if (!Array.isArray(items)) return false;
  const want = assetPath.replace(/\/+$/, "");
  return items.some((item) => {
    const p = String(item?.path ?? item?.file ?? item ?? "");
    return p === want || p.endsWith(want.replace(/^res:\/\//, ""));
  });
}

function parentResPath(assetPath) {
  const cleaned = assetPath.replace(/\/+$/, "");
  const idx = cleaned.lastIndexOf("/");
  if (idx <= "res://".length - 1) return "res://";
  return cleaned.slice(0, idx) || "res://";
}

async function safeCall(callTool, name, args) {
  try {
    const raw = await callTool(name, args);
    if (raw && Array.isArray(raw.content) && raw.content[0]?.text) {
      return JSON.parse(String(raw.content[0].text).trim());
    }
    return raw && typeof raw === "object" ? raw : { ok: true, data: raw };
  } catch (error) {
    return { ok: false, error: error?.message ?? String(error) };
  }
}

function clamp(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
