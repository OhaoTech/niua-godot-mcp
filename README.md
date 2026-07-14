# NIUA Godot MCP

**Your AI builds real Godot games on your machine.**

Install once. Chat. Godot opens, scenes appear, the game runs. All local.

---

## 60-second install

### Option A — paste this to your AI (easiest)

Copy into Claude Code, Cursor, Codex, or any agent with shell access:

```text
Install NIUA Godot MCP for me.
Follow: https://raw.githubusercontent.com/OhaoTech/niua-godot-mcp/main/docs/godot-mcp/INSTALL-BY-AGENT.md
Ask before writing any config. Then call get_godot_version.
```

Restart the AI client when it says so. Done.

### Option B — do it yourself

**Need:** [Node 20+](https://nodejs.org) · [Godot 4.6](https://godotengine.org/download) · Claude / Cursor / Codex / etc.

```bash
git clone https://github.com/OhaoTech/niua-godot-mcp.git
cd niua-godot-mcp
mkdir -p ~/Godot/NIUAProjects
```

**Claude Code:**

```bash
claude mcp add niua-godot -s user \
  --env GODOT_MCP_ALLOWED_PROJECT_ROOTS="$HOME/Godot/NIUAProjects" \
  -- node "$(pwd)/src/godot-mcp/cli.js"
```

**Codex / Claude Desktop / Cursor:**

```bash
# preview
node src/godot-mcp/cli.js setup --client codex --project-root "$HOME/Godot/NIUAProjects"
# write (use --client claude or --client generic for others)
node src/godot-mcp/cli.js setup --client codex --project-root "$HOME/Godot/NIUAProjects" --write
```

Restart your AI tool.

---

## First game

Ask your AI:

```text
Create a Godot project at ~/Godot/NIUAProjects/first-game.
Build a 3D scene with a ground, a cube, a camera, and a light.
Save it, set it as main, then call run_playtest_evidence and tell me the evidence claims.
```

You should see Godot open and a real game window. The agent gets one compact evidence pack (run + observe + screenshot contract) instead of a hand-rolled tool loop.

---

## If something breaks

| Problem | Fix |
|---|---|
| `Unable to run Godot` | Install Godot 4.6, or set `GODOT_BIN=/path/to/godot` in the MCP config |
| `outside allowed project roots` | Put projects under `~/Godot/NIUAProjects` (or the folder you chose) |
| `bridge is not reachable` | Ask the AI: “open the project with open_project” |
| Tools missing | Restart the AI client after install |
| Godot stuck on a dialog | Press Esc in Godot; ask the AI to **save** the scene before run |

Health check:

```bash
cd niua-godot-mcp && node src/godot-mcp/doctor.js
```

More help: [troubleshooting](docs/godot-mcp/troubleshooting.md)

---

## Optional

<details>
<summary><strong>Teach the AI the safe build loop</strong> (recommended)</summary>

```bash
# Claude Code
mkdir -p ~/.claude/skills && cp -r skills/niua-godot-forge ~/.claude/skills/

# Codex / agents
mkdir -p ~/.agents/skills && cp -r skills/niua-godot-forge ~/.agents/skills/
```

</details>

<details>
<summary><strong>JS SDK</strong> (scripts, no chat spam)</summary>

After the AI has opened a project once:

```bash
node examples/sdk-quickstart.mjs ~/Godot/NIUAProjects/first-game
```

```js
import { connect } from "niua-godot-mcp/sdk";
const godot = connect({ expectedProjectRoot: "/path/to/project" });
// no tokens to configure
```

</details>

<details>
<summary><strong>Tool profiles & experimental tools</strong></summary>

Default is `core` (~52 tools) — enough for real games.

- `full` — every stable tool  
- `compact` — full surface behind 13 routers  

```bash
node src/godot-mcp/cli.js setup --client codex --project-root "$HOME/Godot/NIUAProjects" --profile full --write
```

Experimental tools (multiplayer, nav, export, …) stay hidden unless you set `NIUA_MCP_EXPERIMENTAL=on`. Catalog: [tools.md](docs/godot-mcp/tools.md)

</details>

<details>
<summary><strong>Developers</strong></summary>

```bash
npm test
npm run godot:mcp:docs
```

- [Kernel contract](docs/godot-mcp/KERNEL-CONTRACT.md)  
- [Manual](docs/godot-mcp/MANUAL.md)  
- [Security](SECURITY.md)  

</details>

---

## License

[PolyForm Small Business 1.0.0](LICENSE.md) — free for individuals and orgs under ~100 people / ~$1M revenue. Larger orgs: team@ohao.tech
