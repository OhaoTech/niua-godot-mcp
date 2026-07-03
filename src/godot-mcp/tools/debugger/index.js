import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import {
  DEBUGGER_CONTROL_TOOL_MANIFEST,
  DEBUGGER_RUNTIME_TOOL_MANIFEST
} from "./manifest.js";
import {
  captureRuntimeScreenshot,
  getRuntimeNodeProperties
} from "./runtime-adapters.js";

export const DEBUGGER_CONTROL_TOOL_DEFINITIONS = toolDefinitionsFromManifest(DEBUGGER_CONTROL_TOOL_MANIFEST);
export const DEBUGGER_RUNTIME_TOOL_DEFINITIONS = toolDefinitionsFromManifest(DEBUGGER_RUNTIME_TOOL_MANIFEST, {
  adapterHandlers: {
    captureRuntimeScreenshot,
    getRuntimeNodeProperties
  }
});

export const DEBUGGER_TOOL_DEFINITIONS =
  DEBUGGER_CONTROL_TOOL_DEFINITIONS.concat(DEBUGGER_RUNTIME_TOOL_DEFINITIONS);
