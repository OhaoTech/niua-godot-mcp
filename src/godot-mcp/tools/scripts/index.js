import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import {
  diagnoseGodotProjectScripts,
  diagnoseGodotScript
} from "./diagnostics.js";
import { SCRIPT_TOOL_MANIFEST } from "./manifest.js";

export const SCRIPT_TOOL_DEFINITIONS = toolDefinitionsFromManifest(SCRIPT_TOOL_MANIFEST, {
  localHandlers: {
    diagnoseGodotScript,
    diagnoseGodotProjectScripts
  }
});
