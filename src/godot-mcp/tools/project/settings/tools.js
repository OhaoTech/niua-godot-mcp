import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { configureHdrOutput } from "./hdr.js";
import { PROJECT_SETTINGS_TOOL_MANIFEST } from "./manifest.js";

export const PROJECT_SETTINGS_TOOL_DEFINITIONS = toolDefinitionsFromManifest(PROJECT_SETTINGS_TOOL_MANIFEST, {
  localHandlers: {
    configureHdrOutput
  }
});
