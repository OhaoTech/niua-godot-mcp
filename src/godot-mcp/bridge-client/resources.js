import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { RESOURCE_BRIDGE_TOOL_MANIFEST } from "../tools/resources/manifest.js";

export const RESOURCE_BRIDGE_METHODS = bridgeMethodsFromManifest(RESOURCE_BRIDGE_TOOL_MANIFEST);
