// src/godot-mcp/sdk/index.js
import { GODOT_MCP_TOOLS } from "../tools/index.js";
import { createDispatch } from "./dispatch.js";
import { buildNamespaces } from "./generated.js";
import { summarize } from "./summary.js";

// Attach to a running Godot editor bridge and get the `godot` API. Connection args
// (host/port/token/expectedProjectRoot) are merged into every tool call. `tools` is
// injectable for tests; defaults to the full raw registry (bypasses the profile gate).
export function connect(opts = {}) {
  const { tools = GODOT_MCP_TOOLS, host, port, token, expectedProjectRoot, timeoutMs, maxCalls } = opts;
  const conn = {};
  if (host !== undefined) conn.host = host;
  if (port !== undefined) conn.port = port;
  if (token !== undefined) conn.token = token;
  if (expectedProjectRoot !== undefined) conn.expectedProjectRoot = expectedProjectRoot;
  const call = createDispatch({ tools, conn, timeoutMs, maxCalls });
  const namespaces = buildNamespaces(call);
  return { ...namespaces, summarize };
}
