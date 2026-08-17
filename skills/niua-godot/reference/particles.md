# particles tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 4 (0 in v1, 4 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `create_gpu_particles_3d` | full | Create a GPUParticles3D emitter with a draw-pass mesh and optional ParticleProcessMaterial settings. | host:string, port:number, expectedProjectRoot:string, parentPath:string, name:string, amount:integer, lifetime:number, oneShot:boolean, emitting:boolean, preprocess:number, material:object, position:object, rotationDegrees:object, scale:object, meshType:enum(sphere\|box\|quad), meshRadius:number, meshSize:object, quadSize:object |
| `create_gpu_particles_2d` | full | Create a GPUParticles2D emitter with a default texture and optional ParticleProcessMaterial settings. | host:string, port:number, expectedProjectRoot:string, parentPath:string, name:string, amount:integer, lifetime:number, oneShot:boolean, emitting:boolean, preprocess:number, material:object, position:object, scale:object, textureSize:integer |
| `configure_particle_process_material` | full | Create or update the ParticleProcessMaterial on a GPUParticles2D or GPUParticles3D node. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, replace:boolean, material*:object |
| `set_particles_emitting` | full | Set a GPUParticles2D or GPUParticles3D node's emitting and one-shot state, optionally restarting it. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, emitting:boolean, oneShot:boolean, restart:boolean |
