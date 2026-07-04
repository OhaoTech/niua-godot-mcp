# ADR: The Capability-Graph Architecture

**Status:** Accepted (direction) — 2026-07-03
**Scope:** the NIUA agent-native interface pattern. Godot is the reference
implementation; the architecture must hold for mega software (Unreal, Unity,
DaVinci, CAD — 10,000+ operations, 30GB+ installs).

## Context

The Godot MCP grew a tool catalog (175 tools) and three hand-maintained views of
it: a curated allowlist (`core`), a raw dump (`full`), and a hand-mapped router
profile (`compact`). Each works; together they are three parallel structures
that can drift, chosen statically at server start.

At mega-software scale every one of these dies:
- nobody hand-curates a 10,000-operation allowlist;
- nobody hand-maps 400 subsystems into router domains;
- no context window survives a flat listing (our own measurement: 175 tools ≈
  53K tokens per request on schema-injecting clients).

Meanwhile, one week of hardening produced empirical answers that all point at
the same underlying shape. This ADR names it.

## Decision

**There is exactly one structure: a hierarchical capability graph. Everything
else is a computed projection of it.**

```
app → subsystem → domain → operation
(unreal → editor → actors → spawn_actor)
(godot  → editor → scene  → create_node)
```

Every node carries metadata:

| Field | Meaning |
|---|---|
| `schema` | input schema (leaves) |
| `safety` | read / mutate / destructive — gates recipes, undo policy, confirmation |
| `tier` | essential ↔ rare — earned by evidence (gate runs, usage), never by opinion |
| `category/domain` | position in the graph (drives routing projections) |
| `docs` | one-line summary + full description (progressive disclosure) |

### The five principles

**1. Projections, not profiles.**
A "profile" is a query over the graph, computed at load:
- *core* = leaves where `tier: essential`
- *full* = all leaves, flat
- *compact* = collapse the graph at depth N into action-routed dispatchers
Hand-maintained parallel lists are forbidden; if two views can drift, the
structure is wrong. Contract tests assert projections derive from the graph.

**2. Navigation over listing.**
The agent walks the surface instead of receiving it: connect → root map (~10
domains, ~1KB) → `describe(domain)` → `describe(operation)` → call. Context
cost is O(log n) in surface size. Flat listing is just the projection you pick
when the graph is small. `describe` is therefore a **universal primitive**
available in every projection, not a feature of one profile.

**3. Machine-derived catalogs.**
Hand-authoring stops at the hundreds. Mega software exposes reflection
(Unreal `UFunction`/`UPROPERTY`, Blender RNA, Godot `ClassDB`): the L0 layer of
the graph must be *generated* from the application's own reflection and then
*annotated* (tiers, safety, docs). The manifest layer is the seam: today a
source, at scale a target.

**4. Session-adaptive exposure.**
Binding the surface at process start (env var) is the wrong binding time. The
surface should adapt within a session: domains in active use expand; untouched
domains stay collapsed. Definitions stay stable and availability is masked
(KV-cache-safe). Usage telemetry feeds tier annotation: a tool earns
`essential` by being needed in real runs — policy we already enforce by hand.

**5. Layered semantics — agents don't live at the bottom.**
The graph's leaves are too granular for real work. The full stack:

| Layer | What | Godot instance |
|---|---|---|
| L0 | raw operations (reflection-derived) | `set_node_property`, route table |
| L1 | curated task tools | `create_character_body_3d`, builders |
| L2 | declarative macros — many ops, one call, intermediate results never enter context | `apply_scene_recipe`, `batch_scene_operations` |
| L3 | knowledge — the tool teaches its own use | `initialize.instructions`, hinted errors, `describe`, skills |

Agents work at L2/L3 by default and descend only when necessary. Token
efficiency and quality both fall out of this layering; they are not separate
programs.

### Invariants that hold at every layer (the quality identity)

These are not Godot features; they are the product's identity, and they carry
to every future engine:
- **Truth:** every mutator reports engine-verified post-state; silent no-ops
  are structurally impossible (read-backs, parse-at-edit, loud coercion
  failures).
- **Teaching:** instructions at connect, errors that name the next step,
  schemas on demand.
- **Determinism:** identical state → identical bytes (cache-safe, diff-safe).
- **Enforcement:** token budgets, output-shape contracts, errorCode registry,
  and a live conformance gate; releases claim only what a gate proved.

## Migration path (Godot reference implementation)

1. **Now:** `tier` moves into manifest entries; the core projection derives
   from it (the hand list dies). `describe` becomes a universal tool in every
   projection. `category → domain` mapping formalized as manifest metadata.
2. **Next:** session-adaptive exposure (expand/collapse via listChanged);
   usage-derived tier reports; the graph exported as a machine-readable
   artifact (the root map).
3. **Later (engine #2):** generate an L0 catalog from reflection (Unreal PoC or
   Godot ClassDB self-derivation as the dry run), annotate, and reuse the
   entire projection/navigation/enforcement stack unchanged. The stack, not
   the catalog, is the product.

## Consequences

- Slightly more machinery at load time (projection computation) for the end of
  drift between views.
- The manifest schema grows fields (`tier`, formalized domain); one-time churn.
- The public story sharpens: not "a Godot MCP with three profiles" but "a
  capability graph you can view flat, curated, or routed — and navigate at any
  scale."
