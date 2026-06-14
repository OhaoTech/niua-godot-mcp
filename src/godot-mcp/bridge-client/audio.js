import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { AUDIO_TOOL_MANIFEST } from "../tools/audio/manifest.js";

export const AUDIO_BRIDGE_METHODS = bridgeMethodsFromManifest(AUDIO_TOOL_MANIFEST);
