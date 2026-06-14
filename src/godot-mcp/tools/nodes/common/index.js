import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { COMMON_NODE_TOOL_MANIFEST } from "./manifest.js";

export const COMMON_NODE_TOOL_DEFINITIONS = toolDefinitionsFromManifest(COMMON_NODE_TOOL_MANIFEST);
