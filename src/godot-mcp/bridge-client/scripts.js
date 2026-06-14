import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { SCRIPT_TOOL_MANIFEST } from "../tools/scripts/manifest.js";

export const SCRIPT_BRIDGE_METHODS = bridgeMethodsFromManifest(SCRIPT_TOOL_MANIFEST);
