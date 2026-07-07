# NIUA Godot MCP

NIUA Godot MCP lets an AI agent drive a real local Godot 4.6 editor through MCP tools. The agent can create projects, add scenes and nodes, write GDScript, run the game, inspect runtime state, capture screenshots, and export builds without hand-clicking the editor.

The repo ships two pieces:

- A Node.js MCP server in `src/godot-mcp`
- A Godot editor addon in `godot/addons/niua_mcp`

Local-first by design: it uses local files, local Godot, local ports, and project roots you explicitly allow.

## Requirements

- Node.js 20 or newer
- Godot 4.6.x on `PATH` as `godot`, or `GODOT_BIN=/absolute/path/to/godot`
- Linux, macOS, or Windows
- An MCP client such as Codex or Claude Desktop

## Quick Start From Source

The package name is not always available on npm. The reliable path today is to run it from a checkout.

```bash
git clone https://github.com/OhaoTech/niua-godot-mcp.git
cd niua-godot-mcp

node --version
godot --version   # or: export GODOT_BIN=/absolute/path/to/godot
```

Pick one folder where NIUA is allowed to create and edit Godot projects:

```bash
mkdir -p "$HOME/Godot/NIUAProjects"
```

Wire the MCP server into Codex:

```bash
node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "$HOME/Godot/NIUAProjects" \
  --write
```

For Claude Desktop, use `--client claude` instead.

Restart your MCP client, then ask it:

```text
Call the niua-godot MCP tool get_godot_version.
```

If that works, ask it to create and run a first project:

```text
Use niua-godot-forge. Create a Godot project at ~/Godot/NIUAProjects/first-niua-game.
Create a simple saved 3D scene with a ground plane, a cube, a camera, and a light.
Set the scene as the main scene, run it, and report the run status.
```

Then the part that is genuinely different — ask the agent to play what it just built:

```text
Add WASD movement to the cube: define the input actions, attach a small script.
Then playtest it yourself: run the scene, install the runtime probe, inject the
movement inputs, verify from runtime state that the cube actually moved, and
capture a screenshot of the running game.
```

The agent drives the running game the way a player's keyboard would — input-map
actions, raw key events, mouse clicks — and reads live state back as proof, so it
verifies its own gameplay instead of assuming the code works.

Keep this checkout in place. The setup command writes an absolute path to `src/godot-mcp/server.js` into your MCP client config.

## Install The Optional Agent Skill

The MCP server provides the tools. The `niua-godot-forge` skill teaches the agent the safe Godot build loop: save the scene, set the main scene, run, observe, and recover from common editor modal traps.

For Codex:

```bash
mkdir -p ~/.agents/skills
cp -r skills/niua-godot-forge ~/.agents/skills/
```

For Claude Code:

```bash
mkdir -p ~/.claude/skills
cp -r skills/niua-godot-forge ~/.claude/skills/
```

See [skills/niua-godot-forge/README.md](skills/niua-godot-forge/README.md) for platform notes.

## Daily Commands

Run the MCP server directly over stdio:

```bash
node src/godot-mcp/server.js
```

Run setup as a dry run before writing config:

```bash
node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "$HOME/Godot/NIUAProjects"
```

Run doctor checks:

```bash
node src/godot-mcp/doctor.js
node src/godot-mcp/doctor.js --project "$HOME/Godot/NIUAProjects/first-niua-game"
node src/godot-mcp/doctor.js --profile full --godot-bin "$GODOT_BIN"
```

Install or repair the Godot addon in an existing project:

```bash
node scripts/install-niua-godot-addon.js /path/to/project
```

Or through npm scripts:

```bash
npm run godot:addon:install -- /path/to/project
```

## Tool Profiles

- `v1` is the default. It exposes the compact core: project setup, filesystem, scenes, nodes, scripts, run controls, runtime screenshot, inspector, and core 3D helpers.
- `full` exposes every subsystem: animation, UI, particles, navigation, audio, localization, multiplayer, resources, debugger, viewport, 2D helpers, and export helpers.

Use the full profile only when you need the wider tool menu:

```bash
NIUA_MCP_PROFILE=full node src/godot-mcp/server.js
```

If you already wrote client config, rerun setup with `--profile full --write`.

The generated catalog is [docs/godot-mcp/tools.md](docs/godot-mcp/tools.md).

## Configuration

The setup command writes these environment values into your MCP client config:

```bash
NIUA_MCP_PROFILE=v1
GODOT_BIN=godot
GODOT_MCP_ALLOWED_PROJECT_ROOTS=/absolute/path/to/GodotProjects
```

`GODOT_MCP_ALLOWED_PROJECT_ROOTS` is important. Local project-management tools refuse to create, import, open, export, or discover projects outside those roots.

## Troubleshooting

Use the hands-on guide first:

- [Getting started](docs/godot-mcp/getting-started.md)
- [First project tutorial](docs/godot-mcp/first-project.md)
- [Troubleshooting](docs/godot-mcp/troubleshooting.md)

Common fixes:

- `npx niua-godot-mcp` returns `404`: use the source-checkout commands above, or install globally from this checkout with `npm install -g .`.
- `Unable to run Godot executable`: install Godot 4.6.x, put it on `PATH`, or pass `--godot-bin /absolute/path/to/godot`.
- `outside allowed project roots`: create/open projects under the folder passed to `--project-root`, or rerun setup with the root you want.
- Bridge is unreachable: open the project through the MCP `open_project` tool, or run `node src/godot-mcp/doctor.js --project /path/to/project --port 9174`.
- Godot shows a blocking run dialog: save the scene to `res://...`, set the main scene, press Escape in the editor if a modal is already open, then retry.

## Development

This repo currently has no external npm dependencies. Run the unit suite directly:

```bash
npm test
npm run godot:mcp:docs
```

`npm run godot:mcp:docs` regenerates the tool catalog and the skill reference docs. Do not edit generated reference files by hand.

## Security

The bridge binds to localhost, can use a per-session auth token, and restricts project filesystem writes to `res://` paths. Treat any MCP client with access to the bridge as trusted to edit the current Godot project. See [SECURITY.md](SECURITY.md).

## License

[PolyForm Small Business License 1.0.0](LICENSE.md) is free for individuals and small businesses with fewer than 100 people and under about $1M USD annual revenue. Larger organizations need a commercial license: contact OhaoTech at <team@ohao.tech>.
