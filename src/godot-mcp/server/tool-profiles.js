// Tool-surface profiles for the Godot MCP server.
//
// Why: the full catalog consumes a large slab of every agent session's
// context window, and this MCP often coexists in one session with other
// MCP servers. The default `v1` profile advertises only the compact,
// run-proven core tools; `full` exposes everything. Nothing is deleted —
// `full` is always available via NIUA_MCP_PROFILE=full.

export const TOOL_PROFILE_ENV_VAR = "NIUA_MCP_PROFILE";
export const DEFAULT_TOOL_PROFILE = "v1";
export const TOOL_PROFILES = Object.freeze(["v1", "full"]);

// The v1 cut: the compact core tools proven necessary to import assets,
// assemble a playable scene, run it, and observe it through a real editor.
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
