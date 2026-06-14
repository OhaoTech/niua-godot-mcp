import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { RUN_TOOL_MANIFEST } from "./manifest.js";

export const RUN_TOOL_DEFINITIONS = toolDefinitionsFromManifest(RUN_TOOL_MANIFEST);
