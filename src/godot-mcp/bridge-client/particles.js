import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { PARTICLES_TOOL_MANIFEST } from "../tools/particles/manifest.js";

export const PARTICLES_BRIDGE_METHODS = bridgeMethodsFromManifest(PARTICLES_TOOL_MANIFEST);
