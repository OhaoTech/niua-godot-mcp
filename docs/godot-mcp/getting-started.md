# Getting Started With NIUA Godot MCP

This guide gets a local MCP client connected to a local Godot editor through NIUA Godot MCP.

## What You Will Have

After setup, your MCP client can call tools such as `get_godot_version`, `create_project`, `open_project`, `create_scene`, `create_node`, `write_script`, `run_main_scene`, and `capture_runtime_screenshot`.

## Prerequisites

- Node.js 20 or newer
- Godot 4.6.x
- A local checkout of this repository
- An MCP client: Claude Code, Codex, Claude Desktop, or another MCP-capable tool
- One folder where AI-assisted Godot projects are allowed to live

Check Node and Godot:

```bash
node --version
godot --version
```

If Godot is not on `PATH`, set `GODOT_BIN`:

```bash
export GODOT_BIN="/absolute/path/to/godot"
"$GODOT_BIN" --version
```

## 1. Clone The Repository

```bash
git clone https://github.com/OhaoTech/niua-godot-mcp.git
cd niua-godot-mcp
```

This checkout is part of the installation. The setup command writes an absolute path to the MCP server in this folder, so keep it somewhere stable.

## 2. Choose An Allowed Project Root

NIUA refuses project-management operations outside explicit allowed roots. Pick a folder for projects the agent may edit:

```bash
mkdir -p "$HOME/Godot/NIUAProjects"
```

You can use a different path. Use the same path in `--project-root`.

## 3. Run Setup For Your MCP Client

For Claude Code, one command registers the server (no setup script needed):

```bash
claude mcp add niua-godot -s user \
  --env GODOT_MCP_ALLOWED_PROJECT_ROOTS="$HOME/Godot/NIUAProjects" \
  -- node /absolute/path/to/niua-godot-mcp/src/godot-mcp/cli.js
```

Add `--env GODOT_BIN=/absolute/path/to/godot` before the `--` if Godot is not on `PATH`. Then restart Claude Code (or run `/mcp` and connect `niua-godot`) and skip to step 5.

For Codex:

```bash
node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "$HOME/Godot/NIUAProjects" \
  --write
```

For Claude Desktop:

```bash
node src/godot-mcp/cli.js setup \
  --client claude \
  --project-root "$HOME/Godot/NIUAProjects" \
  --write
```

The command does a smoke test by default. It starts the MCP server over stdio, calls `initialize`, lists tools, and writes client config only if the smoke test succeeds.

Run a dry run by leaving off `--write`:

```bash
node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "$HOME/Godot/NIUAProjects"
```

## 4. Restart Your MCP Client

After setup writes config, restart your MCP client so it reloads the MCP server entry.

Then ask:

```text
Call the niua-godot MCP tool get_godot_version.
```

Expected result: the agent reports a Godot 4.6.x version string.

## 5. Install The Agent Skill

The MCP tools work without the skill, but the skill helps the agent avoid Godot editor traps such as running an unsaved scene.

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

Now include `Use niua-godot-forge` in hands-on prompts.

## 6. Run Doctor

Use doctor when setup fails or Godot cannot be reached:

```bash
node src/godot-mcp/doctor.js
```

Check a specific project:

```bash
node src/godot-mcp/doctor.js --project "$HOME/Godot/NIUAProjects/first-niua-game"
```

Check a running bridge on the default port:

```bash
node src/godot-mcp/doctor.js \
  --project "$HOME/Godot/NIUAProjects/first-niua-game" \
  --port 9174
```

## Setup Command Reference

```bash
node src/godot-mcp/cli.js setup --client <claude|codex|generic> --project-root <path> [options]
```

| Option | Default | What It Does |
| --- | --- | --- |
| `--write` | off | Writes the client config. Without this, setup prints a dry run. |
| `--config-path <path>` | client default | Writes to a specific config path. |
| `--server-name <name>` | `niua-godot` | MCP server name in the client config. |
| `--profile <core|full|compact>` | `core` | Chooses the advertised tool surface (`v1`/`dispatch` remain aliases). |
| `--godot-bin <path>` | `GODOT_BIN` or `godot` | Godot executable used by MCP tools. |
| `--node-command <path>` | current Node executable | Node executable written to client config. |
| `--server-path <path>` | bundled `server.js` | MCP server file written to client config. |
| `--startup-timeout-sec <seconds>` | `120` | Startup timeout written for Codex config. |
| `--no-smoke` | off | Skips the setup smoke test. Use only when debugging setup itself. |

## If You Want A Global Command

From the checkout:

```bash
npm install -g .
```

Then use:

```bash
niua-godot-mcp setup --client codex --project-root "$HOME/Godot/NIUAProjects" --write
niua-godot-mcp-doctor
```

If you later move or delete the checkout, rerun setup so the client config points at the right server path.

## Next Step

Build a small project with the [first project tutorial](first-project.md).
