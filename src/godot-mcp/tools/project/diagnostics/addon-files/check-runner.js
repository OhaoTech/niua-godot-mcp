import path from "node:path";

import { pathExists } from "../../../../services/project-registry.js";

import { ADDON_FILE_CHECKS } from "./catalog.js";
import { diagnosticCheck } from "../checks.js";

export async function buildAddonFileChecks(addonRoot) {
  const checks = [];

  for (const [code, fileName] of ADDON_FILE_CHECKS) {
    const filePath = path.join(addonRoot, fileName);
    const exists = await pathExists(filePath);
    checks.push(diagnosticCheck({
      code,
      ok: exists,
      severity: "error",
      message: exists
        ? `${fileName} exists`
        : `${fileName} is missing from addons/niua_mcp`,
      path: filePath
    }));
  }

  return checks;
}
