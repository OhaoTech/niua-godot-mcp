import { encodeResponse, toJsonRpcError } from "./json-rpc.js";
import { handleRequest as defaultHandleRequest } from "./request-handler.js";

export function startStdioServer({
  input = process.stdin,
  output = process.stdout,
  errorOutput = process.stderr,
  requestHandler = defaultHandleRequest
} = {}) {
  let buffer = Buffer.alloc(0);

  async function handleMessage(message) {
    if (message.id === undefined || message.id === null) {
      if (message.method !== "notifications/initialized") {
        try {
          await requestHandler(message);
        } catch (error) {
          errorOutput.write(`${error.message}\n`);
        }
      }
      return;
    }

    try {
      const result = await requestHandler(message);
      output.write(encodeResponse({
        jsonrpc: "2.0",
        id: message.id,
        result
      }));
    } catch (error) {
      output.write(encodeResponse(toJsonRpcError(message.id, error)));
    }
  }

  // MCP stdio transport is newline-delimited JSON: one message per line.
  // A single pipe chunk may carry several lines or a partial trailing line,
  // so drain every complete line and keep the remainder buffered.
  function parseFrames() {
    while (true) {
      const newline = buffer.indexOf(0x0a);
      if (newline === -1) {
        return;
      }

      const line = buffer.subarray(0, newline).toString("utf8").trim();
      buffer = buffer.subarray(newline + 1);
      if (!line) {
        continue;
      }

      let message;
      try {
        message = JSON.parse(line);
      } catch (error) {
        errorOutput.write(`Invalid MCP JSON line: ${error.message}\n`);
        continue;
      }

      void handleMessage(message);
    }
  }

  input.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    parseFrames();
  });

  input.resume();
}
