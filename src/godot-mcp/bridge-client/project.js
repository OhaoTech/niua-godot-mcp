import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { PROJECT_SETTINGS_TOOL_MANIFEST } from "../tools/project/settings/manifest.js";

export const PROJECT_BRIDGE_METHODS = bridgeMethodsFromManifest(PROJECT_SETTINGS_TOOL_MANIFEST);
