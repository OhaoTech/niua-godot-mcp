import { readFile } from "node:fs/promises";
import path from "node:path";

import { normalizePositiveInteger } from "../../shared/numbers.js";
import { resolveBridgeToken } from "../../services/bridge-auth.js";
import { assertAllowedProjectRoot, pathExists } from "../../services/project-registry.js";
import { pollBridgeHealth } from "../../services/process-manager.js";

import {
  addonFilesReady,
  buildAddonFileChecks
} from "./diagnostics/addon-files.js";
import { diagnosticCheck } from "./diagnostics/checks.js";
import { projectTextHasEnabledNiuaPlugin } from "./diagnostics/plugin-config.js";
import { bridgeRecoveryActions } from "./diagnostics/recovery.js";

export async function diagnoseGodotProjectSetup(args = {}) {
  const requestedProjectRoot = String(args.projectRoot ?? "").trim();
  if (!requestedProjectRoot) {
    throw new Error("projectRoot is required");
  }

  const projectRoot = assertAllowedProjectRoot(requestedProjectRoot);
  const projectFile = path.join(projectRoot, "project.godot");
  const projectFileExists = await pathExists(projectFile);
  const projectText = projectFileExists ? await readFile(projectFile, "utf8") : "";
  const addonRoot = path.join(projectRoot, "addons/niua_mcp");
  const checks = [
    diagnosticCheck({
      code: "project_file",
      ok: projectFileExists,
      severity: "error",
      message: projectFileExists
        ? "project.godot exists"
        : "project.godot is missing",
      path: projectFile
    })
  ];

  checks.push(...await buildAddonFileChecks(addonRoot));

  const pluginEnabled = projectFileExists && projectTextHasEnabledNiuaPlugin(projectText);
  checks.push(diagnosticCheck({
    code: "editor_plugin_enabled",
    ok: pluginEnabled,
    severity: "error",
    message: pluginEnabled
      ? "NIUA editor plugin is enabled in project.godot"
      : "NIUA editor plugin is not enabled in project.godot",
    path: projectFile,
    data: {
      pluginPath: "res://addons/niua_mcp/plugin.cfg"
    }
  }));

  let recoveryActions = [];
  if (args.checkBridge === true) {
    const host = String(args.bridgeHost ?? process.env.GODOT_MCP_HOST ?? "127.0.0.1");
    const port = Number(args.bridgePort ?? process.env.GODOT_MCP_PORT ?? 9174);
    const bridge = await pollBridgeHealth({
      host,
      port,
      token: resolveBridgeToken({
        host,
        port,
        token: args.token,
        bridgeToken: args.bridgeToken
      }),
      timeoutMs: normalizePositiveInteger(args.timeoutMs, 1000)
    });
    if (!bridge.available) {
      recoveryActions = bridgeRecoveryActions({
        projectRoot,
        host,
        port,
        addonFilesReady: addonFilesReady(checks),
        pluginEnabled
      });
      bridge.recoveryActions = recoveryActions;
    }
    checks.push(diagnosticCheck({
      code: "bridge_health",
      ok: bridge.available,
      severity: "warning",
      message: bridge.available
        ? `NIUA bridge is reachable at ${host}:${port}`
        : `NIUA bridge is not reachable at ${host}:${port}`,
      data: bridge
    }));
  }

  return {
    ok: true,
    data: {
      projectRoot,
      ready: checks.every((check) => check.ok),
      recoveryActions,
      checks
    }
  };
}
