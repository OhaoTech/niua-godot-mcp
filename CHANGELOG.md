# Changelog

## 0.1.3

- Add the `dispatch` tool profile: the full 173-tool surface behind 13 action-routed domain tools (~4K tokens of schema per request, a ~92% cut vs `full`), with per-action schemas served on demand via the `describe` action.
- Add `apply_scene_recipe`: execute a recipe JSON file of tool steps in one call; per-step successes stay out of the response, only a compact summary and failures return.
- Token-diet read controls: `get_scene_tree` `maxDepth`/`pathFilter` (truncated nodes report `childrenTruncated`), `get_inspector_properties` compact-by-default with a `properties` allowlist and `verbose` opt-in, `list_filesystem` `exclude`/`maxDepth`.
- Screenshots accept `savePath` (PNG to disk instead of ~250KB inline base64); `get_runtime_node_properties` accepts a `properties` allowlist; `get_output_logs` supports `clearAfterRead` with monotonic line counters.
- Compact JSON in every tool result and resource read (pretty-printing was ~37% whitespace).
- Ship the token-efficiency guide (MANUAL §8) and architecture manual.

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
