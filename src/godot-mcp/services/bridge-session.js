/**
 * Local bridge session file — friction-free handoff between MCP server and SDK.
 *
 * Written when open_project brings up the editor. SDK / other local tools read it
 * so users never set GODOT_MCP_TOKEN by hand on the happy path.
 *
 * Lives under <project>/.godot/ (Godot's local cache; not for git).
 */
import { chmodSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import path from "node:path";

export const BRIDGE_SESSION_SCHEMA_VERSION = 1;
export const BRIDGE_SESSION_RELATIVE_PATH = path.join(".godot", "niua_mcp_bridge.json");

export function bridgeSessionPath(projectRoot) {
  const root = String(projectRoot ?? "").trim();
  if (!root) return null;
  return path.join(path.resolve(root), BRIDGE_SESSION_RELATIVE_PATH);
}

/**
 * @returns {{ schemaVersion: number, host: string, port: number, token: string|null, projectRoot: string, updatedAt: string } | null}
 */
export function loadBridgeSession(projectRoot) {
  const filePath = bridgeSessionPath(projectRoot);
  if (!filePath || !existsSync(filePath)) return null;

  try {
    const raw = JSON.parse(readFileSync(filePath, "utf8"));
    if (!raw || typeof raw !== "object") return null;
    const host = String(raw.host ?? "127.0.0.1").trim() || "127.0.0.1";
    const port = Number(raw.port);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) return null;
    const token = raw.token == null || raw.token === "" ? null : String(raw.token);
    return {
      schemaVersion: Number(raw.schemaVersion) || BRIDGE_SESSION_SCHEMA_VERSION,
      host,
      port,
      token,
      projectRoot: String(raw.projectRoot ?? path.resolve(projectRoot)),
      updatedAt: String(raw.updatedAt ?? "")
    };
  } catch {
    return null;
  }
}

/**
 * Persist session for local tools (SDK). Best-effort; never throws to callers of open_project.
 */
export function writeBridgeSession(projectRoot, { host, port, token } = {}) {
  const filePath = bridgeSessionPath(projectRoot);
  if (!filePath) return null;

  const dir = path.dirname(filePath);
  mkdirSync(dir, { recursive: true });

  const payload = {
    schemaVersion: BRIDGE_SESSION_SCHEMA_VERSION,
    host: String(host ?? "127.0.0.1"),
    port: Number(port),
    token: token == null || token === "" ? null : String(token),
    projectRoot: path.resolve(projectRoot),
    updatedAt: new Date().toISOString()
  };

  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  try {
    chmodSync(filePath, 0o600);
  } catch {
    // Windows or restricted FS — ignore
  }
  return filePath;
}

export function clearBridgeSession(projectRoot) {
  const filePath = bridgeSessionPath(projectRoot);
  if (!filePath || !existsSync(filePath)) return false;
  try {
    unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}
