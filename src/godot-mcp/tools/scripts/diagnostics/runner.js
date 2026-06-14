import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runGodotScriptCheck(godotBin, checkArgs, {
  cwd,
  timeoutMs
}) {
  try {
    const result = await execFileAsync(godotBin, checkArgs, {
      cwd,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024
    });
    return {
      exitCode: 0,
      signal: null,
      timedOut: false,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? ""
    };
  } catch (error) {
    if (Number.isInteger(error.code) || error.killed || error.signal) {
      return {
        exitCode: Number.isInteger(error.code) ? error.code : null,
        signal: error.signal ?? null,
        timedOut: Boolean(error.killed),
        stdout: error.stdout ?? "",
        stderr: error.stderr ?? ""
      };
    }

    throw error;
  }
}
