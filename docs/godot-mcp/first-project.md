# First Project Tutorial

This tutorial walks through the first hands-on flow after NIUA Godot MCP is connected to your MCP client. You will create a Godot project, open it through the MCP, build a small saved 3D scene, set it as the main scene, and run it.

## What You Need

- Completed [getting started](getting-started.md)
- Godot 4.6.x
- A project root allowed by setup, such as `$HOME/Godot/NIUAProjects`
- The optional `niua-godot-forge` skill installed

## Step 1: Verify The MCP Server

Ask your agent:

```text
Call the niua-godot MCP tool get_godot_version.
```

Expected result: the agent reports the Godot executable version.

If this fails, use [troubleshooting](troubleshooting.md) before continuing.

## Step 2: Create And Open A Project

Ask your agent:

```text
Use niua-godot-forge.
Create a Godot project at ~/Godot/NIUAProjects/first-niua-game.
Open it in the Godot editor and wait for the NIUA bridge.
```

Expected result: Godot opens the project, the NIUA addon is installed, and the bridge becomes reachable.

If you chose a different allowed project root during setup, use that path instead.

## Step 3: Build A Saved 3D Scene

Ask your agent:

```text
Use niua-godot-forge.
In the open project, create a scene saved as res://main.tscn.
Add a ground plane, a visible cube, a Camera3D, and a DirectionalLight3D.
Save the scene.
Set res://main.tscn as the main scene.
```

Expected result: the scene exists on disk and has enough camera and light setup to avoid a black run window.

The save step matters. Running an untitled scene can trigger a native Godot modal dialog that MCP tools cannot click.

## Step 4: Run And Observe

Ask your agent:

```text
Run the main scene, report get_run_status, capture a runtime screenshot if available, then stop the running scene.
```

Expected result:

- `get_run_status` reports the scene running before stop.
- `capture_runtime_screenshot` returns an image or `available:false`.
- `available:false` is normal in headless or display-less environments.
- `stop_running_scene` returns the editor to an idle run state.

## What You Built

You now have a real Godot project under your allowed project root with:

- The NIUA editor addon installed
- A saved `res://main.tscn`
- A simple visible 3D scene
- A main scene setting
- A verified run loop

From here, ask the agent for focused changes:

```text
Use niua-godot-forge.
Add a CharacterBody3D player controller to this scene.
Save, run, report runtime logs, and stop.
```

Or switch to the full profile for specialized subsystems:

```bash
node src/godot-mcp/cli.js setup \
  --client codex \
  --project-root "$HOME/Godot/NIUAProjects" \
  --profile full \
  --write
```

Restart the MCP client after changing profiles.

## Related

- [Getting started](getting-started.md)
- [Troubleshooting](troubleshooting.md)
- [Tool catalog](tools.md)
- [niua-godot-forge skill](../../skills/niua-godot-forge/SKILL.md)
