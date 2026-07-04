import assert from "node:assert/strict";
import test from "node:test";

import { readAddonFileExact } from "../helpers/plugin-files.js";

// B4 read-back guarantees (docs/godot-mcp/quality-delivery-architecture.md):
// a mutator's response must be derived from the engine object AFTER the
// mutation, never echoed from the request. These pins hold the read-back
// expressions in place so a refactor cannot quietly reintroduce echoes
// (e.g. reporting the requested node name when add_child renamed it to
// "@Enemy@3" on a sibling collision).

test("create_node derives its response from the node after add_child", async () => {
  const source = await readAddonFileExact("niua_mcp_scene_node_instance_creation.gd");

  // name/type/paths are read AFTER the node enters the tree.
  assert.match(source, /parent\.add_child\(node\)[\s\S]*"name": node\.name/);
  assert.match(source, /parent\.add_child\(node\)[\s\S]*"type": node\.get_class\(\)/);
  assert.match(source, /"parentPath": NiuaMcpSceneNodeContext\.node_path_for_response\(editor, node\.get_parent\(\)\)/);
  // never echo the requested name back
  assert.doesNotMatch(source, /"name": desired_name/);
});

test("rename_node reports the engine's post-rename name, not the requested one", async () => {
  const source = await readAddonFileExact("niua_mcp_scene_node_tree_basic_operations.gd");

  assert.match(source, /node\.name = new_name[\s\S]*"name": node\.name/);
  assert.doesNotMatch(source, /"name": new_name/);
});

test("delete_node verifies the node actually left the tree", async () => {
  const source = await readAddonFileExact("niua_mcp_scene_node_tree_basic_operations.gd");

  assert.match(source, /parent\.remove_child\(node\)[\s\S]*node\.get_parent\(\) != null/);
  assert.match(source, /parent\.has_node\(NodePath\(deleted_name\)\)/);
  assert.match(source, /"delete_failed"/);
});

test("duplicate_node derives its response from the duplicate after add_child", async () => {
  const source = await readAddonFileExact("niua_mcp_scene_node_tree_basic_operations.gd");

  assert.match(source, /parent\.add_child\(duplicate\)[\s\S]*"name": duplicate\.name/);
  assert.match(source, /"parentPath": NiuaMcpSceneNodeContext\.node_path_for_response\(editor, duplicate\.get_parent\(\)\)/);
});

test("reparent_node reports the node's actual parent after the move", async () => {
  const source = await readAddonFileExact("niua_mcp_scene_node_tree_hierarchy_operations.gd");

  assert.match(source, /new_parent\.add_child\(node\)[\s\S]*"parentPath": NiuaMcpSceneNodeContext\.node_path_for_response\(editor, node\.get_parent\(\)\)/);
  assert.doesNotMatch(source, /"parentPath": NiuaMcpSceneNodeContext\.node_path_for_response\(editor, new_parent\)/);
});

test("reorder_node reports the node's actual index and sibling order after move_child", async () => {
  const source = await readAddonFileExact("niua_mcp_scene_node_tree_hierarchy_operations.gd");

  assert.match(source, /parent\.move_child\(node, target_index\)[\s\S]*"index": node\.get_index\(\)/);
  assert.match(source, /"siblingOrder": NiuaMcpNodeSnapshot\.sibling_order\(parent\)/);
  assert.doesNotMatch(source, /"index": target_index/);
});

test("attach_script reads node.get_script() back and fails loudly when it differs", async () => {
  const source = await readAddonFileExact("niua_mcp_script_editor_attach_operations.gd");

  // post-attach read-back with a null/different check and a recovery hint
  assert.match(source, /node\.set_script\(script\)[\s\S]*var attached_script := node\.get_script\(\) as Script/);
  assert.match(source, /if attached_script != null else ""/);
  assert.match(source, /attached_script != script or attached_path != script_path/);
  assert.match(source, /"attach_failed"/);
  assert.match(source, /retry attach_script/);
  // the reported script path/type come from the attached script, not the request
  assert.match(source, /"path": attached_path/);
  assert.match(source, /"type": attached_script\.get_class\(\)/);
  assert.doesNotMatch(source, /"script": \{\n\t\t\t\t"path": script_path/);
});

test("set_project_setting reports the value ProjectSettings actually holds", async () => {
  const source = await readAddonFileExact("niua_mcp_project_setting_mutation_operations.gd");

  assert.match(source, /ProjectSettings\.set_setting\(name, value\)[\s\S]*"value": NiuaMcpVariantCodec\.variant_to_json\(ProjectSettings\.get_setting\(name\)\)/);
});

test("upsert_animation derives its response from the stored library animation", async () => {
  const source = await readAddonFileExact("niua_mcp_animation_player_operations.gd");

  // add_animation's error code is checked; the stored copy is read back
  assert.match(source, /var add_error := library\.add_animation\(animation_name, animation\)/);
  assert.match(source, /if add_error != OK or not library\.has_animation\(animation_name\):/);
  assert.match(source, /var stored: Animation = library\.get_animation\(animation_name\)/);
  assert.match(source, /"length": stored\.length/);
  assert.match(source, /"loopMode": _loop_mode_name\(stored\.loop_mode\)/);
  assert.match(source, /"trackCount": stored\.get_track_count\(\)/);
  // never echo the requested loop mode string
  assert.doesNotMatch(source, /"loopMode": str\(body\.get\("loopMode", "none"\)\)/);
});
