import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { FILESYSTEM_TOOL_MANIFEST } from "../tools/filesystem/manifest.js";

export const FILESYSTEM_BRIDGE_METHODS = bridgeMethodsFromManifest(FILESYSTEM_TOOL_MANIFEST);
