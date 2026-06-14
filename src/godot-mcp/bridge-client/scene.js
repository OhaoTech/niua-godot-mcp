import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { SCENE_BRIDGE_TOOL_MANIFEST } from "../tools/scene/manifest.js";

export const SCENE_BRIDGE_METHODS = bridgeMethodsFromManifest(SCENE_BRIDGE_TOOL_MANIFEST);
