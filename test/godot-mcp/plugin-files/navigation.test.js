import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact
} from "../helpers/plugin-files.js";

test("Godot Navigation bridge routes live in a focused write route module", async () => {
  const writeRoutes = await readAddonFileExact("niua_mcp_bridge_write_routes.gd");
  const writeNavigationRoutes = await readAddonFile("niua_mcp_bridge_write_navigation_routes.gd");
  const writeEndpoints = await readAddonFile("niua_mcp_bridge_write_route_endpoints.gd");
  const writeRouteTable = await readAddonFile("niua_mcp_bridge_write_route_table.gd");

  assert.match(writeRoutes, /preload\("niua_mcp_bridge_write_navigation_routes\.gd"\)/);
  assert.match(writeRoutes, /NiuaMcpBridgeWriteNavigationRoutes\.new\(\)/);
  assert.match(writeRoutes, /"_create_navigation_region_3d": true/);
  assert.match(writeRoutes, /"_bake_navigation_mesh_3d": true/);
  assert.match(writeRoutes, /"_create_navigation_target_follow_script": true/);

  assert.match(writeNavigationRoutes, /extends RefCounted/);
  assert.match(writeNavigationRoutes, /func _create_navigation_region_3d\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeNavigationRoutes, /NiuaMcpNavigationOperations\.create_navigation_region_3d_with_side_effects/);
  assert.match(writeNavigationRoutes, /func _bake_navigation_mesh_3d\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeNavigationRoutes, /NiuaMcpNavigationOperations\.bake_navigation_mesh_3d_with_side_effects/);

  assert.match(writeEndpoints, /"\/navigation\/region\/create"/);
  assert.match(writeEndpoints, /"\/navigation\/script\/target-follow\/create"/);
  assert.match(writeRouteTable, /"\/navigation\/mesh\/bake": \{ "handler": "_bake_navigation_mesh_3d", "arg": "body", "methodError": "navigation mesh bake requires POST" \}/);
});

test("Godot Navigation operations are split by focused operation modules", async () => {
  const facade = await readAddonFile("niua_mcp_navigation_operations.gd");
  const region = await readAddonFile("niua_mcp_navigation_region_operations.gd");
  const agent = await readAddonFile("niua_mcp_navigation_agent_operations.gd");
  const script = await readAddonFile("niua_mcp_navigation_script_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_navigation_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_navigation_region_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_navigation_agent_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_navigation_script_operations\.gd"\)/);
  assert.match(facade, /static func create_navigation_region_3d_with_side_effects/);
  assert.match(facade, /static func create_navigation_target_follow_script/);

  assert.match(region, /static func create_navigation_region_3d/);
  assert.match(region, /NavigationRegion3D\.new\(\)/);
  assert.match(region, /NavigationMesh\.new\(\)/);
  assert.match(region, /bake_navigation_mesh/);

  assert.match(agent, /static func create_navigation_agent_3d/);
  assert.match(agent, /NavigationAgent3D\.new\(\)/);

  assert.match(script, /static func create_navigation_target_follow_script/);
  assert.match(script, /NavigationAgent3D/);
  assert.match(script, /target_position/);

  assert.match(sideEffects, /Created NavigationRegion3D/);
  assert.match(sideEffects, /Baked NavigationMesh/);
});
