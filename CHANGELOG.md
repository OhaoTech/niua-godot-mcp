# Changelog

## 0.1.7 - P0–P2 first-success loop

- **Run safety:** `saveBeforeRun` defaults to **true**; unsaved / no-main errors include `recovery.tool` + hint (no modal traps).
- **`run_playtest_evidence`:** one-call playtest → compact engine evidence pack (headless screenshots `available:false` is not a failure).
- **`wait_for_imported_asset`:** poll until import-ready to kill write→use races.
- **P0–P2 smoke:** `npm run smoke:p0-p2` (no live Godot for package checks).
- Core diet guard tests: L1 creators stay out of essential; play loop tools required.

## 0.1.6 - Kernel surface diet

- `core` profile rebalanced around L0 primitives + recipes + safe run/observe (~52 tools; was 55).
- Demoted L1 3D/audio convenience creators from essential to standard (still available in `full`).
- Promoted `create_resource`, `save_scene_as`, `get_run_settings`, `run_custom_scene`, `get_runtime_events` into essential.
- Documented diet policy in `docs/godot-mcp/SURFACE-DIET.md`.


## 0.1.5

- Selfplay: `send_runtime_input` gains raw keyboard events (`keys`: keycode/physicalKeycode via `Input.parse_input_event`, reaching both `_input` handlers and `Input.is_physical_key_pressed`) and mouse-button events with viewport positions — games that check raw keys (restart keys, menus, upgrade pickers) are now drivable end to end. `holdMs` releases keys symmetrically with actions.
- `get_runtime_state` returns the snapshot you asked for: requests carry a requestId, the probe stamps it into the response, and the tool polls until the correlated snapshot lands (`pending: false`, `kind: "snapshot"`) instead of serving a cached earlier tree as current truth.
- Fix: `send_runtime_input` without `holdMs` crashed the runtime probe planner (`int(null)`) and left requests pending forever. Fixed at both layers (route never forwards null; planner casts are null-safe) and pinned in live conformance, which previously had zero coverage for this tool.
- Bare `res://` strings now coerce for Object/Resource properties (`set_node_property stream = "res://sfx/fire.wav"`), resolved through the same validated loader as the `{ type: "Resource", path }` wrapper. Unresolved paths still fail loudly.
- Local usage counters: each session writes tool-call counts to `runs/tool-usage/` — tool names, call counts, and error counts only; nothing leaves the machine. Disable with `NIUA_MCP_USAGE_STATS=off`. This is the evidence base for future usage-derived default profiles.
- Tier triage from a real game build (a survivor-like built end to end through this MCP): the `core` profile grows 48 -> 55, adding the runtime verification quartet, `set_input_action`, and the audio pair (`upsert_audio_bus`, `create_audio_stream_player`) — each promotion backed by a documented real-run need, and each requiring live error-path conformance coverage to land.
- New CI contract pins route reachability across all four registration points (catalog, aggregator allowlist, domain handler map, handler function), killing the drift class where a route 400s at runtime with "route handler did not return a Dictionary".
- Docs: manual documents the usage-stats env vars and current `core`/`full`/`compact` profile names; adaptive-exposure research note ships in `docs/godot-mcp/spike-list-changed.md`.

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
