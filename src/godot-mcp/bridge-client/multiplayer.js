import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { MULTIPLAYER_TOOL_MANIFEST } from "../tools/multiplayer/manifest.js";

export const MULTIPLAYER_BRIDGE_METHODS = bridgeMethodsFromManifest(MULTIPLAYER_TOOL_MANIFEST);
