# filesystem tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 10 (5 in v1, 5 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `get_filesystem_dock_state` | full | Read visible Godot FileSystem dock selection, current path/current directory, and scan progress. | host:string, port:number |
| `list_filesystem` | v1, full | List Godot FileSystem dock entries under a res:// path. | host:string, port:number, path:string, recursive:boolean |
| `create_folder` | v1, full | Create a folder under the Godot project res:// filesystem. | host:string, port:number, path*:string |
| `read_text_file` | v1, full | Read a UTF-8 text file from the Godot project res:// filesystem. | host:string, port:number, path*:string |
| `write_text_file` | v1, full | Write a UTF-8 text file under the Godot project res:// filesystem. | host:string, port:number, path*:string, content*:string |
| `write_binary_file` | v1, full | Write a base64-encoded binary file under the Godot project res:// filesystem. | host:string, port:number, path*:string, contentBase64*:string |
| `move_filesystem_entry` | full | Move or rename a file or folder under the Godot project res:// filesystem. | host:string, port:number, fromPath*:string, toPath*:string |
| `copy_filesystem_entry` | full | Copy a file or folder under the Godot project res:// filesystem. | host:string, port:number, fromPath*:string, toPath*:string, overwrite:boolean |
| `batch_filesystem_operations` | full | Run ordered copy, move, and delete operations under the Godot project res:// filesystem. | host:string, port:number, operations*:array, continueOnError:boolean, dryRun:boolean |
| `delete_filesystem_entry` | full | Delete a file or empty folder under the Godot project res:// filesystem. | host:string, port:number, path*:string |
