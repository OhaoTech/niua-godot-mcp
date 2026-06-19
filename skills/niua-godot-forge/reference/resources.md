# resources tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 9 (0 in v1, 9 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `open_resource` | full | Open a scene/resource/script in the visible Godot editor. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `focus_resource` | full | Reveal and inspect a resource path in the visible Godot editor when supported by the local editor API. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `create_resource` | full | Create and save a Godot Resource-derived asset under res://, such as a material .tres. | host:string, port:number, expectedProjectRoot:string, path*:string, className*:string, properties:object, open:boolean, overwrite:boolean |
| `save_resource` | full | Load, update, and save an existing Godot Resource asset under res://. | host:string, port:number, expectedProjectRoot:string, path*:string, properties:object, open:boolean |
| `create_sprite_frames` | full | Create a SpriteFrames resource from named animations and existing Texture2D frame resources. | host:string, port:number, expectedProjectRoot:string, path*:string, resourceName:string, animations*:array, open:boolean, overwrite:boolean |
| `create_tile_set` | full | Create a TileSet resource from existing Texture2D atlases, explicit tile coordinates, and generated atlas grids. | host:string, port:number, expectedProjectRoot:string, path*:string, resourceName:string, tileSize:any, sources*:array, physicsLayers:array, terrainSets:array, open:boolean, overwrite:boolean |
| `create_material` | full | Create a StandardMaterial3D asset from practical material fields and optionally assign it to a scene node. | host:string, port:number, expectedProjectRoot:string, path*:string, className:string, name:string, albedoColor:any, baseColor:any, alpha:number, metallic:number, roughness:number, emissionColor:any, emissionEnabled:boolean, emissionEnergyMultiplier:number, transparency:any, cullMode:any, shadingMode:any, open:boolean, overwrite:boolean, assignToNode:object, properties:object |
| `create_shader_material` | full | Create a Shader resource plus ShaderMaterial resource, set shader uniform values, and optionally assign it to a scene node. | host:string, port:number, expectedProjectRoot:string, path*:string, shaderPath*:string, resourceName:string, name:string, code*:string, parameters:object, open:boolean, overwrite:boolean, overwriteShader:boolean, assignToNode:object |
| `assign_material` | full | Assign a saved Godot Material resource to a scene node material override or mesh surface. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, materialPath*:string, surfaceIndex:number |
