# Changelog

## 0.1.2

- Coerce schema-untyped values so set_node_property accepts [x,y,z], {x,y,z}, {type:Vector3}, plain booleans and scalars without a typed wrapper (fixes silent no-ops when a client stringifies untyped params).
- Reject unresolved Object/Resource property writes with a clear error instead of a silent null.
- Add send_runtime_input to inject input-map actions and mouse motion into the running game for automated playtests.
- Additional reliability hardening: dialog guards, byte-length HTTP framing, script-attach, and filesystem-mutation fixes.

## 0.1.1

- Verify the Godot bridge project identity before requests, so a command can't hit the wrong project's bridge port.
- Add display-server / interactive metadata to run status.
- Harden filesystem and import operations.

## 0.1.0

- Added the NIUA Godot MCP server with v1 and full tool profiles.
- Added the bundled Godot editor addon at `godot/addons/niua_mcp`.
- Added manifest-backed tool generation for the MCP server, bridge client, and Godot route contracts.
- Added the `niua-godot-forge` agent skill with per-subsystem reference docs.
- Added package bin entries, doctor diagnostics, generated tool docs, and setup documentation.
