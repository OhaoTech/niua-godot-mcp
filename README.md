# NIUA Godot MCP

A local [MCP](https://modelcontextprotocol.io) server plus a bundled Godot editor addon that lets an AI agent **create, inspect, run, debug, and export real Godot 4.6 games through tools** — instead of hand-clicking the editor. Pairs with the optional `niua-godot-forge` agent skill, which teaches the safe build workflow.

Local-first by design: it drives a local editor, local game files, local ports, and user-owned project roots.

## Requirements

- Node.js 20 or newer
- Godot 4.6.x on `PATH` as `godot`, or `GODOT_BIN=/path/to/godot`
- Linux, macOS, or Windows

## Quick start

Wire the MCP into an agent client (Codex shown; `--client claude` for Claude Desktop). Dry-run by default; add `--write` to update the client config:

```bash
npx niua-godot-mcp setup --client codex --project-root /path/to/GodotProjects --write
```

Then restart the client and ask the agent to call `get_godot_version`.

Run the server directly over stdio:

```bash
npx niua-godot-mcp
```

## Doctor

Verify Node, Godot, tool profile, bundled addon, and optional bridge reachability before wiring it in:

```bash
npx niua-godot-mcp-doctor
npx niua-godot-mcp-doctor --project /path/to/project
npx niua-godot-mcp-doctor --profile full --godot-bin "$GODOT_BIN"
```

## Tool profiles

- **`v1` (default)** — compact, run-proven core (project, scene, node, script, run, export, inspector, filesystem). Best for day-to-day agent sessions and context budget.
- **`full`** — adds curated subsystems: animation, UI, particles, navigation, audio, localization, multiplayer, deeper 2D/3D, resources, debugger, viewport.

```bash
NIUA_MCP_PROFILE=full npx niua-godot-mcp
```

Same code either way — `full` only widens the advertised tool menu. The generated catalog lives at `docs/godot-mcp/tools.md`.

## The agent skill (recommended)

`skills/niua-godot-forge` is a portable [Agent Skill](https://agentskills.io/specification) that teaches the safe build loop (save → set main scene → run), profile guidance, and error recovery, plus one on-demand reference doc per subsystem. Install it into your agent platform's skills directory:

```bash
# Claude Code
cp -r skills/niua-godot-forge ~/.claude/skills/
# Codex
cp -r skills/niua-godot-forge ~/.agents/skills/
```

See `skills/niua-godot-forge/README.md` for all platforms.

## Recommended environment

```bash
NIUA_MCP_PROFILE=v1
GODOT_BIN=godot
GODOT_MCP_ALLOWED_PROJECT_ROOTS=/absolute/path/to/GodotProjects
```

The MCP refuses filesystem operations outside the allowlisted project roots. See `SECURITY.md` for the full trust model.

## Manual addon install

Agents normally call `create_project` / `open_project`, which install the bundled addon automatically. For a manual install into an existing project:

```bash
npx niua-godot-mcp -- godot:addon:install /path/to/project   # or: node scripts/install-niua-godot-addon.js /path/to/project
godot --path /path/to/project --editor
```

## Development

```bash
npm ci --ignore-scripts
npm test                                  # unit suite
npm run godot:mcp:docs                    # regenerate tool catalog + skill reference
```

## Security

Per-session localhost bridge token, localhost-only binding, `res://` write constraints, and refusal of path traversal / `.godot` writes / addon self-overwrite / symlink escapes / oversized payloads. Report issues per `SECURITY.md`.

## License

[PolyForm Small Business License 1.0.0](LICENSE.md) — free for individuals and small businesses (fewer than 100 people and under ~$1M USD annual revenue). Larger organizations need a commercial license: contact OhaoTech at <team@ohao.tech>.
