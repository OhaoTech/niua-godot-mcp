import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { UI_TOOL_MANIFEST } from "../tools/ui/manifest.js";

export const UI_BRIDGE_METHODS = bridgeMethodsFromManifest(UI_TOOL_MANIFEST);
