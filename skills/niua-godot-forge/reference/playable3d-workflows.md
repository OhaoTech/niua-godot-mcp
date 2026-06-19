# playable3d-workflows tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 2 (1 in v1, 1 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `create_3d_playable_blockout` | full | Compose a practical 3D playable scene blockout with root, ground mesh/collision, player body, visual capsule, chase camera, and key light. | host:string, port:number, expectedProjectRoot:string, rootName:string, parentPath:string, resourceDirectory:string, overwriteResources:boolean, groundSize:any, groundPosition:any, groundVisualName:string, groundBodyName:string, groundCollisionName:string, playerName:string, playerVisualName:string, playerCollisionName:string, playerPosition:any, playerRadius:number, playerHeight:number, cameraName:string, cameraPosition:any, cameraRotationDegrees:any, cameraFov:number, lightName:string, lightRotationDegrees:any, lightEnergy:number, rootProperties:object |
| `create_3d_character_controller` | v1, full | Create default WASD/space input actions, write a curated CharacterBody3D movement script, and attach it to a player node. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, scriptPath:string, className:string, speed:number, jumpVelocity:number, gravity:number, overwriteScript:boolean, validateAfterCreate:boolean, saveScene:boolean, configureInputMap:boolean, actionNames:object |
