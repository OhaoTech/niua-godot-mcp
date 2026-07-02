# debugger-runtime tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 7 (2 in v1, 5 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `install_runtime_probe` | v1, full | Enable the NIUA runtime probe as a Godot autoload for runtime inspection workflows. | host:string, port:number, expectedProjectRoot:string, save:boolean |
| `get_runtime_state` | full | Read runtime scene-tree state captured from NIUA runtime probe debugger messages. | host:string, port:number, expectedProjectRoot:string |
| `get_runtime_events` | full | Read filtered runtime/debugger events captured by the NIUA Godot debugger probe without requesting a fresh runtime snapshot. | host:string, port:number, expectedProjectRoot:string, limit:integer, kinds:array, sinceMsec:number |
| `get_runtime_node_properties` | full | Inspect runtime node properties from the running Godot game through the NIUA runtime probe. | host:string, port:number, expectedProjectRoot:string, nodePath:string, timeoutMsec:number, pollIntervalMsec:number |
| `set_runtime_node_property` | full | Set a live runtime node property in the running Godot game through the NIUA runtime probe. | host:string, port:number, expectedProjectRoot:string, nodePath*:string, property*:string, value*:any, timeoutMsec:number, pollIntervalMsec:number |
| `capture_runtime_screenshot` | v1, full | Capture a PNG screenshot from the running Godot game through the NIUA runtime probe. Returns available=false when the runtime renderer cannot expose pixels, such as headless mode. | host:string, port:number, expectedProjectRoot:string, timeoutMsec:number, pollIntervalMsec:number |
| `send_runtime_input` | full | Inject input into the running Godot game through the NIUA runtime probe: press or release input-map actions (for example move_forward, jump) with an optional timed hold, and feed relative mouse-look motion. Lets an agent script a playthrough and verify gameplay without a human. | host:string, port:number, expectedProjectRoot:string, actions:array, holdMs:number, mouseMotion:object, timeoutMsec:number, pollIntervalMsec:number |
