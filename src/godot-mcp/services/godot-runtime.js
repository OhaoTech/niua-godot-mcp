import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getGodotVersion() {
  if (process.env.GODOT_MCP_GODOT_VERSION) {
    return process.env.GODOT_MCP_GODOT_VERSION;
  }

  const godotBin = process.env.GODOT_BIN ?? "godot";
  let stdout;
  let stderr;
  try {
    ({ stdout, stderr } = await execFileAsync(godotBin, ["--version"], {
      timeout: 10000,
      windowsHide: true
    }));
  } catch (error) {
    throw new Error(
      `Unable to run Godot executable "${godotBin}" for --version: ${error.message}. ` +
        "Install Godot 4.6 or set GODOT_BIN to the full path of a working Godot executable."
    );
  }

  return (stdout || stderr).trim();
}
