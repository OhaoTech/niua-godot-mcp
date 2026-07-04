import { ACTIVE_TOOL_PROFILE } from "./tool-catalog.js";

// Served through MCP initialize.instructions: the server teaches every client its
// golden path at connect time — no client-side skill required. Keep it terse; this
// lands in the caller's system context once per session.
const CORE_INSTRUCTIONS = `NIUA Godot MCP — golden path:
1) create_project/open_project (allowlisted roots) -> the editor + bridge start; pass expectedProjectRoot on later calls.
2) Save before running: create_scene with a res:// path, save_current_scene after node batches, set_main_scene before run_main_scene. Running an unsaved/untitled scene stalls the editor on a native dialog.
3) Multi-step builds: write a recipe JSON to disk and call apply_scene_recipe { recipePath } — one call, compact summary, failures only.
4) Keep results small: get_scene_tree { maxDepth, pathFilter }; get_inspector_properties { properties: [...] } (verbose: true only when needed); list_filesystem { exclude: ["addons", ".godot"], maxDepth }; always pass savePath on screenshots; get_output_logs { clearAfterRead: true }.
5) Values coerce: position accepts [x,y,z] or {x,y,z}; booleans/numbers accept plain JSON. Object/Resource writes fail loudly if the res:// path cannot load — fix the path, do not retry blindly.
6) Runtime: install_runtime_probe once, then get_runtime_state / get_runtime_node_properties { properties } / set_runtime_node_property / send_runtime_input (actions + mouse) to drive and verify the running game.
7) On bridge errors, follow the message: it names the recovery tool (open_project / diagnose_project_setup).
8) Lost? describe_tools navigates the full catalog: no args -> domain map, { domain } -> its tools, { name } -> one schema.`;

const DISPATCH_ADDENDUM = `
This session runs the dispatch profile: ~13 domain tools route many actions each. Call { action: "describe" } to list a domain's actions, { action: "describe", name: "<action>" } for that action's schema, then { action: "<action>", args: { ... } }.`;

export function serverInstructions(profile = ACTIVE_TOOL_PROFILE) {
  return profile === "compact"
    ? `${CORE_INSTRUCTIONS}\n${DISPATCH_ADDENDUM.trim()}`
    : CORE_INSTRUCTIONS;
}
