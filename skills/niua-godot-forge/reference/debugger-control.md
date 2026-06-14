# debugger-control tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 4 (0 in v1, 4 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `get_debugger_state` | full | Read Godot debugger-panel state: sessions, breakpoints, recent debugger events, and performance monitors. | host:string, port:number |
| `set_debugger_breakpoint` | full | Set or clear a Godot debugger breakpoint in a GDScript file. | host:string, port:number, path*:string, line*:number, enabled:boolean |
| `toggle_debugger_profiler` | full | Enable or disable a Godot debugger profiler on active editor debugger sessions. | host:string, port:number, profiler*:string, enabled*:boolean, data:array |
| `send_debugger_message` | full | Send a low-level Godot debugger message to editor debugger sessions through the public debugger API. | host:string, port:number, message*:string, data:array, activeOnly:boolean |
