import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact
} from "../helpers/plugin-files.js";

test("Godot UI bridge routes live in a focused write route module", async () => {
  const writeRoutes = await readAddonFileExact("niua_mcp_bridge_write_routes.gd");
  const writeUiRoutes = await readAddonFile("niua_mcp_bridge_write_ui_routes.gd");
  const writeEndpoints = await readAddonFile("niua_mcp_bridge_write_route_endpoints.gd");
  const writeRouteTable = await readAddonFile("niua_mcp_bridge_write_route_table.gd");

  assert.match(writeRoutes, /preload\("niua_mcp_bridge_write_ui_routes\.gd"\)/);
  assert.match(writeRoutes, /NiuaMcpBridgeWriteUiRoutes\.new\(\)/);
  assert.match(writeRoutes, /"_create_ui_control": true/);
  assert.match(writeRoutes, /"_create_ui_theme": true/);
  assert.match(writeRoutes, /"_connect_ui_signal": true/);

  assert.match(writeUiRoutes, /extends RefCounted/);
  assert.match(writeUiRoutes, /func _create_ui_control\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeUiRoutes, /NiuaMcpUiOperations\.create_ui_control_with_side_effects/);
  assert.match(writeUiRoutes, /func _set_control_layout\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeUiRoutes, /NiuaMcpUiOperations\.set_control_layout_with_side_effects/);
  assert.match(writeUiRoutes, /func _connect_ui_signal\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeUiRoutes, /NiuaMcpUiOperations\.connect_ui_signal_with_side_effects/);

  assert.match(writeEndpoints, /"\/ui\/control\/create"/);
  assert.match(writeEndpoints, /"\/ui\/theme\/override"/);
  assert.match(writeRouteTable, /"\/ui\/signal\/connect": \{ "handler": "_connect_ui_signal", "arg": "body", "methodError": "UI signal connection requires POST" \}/);
});

test("Godot UI operations are split by focused operation modules", async () => {
  const facade = await readAddonFile("niua_mcp_ui_operations.gd");
  const controls = await readAddonFile("niua_mcp_ui_control_operations.gd");
  const layout = await readAddonFile("niua_mcp_ui_layout_operations.gd");
  const theme = await readAddonFile("niua_mcp_ui_theme_operations.gd");
  const signals = await readAddonFile("niua_mcp_ui_signal_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_ui_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_ui_control_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_ui_layout_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_ui_theme_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_ui_signal_operations\.gd"\)/);
  assert.match(facade, /static func create_ui_control_with_side_effects/);
  assert.match(facade, /static func apply_ui_theme_override/);

  assert.match(controls, /static func create_ui_control/);
  assert.match(controls, /SUPPORTED_CONTROL_TYPES/);
  assert.match(controls, /TextureRect/);

  assert.match(layout, /static func set_control_layout/);
  assert.match(layout, /anchor_left/);
  assert.match(layout, /offset_right/);

  assert.match(theme, /static func create_ui_theme/);
  assert.match(theme, /Theme\.new\(\)/);
  assert.match(theme, /add_theme_font_size_override/);

  assert.match(signals, /static func connect_ui_signal/);
  assert.match(signals, /Callable\(target, method_name\)/);

  assert.match(sideEffects, /Created UI control/);
  assert.match(sideEffects, /Connected UI signal/);
});
