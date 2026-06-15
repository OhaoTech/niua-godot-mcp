#!/usr/bin/env node
import { spawn } from "node:child_process";
import { realpathSync } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  DEFAULT_TOOL_PROFILE,
  TOOL_PROFILE_ENV_VAR,
  resolveToolProfile
} from "./server/tool-profiles.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const addonRoot = path.join(repoRoot, "godot/addons/niua_mcp");

export async function runDoctor(options = {}) {
  const checks = [];
  const add = (name, status, summary, details = {}) => {
    checks.push({ name, status, summary, details });
  };

  checkNodeVersion(add);
  checkToolProfile(add, options.profile);
  await checkGodotBinary(add, options);
  await checkAddonFiles(add);
  await checkProjectRoot(add, options);
  await checkBridge(add, options);

  const failed = checks.filter((check) => check.status === "fail").length;
  const warned = checks.filter((check) => check.status === "warn").length;
  return {
    ok: failed === 0,
    failed,
    warned,
    checks
  };
}

function checkNodeVersion(add) {
  const major = Number(process.versions.node.split(".")[0]);
  if (major >= 20) {
    add("node", "pass", `Node ${process.versions.node}`);
    return;
  }
  add("node", "fail", `Node ${process.versions.node} is unsupported`, {
    required: ">=20"
  });
}

function checkToolProfile(add, explicitProfile) {
  const rawProfile = explicitProfile ?? process.env[TOOL_PROFILE_ENV_VAR] ?? DEFAULT_TOOL_PROFILE;
  try {
    const profile = resolveToolProfile(rawProfile);
    add("profile", "pass", `${TOOL_PROFILE_ENV_VAR}=${profile}`, {
      defaultProfile: DEFAULT_TOOL_PROFILE
    });
  } catch (error) {
    add("profile", "fail", error.message, {
      value: rawProfile
    });
  }
}

async function checkGodotBinary(add, options) {
  const godotBin = options.godotBin ?? process.env.GODOT_BIN ?? "godot";
  const timeoutMs = Number(options.timeoutMs ?? 5000);
  const result = await runCommand(godotBin, ["--version"], timeoutMs);
  if (result.ok) {
    add("godot", "pass", result.stdout.trim() || `${godotBin} --version succeeded`, {
      command: godotBin
    });
    return;
  }
  add("godot", "fail", `Could not run ${godotBin} --version: ${result.error}`, {
    command: godotBin,
    stderr: result.stderr
  });
}

async function checkAddonFiles(add) {
  const required = [
    "plugin.cfg",
    "niua_mcp_plugin.gd",
    "niua_mcp_bridge.gd"
  ];
  const missing = [];
  for (const file of required) {
    const filePath = path.join(addonRoot, file);
    try {
      await access(filePath);
    } catch {
      missing.push(file);
    }
  }

  if (missing.length === 0) {
    add("addon", "pass", "Bundled Godot addon files are present", {
      addonRoot
    });
    return;
  }
  add("addon", "fail", `Missing bundled addon files: ${missing.join(", ")}`, {
    addonRoot,
    missing
  });
}

async function checkProjectRoot(add, options) {
  const projectRoot = options.projectRoot;
  const allowedRoots = parsePathList(
    options.allowedRoots ?? process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS ?? ""
  );

  if (!projectRoot) {
    add("project", "skip", "No --project provided; project file check skipped", {
      allowedRoots: allowedRoots.length > 0 ? allowedRoots : [path.join(repoRoot, "runs")]
    });
    return;
  }

  const resolvedProjectRoot = path.resolve(projectRoot);
  const projectFile = path.join(resolvedProjectRoot, "project.godot");
  try {
    await stat(projectFile);
  } catch {
    add("project", "fail", `Missing Godot project file: ${projectFile}`, {
      projectRoot: resolvedProjectRoot
    });
    return;
  }

  if (allowedRoots.length > 0 && !isInsideAnyRoot(resolvedProjectRoot, allowedRoots)) {
    add("project", "fail", "Project is outside GODOT_MCP_ALLOWED_PROJECT_ROOTS", {
      projectRoot: resolvedProjectRoot,
      allowedRoots
    });
    return;
  }

  let projectName = path.basename(resolvedProjectRoot);
  try {
    const text = await readFile(projectFile, "utf8");
    const match = /^config\/name=(.+)$/m.exec(text);
    if (match) {
      projectName = match[1].replace(/^"|"$/g, "");
    }
  } catch {
    // The stat check already proved the project file exists.
  }

  add("project", "pass", `Project file found: ${projectName}`, {
    projectRoot: resolvedProjectRoot,
    allowedRoots
  });
}

