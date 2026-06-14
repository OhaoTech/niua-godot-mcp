import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

import {
  appendProcessOutput,
  openProjectProcesses,
  serializeProjectProcess,
  waitForChildSpawn
} from "../../../../services/process-manager.js";

export function createOpenProjectProcessEntry({
  args = {},
  projectRoot,
  projectFile,
  addon,
  bridgePort,
  bridgeToken,
  bridgeState
}) {
  const godotBin = process.env.GODOT_BIN ?? "godot";
  const headless = Boolean(args.headless ?? defaultHeadlessLaunch());
  const launchArgs = [
    ...(headless ? ["--headless"] : []),
    "--path",
    projectRoot,
    "--editor"
  ];
  const child = spawn(godotBin, launchArgs, {
    cwd: projectRoot,
    env: {
      ...process.env,
      NIUA_MCP_PORT: String(bridgePort),
      GODOT_MCP_PORT: String(bridgePort),
      NIUA_MCP_TOKEN: bridgeToken,
      GODOT_MCP_TOKEN: bridgeToken
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: false
  });
  const entry = {
    projectId: randomUUID(),
    projectRoot,
    projectFile,
    godotBin,
    args: launchArgs,
    headless,
    child,
    pid: child.pid ?? null,
    status: "running",
    startedAt: new Date().toISOString(),
    exitedAt: null,
    exitCode: null,
    signal: null,
    stdout: [],
    stderr: [],
    bridge: bridgeState,
    bridgeToken,
    addonInstalled: Boolean(addon),
    pluginPath: addon?.pluginPath ?? null
  };

  openProjectProcesses.set(entry.projectId, entry);
  attachOpenProjectProcessEvents(entry, child);
  return entry;
}

function defaultHeadlessLaunch() {
  const raw = process.env.GODOT_MCP_HEADLESS ?? process.env.NIUA_MCP_HEADLESS ?? "";
  return ["1", "true", "yes", "on"].includes(String(raw).toLowerCase());
}

export async function waitForOpenProjectProcessSpawn(entry) {
  try {
    await waitForChildSpawn(entry.child, 1000);
  } catch (error) {
    openProjectProcesses.delete(entry.projectId);
    throw new Error(`failed to launch Godot editor: ${error.message}`);
  }
}

export function serializeOpenProjectProcessEntry(entry) {
  return serializeProjectProcess(entry);
}

function attachOpenProjectProcessEvents(entry, child) {
  child.stdout?.on("data", (chunk) => appendProcessOutput(entry, "stdout", chunk));
  child.stderr?.on("data", (chunk) => appendProcessOutput(entry, "stderr", chunk));
  child.once("error", (error) => {
    entry.status = "error";
    entry.exitedAt = new Date().toISOString();
    entry.exitCode = null;
    entry.signal = null;
    appendProcessOutput(entry, "stderr", Buffer.from(error.message));
  });
  child.once("exit", (code, signal) => {
    entry.status = "exited";
    entry.exitedAt = new Date().toISOString();
    entry.exitCode = code;
    entry.signal = signal;
  });
}
