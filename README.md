# NIUA Godot MCP

Give your AI assistant a real Godot editor.

NIUA Godot MCP lets an AI agent (Claude, Codex, or any MCP client) drive a local Godot 4.6 editor the way you would: create projects, build scenes, write GDScript, run the game, **play it, and verify it works** — all through tools instead of hand-clicking.

Ten minutes from now you'll have an AI that builds a small 3D game on your machine, runs it, and playtests it itself.

Everything is local: your files, your Godot, your ports. The agent can only touch project folders you explicitly allow.

---

## What you need first

Three things. Check each one — the rest of this guide assumes they pass.

**1. Node.js 20 or newer**

```bash
node --version
```

You should see `v20.x` or higher. If not: [nodejs.org](https://nodejs.org).

**2. Godot 4.6.x**

```bash
godot --version
```

You should see `4.6.x.stable...`. If the command isn't found but Godot is installed somewhere, note its full path — you'll pass it as `GODOT_BIN` in Step 3. If Godot isn't installed: [godotengine.org/download](https://godotengine.org/download).

**3. An MCP-capable AI tool** — Claude Code, Codex, Claude Desktop, or any other MCP client.

---

## Step 1 — Get the code

```bash
git clone https://github.com/OhaoTech/niua-godot-mcp.git
cd niua-godot-mcp
```

That's the whole install. There are no dependencies to download — `npm install` is not needed.

Keep this folder where it is: your AI tool's config will point at it by absolute path.

## Step 2 — Choose where games may live

Pick one folder. The agent will only be able to create and open Godot projects inside it — everything else on your disk is off-limits to the project tools.

```bash
mkdir -p "$HOME/Godot/NIUAProjects"
```

Use any path you like; just use the same one in Step 3.

## Step 3 — Connect your AI tool

Pick **your** tool below and do just that one section.

### Claude Code

One command (replace the two paths with yours):

```bash
claude mcp add niua-godot -s user \
  --env GODOT_MCP_ALLOWED_PROJECT_ROOTS="$HOME/Godot/NIUAProjects" \
  -- node /absolute/path/to/niua-godot-mcp/src/godot-mcp/cli.js
```

If Godot is not on your `PATH`, add `--env GODOT_BIN=/absolute/path/to/godot` before the `--`.

Restart Claude Code (or run `/mcp` and connect `niua-godot`).

### Codex

The setup command previews first, writes only when you add `--write`:

```bash
node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "$HOME/Godot/NIUAProjects"
```

Read the preview — it shows exactly what will be written and runs a connection smoke test. Then run the same command again with `--write`, and restart Codex.

### Claude Desktop

Same flow with `--client claude`:

```bash
node src/godot-mcp/cli.js setup \
  --client claude \
  --project-root "$HOME/Godot/NIUAProjects" \
  --write
```

Restart Claude Desktop.

### Any other MCP client (Cursor, etc.)

```bash
node src/godot-mcp/cli.js setup --client generic --project-root "$HOME/Godot/NIUAProjects"
```

This prints a config block you can adapt to your client's MCP settings file (for Cursor: `~/.cursor/mcp.json`). The server command is `node /absolute/path/to/src/godot-mcp/cli.js` with the `GODOT_MCP_ALLOWED_PROJECT_ROOTS` environment variable.

## Step 4 — Say hello

In your AI tool, ask:

> Call the niua-godot tool get_godot_version.

**Checkpoint:** the agent replies with your Godot version, something like `4.6.3.stable`. If it errors instead, jump to [When something goes wrong](#when-something-goes-wrong).

## Step 5 — Build your first game

Ask:

> Create a Godot project at ~/Godot/NIUAProjects/first-game.
> Build a saved 3D scene with a ground plane, a cube, a camera, and a light.
> Set it as the main scene, run it, and confirm the run status.

**What you'll see:** a real Godot editor window opens on your desktop, nodes appear in the scene tree, and then the game window launches. The agent reports `playing: true` — read back from the engine, not assumed.

## Step 6 — Watch it play its own game

This is the part that's genuinely different. Ask:

> Add WASD movement to the cube: define the input actions and attach a small script.
> Then playtest it yourself: run the scene, install the runtime probe, inject the
> movement inputs, verify from runtime state that the cube actually moved, and
> capture a screenshot of the running game.

The agent presses the same inputs a player's keyboard would — input-map actions, raw keys, mouse clicks — and reads live game state back as proof. It verifies its own gameplay instead of assuming the code works.

From here, just describe the game you want.

---

## When something goes wrong

| You see | Do this |
|---|---|
| `Unable to run Godot executable` | Godot isn't on `PATH`. Add `GODOT_BIN=/absolute/path/to/godot` to the env in your client config (or `--godot-bin` on the setup command). |
| `outside allowed project roots` | The agent tried to create a project outside your Step 2 folder. Ask it to use a path inside that folder, or re-run setup with a different `--project-root`. |
| `Godot bridge is not reachable` | No editor is running for that project. Ask the agent to call `open_project` first — the error message says exactly this. |
| The tool isn't listed in your AI client | The client wasn't restarted after Step 3, or the config path was wrong. Re-run the setup command without `--write` — it prints the config path it detected and smoke-tests the server. |
| Godot editor sits on a dialog and nothing responds | A scene was run before being saved. Press Escape in the editor, then ask the agent to save the scene and set the main scene before running. The bundled skill (below) teaches the agent to avoid this. |

Deeper guides: [Getting started](docs/godot-mcp/getting-started.md) · [First project tutorial](docs/godot-mcp/first-project.md) · [Troubleshooting](docs/godot-mcp/troubleshooting.md) · [Full manual](docs/godot-mcp/MANUAL.md)

Health check anytime:

```bash
node src/godot-mcp/doctor.js
```

---

## Optional: teach the agent the pro workflow

The MCP server provides the tools; the bundled `niua-godot-forge` skill teaches your agent the safe build loop (save before running, recover from editor dialogs, keep responses small).

Claude Code:

```bash
mkdir -p ~/.claude/skills && cp -r skills/niua-godot-forge ~/.claude/skills/
```

Codex:

```bash
mkdir -p ~/.agents/skills && cp -r skills/niua-godot-forge ~/.agents/skills/
```

## Optional: tool profiles

The server exposes a curated core of ~55 tools by default — enough for full games, light on your agent's context.

- `core` *(default)* — project, scenes, nodes, scripts, run controls, runtime playtesting, audio, inspector.
- `full` — everything: animation, UI, particles, navigation, localization, multiplayer, export, debugger (~180 tools).
- `compact` — the full surface behind 13 routing tools, for context-constrained setups.

Switch by re-running setup with `--profile full --write` (or set `NIUA_MCP_PROFILE` in your client config). In any profile, the agent can browse the complete catalog with the `describe_tools` tool. The generated reference is [docs/godot-mcp/tools.md](docs/godot-mcp/tools.md).

## Security model, in one paragraph

The Godot bridge binds to `127.0.0.1` only and requires a per-session token. Project management is confined to the folders you allowlisted; in-project file writes are confined to `res://`. The agent is trusted with the projects you gave it — treat it like a collaborator with commit access to those folders, nothing more. Details: [SECURITY.md](SECURITY.md).

## Development

```bash
npm test                    # unit + contract suite, no dependencies needed
npm run godot:mcp:docs      # regenerate the tool catalog (never edit it by hand)
```

Architecture notes live in [docs/godot-mcp/capability-graph-architecture.md](docs/godot-mcp/capability-graph-architecture.md).

## License

[PolyForm Small Business License 1.0.0](LICENSE.md) — free for individuals and organizations under 100 people and ~$1M USD annual revenue. Larger organizations: contact OhaoTech at <team@ohao.tech> for a commercial license.
