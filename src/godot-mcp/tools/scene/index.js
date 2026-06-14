import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import {
  SCENE_SAVE_TOOL_MANIFEST,
  SCENE_STATE_TOOL_MANIFEST,
  SCENE_TAB_TOOL_MANIFEST,
  SCENE_TOOL_MANIFEST
} from "./manifest.js";

export const SCENE_TOOL_DEFINITIONS = toolDefinitionsFromManifest(SCENE_TOOL_MANIFEST);

export const SCENE_STATE_TOOL_DEFINITIONS = toolsForManifest(SCENE_STATE_TOOL_MANIFEST);
export const SCENE_TAB_TOOL_DEFINITIONS = toolsForManifest(SCENE_TAB_TOOL_MANIFEST);
export const SCENE_SAVE_TOOL_DEFINITIONS = toolsForManifest(SCENE_SAVE_TOOL_MANIFEST);

function toolsForManifest(manifest) {
  const byName = new Map(SCENE_TOOL_DEFINITIONS.map((tool) => [tool.name, tool]));
  return manifest.map((entry) => byName.get(entry.name));
}
