import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { getGodotOutputLogs } from "../logs.js";
import { PROJECT_LOG_TOOL_MANIFEST } from "../manifest.js";

export const PROJECT_LOG_TOOL_DEFINITIONS = toolDefinitionsFromManifest(PROJECT_LOG_TOOL_MANIFEST, {
  localHandlers: {
    getGodotOutputLogs
  }
});
