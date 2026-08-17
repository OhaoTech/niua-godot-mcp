# export tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 5 (0 in v1, 5 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `list_export_presets` | full | List Godot export presets configured in export_presets.cfg. | host:string, port:number, expectedProjectRoot:string |
| `upsert_export_preset` | full | Create or update a Godot export preset through the visible editor bridge. | host:string, port:number, expectedProjectRoot:string, index:number, name*:string, platform*:string, exportPath:string, runnable:boolean, exportFilter:string, includeFilter:string, excludeFilter:string, customFeatures:string, dedicatedServer:boolean, options:object |
| `diagnose_export_templates` | full | Diagnose whether local Godot export templates are installed for the MCP Godot version. | projectRoot:string |
| `validate_export_preset` | full | Validate Godot export preset configuration before running a local export. | projectRoot*:string, preset:string |
| `export_project` | full | Export an allowlisted Godot project through the local Godot CLI. | projectRoot*:string, preset*:string, outputPath*:string, mode:string, timeoutMs:number |
