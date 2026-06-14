import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function encodeMessage(message) {
  return `${JSON.stringify(message)}\n`;
}

export async function withBridgeServer(handler, run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    await run(port);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

export function createMcpProcess(env = {}) {
  const child = spawn(process.execPath, ["src/godot-mcp/server.js"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      GODOT_MCP_GODOT_VERSION: "Godot Engine 4.6.2.test",
      // The suite exercises the whole catalog; profile-specific tests
      // override this (e.g. NIUA_MCP_PROFILE: "" for the v1 default).
      NIUA_MCP_PROFILE: "full",
      ...env
    },
    stdio: ["pipe", "pipe", "pipe"]
  });

  let id = 1;
  let buffer = Buffer.alloc(0);
  const responses = [];
  const waiters = [];
  let stderr = "";
  let closed = false;

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  child.stdout.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    parseFrames();
  });

  child.once("close", (code) => {
    closed = true;
    while (waiters.length > 0) {
      const waiter = waiters.shift();
      waiter.reject(new Error(`MCP process exited with ${code}; stderr: ${stderr}`));
    }
  });

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

      const response = JSON.parse(line);
      const waiter = waiters.shift();
      if (waiter) {
        waiter.resolve(response);
      } else {
        responses.push(response);
      }
    }
  }

  async function request(method, params = {}) {
    if (closed) {
      throw new Error(`MCP process already exited; stderr: ${stderr}`);
    }

    const requestId = id++;
    child.stdin.write(encodeMessage({
      jsonrpc: "2.0",
      id: requestId,
      method,
      params
    }));

    const response = responses.shift() ?? await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`timed out waiting for ${method}; stderr: ${stderr}`));
      }, 2000);

      waiters.push({
        resolve(value) {
          clearTimeout(timeout);
          resolve(value);
        },
        reject(error) {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });

    assert.equal(response.id, requestId);
    return response;
  }

  async function close() {
    if (closed) {
      return;
    }

    child.stdin.end();
    child.kill();
    await new Promise((resolve) => child.once("close", resolve));
  }

  return { child, request, close };
}

export async function createFakeGodotExecutable(root) {
  const fakeGodot = path.join(root, "fake-godot.mjs");
  const logPath = path.join(root, "fake-godot-log.jsonl");

  await writeFile(fakeGodot, `#!/usr/bin/env node
import { writeFileSync } from "node:fs";

writeFileSync(process.env.NIUA_FAKE_GODOT_LOG, JSON.stringify({
  pid: process.pid,
  argv: process.argv.slice(2),
  env: {
    NIUA_MCP_PORT: process.env.NIUA_MCP_PORT || "",
    GODOT_MCP_PORT: process.env.GODOT_MCP_PORT || "",
    NIUA_MCP_TOKEN: process.env.NIUA_MCP_TOKEN || "",
    GODOT_MCP_TOKEN: process.env.GODOT_MCP_TOKEN || ""
  }
}) + "\\n", { flag: "a" });

if (process.env.NIUA_FAKE_GODOT_STDOUT) {
  console.log(process.env.NIUA_FAKE_GODOT_STDOUT);
}

if (process.env.NIUA_FAKE_GODOT_STDERR) {
  console.error(process.env.NIUA_FAKE_GODOT_STDERR);
}

process.on("SIGTERM", () => process.exit(0));
setInterval(() => {}, 1000);
`, { mode: 0o755 });

  return { fakeGodot, logPath };
}

export async function createFakeGodotExporter(root) {
  const fakeGodot = path.join(root, "fake-godot-exporter.mjs");
  const logPath = path.join(root, "fake-godot-export-log.jsonl");

  await writeFile(fakeGodot, `#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const outputPath = argv.at(-1);
writeFileSync(process.env.NIUA_FAKE_GODOT_EXPORT_LOG, JSON.stringify({
  pid: process.pid,
  argv
}) + "\\n", { flag: "a" });

if (process.env.NIUA_FAKE_GODOT_EXPORT_PROGRESS) {
  console.log("EXPORT 10%");
  console.log("EXPORT 100%");
}

if (outputPath) {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, "fake exported artifact\\n");
}
`, { mode: 0o755 });

  return { fakeGodot, logPath };
}

export async function createFakeGodotScriptChecker(root) {
  const fakeGodot = path.join(root, "fake-godot-script-checker.mjs");
  const logPath = path.join(root, "fake-godot-script-checker-log.jsonl");

  await writeFile(fakeGodot, `#!/usr/bin/env node
import { writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
writeFileSync(process.env.NIUA_FAKE_GODOT_SCRIPT_CHECK_LOG, JSON.stringify({
  pid: process.pid,
  argv,
  cwd: process.cwd()
}) + "\\n", { flag: "a" });

process.stdout.write("Godot Engine v4.6.2.test - https://godotengine.org\\n\\n");
process.stderr.write('SCRIPT ERROR: Parse Error: Unexpected "Indent" in class body.\\n');
process.stderr.write("          at: GDScript::reload (res://scripts/player.gd:3)\\n");
process.stderr.write('ERROR: Failed to load script "res://scripts/player.gd" with error "Parse error".\\n');
process.stderr.write("   at: load (modules/gdscript/gdscript.cpp:2907)\\n");
process.exit(1);
`, { mode: 0o755 });

  return { fakeGodot, logPath };
}

export async function createFakeGodotProjectScriptChecker(root) {
  const fakeGodot = path.join(root, "fake-godot-project-script-checker.mjs");
  const logPath = path.join(root, "fake-godot-project-script-checker-log.jsonl");

  await writeFile(fakeGodot, `#!/usr/bin/env node
import { writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const scriptPath = argv.at(-1);
writeFileSync(process.env.NIUA_FAKE_GODOT_SCRIPT_CHECK_LOG, JSON.stringify({
  pid: process.pid,
  argv,
  cwd: process.cwd(),
  scriptPath
}) + "\\n", { flag: "a" });

process.stdout.write("Godot Engine v4.6.2.test - https://godotengine.org\\n\\n");
if (scriptPath.endsWith("enemy.gd")) {
  process.stderr.write('SCRIPT ERROR: Parse Error: Expected statement, found "Indent".\\n');
  process.stderr.write("          at: GDScript::reload (res://scripts/enemy.gd:4)\\n");
  process.exit(1);
}
process.exit(0);
`, { mode: 0o755 });

  return { fakeGodot, logPath };
}

export async function getFreeHttpPort() {
  const server = createServer((_req, res) => res.end("ok"));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

export async function waitForFileText(filePath, timeoutMs = 2000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (existsSync(filePath)) {
      const text = readFileSync(filePath, "utf8");
      if (text.trim()) {
        return text;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`timed out waiting for ${filePath}`);
}
