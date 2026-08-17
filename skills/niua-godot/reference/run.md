# run tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 8 (6 in v1, 2 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `get_run_settings` | v1, full | Read Godot run settings such as the configured main scene. | host:string, port:number, expectedProjectRoot:string |
| `set_main_scene` | v1, full | Set application/run/main_scene to a scene path through the visible Godot editor bridge. | host:string, port:number, expectedProjectRoot:string, path*:string, save:boolean |
| `get_run_status` | v1, full | Read whether the Godot editor is currently playing a scene. | host:string, port:number, expectedProjectRoot:string |
| `run_main_scene` | v1, full | Run the project's main scene from the visible Godot editor. | host:string, port:number, expectedProjectRoot:string, saveBeforeRun:boolean |
| `run_current_scene` | full | Run the currently edited scene from the visible Godot editor. | host:string, port:number, expectedProjectRoot:string, saveBeforeRun:boolean |
| `run_custom_scene` | v1, full | Run a specific scene path from the visible Godot editor. | host:string, port:number, expectedProjectRoot:string, path*:string, saveBeforeRun:boolean |
| `stop_running_scene` | v1, full | Stop the scene currently playing from the Godot editor. | host:string, port:number, expectedProjectRoot:string |
| `reload_running_scene` | full | Reload the currently running Godot scene by stopping playback and starting the same scene again. | host:string, port:number, expectedProjectRoot:string, saveBeforeRun:boolean |
