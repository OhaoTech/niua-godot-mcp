# Troubleshooting NIUA Godot MCP

Use this when setup, project launch, bridge connection, or the first run loop fails.

## `npx niua-godot-mcp` Returns 404

The package may not be published to npm yet.

Check:

```bash
npm view niua-godot-mcp version
```

If npm returns `404`, use the source checkout:

```bash
git clone https://github.com/OhaoTech/niua-godot-mcp.git
cd niua-godot-mcp
node src/godot-mcp/cli.js setup --client codex --project-root "$HOME/Godot/NIUAProjects" --write
```

You can also install the current checkout globally:

```bash
npm install -g .
niua-godot-mcp setup --client codex --project-root "$HOME/Godot/NIUAProjects" --write
```

## Godot Cannot Be Found

Symptom:

```text
Unable to run Godot executable "godot" for --version
```

Fix:

```bash
export GODOT_BIN="/absolute/path/to/godot"
"$GODOT_BIN" --version

node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "$HOME/Godot/NIUAProjects" \
  --godot-bin "$GODOT_BIN" \
  --write
```

Then restart your MCP client.

## Project Is Outside Allowed Roots

Symptom:

```text
... is outside allowed project roots ...
```

The MCP server only manages projects under `GODOT_MCP_ALLOWED_PROJECT_ROOTS`.

Fix one of these:

```bash
# Use the existing allowed root.
mkdir -p "$HOME/Godot/NIUAProjects/my-game"
```

Or rerun setup with the root you want:

```bash
node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "/absolute/path/to/GodotProjects" \
  --write
```

Restart the MCP client after changing config.

## Bridge Is Not Reachable

Symptom:

```text
Godot bridge is not reachable at 127.0.0.1:9174
```

Checks:

```bash
node src/godot-mcp/doctor.js --project /path/to/project
node src/godot-mcp/doctor.js --project /path/to/project --port 9174
```

Fixes:

- Open the project through the MCP `open_project` tool instead of launching Godot manually.
- Verify the addon exists at `res://addons/niua_mcp/plugin.cfg`.
- In Godot, enable the `NIUA Godot MCP` plugin if it is disabled.
- If another process uses port `9174`, ask the agent to call `open_project` with a different bridge port.

## Unauthorized Bridge Request

Symptom:

```text
missing or invalid X-NIUA-MCP-Token header
```

The MCP server and editor bridge are using different auth tokens.

Best fix: close the manually opened editor and ask the agent to open the project with `open_project`. That launches Godot with the token the MCP server expects.

Manual fix:

```bash
export NIUA_MCP_TOKEN="$(openssl rand -base64 32 | tr '+/' '-_' | tr -d '=')"
export GODOT_MCP_TOKEN="$NIUA_MCP_TOKEN"
godot --path /path/to/project --editor
```

Run the MCP server in an environment that has the same token.

## Godot Opens A Blocking Run Dialog

Symptoms:

- `no_main_scene`
- `unsaved_scene`
- `current scene has no file path`
- Godot logs mention an exclusive child window or modal dialog

Cause: a run command happened before the scene was saved or before the main scene was set.

Fix:

1. Press Escape in the Godot editor if a native dialog is open.
2. Save the scene to a `res://` path, for example `res://main.tscn`.
3. Call `set_main_scene` with that saved path.
4. Run again.

Safe prompt:

```text
Use niua-godot-forge.
Open or create res://main.tscn, save it, set it as the main scene, then run_main_scene.
```

## Runtime Screenshot Is Unavailable

Symptom:

```json
{ "available": false }
```

This is expected when Godot is running headless or the renderer cannot expose pixels. Treat it as a signal, not a failure. Use runtime logs, `get_run_status`, `get_scene_tree`, and runtime probe events to continue.

## Full Profile Tools Are Missing

Symptom:

```text
Tool "create_sprite_2d" is not in the "v1" tool profile.
```

Fix:

```bash
node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "$HOME/Godot/NIUAProjects" \
  --profile full \
  --write
```

Restart the MCP client.

## Manual Addon Install

Agents normally install the addon through `create_project` or `open_project`. For an existing project:

```bash
node scripts/install-niua-godot-addon.js /path/to/project
```

Or:

```bash
npm run godot:addon:install -- /path/to/project
```

Then open the project in Godot and confirm the plugin is enabled.

## Still Stuck

Collect these facts:

```bash
node --version
godot --version
node src/godot-mcp/doctor.js --json
node src/godot-mcp/doctor.js --project /path/to/project --port 9174 --json
```

Then include:

- Your MCP client
- Operating system
- Godot version
- The exact project root
- The exact error text from the agent
