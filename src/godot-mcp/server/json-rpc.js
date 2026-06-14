// MCP stdio transport is newline-delimited JSON (NDJSON): one JSON-RPC
// message per line, terminated by "\n", with no Content-Length header.
export function encodeResponse(message) {
  return `${JSON.stringify(message)}\n`;
}

export function toJsonRpcError(id, error) {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: error.code ?? -32000,
      message: error.message ?? "Godot MCP server error"
    }
  };
}

