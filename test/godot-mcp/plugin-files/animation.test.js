import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact
} from "../helpers/plugin-files.js";

test("Godot Animation bridge routes live in focused read/write route modules", async () => {
  const readRoutes = await readAddonFileExact("niua_mcp_bridge_read_routes.gd");
  const writeRoutes = await readAddonFileExact("niua_mcp_bridge_write_routes.gd");
  const readAnimationRoutes = await readAddonFile("niua_mcp_bridge_read_animation_routes.gd");
  const writeAnimationRoutes = await readAddonFile("niua_mcp_bridge_write_animation_routes.gd");
  const readCatalog = await readAddonFile("niua_mcp_bridge_read_route_catalog.gd");
  const writeEndpoints = await readAddonFile("niua_mcp_bridge_write_route_endpoints.gd");
  const writeRouteTable = await readAddonFile("niua_mcp_bridge_write_route_table.gd");

  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_animation_routes\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpBridgeReadAnimationRoutes\.new\(\)/);
  assert.match(readRoutes, /"_list_animations": true/);
  assert.match(readRoutes, /"_get_animation_state": true/);

  assert.match(writeRoutes, /preload\("niua_mcp_bridge_write_animation_routes\.gd"\)/);
  assert.match(writeRoutes, /NiuaMcpBridgeWriteAnimationRoutes\.new\(\)/);
  assert.match(writeRoutes, /"_upsert_animation": true/);
  assert.match(writeRoutes, /"_play_animation": true/);
  assert.match(writeRoutes, /"_create_animation_tree_state_machine": true/);

  assert.match(readAnimationRoutes, /extends RefCounted/);
  assert.match(readAnimationRoutes, /func _list_animations\(query: Dictionary\) -> Dictionary:/);
  assert.match(readAnimationRoutes, /NiuaMcpAnimationOperations\.list_animations/);
  assert.match(readAnimationRoutes, /func _get_animation_state\(query: Dictionary\) -> Dictionary:/);
  assert.match(readAnimationRoutes, /NiuaMcpAnimationOperations\.get_animation_state/);

  assert.match(writeAnimationRoutes, /extends RefCounted/);
  assert.match(writeAnimationRoutes, /func _upsert_animation\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeAnimationRoutes, /NiuaMcpAnimationOperations\.upsert_animation_with_side_effects/);
  assert.match(writeAnimationRoutes, /func _play_animation\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeAnimationRoutes, /NiuaMcpAnimationOperations\.play_animation_with_side_effects/);
  assert.match(writeAnimationRoutes, /func _travel_animation_tree\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeAnimationRoutes, /NiuaMcpAnimationOperations\.travel_animation_tree_with_side_effects/);

  assert.match(readCatalog, /"\/animation\/list": \{ "handler": "_list_animations", "arg": "query" \}/);
  assert.match(readCatalog, /"\/animation\/state": \{ "handler": "_get_animation_state", "arg": "query" \}/);
  assert.match(writeEndpoints, /"\/animation\/upsert"/);
  assert.match(writeEndpoints, /"\/animation\/tree\/travel"/);
  assert.match(writeRouteTable, /"\/animation\/play": \{ "handler": "_play_animation", "arg": "body", "methodError": "animation playback requires POST" \}/);
});

test("Godot Animation operations are split by focused operation modules", async () => {
  const facade = await readAddonFile("niua_mcp_animation_operations.gd");
  const players = await readAddonFile("niua_mcp_animation_player_operations.gd");
  const trees = await readAddonFile("niua_mcp_animation_tree_operations.gd");
  const state = await readAddonFile("niua_mcp_animation_state_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_animation_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_animation_player_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_animation_tree_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_animation_state_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_animation_side_effects\.gd"\)/);
  assert.match(facade, /static func upsert_animation_with_side_effects/);
  assert.match(facade, /static func list_animations/);
  assert.match(facade, /static func create_animation_tree_state_machine_with_side_effects/);

  assert.match(players, /static func upsert_animation/);
  assert.match(players, /AnimationPlayer/);
  assert.match(players, /AnimationLibrary/);
  assert.match(players, /track_insert_key/);
  assert.match(players, /_apply_root_node\(player, body, true\)/);
  assert.match(players, /force_default or str\(player\.root_node\)\.is_empty\(\)/);

  assert.match(trees, /static func create_animation_tree_state_machine/);
  assert.match(trees, /AnimationNodeStateMachine/);
  assert.match(trees, /travel/);

  assert.match(state, /static func list_animations/);
  assert.match(state, /static func get_animation_state/);
  assert.match(state, /PackedScene/);

  assert.match(sideEffects, /Upserted animation/);
  assert.match(sideEffects, /Playing animation/);
});
