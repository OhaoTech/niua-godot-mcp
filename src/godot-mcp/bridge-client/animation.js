import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { ANIMATION_TOOL_MANIFEST } from "../tools/animation/manifest.js";

export const ANIMATION_BRIDGE_METHODS = bridgeMethodsFromManifest(ANIMATION_TOOL_MANIFEST);