async function checkBridge(add, options) {
  const rawPort = options.port ?? process.env.GODOT_MCP_PORT ?? process.env.NIUA_MCP_PORT;
  if (!rawPort) {
    add("bridge", "skip", "No bridge port provided; reachability check skipped");
    return;
  }

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    add("bridge", "fail", `Invalid bridge port: ${rawPort}`);
    return;
  }

  const host = options.host ?? process.env.GODOT_MCP_HOST ?? "127.0.0.1";
  const token = options.token ?? process.env.NIUA_MCP_TOKEN ?? process.env.GODOT_MCP_TOKEN;
  const timeoutMs = Number(options.timeoutMs ?? 5000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`http://${host}:${port}/health`, {
      headers: token ? { "X-NIUA-MCP-Token": token } : {},
      signal: controller.signal
    });
    const text = await response.text();
    if (!response.ok) {
      add("bridge", "fail", `Bridge health returned HTTP ${response.status}`, {
        host,
        port,
        body: text
      });
      return;
    }
    add("bridge", "pass", `Bridge reachable at ${host}:${port}`, {
      host,
      port,
      authenticated: Boolean(token)
    });
  } catch (error) {
    add("bridge", "fail", `Bridge is not reachable at ${host}:${port}: ${error.message}`, {
      host,
      port
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parsePathList(value) {
  return String(value)
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => path.resolve(entry));
}

function isInsideAnyRoot(target, roots) {
  return roots.some((root) => {
    const relative = path.relative(root, target);
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
  });
}

function runCommand(command, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      settled = true;
      child.kill("SIGTERM");
      resolve({
        ok: false,
        stdout,
        stderr,
        error: `timed out after ${timeoutMs}ms`
      });
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve({
        ok: false,
        stdout,
        stderr,
        error: error.message
      });
    });
    child.once("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve({
        ok: code === 0,
        stdout,
        stderr,
        error: code === 0 ? "" : `exited with code ${code}`
      });
    });
  });
}

export function formatDoctorReport(report) {
  const lines = [
    `NIUA Godot MCP doctor: ${report.ok ? "ok" : "failed"} (${report.failed} failed, ${report.warned} warnings)`
  ];
  for (const check of report.checks) {
    lines.push(`${check.status.toUpperCase().padEnd(4)} ${check.name}: ${check.summary}`);
  }
  return `${lines.join("\n")}\n`;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--project") {
      index += 1;
      options.projectRoot = argv[index];
      continue;
    }
    if (arg === "--port") {
      index += 1;
      options.port = argv[index];
      continue;
    }
    if (arg === "--host") {
      index += 1;
      options.host = argv[index];
      continue;
    }
    if (arg === "--token") {
      index += 1;
      options.token = argv[index];
      continue;
    }
    if (arg === "--godot-bin") {
      index += 1;
      options.godotBin = argv[index];
      continue;
    }
    if (arg === "--profile") {
      index += 1;
      options.profile = argv[index];
      continue;
    }
    if (arg === "--timeout-ms") {
      index += 1;
      options.timeoutMs = Number(argv[index]);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function usage() {
  return `Usage: niua-godot-mcp-doctor [options]

Options:
  --project <path>      Check a Godot project root
  --port <port>         Check a running NIUA bridge health endpoint
  --host <host>         Bridge host, default 127.0.0.1
  --token <token>       Bridge auth token for /health
  --godot-bin <path>    Godot executable, default GODOT_BIN or godot
  --profile <name>      Tool profile, v1 or full
  --timeout-ms <ms>     Per-check timeout, default 5000
  --json                Print JSON
`;
}

async function main(argv) {
  const options = parseArgs(argv);
  if (options.help) {
    process.stdout.write(usage());
    return;
  }

  const report = await runDoctor(options);
  process.stdout.write(options.json
    ? `${JSON.stringify(report, null, 2)}\n`
    : formatDoctorReport(report));
  process.exitCode = report.ok ? 0 : 1;
}

function isDirectRun() {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  }
}

if (isDirectRun()) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
