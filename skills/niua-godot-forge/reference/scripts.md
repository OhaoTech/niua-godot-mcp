# scripts tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 13 (5 in v1, 8 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `read_script` | v1, full | Read a GDScript file from the Godot project. | host:string, port:number, path*:string |
| `write_script` | v1, full | Write a GDScript file under res:// and refresh the Godot editor filesystem. | host:string, port:number, path*:string, content*:string |
| `open_script` | full | Open a GDScript file in the visible Godot editor. | host:string, port:number, path*:string |
| `validate_script` | full | Validate that a GDScript file can be loaded by Godot. | host:string, port:number, path*:string |
| `diagnose_script` | v1, full | Run Godot's GDScript parser for a res:// script and return structured diagnostics. | projectRoot*:string, path*:string, timeoutMs:number |
| `diagnose_project_scripts` | full | Run Godot's GDScript parser across explicit or discovered project scripts and return aggregate diagnostics. | projectRoot*:string, rootPath:string, paths:array, maxScripts:integer, timeoutMs:number |
| `get_script_symbols` | full | Read Godot script symbol metadata including methods, properties, signals, and constants. | host:string, port:number, path*:string |
| `get_script_editor_state` | full | Read visible Godot Script Editor state including current script, open scripts, and breakpoints. | host:string, port:number |
| `get_script_cursor_state` | full | Read active Godot Script Editor caret, selection, and visible-line metadata. | host:string, port:number |
| `goto_script_line` | full | Open a script in the visible Godot Script Editor and focus a 1-based line number. | host:string, port:number, path*:string, line*:number, column:number, grabFocus:boolean |
| `replace_in_scripts` | full | Preview or apply a capped literal replacement across GDScript files in the Godot project. | host:string, port:number, search*:string, replacement*:string, paths:array, rootPath:string, caseSensitive:boolean, dryRun:boolean, maxFiles:integer, maxReplacements:integer |
| `create_script` | v1, full | Create a GDScript file using supplied content or a generated template with optional class_name. | host:string, port:number, path*:string, baseType:string, template:enum(extends_only\|node_lifecycle\|node_process\|tool_node), className:string, content:string, overwrite:boolean |
| `attach_script` | v1, full | Attach a GDScript file to a node in the current edited Godot scene. | host:string, port:number, nodePath*:string, scriptPath*:string, createIfMissing:boolean, baseType:string, template:enum(extends_only\|node_lifecycle\|node_process\|tool_node), className:string, content:string, saveScene:boolean |
