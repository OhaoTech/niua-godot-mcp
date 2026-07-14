import assert from "node:assert/strict";
import test from "node:test";
import { CORE_TOOL_NAMES } from "../../../src/godot-mcp/server/tool-profiles.js";

// P2 surface diet: core stays small and L0-first.
const FORBIDDEN_IN_CORE = [
  "create_mesh_instance_3d",
  "create_light_3d",
  "create_camera_3d",
  "create_character_body_3d",
  "create_static_body_3d",
  "create_3d_character_controller",
  "upsert_audio_bus",
  "create_audio_stream_player"
];

const REQUIRED_IN_CORE = [
  "create_node",
  "create_resource",
  "save_scene_as",
  "run_main_scene",
  "run_playtest_evidence",
  "wait_for_imported_asset",
  "apply_scene_recipe",
  "open_project",
  "describe_tools"
];

test("core stays under budget and excludes demoted L1 creators", () => {
  assert.ok(CORE_TOOL_NAMES.length <= 60, `core too large: ${CORE_TOOL_NAMES.length}`);
  assert.ok(CORE_TOOL_NAMES.length >= 40, `core unexpectedly tiny: ${CORE_TOOL_NAMES.length}`);
  for (const name of FORBIDDEN_IN_CORE) {
    assert.ok(!CORE_TOOL_NAMES.includes(name), `${name} must not be essential/core`);
  }
});

test("core includes play loop + import wait + primitives", () => {
  for (const name of REQUIRED_IN_CORE) {
    assert.ok(CORE_TOOL_NAMES.includes(name), `missing essential tool: ${name}`);
  }
});
