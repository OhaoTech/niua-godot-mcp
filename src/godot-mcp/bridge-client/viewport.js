import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { VIEWPORT_BRIDGE_TOOL_MANIFEST } from "../tools/viewport/manifest.js";

export const VIEWPORT_BRIDGE_METHODS = bridgeMethodsFromManifest(VIEWPORT_BRIDGE_TOOL_MANIFEST);
