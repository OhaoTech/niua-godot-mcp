import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { RUN_TOOL_MANIFEST } from "../tools/run/manifest.js";

export const RUN_BRIDGE_METHODS = bridgeMethodsFromManifest(RUN_TOOL_MANIFEST);
