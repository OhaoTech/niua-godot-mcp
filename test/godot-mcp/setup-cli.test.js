import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const cliPath = path.resolve("src/godot-mcp/cli.js");

test("setup dry-run prints config without writing", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "niua-setup-cli-"));
  const configPath = path.join(root, "claude_desktop_config.json");
  const projectRoot = path.join(root, "projects");
  await mkdir(projectRoot);

  const result = await runCli([
    "setup",
    "--client",
    "claude",
    "--project-root",
    projectRoot,
    "--config-path",
    configPath,
    "--no-smoke"
  ]);

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /NIUA Godot MCP setup: dry-run/);
  assert.match(result.stdout, /No files written/);
  assert.match(result.stdout, /"niua-godot"/);
  await assert.rejects(() => stat(configPath), /ENOENT/);
});

test("setup write mode writes client config", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "niua-setup-cli-"));
  const configPath = path.join(root, "claude_desktop_config.json");
  const projectRoot = path.join(root, "projects");
  await mkdir(projectRoot);

  const result = await runCli([
    "setup",
    "--client",
    "claude",
    "--project-root",
    projectRoot,
    "--config-path",
    configPath,
    "--write",
    "--no-smoke"
  ]);

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /NIUA Godot MCP setup: wrote/);
  const parsed = JSON.parse(await readFile(configPath, "utf8"));
  assert.equal(parsed.mcpServers["niua-godot"].env.GODOT_MCP_ALLOWED_PROJECT_ROOTS, projectRoot);
});

test("cli without arguments still serves MCP over stdio", async () => {
  const child = spawn(process.execPath, [cliPath], {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      NIUA_MCP_PROFILE: "v1"
    }
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  child.stdin.write(frame({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "setup-cli-test", version: "0" }
    }
  }));
  const init = await readFrame(child, stderr);

  child.stdin.write(frame({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  }));
  const tools = await readFrame(child, stderr);
  child.kill();

  assert.equal(init.result.serverInfo.name, "niua-godot-mcp");
  assert.equal(tools.result.tools.length, 43);
});

function runCli(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

function frame(message) {
  return `${JSON.stringify(message)}\n`;
}

function readFrame(child, stderrText) {
  let buffer = Buffer.alloc(0);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out waiting for MCP frame. stderr=${stderrText}`)),
      3000
    );
    function onData(chunk) {
      buffer = Buffer.concat([buffer, chunk]);
      const newline = buffer.indexOf(0x0a);
      if (newline === -1) return;
      const line = buffer.subarray(0, newline).toString("utf8").trim();
      buffer = buffer.subarray(newline + 1);
      if (!line) return;
      child.stdout.off("data", onData);
      clearTimeout(timer);
      resolve(JSON.parse(line));
    }
    child.stdout.on("data", onData);
  });
}
