---
name: niua-godot
description: Use when building, running, or debugging a Godot game through the NIUA Godot MCP (mcp__niua-godot__* tools) — creating scenes and nodes, wiring scripts, running a scene, capturing runtime screenshots, or recovering from errors like "no_main_scene", "unsaved_scene", "current scene has no file path", or a stuck Godot editor dialog after a run.
---

# NIUA Godot

Playbook for a real Godot 4.7 editor through the NIUA Godot MCP. The MCP is the hands. This file is the order of operations so Godot does not pop a modal the agent cannot click.

## What's in this skill

| File | What it is |
| --- | --- |
| `SKILL.md` (this file) | Safe build/run loop, token diet, error recovery |
| `reference/*.md` | Generated tool lists per domain — read only the one you need |

The MCP already sends a short golden path at initialize. Use this skill when you are actually building or debugging.

## Core principle

**A scene must exist on disk before you run it.** An untitled scene, or `run_main_scene` with no main scene, pops a native Save As / "select main scene" dialog. No tool can dismiss it; every later call stalls. Never run a scene that is not saved to a `res://` path.

After `create_project` / `open_project`, pass `expectedProjectRoot` on later calls.

## The safe build loop

Steps 4–5 are the ones agents skip.

1. **Scene on disk.** `create_scene(path: "res://<name>.tscn", open: true)` or `open_scene`. An explicit path means it already has a file.
2. **Build.** Prefer `apply_scene_recipe` / `batch_scene_operations`, or `create_node` + `create_resource` + `set_node_property` + `attach_script`. Specialized L1 creators stay in `full`.
3. **Make it visible** (3D): a `Camera3D` framing the content and a light, or the run is a black window.
4. **Save.** File path already set → `save_current_scene`. Untitled → `save_scene_as(path: "res://<name>.tscn")`. `save_current_scene` errors on untitled.
5. **Define what runs.** `set_main_scene(path)` then `run_main_scene`, or skip that with `run_custom_scene(path, saveBeforeRun: true)`.
6. **Run.** `run_main_scene` / `run_current_scene` / `run_custom_scene` (`saveBeforeRun` defaults true).
7. **Observe.** Prefer `run_playtest_evidence` (compact pack; pass `savePath` for the PNG). Or `get_runtime_state`, `get_runtime_events`, `get_runtime_node_properties` with a `properties` allowlist, `capture_runtime_screenshot` with `savePath`. Headless `available:false` is expected.

Unsure of state? `get_run_settings` (`mainScene` + `mainSceneExists`) then `find_nodes` — cheaper than a stuck dialog.

## Keep results small

- Large scenes: `find_nodes { nameContains|type|pathPrefix|sceneFileContains }`, not a full `get_scene_tree`.
- Trees default `maxDepth: 2`. Pass `0` for the full tree, `savePath` to keep JSON on disk.
- Screenshots need `savePath` (or `includePayload: true`). Inline PNG is omitted by default.
- Runtime properties: pass `properties: ["hp"]`. Default is script variables only; `verbose: true` is the engine list.
- Events: `get_runtime_events`. Snapshots do not include the log.
- Editor logs: `get_output_logs`. `get_editor_state` returns `logCount` / `lastLog` only.
- `list_filesystem` recursive default is `maxDepth: 2`.

## Preconditions for running

| To run with… | Required first |
| --- | --- |
| `run_current_scene` | current scene saved to a `res://` path |
| `run_main_scene` | `set_main_scene` **and** the scene saved |
| `run_custom_scene(path)` | that `path` exists on disk |

## Error recovery

| Error / symptom | Fix |
| --- | --- |
| `unsaved_scene` | `save_scene_as("res://…")`, then run |
| `current scene has no file path` | `save_scene_as`, not `save_current_scene` |
| `no_main_scene` | `set_main_scene(path)` or `run_custom_scene` |
| stuck editor / `window.cpp` exclusive-child | press Esc; save + set main scene; retry |

Errors often include `recovery.tool`. Lost? `describe_tools`.

## Tool profiles

- **`core` (~52 tools, default)** — project, scenes, L0 primitives, scripts, run, playtest, inspector, recipes/batch.
- **`full`** — adds L1 specialized creators. Wider menu, not higher quality.
- **`compact`** — ~13 action-routed domain tools. `{ action: "describe" }` then `{ action: "<name>", args }`.

Experimental tools stay hidden unless `NIUA_MCP_EXPERIMENTAL=on`. Do not suggest them unless that env is set.

## Subsystem reference

Read one file from `reference/` when you need that domain. Do not load them all.

| Need | Read |
| --- | --- |
| 3D / physics / blockouts | `reference/nodes-3d.md`, `reference/playable3d-workflows.md` |
| 2D / sprites / tilemaps | `reference/nodes-2d.md`, `reference/playable2d-workflows.md` |
| Animation | `reference/animation.md` |
| Audio | `reference/audio.md` |
| Particles | `reference/particles.md` |
| UI | `reference/ui.md` |
| Scripts, scenes, filesystem, import, resources, run, debugger, viewport | the same-named `reference/*.md` |
