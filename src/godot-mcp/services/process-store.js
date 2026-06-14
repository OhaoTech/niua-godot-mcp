import path from "node:path";

import { assertAllowedProjectRoot } from "./project-registry.js";

export const openProjectProcesses = new Map();

export function findOpenProjectEntry(args = {}) {
  const projectId = String(args.projectId ?? "").trim();
  if (projectId) {
    return openProjectProcesses.get(projectId) ?? null;
  }

  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectId or projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const matches = [...openProjectProcesses.values()].filter((entry) => (
    entry.projectRoot === projectRoot
  ));

  return matches.find((entry) => entry.status === "running")
    ?? matches.at(-1)
    ?? null;
}

export function findOpenProjectByBridge({
  host = "127.0.0.1",
  port
} = {}) {
  const requestedPort = Number(port);
  return [...openProjectProcesses.values()].find((entry) => (
    entry.status === "running"
    && entry.bridge?.host === host
    && Number(entry.bridge?.port) === requestedPort
  )) ?? null;
}

export function getRunningProjectByRoot(projectRoot) {
  return [...openProjectProcesses.values()].find((entry) => (
    entry.projectRoot === projectRoot && entry.status === "running"
  )) ?? null;
}

export function openProjectByRoot(projectRoot) {
  if (!projectRoot) {
    return null;
  }

  const resolvedProjectRoot = path.resolve(projectRoot);
  const entry = [...openProjectProcesses.values()].find((project) => (
    path.resolve(project.projectRoot) === resolvedProjectRoot
  ));

  return entry ? serializeProjectProcess(entry) : null;
}

export function serializeProjectProcess(entry) {
  let bridge = entry.bridge;
  if (entry.bridge) {
    const { token: _token, ...serializedBridge } = entry.bridge;
    bridge = {
      ...serializedBridge,
      tokenConfigured: Boolean(entry.bridgeToken)
    };
  }

  return {
    projectId: entry.projectId,
    projectRoot: entry.projectRoot,
    projectFile: entry.projectFile,
    pid: entry.pid,
    status: entry.status,
    startedAt: entry.startedAt,
    exitedAt: entry.exitedAt,
    exitCode: entry.exitCode,
    signal: entry.signal,
    godotBin: entry.godotBin,
    args: entry.args,
    headless: entry.headless,
    addonInstalled: entry.addonInstalled,
    pluginPath: entry.pluginPath,
    bridge,
    recentStdout: entry.stdout,
    recentStderr: entry.stderr
  };
}
