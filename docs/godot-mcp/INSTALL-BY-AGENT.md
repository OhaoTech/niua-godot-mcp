# Install guide for AI agents

You are installing NIUA Godot MCP for the user. Keep it simple. **One question. Defaults for everything else.**

## Rules

- Show config before writing it. Never silent-write.
- Default profile is `core`. Do **not** ask about profiles or experimental tools unless the user brings it up.
- If something fails twice, stop and show the exact error.

## 1. Preflight

```bash
node --version
godot --version
```

- Node must be **20+**. If missing: send them to https://nodejs.org and wait.
- Godot must be **4.6.x**. If `godot` not found, ask for the binary path → `GODOT_BIN`. If they don’t have Godot: https://godotengine.org/download and wait.

## 2. One question

Ask only:

> **Where should I create Godot projects?**  
> (Default: `~/Godot/NIUAProjects`)

Create that folder. That path is `GODOT_MCP_ALLOWED_PROJECT_ROOTS`.

Do not ask about tool profiles or experimental features.

## 3. Clone

```bash
git clone https://github.com/OhaoTech/niua-godot-mcp.git <stable-path>/niua-godot-mcp
```

No `npm install`. Remember the **absolute** clone path.

## 4. Wire the client you’re running in

**Claude Code:**

```bash
claude mcp add niua-godot -s user \
  --env GODOT_MCP_ALLOWED_PROJECT_ROOTS="<projects-folder>" \
  -- node <clone>/src/godot-mcp/cli.js
```

If Godot is off-PATH, add `--env GODOT_BIN=<path>` before `--`.

**Codex:**

```bash
node <clone>/src/godot-mcp/cli.js setup --client codex --project-root "<projects-folder>"
# show preview, then:
node <clone>/src/godot-mcp/cli.js setup --client codex --project-root "<projects-folder>" --write
```

**Claude Desktop:** same with `--client claude` and `--write`.

**Cursor / other:** `--client generic`, merge the printed block into their MCP config (Cursor: `~/.cursor/mcp.json`). Show the file before saving.

## 5. Verify

```bash
node <clone>/src/godot-mcp/doctor.js
```

All lines PASS or SKIP. If Godot fails, fix `GODOT_BIN`.

## 6. Hand back

You cannot restart yourself. Tell the user:

> Restart me (or reconnect the niua-godot MCP server), then ask:  
> **Call get_godot_version**

When that returns their Godot version, install is done. Suggest:

```text
Create a project at <projects-folder>/first-game.
Build a 3D scene with ground, cube, camera, light.
Save, set main, run, confirm it's playing.
```

## Optional skill

Offer once:

- Claude Code: `cp -r <clone>/skills/niua-godot-forge ~/.claude/skills/`
- Codex: `cp -r <clone>/skills/niua-godot-forge ~/.agents/skills/`

Teaches save-before-run so the editor doesn’t get stuck on dialogs.
