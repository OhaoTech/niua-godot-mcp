# Install Guide for AI Agents

You are an AI agent installing NIUA Godot MCP for your user. Follow these steps in order. Ask the user the questions in Step 2 in chat — the answers drive the config you write. Never write config without showing the user what will be written first.

## Step 0 — Preflight

Run:

```bash
node --version
godot --version
```

- Node must be 20 or newer. If it is missing or too old, stop and tell the user to install Node 20+ from nodejs.org before continuing.
- Godot must be 4.6.x. If `godot` is not on `PATH`, ask the user where their Godot 4.6 executable is and remember that absolute path as `GODOT_BIN` for Step 3. If they don't have Godot, point them at godotengine.org/download and wait — do not install it yourself without their approval.

## Step 1 — Clone

Ask the user where they keep tools (suggest `~/tools`), then:

```bash
git clone https://github.com/OhaoTech/niua-godot-mcp.git <chosen-dir>/niua-godot-mcp
```

No `npm install` is needed — the server has zero dependencies. Remember the absolute path of the clone; the client config will reference it.

## Step 2 — Ask the user three questions

1. **"Which folder may I create Godot projects in?"** Suggest `~/Godot/NIUAProjects`. Create it. This becomes `GODOT_MCP_ALLOWED_PROJECT_ROOTS` — the server refuses to manage projects outside it, which is the safety boundary the user is agreeing to.
2. **"Which tool profile?"** Recommend `core` (default; ~55 proven tools, light on context). `full` exposes every stable tool; `compact` serves the full surface behind 13 routing tools for context-constrained setups. Any profile can browse the whole catalog via `describe_tools`.
3. **"Enable under-development tools?"** Default no. If yes, you will add `NIUA_MCP_EXPERIMENTAL=on` — explain that those 32 tools (multiplayer, localization, navigation, tilemaps, export, debugger control, animation trees, UI theming, 2D workflow builders) pass automated tests but have not yet been proven in real game builds.

## Step 3 — Write the config for the client you are running in

**If you are Claude Code**, run (with the user's values):

```bash
claude mcp add niua-godot -s user \
  --env GODOT_MCP_ALLOWED_PROJECT_ROOTS="<projects-folder>" \
  -- node <clone-path>/src/godot-mcp/cli.js
```

Append `--env NIUA_MCP_PROFILE=<profile>` if not core, `--env GODOT_BIN=<path>` if Godot is off-PATH, and `--env NIUA_MCP_EXPERIMENTAL=on` if chosen — all before the `--`.

**If you are Codex**, preview first, then write:

```bash
node <clone-path>/src/godot-mcp/cli.js setup --client codex \
  --project-root "<projects-folder>" [--profile <profile>] [--godot-bin <path>]
```

Show the user the dry-run preview, then re-run with `--write`. The command smoke-tests the server (initialize + tools/list) before writing and backs up the existing config.

**If you are Claude Desktop's agent**, same as Codex with `--client claude`.

**If you are any other client (Cursor, etc.)**, run the setup with `--client generic`, take the printed server command + env block, and merge it into your client's MCP settings file yourself (Cursor: `~/.cursor/mcp.json`). Show the user the merged file before saving.

## Step 4 — Verify before declaring success

```bash
node <clone-path>/src/godot-mcp/doctor.js
```

Every line must be PASS or SKIP. If `godot` fails, revisit `GODOT_BIN`. Do not tell the user the install succeeded unless doctor passes.

## Step 5 — Hand back to the user

You cannot restart your own client. Tell the user exactly one action remains:

> Restart me (or reconnect the `niua-godot` MCP server), then ask me to call `get_godot_version`.

When that call returns their Godot version, the install is complete. Suggest the first-game prompt from the README's Step 5 as the next move.

## Optional — install the skill

If your client supports skills, offer to copy `skills/niua-godot-forge` into the skills folder (`~/.claude/skills/` for Claude Code, `~/.agents/skills/` for Codex). It teaches the safe build loop: save before running, recover from editor dialogs, keep tool responses small.

## Rules

- Show, then write: previews before any config mutation.
- Never touch config files for clients other than the one you are running in.
- If anything fails twice, stop and show the user the exact error — the server's errors name their own fixes.
