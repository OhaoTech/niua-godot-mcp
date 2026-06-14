import { bridgeMethodsFromManifest } from "../manifest/bridge-methods.js";
import { DEBUGGER_CONTROL_TOOL_MANIFEST } from "../tools/debugger/manifest.js";

export const DEBUGGER_BRIDGE_METHODS = bridgeMethodsFromManifest(DEBUGGER_CONTROL_TOOL_MANIFEST);
