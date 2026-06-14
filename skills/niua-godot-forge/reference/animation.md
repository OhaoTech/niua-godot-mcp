# animation tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 8 (0 in v1, 8 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `upsert_animation` | full | Create or replace an AnimationPlayer animation with property or transform tracks and keyframes. | host:string, port:number, playerPath:string, parentPath:string, playerName:string, rootNodePath:string, animationName*:string, length:number, loopMode:enum(none\|linear\|pingpong), tracks*:array |
| `list_animations` | full | List AnimationPlayer animations in the edited scene or inside an imported PackedScene such as a GLB. | host:string, port:number, playerPath:string, nodePath:string, scenePath:string |
| `play_animation` | full | Play an AnimationPlayer animation in the visible Godot editor. | host:string, port:number, playerPath*:string, animationName*:string, customBlend:number, customSpeed:number, fromEnd:boolean |
| `stop_animation` | full | Stop an AnimationPlayer animation in the visible Godot editor. | host:string, port:number, playerPath*:string, keepState:boolean |
| `get_animation_state` | full | Read an AnimationPlayer playback state and available animations. | host:string, port:number, playerPath*:string |
| `instance_animated_scene` | full | Instance an imported PackedScene that contains animations into the edited scene and report nested AnimationPlayers. | host:string, port:number, scenePath*:string, parentPath:string, name:string |
| `create_animation_tree_state_machine` | full | Create or update a basic AnimationTree StateMachine wired to an AnimationPlayer. | host:string, port:number, treePath:string, parentPath:string, treeName:string, playerPath*:string, states*:array, transitions:array, active:boolean |
| `travel_animation_tree` | full | Travel an AnimationTree StateMachine playback to a named state. | host:string, port:number, treePath*:string, state*:string |
