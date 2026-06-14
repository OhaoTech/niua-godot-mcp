import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact
} from "../helpers/plugin-files.js";

test("Godot Localization bridge routes live in focused read and write route modules", async () => {
  const readRoutes = await readAddonFileExact("niua_mcp_bridge_read_routes.gd");
  const readLocalizationRoutes = await readAddonFile("niua_mcp_bridge_read_localization_routes.gd");
  const readCatalog = await readAddonFile("niua_mcp_bridge_read_route_catalog.gd");
  const writeRoutes = await readAddonFileExact("niua_mcp_bridge_write_routes.gd");
  const writeLocalizationRoutes = await readAddonFile("niua_mcp_bridge_write_localization_routes.gd");
  const writeEndpoints = await readAddonFile("niua_mcp_bridge_write_route_endpoints.gd");
  const writeRouteTable = await readAddonFile("niua_mcp_bridge_write_route_table.gd");

  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_localization_routes\.gd"\)/);
  assert.match(readRoutes, /NiuaMcpBridgeReadLocalizationRoutes\.new\(\)/);
  assert.match(readRoutes, /"_get_localization_state": true/);
  assert.match(readLocalizationRoutes, /func _get_localization_state\(_query: Dictionary\) -> Dictionary:/);
  assert.match(readLocalizationRoutes, /NiuaMcpLocalizationOperations\.get_localization_state/);
  assert.match(readCatalog, /"\/localization\/state": \{ "handler": "_get_localization_state", "arg": "query" \}/);

  assert.match(writeRoutes, /preload\("niua_mcp_bridge_write_localization_routes\.gd"\)/);
  assert.match(writeRoutes, /NiuaMcpBridgeWriteLocalizationRoutes\.new\(\)/);
  assert.match(writeRoutes, /"_create_csv_translation": true/);
  assert.match(writeRoutes, /"_set_locale": true/);
  assert.match(writeLocalizationRoutes, /func _create_csv_translation\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeLocalizationRoutes, /NiuaMcpLocalizationOperations\.create_csv_translation_with_side_effects/);

  assert.match(writeEndpoints, /"\/localization\/csv\/create"/);
  assert.match(writeEndpoints, /"\/localization\/locale\/set"/);
  assert.match(writeRouteTable, /"\/localization\/file\/register": \{ "handler": "_register_translation_file", "arg": "body", "methodError": "translation file registration requires POST" \}/);
});

test("Godot Localization operations are split by focused operation modules", async () => {
  const facade = await readAddonFile("niua_mcp_localization_operations.gd");
  const csv = await readAddonFile("niua_mcp_localization_csv_operations.gd");
  const registry = await readAddonFile("niua_mcp_localization_registry_operations.gd");
  const locale = await readAddonFile("niua_mcp_localization_locale_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_localization_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_localization_csv_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_localization_registry_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_localization_locale_operations\.gd"\)/);
  assert.match(facade, /static func get_localization_state/);
  assert.match(facade, /static func create_csv_translation_with_side_effects/);

  assert.match(csv, /Translation\.new\(\)/);
  assert.match(csv, /add_message/);
  assert.match(csv, /ResourceSaver\.save/);

  assert.match(registry, /internationalization\/locale\/translations/);
  assert.match(registry, /ProjectSettings\.save/);
  assert.match(registry, /TranslationServer\.add_translation/);

  assert.match(locale, /TranslationServer\.set_locale/);
  assert.match(locale, /TranslationServer\.get_locale/);

  assert.match(sideEffects, /Created CSV translation/);
  assert.match(sideEffects, /Set locale/);
});
