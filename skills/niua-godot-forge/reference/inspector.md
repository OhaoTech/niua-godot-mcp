# inspector tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 2 (2 in v1, 0 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `get_inspector_properties` | v1, full | Read inspector-style editable properties for a selected or addressed node. | host:string, port:number, nodePath:string |
| `set_node_property` | v1, full | Set a property on a node in the current edited Godot scene. | host:string, port:number, nodePath*:string, property*:string, value*:any |
