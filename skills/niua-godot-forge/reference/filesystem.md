# filesystem tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 10 (5 in v1, 5 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `get_filesystem_dock_state` | full | Read visible Godot FileSystem dock selection, current path/current directory, and scan progress. | host:string, port:number, expectedProjectRoot:string |
| `list_filesystem` | v1, full | List Godot FileSystem dock entries under a res:// path. Entries are sorted by name ascending within each directory (directories and files interleaved); recursive listings expand each subdirectory depth-first in that order. | host:string, port:number, expectedProjectRoot:string, path:string, recursive:boolean, maxDepth:number, exclude:array |
| `create_folder` | v1, full | Create a folder under the Godot project res:// filesystem. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `read_text_file` | v1, full | Read a UTF-8 text file from the Godot project res:// filesystem. Optional lineStart (1-based) + lineCount return only that line range; totalLines is always reported. | host:string, port:number, expectedProjectRoot:string, path*:string, lineStart:integer, lineCount:integer |
| `write_text_file` | v1, full | Write a UTF-8 text file under the Godot project res:// filesystem. | host:string, port:number, expectedProjectRoot:string, path*:string, content*:string, refreshAfterWrite:boolean |
| `write_binary_file` | v1, full | Write a base64-encoded binary file under the Godot project res:// filesystem. | host:string, port:number, expectedProjectRoot:string, path*:string, contentBase64*:string, refreshAfterWrite:boolean |
| `move_filesystem_entry` | full | Move or rename a file or folder under the Godot project res:// filesystem. | host:string, port:number, expectedProjectRoot:string, fromPath*:string, toPath*:string |
| `copy_filesystem_entry` | full | Copy a file or folder under the Godot project res:// filesystem. | host:string, port:number, expectedProjectRoot:string, fromPath*:string, toPath*:string, overwrite:boolean |
| `batch_filesystem_operations` | full | Run ordered copy, move, and delete operations under the Godot project res:// filesystem. | host:string, port:number, expectedProjectRoot:string, operations*:array, continueOnError:boolean, dryRun:boolean |
| `delete_filesystem_entry` | full | Delete a file or empty folder under the Godot project res:// filesystem. | host:string, port:number, expectedProjectRoot:string, path*:string |
