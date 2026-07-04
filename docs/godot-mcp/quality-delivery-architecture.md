# Quality-Delivery Architecture — NIUA Godot MCP (v0.2 direction)

The bar: the reference implementation for an agent-native MCP. Two axes, one principle:
**every token the server sends must either advance the task or teach the agent.**

## The four pillars

### A. AX — the server teaches its caller
1. **`initialize.instructions`** — the server ships its own golden path to every client at
   connect time (safe build loop, diet controls, recipes, profiles). No client-side skill
   required; works on Cursor/Codex/anything.
2. **Errors carry the fix** — every error names the failure AND the next step (the
   bridge-down message already does this; make it the rule everywhere: `errorCode` +
   one-line `hint`).
3. **Schemas guide** — enums over free strings, defaults stated, describe-on-demand
   (dispatch profile) as the discovery path.

### B. Truth — the server never lies
4. **Read-back guarantees** — every mutator returns the minimal *authoritative post-state*
   (what was actually applied, read back from the engine, not an echo of the request).
   Silent no-ops become structurally impossible.
5. **No echo waste** — one copy of each fact per response. Curated builders currently
   return the same data up to 3x (`properties` + node + `created*` wrappers): dedupe to
   a single authoritative shape.
6. **Determinism** — stable key order, stable list order, no gratuitous timestamps in
   results. Append-only-friendly for KV-cache reuse across clients.

### C. Efficiency — completed and locked (Tiers 1–3 shipped)
7. Remaining parity: `get_runtime_state` `maxDepth`/`pathFilter`; runtime-probe codec
   coercion parity with the editor codec.
8. `batch_scene_operations` — inline sibling of `apply_scene_recipe` for small batches.
9. `call_runtime_node_method` — invoke functions in the running game (completes the
   probe surface: read + write + input + call).
10. Code-execution facade — present the server as a scriptable code API (last of the
    Anthropic patterns; largest lift, schedule after A/B land).
    **Decision 2026-07-03: DEFERRED.** apply_scene_recipe + batch_scene_operations
    capture most of the facade's value for this domain (many ops per call, intermediate
    results out of context) at a fraction of the surface. Revisit only if real usage
    shows loops/conditionals inside builds that recipes cannot express.

### D. Enforcement — quality that cannot regress
11. **Output-shape contracts** — declared response schemas for our own tools, validated
    in CI (we already do this for token budgets and dispatch coverage; extend to shapes).
12. **Live conformance** — the lab conformance harness (`scripts/conformance.mjs`) stays
    the release gate for editor-facing behavior; every release note claims only what a
    gate proved.

## Delivery order
- **Slice 1 (now):** A1 instructions · C7 runtime-tree diet parity · B5 builder dedup ·
  A2 hint audit on the top error paths.
- **Slice 2:** B4 read-back guarantees on mutators · C8 batch ops · C9 runtime method call.
- **Slice 3:** B6 determinism audit · D11 output contracts · C10 facade decision.
- **Slice 4 (runtime truth parity):** runtime-probe codec coercion parity with the editor
  codec (kills the observed silent (0,0) Vector2 write at runtime) · errorCode passthrough
  in the JS normalizer · `get_runtime_state` `pathFilter`.

Each slice ships with tests, updates this doc's status, and lands publicly in the next
patch release.

## Status
- 2026-07-03: doc created. Slice 1 in progress.
- 2026-07-03: B5 (builder response dedup — `created*` echo wrappers dropped, one authoritative
  copy per fact, blockout `steps` dieted to name+ok), C7 (`get_runtime_state` `maxDepth` with
  `childrenTruncated`, mirroring the editor serializer; `pathFilter` still pending), and A2
  (scene-graph not_found / unknown_property / invalid_value errors now name the recovery tool)
  implemented with tests. A1 (initialize.instructions golden path, size-guarded) shipped
  earlier the same day — **Slice 1 complete.** Next: Slice 2.
- 2026-07-03: B4 (read-back guarantees on scene mutators — attach_script now reads
  `node.get_script()` back and fails with a hint when null/different, delete_node verifies
  detachment, upsert_animation reports the stored library copy including loop mode,
  reparent/duplicate/create report the engine's actual parent/name; structural pins in
  `test/godot-mcp/plugin-files/mutator-read-back.test.js`), C8 (`batch_scene_operations` —
  inline sibling of apply_scene_recipe, 50-step cap, shared executor extracted to
  `tools/workflows/recipes/executor.js`, standalone in the dispatch profile, in v1), and
  C9 (`call_runtime_node_method` — full bridge/probe round trip mirroring
  set_runtime_node_property: validates node exists AND has_method with a
  get_runtime_node_properties hint, converts args through the probe variant codec,
  serializes returns with an Object guard; in v1) implemented with tests —
  **Slice 2 complete.** Next: Slice 3.
- 2026-07-03: B6 (determinism audit — every directory walk that feeds a response now
  lists in sorted name order: list_filesystem, list_imported_assets, replace_in_scripts
  root scans, discover_projects; get_localization_state sorts the engine's hash-ordered
  loadedLocales/translations sets; order guarantees documented in the tool descriptions;
  meaningful orders — scene-tree children, animation tracks, registeredTranslations,
  lifecycle timestamps, probe telemetry — deliberately untouched; pins in
  `test/godot-mcp/plugin-files/determinism.test.js`) and D11 (output-shape contracts —
  `test/godot-mcp/contracts/output-shapes.test.js` declares closed shapes for the
  high-traffic tool families and validates local tools against real handler outputs
  (get_godot_version, batch/recipe summaries, dispatch describe) and bridge tools
  against fixtures mirroring the addon source (set_node_property, get_scene_tree,
  get_inspector_properties, list_filesystem, create_node); the bridge error envelope
  `{ok:false,error,errorCode}` is enforced with a pinned 22-code errorCode registry
  extracted from the addon sources). With C10 deferred, **Slice 3 complete.**
- 2026-07-03: Slice 4 (runtime truth parity) — the runtime-probe codec
  (`niua_mcp_runtime_probe_variant_codec.gd`) now mirrors the editor codec: JSON-string
  values parse back to structure and `coerce_to_declared_type` turns scalar strings and
  plain [x,y]/{x,y} shapes into the declared bool/int/float/Vector2/Vector3/Color; the
  runtime property writer consults the live node's declared type, keeps String/StringName
  text verbatim, rejects unresolved Object/Resource writes with an entry error instead of
  a silent null write, and reports the engine read-back after set (kills the observed
  silent (0,0) Vector2 write). `normalizeBridgeResponse` forwards the addon's `errorCode`
  (omitted when absent) — the output-shape contract now requires it to survive.
  `get_runtime_state` gained `pathFilter` through the full chain (schema → manifest query
  → bridge client → route → snapshot message → probe serializer, reusing the probe node
  lookup); an unknown path reports an explicit error naming get_runtime_node_properties.
  Pins in `test/godot-mcp/plugin-files.test.js` (Slice 4 codec/writer test),
  `manifest/token-diet.test.js`, `contracts/output-shapes.test.js`, and `protocol.test.js`
  — **Slice 4 complete.**
