import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { INSPECTOR_TOOL_MANIFEST } from "../tools/inspector/manifest.js";

export const INSPECTOR_BRIDGE_METHODS = bridgeMethodsFromManifest(INSPECTOR_TOOL_MANIFEST);
