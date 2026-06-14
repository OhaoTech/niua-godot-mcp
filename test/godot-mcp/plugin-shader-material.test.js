import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("Godot bridge exposes ShaderMaterial creation endpoint", async () => {
  const resourceRoutes = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_bridge_write_resource_routes.gd"),
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
  const shaderMaterialOperations = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_resource_shader_material_operations.gd"),
    "utf8"
  );
  const shaderMaterialBuilder = await readFile(
    path.join(repoRoot, "godot/addons/niua_mcp/niua_mcp_shader_material_builder.gd"),
    "utf8"
  );

  assert.match(`${router}\n${writeCatalog}\n${writeEndpoints}`, /\/resource\/shader-material\/create/);
  assert.match(resourceRoutes, /_create_shader_material_resource/);
  assert.match(resourceRoutes, /NiuaMcpResourceOperations\.create_shader_material_resource/);
  assert.match(shaderMaterialOperations, /NiuaMcpShaderMaterialBuilder\.build/);
  assert.match(shaderMaterialBuilder, /Shader\.new/);
  assert.match(shaderMaterialBuilder, /ShaderMaterial\.new/);
  assert.match(shaderMaterialBuilder, /set_shader_parameter/);
});
