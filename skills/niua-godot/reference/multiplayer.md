# multiplayer tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 4 (0 in v1, 4 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `create_enet_multiplayer_script` | full | Generate and attach a minimal ENet host/join script for localhost multiplayer probes. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, scriptPath*:string, statePath*:string, propertyName*:string, hostValue:string, defaultPort:integer, overwrite:boolean |
| `create_multiplayer_spawner` | full | Create a MultiplayerSpawner with spawn path, limit, and optional spawnable scenes. | host:string, port:number, expectedProjectRoot:string, parentPath:string, name:string, spawnPath:string, spawnLimit:integer, spawnableScenes:array |
| `create_multiplayer_synchronizer` | full | Create a MultiplayerSynchronizer with a SceneReplicationConfig for selected property paths. | host:string, port:number, expectedProjectRoot:string, parentPath*:string, name:string, rootPath:string, propertyPaths*:array, replicationInterval:number, deltaInterval:number, publicVisibility:boolean |
| `create_multiplayer_state_script` | full | Generate and attach a small Node script exposing one synchronized string property. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, scriptPath*:string, propertyName*:string, initialValue:string, overwrite:boolean |
