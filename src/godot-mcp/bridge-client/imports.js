import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { IMPORT_TOOL_MANIFEST } from "../tools/import/manifest.js";

export const IMPORT_BRIDGE_METHODS = bridgeMethodsFromManifest(IMPORT_TOOL_MANIFEST);
