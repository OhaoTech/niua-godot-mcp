# Code-Execution Facade — Design (Token-Efficiency Roadmap Tier 3 #8)

*Status: design / awaiting review · 2026-07-12 · implements `token-efficiency-roadmap.md` Tier 3 item 8*

## 1. Context & goal

The roadmap's Tier 3 #8 is: *"Code-execution facade — present the server as a code API
(Anthropic pattern); agents script loops against it, intermediate results stay out of
context."* Tier 3 #7 (the `dispatch` profile) is done and **measured** — it cut the
*schema-tax* half (full 224K chars / ~56K tok → dispatch 17.3K / ~4.3K tok, ~92%). What
is **not** built and **not** measured on this server is the *intermediate-results* half:
when a multi-step build makes many tool calls, every result (tree dumps, screenshots,
inspector reads) transits the caller's context. Anthropic reports ~98.7% cut by keeping
those in a code-execution environment; **this design builds and measures that on our own
server.**

Chosen approach (decided in brainstorming): **prove client-side first, then generalize.**
Both Anthropic ("Code execution with MCP") and Cloudflare ("Code Mode") ship the
*client-runs-code* flavor — tools presented as a code API, code runs in a sandbox, only
summaries return. Because `godot-mcp` is a **local Node package**, the client-side flavor
is near-zero new infra: a plain `node` script imports the package and drives the running
editor in-process. We build that, measure the real win on a fan-out-heavy workload, and
only then (Stage 2, gated on the number) add an in-MCP `run_script` tool for other clients.

### Non-goals for Stage 1 (YAGNI)
- No `run_script` MCP tool, no server-hosted JS sandbox (that is Stage 2, gated on the
  measured win).
- No interface/policy import-direction lint.
- No skills/recipe registry inside the server (skills stay in the orchestrator layer —
  the host agent / orchestrator skill layer).
- Not a replacement for `apply_scene_recipe`/`batch_scene_operations`; the SDK is a peer
  that adds real control flow. Declarative recipes remain for simple cases.

## 2. Feasibility (verified against source)

`callTool(name, args)` (`server/tool-catalog.js:48`) resolves a tool whose handler is
**stateless per call**: `toolDefinitionsFromManifest` (`manifest/tool-definitions.js:14-27`)
builds a handler that runs `splitBridgeArgs(args)` → constructs a **fresh**
`GodotBridgeClient` (`server/context.js:4-18`) → HTTP `fetch` to the editor
(`bridge-client.js:61-85`, default `127.0.0.1:9174`). The bridge is an HTTP server hosted
**inside the Godot editor by the NIUA addon**, up as long as the editor is open, and
agnostic to which client connects. No stdio coupling, no MCP request-context object, no
boot singleton the handlers depend on.

**Therefore a standalone `node` script can call tool handlers in-process against a running
editor** — confirmed feasible with minor init. Two facts drive the design:

- **Bind to `GODOT_MCP_TOOLS`, not `callTool`.** `callTool` applies the active *profile*
  filter (default `core`), which would reject non-essential tools with `-32602`. The
  profile is a *model-context* concern (which schemas to show the model) and is irrelevant
  when a script calls in-process. The SDK binds each function directly to the raw handler
  in `GODOT_MCP_TOOLS` (`tools/index.js`), so it exposes the full surface independent of
  profile. The SDK is thus **another projection of the capability graph**, consistent with
  the existing architecture.
- **Token propagation is automatic on the happy path.** `open_project` writes
  `<project>/.godot/niua_mcp_bridge.json` (host/port/token). SDK `connect({ expectedProjectRoot })`
  loads that session file so users never set `GODOT_MCP_TOKEN`. In-process MCP still uses
  the process-store Map; env tokens remain an advanced/CI override only.

## 3. Architecture — three units

```
manifests (GODOT_MCP_TOOLS)          ── source of truth (already exists)
      │  codegen (build step, committed output + drift test)
      ▼
sdk/  godot.<domain>.<tool>(args)    ── Unit A: generated typed JS API (pure interface)
      │  imported by
      ▼
runner (a plain node script)         ── Unit B: drives editor in-process, prints summary
      │  measured by
      ▼
ruler (blockout built 2 ways)        ── Unit C: identical-outcome check + token delta
```

### Unit A — the generated SDK (`src/godot-mcp/sdk/`)
- **Generator** (`scripts/gen-sdk.mjs`): reads `GODOT_MCP_TOOLS`, groups tools by
  `category` into one module per domain, emits for each tool an async function
  `godot.<domain>.<tool>(args) -> Promise<result>` that looks up the tool by name in
  `GODOT_MCP_TOOLS` and awaits `tool.handler(mergedArgs)`. Connection defaults (host, port,
  token, `expectedProjectRoot`) are merged from a per-session config object + env so call
  sites pass only domain args.
