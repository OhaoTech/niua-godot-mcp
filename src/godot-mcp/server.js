#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import { startStdioServer } from "./server/stdio.js";

export {
  ACTIVE_TOOL_PROFILE,
  callTool,
  SERVER_INFO,
  TOOL_DEFINITIONS
} from "./server/tool-catalog.js";
export { handleRequest } from "./server/request-handler.js";
export { RESOURCE_DEFINITIONS } from "./server/resources.js";
export { startStdioServer } from "./server/stdio.js";
export {
  closeGodotProject,
  create3DCharacterController,
  create3DPlayableBlockout,
  createGodotProject,
  diagnoseExportTemplates,
  diagnoseGodotProjectScripts,
  diagnoseGodotProjectSetup,
  diagnoseGodotScript,
  discoverEditorBridges,
  discoverGodotProjects,
  exportGodotProject,
  forgetGodotProject,
  getGodotOutputLogs,
  getGodotVersion,
  importGodotProject,
  installProjectAddon,
  listKnownGodotProjects,
  listOpenGodotProjects,
  listScenes,
  openGodotProject,
  validateExportPreset
} from "./tools/index.js";

function isDirectRun() {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  }
}

if (isDirectRun()) {
  startStdioServer();
}
