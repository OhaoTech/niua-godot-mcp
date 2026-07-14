# Token-Efficiency Roadmap — NIUA Godot MCP

Why: agent sessions run ~100:1 input:output tokens; fat tool results, schema bloat,
and retry loops are the real cost drivers. The industry playbook (Anthropic code-execution
= 98.7% cut; Manus file-system-as-context; trim projections = 94% cut on fat payloads;
consolidated dispatchers = ~100x on schema listings) maps directly onto this server.
References: anthropic.com/engineering/code-execution-with-mcp,
anthropic.com/engineering/effective-context-engineering-for-ai-agents,
manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus.

Principle: **the MCP is a context-aware intermediary, not a transparent proxy.**
Every tool result is a cost imposed on the caller's context window.

## Tier 1 — response diet (small, no API breaks; do first)
1. **Compact-by-default reads** — `get_scene_tree` (`maxDepth`, `pathFilter`, compact
   node format), `get_inspector_properties` (name+value only; `verbose:true` for editor
   metadata), `list_filesystem` (`exclude`, `maxDepth`), `get_output_logs` (tail count).
2. **`saveTo` on any fat read** — generalize the screenshots `savePath` pattern: dump
   full payloads to disk, return path + summary (file-system-as-context).
3. **CI response-budget guard** — contract test failing any tool whose *default* response
   can exceed ~4 KB. Makes the diet permanent.
4. **MANUAL: "Token-efficient usage"** — savePath always; field projections; `v1` (42
   tools) over `full` (171) unless needed; builds in sub-agents returning summaries.

## Tier 2 — fewer round-trips (new tools)
5. **`apply_scene_recipe`** — recipe JSON written to *disk* by the agent, one tool call
   executes all ops server-side and returns a pass/fail summary. A 238-step build
   becomes ~10 calls and the recipe never transits context. Biggest single win.
6. **`batch_scene_operations`** — inline ops array for smaller batches (peer of the
   existing `batch_filesystem_operations`).

## Tier 3 — architectural
7. **Consolidated dispatcher profile** — ~15 `action`-routed tools generated from the
   existing manifests, for clients that inject all schemas every request (Codex, Cursor).
   Schema listing drops ~10k → ~100 tokens.
8. **Code-execution facade** — present the server as a code API (Anthropic pattern);
   agents script loops against it, intermediate results stay out of context.
9. **KV-cache determinism** — audit results for stable ordering / no gratuitous
   timestamps so append-only caching holds across clients.

## Status log
- DONE: screenshots `savePath`; `get_runtime_node_properties` `properties` allowlist;
  `get_output_logs` `clearAfterRead` + monotonic counters (19c5504).
- DONE: reliability hardening (coercion, loud failures) — cuts retry-loop burn (3e3ae6f).
- DONE (Tier 1): `get_scene_tree` `maxDepth`/`pathFilter` + `childrenTruncated`;
  `get_inspector_properties` compact-by-default + `properties` allowlist + `verbose`;
  `list_filesystem` `exclude`/`maxDepth`; token-diet contract tests
  (test/godot-mcp/manifest/token-diet.test.js); MANUAL §8 "Token-efficient usage".
- DONE (Tier 2): `apply_scene_recipe` — executes a recipe JSON from disk in one call
  (v1 profile); per-step successes never enter context, failures return compactly with
  a stopOnError contract; lifecycle tools denied inside recipes. Token contract is
  test-enforced (100 successful steps must summarize in <500 chars).
- MEASURED: scene_tree 37.8KB→2.3KB (maxDepth 2, 94% cut) / 596B (subtree, 98% cut);
  inspector 26.3KB→2.6KB compact (90%) / 196B two-property allowlist (99.3%).
- DONE (envelope pass): compact JSON in every tool result and resource read
  (pretty-printing was ~37% whitespace on every response); terse connection-property
  descriptions (they repeat in all 173 schemas — saved ~12.5K chars across profiles).
  Final schema tax: full 212K chars (~53K tok), v1 44.6K (~11.1K tok),
  dispatch 16.2K (~4.1K tok).
- CANDIDATES (not yet done): dedupe curated-builder response echoes (same data ~3x in
  create_character_body_3d-style results); runtime-tree maxDepth parity on
  get_runtime_state; MCP initialize `instructions` cheat-sheet.
- DONE (Tier 3): `NIUA_MCP_PROFILE=dispatch` — 13 action-routed domain tools expose
  the full 173-tool surface at 17.3K chars (~4.3K tokens) of schema per request vs
  224K chars (~56K tokens) for `full`: a 92% schema-tax cut. Per-action schemas served
  on demand via the `describe` action (search-first, server-side, works on any
  client). Contract tests enforce full coverage (every tool reachable exactly once)
  and a 20K-char schema budget.
- MEASURED (Tier 3 #8): SDK code-execution facade — the intermediate-results half.
  An identical 12-node blockout built via `callTool` (baseline) vs one `connect()`
  SDK script (facade, summary-only), context bytes diffed, identical-outcome gated
  (scripts/probes/sdk-token-ruler.mjs). Live run against a token-authenticated
  editor bridge (127.0.0.1:9174, shared `GODOT_MCP_TOKEN`): **baseline ~4969 B
  (~1242 tok) of intermediate results vs facade ~27 B (~7 tok) summary → ~99% cut,
  identical scene tree**, ~4 chars/tok approx, per-op; the generated SDK module read
  amortizes across a session. Stable across 3 runs (1242→7 each). Matches the
  Anthropic (98.7%) / Cloudflare (99.9%) order on a real fan-out. This is a small,
  screenshot-free build — real builds (screenshots, tree dumps) carry far larger
  intermediates, so the absolute win scales up. Both the schema-tax half (Tier 3 #7,
  dispatch) and the intermediate-results half (#8) are now measured on this server.
  → Stage 2 (`run_script` MCP tool exposing the facade to other clients) is
  evidence-justified; queue it.
