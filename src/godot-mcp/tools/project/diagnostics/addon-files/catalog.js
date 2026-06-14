import { BUILDERS_PROJECT_ADDON_FILE_CHECKS } from "./catalog/builders-project.js";
import { CORE_BRIDGE_ADDON_FILE_CHECKS } from "./catalog/bridge.js";
import { EDITOR_SCENE_VIEWPORT_ADDON_FILE_CHECKS } from "./catalog/editor-scene-viewport.js";
import { FILESYSTEM_RESOURCE_SCRIPT_ADDON_FILE_CHECKS } from "./catalog/filesystem-resource-script.js";
import { RUNTIME_DEBUGGER_ADDON_FILE_CHECKS } from "./catalog/runtime-debugger.js";

export const ADDON_FILE_CHECKS = [
  ...CORE_BRIDGE_ADDON_FILE_CHECKS,
  ...RUNTIME_DEBUGGER_ADDON_FILE_CHECKS,
  ...FILESYSTEM_RESOURCE_SCRIPT_ADDON_FILE_CHECKS,
  ...EDITOR_SCENE_VIEWPORT_ADDON_FILE_CHECKS,
  ...BUILDERS_PROJECT_ADDON_FILE_CHECKS
];

export const REQUIRED_ADDON_CODES = new Set(ADDON_FILE_CHECKS.map(([code]) => code));
