# project-settings tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 5 (0 in v1, 5 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `get_project_settings` | full | Read Godot Project Settings values, category tree, usage flags, and editor metadata, optionally filtered by prefix. | host:string, port:number, expectedProjectRoot:string, prefix:string, query:string, editorVisible:boolean, basic:boolean, internal:boolean, restartIfChanged:boolean |
| `set_project_setting` | full | Set a Godot Project Settings value and optionally save project.godot. | host:string, port:number, expectedProjectRoot:string, name*:string, value*:any, save:boolean |
| `set_project_setting_metadata` | full | Update Godot Project Settings metadata such as order, initial value, basic/internal visibility, and restart-required flags. | host:string, port:number, expectedProjectRoot:string, name*:string, order:number, initialValue:any, basic:boolean, internal:boolean, restartIfChanged:boolean, save:boolean |
| `get_input_map` | full | Read Godot Input Map actions and supported event bindings. | host:string, port:number, expectedProjectRoot:string |
| `set_input_action` | full | Create or replace a Godot Input Map action with keyboard or joypad button events. | host:string, port:number, expectedProjectRoot:string, name*:string, deadzone:number, replace:boolean, events:array, save:boolean |
