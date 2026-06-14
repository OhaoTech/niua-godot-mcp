import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact
} from "../helpers/plugin-files.js";

test("Godot Audio bridge routes live in focused read and write route modules", async () => {
  const readRoutes = await readAddonFileExact("niua_mcp_bridge_read_routes.gd");
  const readAudioRoutes = await readAddonFile("niua_mcp_bridge_read_audio_routes.gd");
  const readCatalog = await readAddonFile("niua_mcp_bridge_read_route_catalog.gd");
  const writeRoutes = await readAddonFileExact("niua_mcp_bridge_write_routes.gd");
  const writeAudioRoutes = await readAddonFile("niua_mcp_bridge_write_audio_routes.gd");
  const writeEndpoints = await readAddonFile("niua_mcp_bridge_write_route_endpoints.gd");
  const writeRouteTable = await readAddonFile("niua_mcp_bridge_write_route_table.gd");

  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_audio_routes\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpBridgeReadAudioRoutes\.new\(\)/);
  assert.match(readRoutes, /"_list_audio_buses": true/);
  assert.match(readAudioRoutes, /func _list_audio_buses\(_query: Dictionary\) -> Dictionary:/);
  assert.match(readAudioRoutes, /NiuaMcpAudioOperations\.list_audio_buses/);
  assert.match(readCatalog, /"\/audio\/buses": \{ "handler": "_list_audio_buses", "arg": "query" \}/);

  assert.match(writeRoutes, /preload\("niua_mcp_bridge_write_audio_routes\.gd"\)/);
  assert.match(writeRoutes, /NiuaMcpBridgeWriteAudioRoutes\.new\(\)/);
  assert.match(writeRoutes, /"_upsert_audio_bus": true/);
  assert.match(writeRoutes, /"_create_audio_stream_player": true/);
  assert.match(writeAudioRoutes, /func _upsert_audio_bus\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeAudioRoutes, /NiuaMcpAudioOperations\.upsert_audio_bus_with_side_effects/);

  assert.match(writeEndpoints, /"\/audio\/bus\/upsert"/);
  assert.match(writeEndpoints, /"\/audio\/player\/create"/);
  assert.match(writeRouteTable, /"\/audio\/bus\/effect\/upsert": \{ "handler": "_upsert_audio_bus_effect", "arg": "body", "methodError": "audio bus effect upsert requires POST" \}/);
});

test("Godot Audio operations are split by focused operation modules", async () => {
  const facade = await readAddonFile("niua_mcp_audio_operations.gd");
  const bus = await readAddonFile("niua_mcp_audio_bus_operations.gd");
  const effect = await readAddonFile("niua_mcp_audio_effect_operations.gd");
  const player = await readAddonFile("niua_mcp_audio_player_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_audio_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_audio_bus_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_audio_effect_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_audio_player_operations\.gd"\)/);
  assert.match(facade, /static func list_audio_buses/);
  assert.match(facade, /static func create_audio_stream_player_with_side_effects/);

  assert.match(bus, /AudioServer\.add_bus/);
  assert.match(bus, /AudioServer\.set_bus_volume_db/);
  assert.match(bus, /AudioServer\.set_bus_mute/);

  assert.match(effect, /AudioEffectReverb\.new\(\)/);
  assert.match(effect, /AudioEffectLimiter\.new\(\)/);
  assert.match(effect, /AudioServer\.add_bus_effect/);

  assert.match(player, /AudioStreamPlayer\.new\(\)/);
  assert.match(player, /AudioStreamGenerator\.new\(\)/);
  assert.match(player, /player\.bus/);

  assert.match(sideEffects, /Upserted audio bus/);
  assert.match(sideEffects, /Created AudioStreamPlayer/);
});
