import { ACTIVE_TOOL_PROFILE } from "./tool-catalog.js";

// Served through MCP initialize.instructions: the server teaches every client its
// golden path at connect time — no client-side skill required. Keep it terse; this
// lands in the caller's system context once per session.
const CORE_INSTRUCTIONS = `NIUA Godot MCP — golden path:
1) create_project/open_project (allowlisted roots) -> editor + bridge start; pass expectedProjectRoot on later calls.
2) Save before running: create_scene with a res:// path; save_scene_as if untitled. run_* defaults saveBeforeRun=true. Prefer set_main_scene then run_main_scene, or run_custom_scene({path}).
3) Multi-step builds: apply_scene_recipe / batch_scene_operations. After assets: wait_for_imported_asset before using them.
4) Playtest in one call: run_playtest_evidence { scenePath?, savePath? } -> compact evidence (headless screenshots may be available:false — not a failure).
5) Keep results small: get_scene_tree { maxDepth, pathFilter }; screenshots with savePath; list_filesystem { exclude: ["addons", ".godot"] }.
6) Errors include errorCode + recovery.tool when available — follow them (open_project, save_scene_as, set_main_scene).
7) Lost? describe_tools: no args -> domain map, { domain } -> tools, { name } -> schema.`;

const DISPATCH_ADDENDUM = `
This session runs the dispatch profile: ~13 domain tools route many actions each. Call { action: "describe" } to list a domain's actions, { action: "describe", name: "<action>" } for that action's schema, then { action: "<action>", args: { ... } }.`;

export function serverInstructions(profile = ACTIVE_TOOL_PROFILE) {
  return profile === "compact"
    ? `${CORE_INSTRUCTIONS}\n${DISPATCH_ADDENDUM.trim()}`
    : CORE_INSTRUCTIONS;
}
