# nodes-common tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 8 (3 in v1, 5 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `search_node_types` | v1, full | Search Godot ClassDB node types for Create Node dialog workflows, including instantiability, enabled-state, and inheritance metadata. | host:string, port:number, query:string, baseType:string, includeAbstract:boolean, includeDisabled:boolean, limit:integer |
| `create_node` | v1, full | Create a node in the current edited Godot scene. | host:string, port:number, type*:string, name:string, parentPath:string, properties:object |
| `create_node_with_script` | full | Create a Godot scene node and create or attach a GDScript in one editor operation. | host:string, port:number, type*:string, name:string, parentPath:string, properties:object, scriptPath*:string, scriptBaseType:string, scriptTemplate:enum(extends_only\|node_lifecycle\|node_process\|tool_node), scriptClassName:string, scriptContent:string, overwriteScript:boolean, saveScene:boolean |
| `rename_node` | full | Rename a node in the current edited Godot scene. | host:string, port:number, nodePath*:string, newName*:string |
| `delete_node` | v1, full | Delete a non-root node from the current edited Godot scene. | host:string, port:number, nodePath*:string |
| `duplicate_node` | full | Duplicate a node in the current edited Godot scene. | host:string, port:number, nodePath*:string, newName:string, parentPath:string |
| `reparent_node` | full | Move a node under a new parent in the current edited Godot scene. | host:string, port:number, nodePath*:string, newParentPath*:string, keepGlobalTransform:boolean |
| `reorder_node` | full | Move a node to a target sibling index under its current parent in the current edited Godot scene. | host:string, port:number, nodePath*:string, index*:integer |
