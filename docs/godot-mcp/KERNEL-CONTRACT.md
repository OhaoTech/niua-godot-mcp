# Kernel contract — NIUA Godot MCP

This package is a **Godot execution substrate for AI agents**, not a full studio.

## Guarantees

1. **Live editor coupling** — tools talk to a real Godot 4.6 editor via a localhost bridge.
2. **Runtime observe** — running games can be probed (state, events, properties, methods, screenshots when available).
3. **Truth over echo** — mutators should return engine-verified post-state; failures are loud and actionable.
4. **Cheap multi-step work** — recipes, batch ops, compact reads, and the JS SDK keep intermediates out of model context.
5. **Trust boundary** — `res://` only, allowlisted project roots, localhost + token.

## Jobs (what agents use it for)

Bootstrap project · author scenes/resources/scripts · import assets · run · observe · repair · export readiness.

## Faces (same op graph)

| Face | Use |
| --- | --- |
| MCP tools | Chat agents (Claude, Codex, Cursor, …) |
| CLI / doctor | Setup and health |
| JS SDK (`connect`) | Scripts and orchestration that keep intermediate results local |

## Non-goals

Game design, asset cloud generation, multi-role studio planning, and proprietary production pipelines live **outside** this package.
