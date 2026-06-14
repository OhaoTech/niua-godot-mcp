import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact
} from "../helpers/plugin-files.js";

test("Godot Multiplayer bridge routes live in a focused write route module", async () => {
  const writeRoutes = await readAddonFileExact("niua_mcp_bridge_write_routes.gd");
  const writeMultiplayerRoutes = await readAddonFile("niua_mcp_bridge_write_multiplayer_routes.gd");
  const writeEndpoints = await readAddonFile("niua_mcp_bridge_write_route_endpoints.gd");
  const writeRouteTable = await readAddonFile("niua_mcp_bridge_write_route_table.gd");

  assert.match(writeRoutes, /preload\("niua_mcp_bridge_write_multiplayer_routes\.gd"\)/);
  assert.match(writeRoutes, /NiuaMcpBridgeWriteMultiplayerRoutes\.new\(\)/);
  assert.match(writeRoutes, /"_create_enet_multiplayer_script": true/);
  assert.match(writeRoutes, /"_create_multiplayer_synchronizer": true/);

  assert.match(writeMultiplayerRoutes, /func _create_enet_multiplayer_script\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeMultiplayerRoutes, /NiuaMcpMultiplayerOperations\.create_enet_multiplayer_script_with_side_effects/);
  assert.match(writeMultiplayerRoutes, /func _create_multiplayer_synchronizer\(body: Dictionary\) -> Dictionary:/);

  assert.match(writeEndpoints, /"\/multiplayer\/enet-script\/create"/);
  assert.match(writeEndpoints, /"\/multiplayer\/synchronizer\/create"/);
  assert.match(writeRouteTable, /"\/multiplayer\/spawner\/create": \{ "handler": "_create_multiplayer_spawner", "arg": "body", "methodError": "multiplayer spawner creation requires POST" \}/);
});

test("Godot Multiplayer operations are split by focused operation modules", async () => {
  const facade = await readAddonFile("niua_mcp_multiplayer_operations.gd");
  const enet = await readAddonFile("niua_mcp_multiplayer_enet_script_operations.gd");
  const replication = await readAddonFile("niua_mcp_multiplayer_replication_operations.gd");
  const state = await readAddonFile("niua_mcp_multiplayer_state_script_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_multiplayer_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_multiplayer_enet_script_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_multiplayer_replication_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_multiplayer_state_script_operations\.gd"\)/);

  assert.match(enet, /ENetMultiplayerPeer/);
  assert.match(enet, /create_server/);
  assert.match(enet, /create_client/);

  assert.match(replication, /MultiplayerSpawner\.new\(\)/);
  assert.match(replication, /MultiplayerSynchronizer\.new\(\)/);
  assert.match(replication, /SceneReplicationConfig\.new\(\)/);

  assert.match(state, /@export var/);
  assert.match(state, /set_script/);

  assert.match(sideEffects, /Created ENet multiplayer script/);
  assert.match(sideEffects, /Created MultiplayerSynchronizer/);
});
