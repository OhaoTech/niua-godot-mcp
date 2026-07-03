# project-management tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 13 (5 in v1, 8 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `create_project` | v1, full | Create a local Godot project under an allowed root and optionally install the NIUA editor bridge addon. | projectRoot*:string, name:string, installAddon:boolean, overwrite:boolean |
| `open_project` | v1, full | Launch a local Godot editor process for an allowlisted project and track its lifecycle. | projectRoot*:string, headless:boolean, installAddon:boolean, waitForBridge:boolean, bridgeHost:string, bridgePort:number, timeoutMs:number, reuseExisting:boolean |
| `get_open_projects` | full | List Godot editor processes launched by this MCP server. | activeOnly:boolean |
| `close_project` | v1, full | Terminate a Godot editor process launched by open_project. | projectId:string, projectRoot:string, signal:string, timeoutMs:number |
| `import_project` | full | Add an existing allowlisted Godot project to the local NIUA project registry without opening it. | projectRoot*:string, installAddon:boolean |
| `install_project_addon` | full | Install or repair the local NIUA Godot editor bridge addon for an existing allowlisted project. | projectRoot*:string |
| `list_known_projects` | full | List Godot projects persisted in the local NIUA project registry. | none |
| `forget_project` | full | Remove an allowlisted Godot project from the local NIUA project registry. | projectRoot*:string |
| `diagnose_project_setup` | v1, full | Inspect whether an allowlisted Godot project has the NIUA MCP addon installed and enabled. | projectRoot*:string, checkBridge:boolean, bridgeHost:string, bridgePort:number, timeoutMs:number |
| `discover_projects` | full | Scan allowlisted filesystem roots for Godot project.godot files and optionally remember them. | roots:array, maxDepth:number, remember:boolean |
| `discover_editor_bridges` | full | Probe local NIUA Godot editor bridge ports and map active bridges to projects. | host:string, ports:array, startPort:number, endPort:number, timeoutMs:number, includeUnavailable:boolean |
| `list_scenes` | full | List .tscn and .scn scene files under an allowlisted Godot project root. | projectRoot*:string, rootPath:string, recursive:boolean, maxScenes:number |
| `get_output_logs` | v1, full | Read recent Godot bridge logs, runtime log events, and stdout/stderr captured from local Godot editor processes launched by this MCP server. Pass clearAfterRead: true to empty the process buffers after reading, so the next call only shows fresh output. | host:string, port:number, expectedProjectRoot:string, projectId:string, projectRoot:string, includeBridge:boolean, includeProcess:boolean, maxLines:number, clearAfterRead:boolean |
