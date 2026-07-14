import { DEBUGGER_TOOL_DEFINITIONS } from "./debugger/index.js";
import { DESCRIBE_TOOL_DEFINITIONS } from "./describe/index.js";
import { ANIMATION_TOOL_DEFINITIONS } from "./animation/index.js";
import { AUDIO_TOOL_DEFINITIONS } from "./audio/index.js";
import {
  EXPORT_TOOL_DEFINITIONS,
  diagnoseExportTemplates,
  exportGodotProject,
  validateExportPreset
} from "./export/index.js";
import { FILESYSTEM_TOOL_DEFINITIONS } from "./filesystem/index.js";
import { IMPORT_TOOL_DEFINITIONS } from "./import/index.js";
import { INSPECTOR_TOOL_DEFINITIONS } from "./inspector/index.js";
import { LOCALIZATION_TOOL_DEFINITIONS } from "./localization/index.js";
import { MULTIPLAYER_TOOL_DEFINITIONS } from "./multiplayer/index.js";
import { NAVIGATION_TOOL_DEFINITIONS } from "./navigation/index.js";
import { COMMON_NODE_TOOL_DEFINITIONS } from "./nodes/common/index.js";
import { NODE2D_TOOL_DEFINITIONS } from "./nodes/node2d/index.js";
import { NODE3D_TOOL_DEFINITIONS } from "./nodes/node3d/index.js";
import { PARTICLES_TOOL_DEFINITIONS } from "./particles/index.js";
import {
  PROJECT_DISCOVERY_TOOL_DEFINITIONS,
  PROJECT_LIFECYCLE_TOOL_DEFINITIONS,
  PROJECT_LOG_TOOL_DEFINITIONS,
  closeGodotProject,
  createGodotProject,
  diagnoseGodotProjectSetup,
  discoverEditorBridges,
  discoverGodotProjects,
  forgetGodotProject,
  getGodotOutputLogs,
  importGodotProject,
  installProjectAddon,
  listKnownGodotProjects,
  listOpenGodotProjects,
  listScenes,
  openGodotProject
} from "./project/index.js";
import { PROJECT_SETTINGS_TOOL_DEFINITIONS } from "./project/settings.js";
import {
  MATERIAL_ASSIGNMENT_TOOL_DEFINITIONS,
  RESOURCE_TOOL_DEFINITIONS
} from "./resources/index.js";
import {
  RUNTIME_TOOL_DEFINITIONS,
  getGodotVersion
} from "./runtime/index.js";
import { RUN_TOOL_DEFINITIONS } from "./run/index.js";
import {
  SCENE_SAVE_TOOL_DEFINITIONS,
  SCENE_STATE_TOOL_DEFINITIONS,
  SCENE_TAB_TOOL_DEFINITIONS
} from "./scene/index.js";
import {
  diagnoseGodotProjectScripts,
  diagnoseGodotScript
} from "./scripts/diagnostics.js";
import { SCRIPT_TOOL_DEFINITIONS } from "./scripts/index.js";
import { UI_TOOL_DEFINITIONS } from "./ui/index.js";
import { VIEWPORT_TOOL_DEFINITIONS } from "./viewport/index.js";
import { VIEWPORT2D_TOOL_DEFINITIONS } from "./viewport/viewport2d/index.js";
import { PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS } from "./workflows/playable2d/index.js";
import { RECIPE_WORKFLOW_TOOL_DEFINITIONS } from "./workflows/recipes/index.js";
import { PLAYTEST_WORKFLOW_TOOL_DEFINITIONS } from "./workflows/playtest/index.js";
import {
  PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS,
  create3DCharacterController,
  create3DPlayableBlockout
} from "./workflows/playable3d/index.js";

const COMMON_NODE_CREATION_TOOL_DEFINITIONS = COMMON_NODE_TOOL_DEFINITIONS
  .filter(({ name }) => name === "search_node_types" || name === "create_node");

const COMMON_NODE_MUTATION_TOOL_DEFINITIONS = COMMON_NODE_TOOL_DEFINITIONS
  .filter(({ name }) => name !== "search_node_types" && name !== "create_node");

export const GODOT_MCP_TOOLS = [
  ...RUNTIME_TOOL_DEFINITIONS,
  ...DESCRIBE_TOOL_DEFINITIONS,
  ...PROJECT_LIFECYCLE_TOOL_DEFINITIONS,
  ...PROJECT_DISCOVERY_TOOL_DEFINITIONS,
  ...SCENE_STATE_TOOL_DEFINITIONS,
  ...PROJECT_LOG_TOOL_DEFINITIONS,
  ...FILESYSTEM_TOOL_DEFINITIONS,
  ...RESOURCE_TOOL_DEFINITIONS,
  ...PROJECT_SETTINGS_TOOL_DEFINITIONS,
  ...SCRIPT_TOOL_DEFINITIONS,
  ...IMPORT_TOOL_DEFINITIONS,
  ...RUN_TOOL_DEFINITIONS,
  ...EXPORT_TOOL_DEFINITIONS,
  ...DEBUGGER_TOOL_DEFINITIONS,
  ...ANIMATION_TOOL_DEFINITIONS,
  ...UI_TOOL_DEFINITIONS,
  ...PARTICLES_TOOL_DEFINITIONS,
  ...NAVIGATION_TOOL_DEFINITIONS,
  ...AUDIO_TOOL_DEFINITIONS,
  ...LOCALIZATION_TOOL_DEFINITIONS,
  ...MULTIPLAYER_TOOL_DEFINITIONS,
  ...VIEWPORT_TOOL_DEFINITIONS,
  ...VIEWPORT2D_TOOL_DEFINITIONS,
  ...SCENE_TAB_TOOL_DEFINITIONS,
  ...COMMON_NODE_CREATION_TOOL_DEFINITIONS,
  ...NODE2D_TOOL_DEFINITIONS,
  ...NODE3D_TOOL_DEFINITIONS,
  ...PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS,
  ...PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS,
  ...PLAYTEST_WORKFLOW_TOOL_DEFINITIONS,
  ...RECIPE_WORKFLOW_TOOL_DEFINITIONS,
  ...COMMON_NODE_MUTATION_TOOL_DEFINITIONS,
  ...INSPECTOR_TOOL_DEFINITIONS,
  ...MATERIAL_ASSIGNMENT_TOOL_DEFINITIONS,
  ...SCENE_SAVE_TOOL_DEFINITIONS
];

export {
  create3DCharacterController,
  create3DPlayableBlockout,
  closeGodotProject,
  createGodotProject,
  diagnoseExportTemplates,
  diagnoseGodotProjectScripts,
  diagnoseGodotScript,
  diagnoseGodotProjectSetup,
  discoverEditorBridges,
  discoverGodotProjects,
  exportGodotProject,
  forgetGodotProject,
  getGodotOutputLogs,
  getGodotVersion,
  importGodotProject,
  installProjectAddon,
  listKnownGodotProjects,
  listOpenGodotProjects,
  listScenes,
  openGodotProject,
  validateExportPreset
};
