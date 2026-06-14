import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact
} from "../helpers/plugin-files.js";

test("Godot Particles bridge routes live in a focused write route module", async () => {
  const writeRoutes = await readAddonFileExact("niua_mcp_bridge_write_routes.gd");
  const writeParticlesRoutes = await readAddonFile("niua_mcp_bridge_write_particles_routes.gd");
  const writeEndpoints = await readAddonFile("niua_mcp_bridge_write_route_endpoints.gd");
  const writeRouteTable = await readAddonFile("niua_mcp_bridge_write_route_table.gd");

  assert.match(writeRoutes, /preload\("niua_mcp_bridge_write_particles_routes\.gd"\)/);
  assert.match(writeRoutes, /NiuaMcpBridgeWriteParticlesRoutes\.new\(\)/);
  assert.match(writeRoutes, /"_create_gpu_particles_3d": true/);
  assert.match(writeRoutes, /"_configure_particle_process_material": true/);
  assert.match(writeRoutes, /"_set_particles_emitting": true/);

  assert.match(writeParticlesRoutes, /extends RefCounted/);
  assert.match(writeParticlesRoutes, /func _create_gpu_particles_3d\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeParticlesRoutes, /NiuaMcpParticlesOperations\.create_gpu_particles_3d_with_side_effects/);
  assert.match(writeParticlesRoutes, /func _configure_particle_process_material\(body: Dictionary\) -> Dictionary:/);
  assert.match(writeParticlesRoutes, /NiuaMcpParticlesOperations\.configure_particle_process_material_with_side_effects/);

  assert.match(writeEndpoints, /"\/particles\/create-3d"/);
  assert.match(writeEndpoints, /"\/particles\/emitting\/set"/);
  assert.match(writeRouteTable, /"\/particles\/material\/configure": \{ "handler": "_configure_particle_process_material", "arg": "body", "methodError": "particle material configuration requires POST" \}/);
});

test("Godot Particles operations are split by focused operation modules", async () => {
  const facade = await readAddonFile("niua_mcp_particles_operations.gd");
  const create = await readAddonFile("niua_mcp_particles_create_operations.gd");
  const material = await readAddonFile("niua_mcp_particles_material_operations.gd");
  const state = await readAddonFile("niua_mcp_particles_state_operations.gd");
  const sideEffects = await readAddonFile("niua_mcp_particles_side_effects.gd");

  assert.match(facade, /preload\("niua_mcp_particles_create_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_particles_material_operations\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_particles_state_operations\.gd"\)/);
  assert.match(facade, /static func create_gpu_particles_3d_with_side_effects/);
  assert.match(facade, /static func set_particles_emitting/);

  assert.match(create, /static func create_gpu_particles_3d/);
  assert.match(create, /GPUParticles3D/);
  assert.match(create, /SphereMesh/);
  assert.match(create, /static func create_gpu_particles_2d/);
  assert.match(create, /GPUParticles2D/);

  assert.match(material, /static func configure_particle_process_material/);
  assert.match(material, /ParticleProcessMaterial\.new\(\)/);
  assert.match(material, /GradientTexture1D/);
  assert.match(material, /emission_shape/);

  assert.match(state, /static func set_particles_emitting/);
  assert.match(state, /restart\(\)/);

  assert.match(sideEffects, /Created GPUParticles3D/);
  assert.match(sideEffects, /Configured particle material/);
});
