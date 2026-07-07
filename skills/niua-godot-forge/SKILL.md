---
name: niua-godot-forge
description: Use when building, running, or debugging a Godot game through the NIUA Godot MCP (mcp__niua-godot__* tools) — creating scenes and nodes, wiring scripts, running a scene, capturing runtime screenshots, or recovering from errors like "no_main_scene", "unsaved_scene", "current scene has no file path", or a stuck Godot editor dialog after a run.
---

# NIUA Godot Forge

Playbook for driving a real Godot 4.6 editor through the NIUA Godot MCP tools. The MCP is the hands; this is the order of operations that keeps the editor from blocking on modal GUI dialogs the agent cannot click.

## Core principle

**A scene must exist on disk before you run it.** Running an untitled scene, or `run_main_scene` with no main scene defined, makes the Godot editor pop a native modal dialog (Save As / "select main scene") that no tool call can dismiss — it stalls every later call. Never run a scene you have not saved to a `res://` path.

## The safe build loop

Follow this order. Steps 4–5 are the ones agents skip.

1. **Ensure a scene exists.** `create_scene(path: "res://<name>.tscn", open: true)` for new work, or `open_scene` for existing. Creating with an explicit `path` means the scene already has a file — no untitled trap.
2. **Build.** `create_node` / `create_mesh_instance_3d` / `set_node_property` / `attach_script`, etc.
3. **Make it visible** (3D): ensure a `Camera3D` framing the content and a light (`create_light_3d`) exist, or the run is a black window.
4. **Save to a `res://` path.** If the scene has a file, `save_current_scene`. If it is untitled (no path), you MUST use `save_scene_as(path: "res://<name>.tscn")` — `save_current_scene` errors on an untitled scene.
5. **Define what runs.** For `run_main_scene`: call `set_main_scene(path)` first. To skip that, use `run_custom_scene(path, saveBeforeRun: true)` with the saved scene's path.
6. **Run.** `run_main_scene` / `run_current_scene` / `run_custom_scene` (pass `saveBeforeRun: true`).
7. **Observe.** `capture_runtime_screenshot` (returns `available:false` in headless — that is expected, not an error), `get_runtime_events`, then `stop_running_scene`.

When unsure of state, call `get_run_settings` (reports `mainScene` + `mainSceneExists`) and `get_scene_tree` before running — cheaper than recovering from a stuck dialog.

## Preconditions for running

| To run with… | Required first |
| --- | --- |
| `run_current_scene` | current scene saved to a `res://` path |
| `run_main_scene` | a main scene set (`set_main_scene`) **and** the scene saved |
| `run_custom_scene(path)` | that `path` exists on disk (saved) |

## Error recovery

| Error / symptom | Cause | Fix |
| --- | --- | --- |
| `unsaved_scene` | running a never-saved scene | `save_scene_as("res://…")`, then run |
| `current scene has no file path` | `save_current_scene` on an untitled scene | use `save_scene_as("res://…")` instead |
| `no_main_scene` | `run_main_scene` with none defined | `set_main_scene(path)` first, or use `run_custom_scene` |
| stuck editor / `window.cpp` exclusive-child error | a prior run popped a modal dialog | press Esc in the editor; then save + set main scene before retrying |

## Tool profiles (context budget)

- **`core` (55 tools, default)** — project, scenes, nodes, scripts, run controls, runtime playtesting, audio, inspector. Every member proven in real game builds. Stay here for normal work.
- **`full` (~146 stable tools)** — adds the specialized subsystems below (env `NIUA_MCP_PROFILE=full`). Same code either way; `full` is a wider menu, not "more production-ready".
- **`compact` (13 router tools)** — the full stable surface behind action-routed domain tools, for context-constrained clients.
- Experimental tools (multiplayer, localization, navigation, tilemaps, export, debugger control, animation trees, UI theming, 2D workflow builders) are hidden from every profile unless `NIUA_MCP_EXPERIMENTAL=on`. `describe_tools` lists them, labeled. Do not suggest them to the user unless that env is set.

## Subsystem reference (read on demand)

For specialized work, read the matching file in `reference/` for that subsystem's tools and conventions — do not load them all up front.

| Need | Read |
| --- | --- |
| 3D nodes, physics bodies, blockouts | `reference/nodes-3d.md`, `reference/playable3d-workflows.md` |
| 2D sprites, tilemaps, bodies | `reference/nodes-2d.md`, `reference/playable2d-workflows.md` |
| Animation / AnimationTree | `reference/animation.md` |
| Audio buses & players | `reference/audio.md` |
| Particles | `reference/particles.md` |
| UI / themes | `reference/ui.md` |
| Navigation / pathfinding | `reference/navigation.md` |
| Localization | `reference/localization.md` |
| Multiplayer | `reference/multiplayer.md` |
| Scripts, scenes, filesystem, import, resources, export, debugger, viewport | the same-named `reference/*.md` |

## Common mistakes

- Calling `save_current_scene` on a brand-new scene — it has no path; use `save_scene_as`.
- Calling `run_main_scene` before `set_main_scene` — pops the "select main scene" dialog.
- Running before saving — pops "Save As" and stalls the editor.
- Treating screenshot `available:false` as a failure — it just means headless/no renderer.
- Switching to `full` profile expecting better quality — it only widens the tool menu.
