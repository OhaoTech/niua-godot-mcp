// src/godot-mcp/sdk/dispatch.js
import { assertAllowed } from "./guard.js";

// Bind tool handlers to a fixed connection. Stateless per call: merges connection
// args into the payload and awaits the raw handler (HTTP to the editor bridge).
// A total wall-clock budget and a max-calls counter bound a runaway script.
export function createDispatch({ tools, conn = {}, timeoutMs = 120000, maxCalls = 500 }) {
  const index = new Map(tools.map((t) => [t.name, t]));
  const started = Date.now();
  let count = 0;
  return async function call(name, args = {}) {
    assertAllowed(name);
    const tool = index.get(name);
    if (!tool || typeof tool.handler !== "function") {
      throw new Error(`Unknown tool: ${name}`);
    }
    if (++count > maxCalls) {
      throw new Error(`SDK max calls budget exceeded (${maxCalls})`);
    }
    if (Date.now() - started > timeoutMs) {
      throw new Error(`SDK time budget exceeded (${timeoutMs}ms)`);
    }
    return tool.handler({ ...conn, ...args });
  };
}
