# Kernel surface diet

**Date:** 2026-07-14  
**Goal:** make `core` the real agent kernel, not a grab-bag of convenient GUI helpers.

## Principle

| Layer | Lives in core? | Examples |
| --- | --- | --- |
| **L0 primitives** | yes | `create_node`, `create_resource`, `set_node_property`, scene/run/runtime |
| **L2 batch** | yes | `apply_scene_recipe`, `batch_scene_operations` |
| **L1 typed creators** | no (full profile) | `create_mesh_instance_3d`, physics body helpers, audio bus helpers |
| **Workflow macros** | no (full / experimental) | character controllers, playable blockouts |

Agents and the JS SDK still reach L1/full tools; they are not deleted.

## 2026-07-14 change set

### Demoted essential → standard (still in `full`)

- `create_light_3d`, `create_camera_3d`, `create_mesh_instance_3d`
- `create_character_body_3d`, `create_static_body_3d`
- `create_3d_character_controller`
- `upsert_audio_bus`, `create_audio_stream_player`

### Promoted standard → essential (safe build + observe loop)

- `create_resource` — L0 resource authoring without L1 creators
- `save_scene_as` — avoid untitled-scene modal traps
- `get_run_settings` — know main scene before run
- `run_custom_scene` — run a saved path without main-scene dialog
- `get_runtime_events` — observe without full tree dumps

### Resulting `core` size

~52 tools (was 55), biased toward **jobs**: bootstrap, author, run, observe, batch.

## Future demotions (not yet)

Candidates when recipes/SDK cover dogfood paths:

- `invoke_editor_action` (allowlist chrome)
- More script-editor state tools if diagnose + write suffice
- Remaining “nice” inspect tools that bloat schema without closing loops

## Future promotions (not yet)

- Export readiness (`diagnose_export_templates` / `export_project`) once default agent ship path needs them in core
- `import_project_assets` if CLI import is always part of bootstrap

## How to change tiers

1. Edit the tool’s `tier` + `profile` in its domain `manifest.js` (`essential`/`v1` or `standard`/`full`).
2. Update any contract tests that pin v1 membership.
3. Refresh skill docs counts (`skills/niua-godot-forge/SKILL.md`).
4. `npm test` — core projection is derived from `tier`, not a hand list.
