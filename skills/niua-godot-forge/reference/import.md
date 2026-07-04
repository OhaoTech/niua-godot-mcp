# import tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 7 (3 in v1, 4 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `import_project_assets` | full | Run a local Godot CLI import pass for an allowlisted project when the visible editor Import dock cannot safely import new source assets. | projectRoot*:string, timeoutMs:number |
| `list_imported_assets` | v1, full | List assets with Godot .import metadata under a res:// folder. Assets are listed in sorted name order per directory, depth-first. | host:string, port:number, expectedProjectRoot:string, path:string, recursive:boolean |
| `get_import_metadata` | full | Read Godot .import sidecar metadata for an imported asset. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `get_import_diagnostics` | v1, full | Diagnose Godot import sidecar health, generated target files, dependencies, and stale source metadata for an asset. | host:string, port:number, expectedProjectRoot:string, path*:string |
| `set_import_options` | full | Update Godot import-dock options in an asset .import sidecar and optionally reimport the asset. | host:string, port:number, expectedProjectRoot:string, path*:string, options*:object, reimport:boolean |
| `reimport_assets` | v1, full | Ask the visible Godot editor to reimport one or more project assets. | host:string, port:number, expectedProjectRoot:string, paths*:array, timeoutMs:number |
| `get_import_events` | full | Read recent Godot Import dock and EditorFileSystem import/reimport events. | host:string, port:number, expectedProjectRoot:string, limit:integer, kinds:array, sinceMsec:number |
