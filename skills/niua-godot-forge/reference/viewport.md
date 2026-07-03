# viewport tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 7 (1 in v1, 6 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `capture_editor_screenshot` | full | Capture a PNG screenshot of the visible Godot editor. Pass savePath to write the PNG to disk and keep large base64 payloads out of the tool result. Returns available=false when the active renderer cannot expose editor pixels, such as headless mode. | host:string, port:number, expectedProjectRoot:string, savePath:string |
| `capture_viewport_screenshot` | full | Capture a PNG screenshot from the Godot editor 2D or 3D viewport. Pass savePath to write the PNG to disk and keep large base64 payloads out of the tool result. Returns available=false when the active renderer cannot expose viewport pixels, such as headless mode. | host:string, port:number, expectedProjectRoot:string, savePath:string, viewport:string, index:number |
| `get_viewport_state` | full | Read Godot editor 2D or 3D viewport size and active camera metadata when exposed by the editor. | host:string, port:number, expectedProjectRoot:string, savePath:string, viewport:string, index:number |
| `set_viewport_camera` | full | Move the active Godot editor 2D or 3D viewport camera, then return updated camera metadata. | host:string, port:number, expectedProjectRoot:string, viewport:string, index:number, position:object, zoom:object, rotation:any, rotationDegrees:any, fov:number, near:number, far:number |
| `send_viewport_input` | full | Send mouse pointer events into a Godot editor 2D or 3D viewport using viewport-local coordinates. | host:string, port:number, expectedProjectRoot:string, viewport:string, index:number, local:boolean, notifyMouseEntered:boolean, updateMouseCursorState:boolean, events*:array |
| `set_editor_main_screen` | full | Switch the visible Godot editor main screen, such as 2D, 3D, Script, Game, or AssetLib. | host:string, port:number, expectedProjectRoot:string, screen*:string |
| `invoke_editor_action` | v1, full | Invoke a conservative allowlisted Godot editor action such as select_file, filesystem_scan, reload_scene_from_path, save_scene, or set_distraction_free_mode. | host:string, port:number, expectedProjectRoot:string, action*:enum(set_distraction_free_mode\|select_file\|filesystem_scan\|filesystem_scan_sources\|filesystem_update_file\|reload_scene_from_path\|save_scene\|save_all_scenes\|mark_scene_as_unsaved\|set_movie_maker_enabled), params:object |
