import {
  findOpenProjectEntry,
  openProjectProcesses
} from "./process-store.js";

export function selectedProcessLogEntries(args = {}) {
  if (args.projectId || args.projectRoot) {
    const entry = findOpenProjectEntry(args);
    return entry ? [entry] : [];
  }

  return [...openProjectProcesses.values()];
}

export function serializeProjectProcessLogs(entry, maxLines) {
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
    bridge: entry.bridge,
    stdout: entry.stdout.slice(-maxLines),
    stderr: entry.stderr.slice(-maxLines),
    stdoutTotalLines: entry.stdoutTotalLines ?? entry.stdout.length,
    stderrTotalLines: entry.stderrTotalLines ?? entry.stderr.length
  };
}

export function clearProjectProcessLogs(entry) {
  entry.stdout.length = 0;
  entry.stderr.length = 0;
}

export function appendProcessOutput(entry, stream, chunk) {
  const lines = chunk.toString("utf8")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const totalKey = `${stream}TotalLines`;
  entry[totalKey] = (entry[totalKey] ?? 0) + lines.length;
  entry[stream].push(...lines);
  if (entry[stream].length > 100) {
    entry[stream].splice(0, entry[stream].length - 100);
  }
}
