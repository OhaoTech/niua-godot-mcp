import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { importProjectAssets } from "./local.js";
import { IMPORT_TOOL_MANIFEST } from "./manifest.js";

export { importProjectAssets };

export const IMPORT_TOOL_DEFINITIONS = toolDefinitionsFromManifest(IMPORT_TOOL_MANIFEST, {
  localHandlers: {
    importProjectAssets
  }
});
