import { assertAllowedProjectRoot } from "../../../services/project-registry.js";
import { normalizeBoundedInteger, normalizePositiveInteger } from "../../../shared/numbers.js";

import { parseGodotScriptDiagnostics } from "./parser.js";
import { runGodotScriptCheck } from "./runner.js";
import { resolveProjectScriptsForDiagnostics } from "./script-discovery.js";

export async function diagnoseGodotProjectScripts(args = {}) {
  const projectRoot = assertAllowedProjectRoot(String(args.projectRoot ?? "").trim());
  const timeoutMs = normalizePositiveInteger(args.timeoutMs, 10000);
  const maxScripts = normalizeBoundedInteger(args.maxScripts, {
    fallback: 100,
    min: 1,
    max: 500
  });
  const scripts = await resolveProjectScriptsForDiagnostics(projectRoot, args, maxScripts);
  const godotBin = process.env.GODOT_BIN ?? "godot";
  const results = [];

  for (const script of scripts) {
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
    results.push({
      path: script.path,
      absolutePath: script.absolutePath,
      valid: result.exitCode === 0 && !hasErrors,
      exitCode: result.exitCode,
      signal: result.signal,
      timedOut: result.timedOut,
      diagnostics
    });
  }

  const invalidScripts = results.filter((script) => !script.valid).length;
  const diagnostics = results.flatMap((script) => script.diagnostics.map((diagnostic) => ({
    ...diagnostic,
    scriptPath: script.path
  })));

  return {
    ok: true,
    data: {
      projectRoot,
      rootPath: String(args.rootPath ?? "res://"),
      valid: invalidScripts === 0,
      scannedScripts: results.length,
      invalidScripts,
      diagnosticCount: diagnostics.length,
      diagnostics,
      scripts: results,
      command: {
        godotBin,
        timeoutMs
      }
    }
  };
}
