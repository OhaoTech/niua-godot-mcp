import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("Godot bridge exposes TileMapLayer terrain paint endpoint", async () => {
  const sceneRoutes = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_write_scene_routes.gd"),
    "utf8"
  );
  const router = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_router.gd"),
    "utf8"
  );
  const writeCatalog = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_write_route_catalog.gd"),
    "utf8"
  );
  const writeEndpoints = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_write_route_endpoints.gd"),
    "utf8"
  );
  const tileMapRoutes = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_write_scene_tile_map_routes.gd"),
    "utf8"
  );
  const tileMapLayerTerrainOperations = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_tile_map_layer_terrain_operations.gd"),
    "utf8"
  );
  const tileMapLayerOperations = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_tile_map_layer_operations.gd"),
    "utf8"
  );

  assert.match(`${router}\n${writeCatalog}\n${writeEndpoints}`, /\/scene\/tile-map-layer\/terrain\/paint/);
  assert.match(sceneRoutes, /_paint_tile_map_layer_terrain/);
  assert.match(tileMapRoutes, /NiuaMcpTileMapLayerOperations\.paint_terrain/);
  assert.match(tileMapLayerOperations, /NiuaMcpTileMapLayerTerrainOperations\.paint_terrain/);
  assert.match(tileMapLayerTerrainOperations, /set_cells_terrain_connect/);
  assert.match(tileMapLayerTerrainOperations, /set_cells_terrain_path/);
});
