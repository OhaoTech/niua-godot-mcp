import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { LOCALIZATION_TOOL_MANIFEST } from "../tools/localization/manifest.js";

export const LOCALIZATION_BRIDGE_METHODS = bridgeMethodsFromManifest(LOCALIZATION_TOOL_MANIFEST);