- **JSDoc from schemas**: each function carries `@param` lines derived from the tool's
  `inputSchema` (property names, types, required flag) plus the tool `description`. Plain
  JS + JSDoc → runs under `node` with **no build/compile step**; editors still get
  type hints.
- **Entry** (`sdk/index.js`): exports a `connect({host, port, token, projectRoot})` factory
  returning the `godot` object with all domain namespaces bound to that connection.
- **Purity**: the SDK contains zero game-design opinion — it is the generic primitive
  surface (P5 interface layer). It must not import anything from `skills/` or
  any external studio/orchestration package.

### Unit B — the client-side runner (a script pattern, not a framework)
- A runner is just `node some_build.js`. It calls `connect(...)` from env, does the
  multi-step work with real control flow, holds all intermediate results in local
  variables, and `console.log`s **only** a compact summary (counts + failures + any
  explicitly-selected values). Intermediates never reach model context — that is the win.
- A tiny shared helper `sdk/summary.js` provides `summarize(label, {ok, fail, notes})` so
  runners emit a consistent one-block summary and (optional) `--json` structured line.
- **Safety**: the runner reuses the executor denylist concept
  (`tools/workflows/recipes/executor.js:9-18`) — a shared `sdk/guard.js` array of tools
  forbidden in scripted contexts (process-lifecycle, export, project open/close), enforced
  by the SDK wrapper throwing before dispatch. Plus a wall-clock timeout and a max-calls
  counter in `connect()` opts (defaults: 120s, 500 calls).

### Unit C — the ruler + honest measurement (`scripts/probes/sdk-token-ruler.mjs`)
- **Workload**: a small, deliberately scene-graph-heavy blockout — a ~12-node playable
  room built through node/scene tools (create bodies, meshes, collision, camera, light,
  parent, set properties). Chosen because it stresses exactly the fan-out the facade
  targets (wake builds in GDScript and would understate the win).
- **Path (a) baseline** — build it tool-by-tool via `callTool`, capturing each result's
  serialized byte size (this is what would enter context). Reuse the usage-telemetry
  recorder (`#26`) where it already records sizes.
- **Path (b) facade** — build the identical scene via one SDK runner; capture only the
  stdout summary size.
- **Identical-outcome gate**: after each path, snapshot `get_scene_tree` (compact) and
  assert the two scene structures are equal. If they differ, the measurement is void.
- **Report**: `context_bytes(a)` vs `context_bytes(b)`, converted to tokens with a stated
  approximation (~4 chars/token; note it is an estimate), reported **both** per-op and
  per-session-amortized (the SDK module is read once per session, so amortize its read
  cost across N ops and say so explicitly). If the bridge is unreachable → emit
  `unmeasured`, never a fabricated pass. Write the numbers into the roadmap `## Status log`
  under a new `MEASURED (Tier 3 #8)` line.

## 4. Testing
- **Drift-guard** (`test/godot-mcp/sdk/drift.test.js`): regenerate the SDK in a temp dir
  from current `GODOT_MCP_TOOLS`; diff against the committed `src/godot-mcp/sdk/`. Fail on
  any difference — forces regeneration when a tool schema changes.
- **Purity test**: assert no file under `sdk/` imports from `skills/` or any external studio/orchestration package.
- **Smoke test** (no editor required): `connect()` + a mocked `fetch` verifies the SDK
  calls the right handler with merged args and that the denylist throws.
- **Ruler**: run only when a bridge is reachable; otherwise skip-honest (mirrors
  kernel acceptance / e2e probes).

## 5. Success criteria
1. `node scripts/gen-sdk.mjs` produces a committed `sdk/` with one function per servable
   tool; drift test green.
2. A runner builds the ruler blockout and prints only a summary (verified: no intermediate
   tool result appears in stdout).
3. The ruler reports a concrete, honestly-approximated token delta for path (a) vs (b) on
   an **identical** built scene, per-op and amortized, appended to the roadmap.
4. The measured number decides Stage 2: if the intermediate-results cut is materially large
   (target: same order as Anthropic's ~90%+ on fan-out), build the in-MCP `run_script`
   tool; if small, stop and document why.

## 6. Risks & resolutions
- **Token propagation** → project session file from `open_project` (primary); env only advanced
  bridge; runner passes token explicitly. Documented as a setup step.
- **Profile gate** → SDK binds to `GODOT_MCP_TOOLS`, bypassing `callTool`'s filter.
- **Routing accuracy regression** (the dispatch-profile concern) is not in scope here — the
  SDK gives the script *all* functions by name with JSDoc, so there is no dispatcher
  indirection at the SDK layer.
- **Measurement dishonesty** → identical-outcome gate + stated approximation + amortized
  framing + `unmeasured` path.
