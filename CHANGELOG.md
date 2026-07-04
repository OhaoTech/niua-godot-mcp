# Changelog

## 0.1.4

- Capability-graph architecture (see `docs/godot-mcp/capability-graph-architecture.md`): profiles are now computed projections of one tool graph — `core` derives from per-tool `tier` metadata (no hand-maintained allowlist), `compact` from the domain structure. New `describe_tools` navigates the full catalog from any profile: no args → domain map, `{domain}` → its tools, `{name}` → one schema.
- Clearer tool profiles: `core` (default curated set, was `v1`), `full`, and `compact` (full surface behind 13 action-routed tools, was `dispatch`). The old names remain permanent aliases — no config change needed.
- Serve golden-path instructions at MCP initialize: safe build loop, recipes, token-diet controls, value coercion, runtime probe flow, and error recovery reach every client with no setup.
- Read-back guarantees on scene mutators: responses report the engine's actual post-state (real node names after collision auto-renames, verified script attachment, verified deletion) — never a request echo.
- Add `batch_scene_operations` (inline sibling of `apply_scene_recipe`, 50-step cap, compact summary) and `call_runtime_node_method` (invoke methods on live game nodes with typed returns).
- `get_runtime_state` accepts `maxDepth` with `childrenTruncated`, matching the editor scene-tree diet.
- Builder responses dedupe to one authoritative copy per fact (created* echo wrappers removed).
- Errors name their fix: not_found/unknown_property/invalid_value messages point at the tool that resolves them.
- Deterministic responses: directory walks and locale sets list in sorted order; documented per tool.
- Output-shape contracts in CI: response envelopes and a pinned errorCode registry cannot drift silently.
- Runtime truth parity: the running-game probe codec coerces values like the editor codec (plain arrays/objects/scalars apply correctly; unresolved Object writes error instead of silently writing null), `errorCode` survives into tool output, and `get_runtime_state` accepts `pathFilter`.
- Script-iteration trio: `search_in_scripts` (grep over res:// scripts — plain or regex, deterministic order, capped excerpts), `read_script`/`read_text_file` line ranges with `totalLines`, and `edit_script` (surgical oldText→newText replacement, uniqueness-guarded, that reports whether the edited script still parses). The find→read→edit loop drops from two full files per change to a few hundred bytes.

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
