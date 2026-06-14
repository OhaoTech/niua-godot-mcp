import { spawn } from "node:child_process";

export function runGodotExportProcess(godotBin, exportArgs, {
  cwd,
  env = process.env,
  timeoutMs,
  outputEvents
}) {
  return new Promise((resolve, reject) => {
    const child = spawn(godotBin, exportArgs, {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
    const stdoutChunks = [];
    const stderrChunks = [];
    let settled = false;
    let timedOut = false;
    let timer = null;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };

    timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => {
      appendExportOutput(stdoutChunks, outputEvents, "stdout", chunk);
    });
    child.stderr?.on("data", (chunk) => {
      appendExportOutput(stderrChunks, outputEvents, "stderr", chunk);
    });
    child.once("error", (error) => {
      error.stdout = stdoutChunks.join("");
      error.stderr = stderrChunks.join("");
      error.outputEvents = outputEvents;
      finish(reject, error);
    });
    child.once("close", (code, signal) => {
      const stdout = stdoutChunks.join("");
      const stderr = stderrChunks.join("");
      if (timedOut) {
        const error = new Error(`process timed out after ${timeoutMs}ms`);
        error.stdout = stdout;
        error.stderr = stderr;
        error.outputEvents = outputEvents;
        finish(reject, error);
        return;
      }
      if (code !== 0) {
        const error = new Error(`process exited with code ${code}${signal ? ` and signal ${signal}` : ""}`);
        error.stdout = stdout;
        error.stderr = stderr;
        error.outputEvents = outputEvents;
        finish(reject, error);
        return;
      }

      finish(resolve, { stdout, stderr, outputEvents });
    });
  });
}

function appendExportOutput(chunks, outputEvents, stream, chunk) {
  const text = chunk.toString("utf8");
  chunks.push(text);

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  for (const line of lines) {
    outputEvents.push({
      stream,
      text: line,
      timestamp: new Date().toISOString()
    });
  }
}

export function exportFailureMessage(error) {
  const parts = [error.message];
  for (const stream of ["stdout", "stderr"]) {
    const text = String(error?.[stream] ?? "").trim();
    if (text) {
      parts.push(`${stream}: ${text.slice(0, 4000)}`);
    }
  }

  return parts.join("; ");
}
