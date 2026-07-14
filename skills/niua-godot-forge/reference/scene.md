# scene tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 16 (6 in v1, 10 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `get_editor_state` | full | Read current visible Godot editor state from the NIUA editor plugin bridge. | host:string, port:number, expectedProjectRoot:string |
| `get_project_info` | v1, full | Read the active Godot project root and project metadata from the editor bridge. | host:string, port:number, expectedProjectRoot:string |
| `get_scene_tree` | v1, full | Read the current scene tree from the visible Godot editor. | host:string, port:number, expectedProjectRoot:string, maxDepth:number, pathFilter:string |
| `get_open_scene_tabs` | full | Read ordered open scene tabs and the current visible Godot scene tab. | host:string, port:number, expectedProjectRoot:string |
| `get_selection` | full | Read the current editor selection from the visible Godot editor, including per-node parent, owner, sibling, group, and metadata-key context. | host:string, port:number, expectedProjectRoot:string |
| `set_selection` | full | Replace the visible Godot editor node selection with one or more scene-tree nodes. | host:string, port:number, expectedProjectRoot:string, nodePaths*:array |
| `focus_node` | full | Select and focus a scene-tree node in the visible Godot editor. | host:string, port:number, expectedProjectRoot:string, nodePath*:string |
| `open_scene` | v1, full | Open an existing scene in the visible Godot editor. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `create_scene` | v1, full | Create a new scene file with a configurable root node and optionally open it in the visible Godot editor. | host:string, port:number, expectedProjectRoot:string, path*:string, rootType:string, rootName:string, open:boolean, overwrite:boolean |
| `save_scene_as` | v1, full | Save the current edited scene to a new scene path under res://. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `switch_scene_tab` | full | Switch the visible Godot editor to an open scene tab, opening it if needed. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `close_scene` | full | Close the current Godot scene tab, optionally switching to and saving a target scene first. | host:string, port:number, expectedProjectRoot:string, path:string, saveBeforeClose:boolean |
| `mark_scene_unsaved` | full | Mark the current or target Godot scene tab as unsaved for dirty-state workflows. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `undo_editor_action` | full | Undo the current Godot editor scene/history action, optionally targeting a historyId from get_open_scene_tabs. | host:string, port:number, expectedProjectRoot:string, historyId:number |
| `redo_editor_action` | full | Redo the current Godot editor scene/history action, optionally targeting a historyId from get_open_scene_tabs. | host:string, port:number, expectedProjectRoot:string, historyId:number |
| `save_current_scene` | v1, full | Save the current edited Godot scene. | host:string, port:number, expectedProjectRoot:string |
