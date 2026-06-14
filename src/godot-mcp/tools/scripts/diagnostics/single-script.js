import { resolveProjectScriptPath } from "../../../godot/paths.js";
import { assertAllowedProjectRoot } from "../../../services/project-registry.js";
import { normalizePositiveInteger } from "../../../shared/numbers.js";

import { parseGodotScriptDiagnostics } from "./parser.js";
import { runGodotScriptCheck } from "./runner.js";

export async function diagnoseGodotScript(args = {}) {
  const projectRoot = assertAllowedProjectRoot(String(args.projectRoot ?? "").trim());
  const script = resolveProjectScriptPath(projectRoot, String(args.path ?? ""));
  const timeoutMs = normalizePositiveInteger(args.timeoutMs, 10000);
  const godotBin = process.env.GODOT_BIN ?? "godot";
  const checkArgs = [
    "--headless",
    "--check-only",
    "--script",
    script.absolutePath
  ];
  const result = await runGodotScriptCheck(godotBin, checkArgs, {
    cwd: projectRoot,
    timeoutMs
  });
  const diagnostics = parseGodotScriptDiagnostics(`${result.stderr}\n${result.stdout}`);
  const hasErrors = diagnostics.some((diagnostic) => diagnostic.severity === "error");

  return {
    ok: true,
    data: {
      projectRoot,
      path: script.path,
      absolutePath: script.absolutePath,
      valid: result.exitCode === 0 && !hasErrors,
      exitCode: result.exitCode,
      signal: result.signal,
      timedOut: result.timedOut,
      diagnostics,
      stdout: result.stdout,
      stderr: result.stderr,
      command: {
        godotBin,
        args: checkArgs
      }
    }
  };
}
