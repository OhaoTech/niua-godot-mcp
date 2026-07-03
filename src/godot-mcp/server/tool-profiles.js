// Tool-surface profiles for the Godot MCP server.
//
// Why: the full catalog (135+ tools) consumes a large slab of every agent
// session's context window, and this MCP must coexist in one session with
// the NIUA MCP and a Blender MCP (docs/godot-mcp/v1-tool-surface.md). The
// default `v1` profile advertises only the tools proven necessary by the
// Slice 0 acceptance run; `full` exposes everything. Nothing is deleted —
// a tool earns promotion into v1 by being needed during a real run
// (a docs/godot-mcp/slice-0-findings.md entry is the admission ticket).

import { dispatchToolsFromCatalog } from "./dispatch-profile.js";

export const TOOL_PROFILE_ENV_VAR = "NIUA_MCP_PROFILE";
export const DEFAULT_TOOL_PROFILE = "v1";
export const TOOL_PROFILES = Object.freeze(["v1", "full", "dispatch"]);

// Composition = the v1 cut from docs/godot-mcp/v1-tool-surface.md,
// reconciled against the tools the Slice 0 acceptance run actually called
// (runs/slice-0-acceptance-2026-06-11T11-02-47-609Z/slice0-run-report.json).
export const V1_TOOL_NAMES = Object.freeze([
  // Project / setup
  "get_godot_version",
  "create_project",
  "open_project",
  "close_project",
  "get_project_info",
  "diagnose_project_setup",
  // Filesystem / import
  "list_filesystem",
  "create_folder",
  "read_text_file",
  "write_text_file",
  "write_binary_file",
  "reimport_assets",
  "list_imported_assets",
  "get_import_diagnostics",
  // Scene / nodes
  "create_scene",
  "open_scene",
  "save_current_scene",
  "get_scene_tree",
  "create_node",
  "delete_node",
  "set_node_property",
  "get_inspector_properties",
  "search_node_types",
  // Scripts
  "create_script",
  "attach_script",
  "read_script",
  "write_script",
  "diagnose_script",
  // Curated 3D helpers
  "create_3d_character_controller",
  "create_camera_3d",
  "create_light_3d",
  "create_mesh_instance_3d",
  "create_static_body_3d",
  "create_character_body_3d",
  // Workflows — apply_scene_recipe is the token-efficiency workhorse: one call
  // executes a whole recipe file, so small-profile sessions stay small.
  "apply_scene_recipe",
  // Run / observe
  "set_main_scene",
  "run_main_scene",
  "stop_running_scene",
  "get_run_status",
  "get_output_logs",
  "install_runtime_probe",
  "capture_runtime_screenshot",
  "invoke_editor_action"
]);

export function resolveToolProfile(value = process.env[TOOL_PROFILE_ENV_VAR]) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "") {
    return DEFAULT_TOOL_PROFILE;
  }
  if (!TOOL_PROFILES.includes(normalized)) {
    throw new Error(
      `Invalid ${TOOL_PROFILE_ENV_VAR}: "${value}". Expected one of: ${TOOL_PROFILES.join(", ")}.`
    );
  }
  return normalized;
}

export function selectProfileTools(tools, profile) {
  if (profile === "full") {
    return tools;
  }

  if (profile === "dispatch") {
    return dispatchToolsFromCatalog(tools);
  }

  const available = new Set(tools.map((tool) => tool.name));
  const missing = V1_TOOL_NAMES.filter((name) => !available.has(name));
  if (missing.length > 0) {
    throw new Error(
      `v1 tool profile references unknown tools (renamed or removed?): ${missing.join(", ")}`
    );
  }

  const allowed = new Set(V1_TOOL_NAMES);
  return tools.filter((tool) => allowed.has(tool.name));
}
