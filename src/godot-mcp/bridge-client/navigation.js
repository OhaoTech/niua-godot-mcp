import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { NAVIGATION_TOOL_MANIFEST } from "../tools/navigation/manifest.js";

export const NAVIGATION_BRIDGE_METHODS = bridgeMethodsFromManifest(NAVIGATION_TOOL_MANIFEST);
