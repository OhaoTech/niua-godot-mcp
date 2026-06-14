import { spawn } from "node:child_process";

export async function runMcpStdioSmoke({
  command,
  args = [],
  env = process.env,
  timeoutMs = 5000
}) {
  const child = spawn(command, args, {
    stdio: ["pipe", "pipe", "pipe"],
    env
  });
  let buffer = Buffer.alloc(0);
  let stderr = "";

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    child.stdin.write(frame({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "niua-godot-mcp-setup",
          version: "0"
        }
      }
    }));
    const init = await readFrame(child, () => buffer, (next) => {
      buffer = next;
    }, () => stderr, timeoutMs);

    child.stdin.write(frame({
      jsonrpc: "2.0",
      method: "notifications/initialized",
      params: {}
    }));
    child.stdin.write(frame({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    }));
    const tools = await readFrame(child, () => buffer, (next) => {
      buffer = next;
    }, () => stderr, timeoutMs);

    if (init.error) {
      throw new Error(`MCP initialize failed: ${init.error.message}`);
    }
    if (tools.error) {
      throw new Error(`MCP tools/list failed: ${tools.error.message}`);
    }

    return {
      ok: true,
      serverInfo: init.result?.serverInfo ?? {},
      protocolVersion: init.result?.protocolVersion ?? "",
      toolCount: tools.result?.tools?.length ?? 0
    };
  } finally {
    child.kill();
  }
}

function frame(message) {
  return `${JSON.stringify(message)}\n`;
}

function readFrame(child, getBuffer, setBuffer, getStderr, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.stdout.off("data", onData);
      reject(new Error(`Timed out waiting for MCP response. stderr=${getStderr()}`));
    }, timeoutMs);

    function onData(chunk) {
      const buffer = Buffer.concat([getBuffer(), chunk]);
      const newline = buffer.indexOf(0x0a);
      if (newline === -1) {
        setBuffer(buffer);
        return;
      }

      const line = buffer.subarray(0, newline).toString("utf8").trim();
      setBuffer(buffer.subarray(newline + 1));
      if (!line) {
        return;
      }

      clearTimeout(timer);
      child.stdout.off("data", onData);
      resolve(JSON.parse(line));
    }

    child.stdout.on("data", onData);
  });
}
