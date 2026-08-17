# navigation tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 4 (0 in v1, 4 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `create_navigation_region_3d` | full | Create a NavigationRegion3D with a NavigationMesh resource and practical agent/bake settings. | host:string, port:number, expectedProjectRoot:string, parentPath:string, name:string, enabled:boolean, cellSize:number, cellHeight:number, agentRadius:number, agentHeight:number, agentMaxClimb:number, agentMaxSlope:number, sourceGeometryMode:integer, parsedGeometryType:integer |
| `bake_navigation_mesh_3d` | full | Bake the NavigationMesh for a NavigationRegion3D from scene geometry. | host:string, port:number, expectedProjectRoot:string, regionPath*:string, onThread:boolean, timeoutMs:number |
| `create_navigation_agent_3d` | full | Create a NavigationAgent3D under an actor node with practical path-following settings. | host:string, port:number, expectedProjectRoot:string, parentPath*:string, name:string, radius:number, height:number, pathDesiredDistance:number, targetDesiredDistance:number, pathMaxDistance:number, maxSpeed:number, targetPosition:object |
| `create_navigation_target_follow_script` | full | Generate and attach a CharacterBody3D script template that follows a target through a NavigationAgent3D. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, agentPath:string, targetPath:string, scriptPath*:string, speed:number, overwrite:boolean |
