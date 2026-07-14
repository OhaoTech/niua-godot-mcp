// src/godot-mcp/sdk/index.js
import { GODOT_MCP_TOOLS } from "../tools/index.js";
import { resolveBridgeConnection } from "../services/bridge-auth.js";
import { createDispatch } from "./dispatch.js";
import { buildNamespaces } from "./generated.js";
import { summarize } from "./summary.js";

/**
 * Attach to a running Godot editor bridge and get the `godot` API.
 *
 * Friction-free defaults (no token env required when open_project already ran):
 *   connect({ expectedProjectRoot: "/path/to/project" })
 *
 * Connection resolution order for host/port/token:
 *   explicit opts → project session file (.godot/niua_mcp_bridge.json) → env → defaults
 *
 * `tools` is injectable for tests; defaults to the full raw registry (bypasses profile gate).
 */
export function connect(opts = {}) {
  const {
    tools = GODOT_MCP_TOOLS,
    host,
    port,
    token,
    bridgeToken,
    expectedProjectRoot,
    projectRoot,
    timeoutMs,
    maxCalls
  } = opts;

  const resolved = resolveBridgeConnection({
    host,
    port,
    token: token ?? bridgeToken,
    bridgeToken,
    expectedProjectRoot: expectedProjectRoot ?? projectRoot,
    projectRoot: projectRoot ?? expectedProjectRoot
  });

  const conn = {
    host: resolved.host,
    port: resolved.port
  };
  if (resolved.token) conn.token = resolved.token;
  if (resolved.expectedProjectRoot) conn.expectedProjectRoot = resolved.expectedProjectRoot;

  const call = createDispatch({ tools, conn, timeoutMs, maxCalls });
  const namespaces = buildNamespaces(call);
  return {
    ...namespaces,
    summarize,
    /** @internal connection actually used (for debugging / tests) */
    connection: { ...conn, fromSession: resolved.fromSession }
  };
}

export { resolveBridgeConnection } from "../services/bridge-auth.js";
export { loadBridgeSession, writeBridgeSession, bridgeSessionPath } from "../services/bridge-session.js";
