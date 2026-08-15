import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("Godot bridge exposes DrawableTexture2D authoring endpoints", async () => {
  const resourceRoutes = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_write_resource_routes.gd"),
    "utf8"
  );
  const writeEndpoints = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_write_route_endpoints.gd"),
    "utf8"
  );
  const writeTable = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_write_route_table.gd"),
    "utf8"
  );
  const operations = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_resource_drawable_texture_operations.gd"),
    "utf8"
  );

  assert.match(writeEndpoints, /\/resource\/drawable-texture\/create/);
  assert.match(writeEndpoints, /\/resource\/drawable-texture\/blit/);
  assert.match(writeTable, /_create_drawable_texture_2d/);
  assert.match(writeTable, /_blit_drawable_texture_2d/);
  assert.match(resourceRoutes, /_create_drawable_texture_2d/);
  assert.match(resourceRoutes, /NiuaMcpResourceOperations\.create_drawable_texture_2d/);
  assert.match(operations, /texture\.setup\(/);
  assert.match(operations, /texture\.blit_rect\(/);
  assert.match(operations, /DrawableTexture2D/);
});
