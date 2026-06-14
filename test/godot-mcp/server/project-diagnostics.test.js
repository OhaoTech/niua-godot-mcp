import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createMcpProcess,
  getFreeHttpPort
} from "../helpers/server-harness.js";

test("Godot MCP server diagnoses projects missing the NIUA addon", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-diagnostics-"));
  const projectRoot = path.join(allowedRoot, "missing-addon");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Missing Addon\"",
      ""
    ].join("\n"));

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const response = await server.request("tools/call", {
        name: "diagnose_project_setup",
        arguments: {
          projectRoot,
          checkBridge: false
        }
      });
      const payload = JSON.parse(response.result.content[0].text);
      const checks = Object.fromEntries(payload.data.checks.map((check) => [check.code, check]));

      assert.equal(payload.ok, true);
      assert.equal(payload.data.ready, false);
      assert.equal(checks.project_file.ok, true);
      assert.equal(checks.addon_plugin_cfg.ok, false);
      assert.equal(checks.editor_plugin_enabled.ok, false);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server diagnoses installed NIUA addon projects as ready", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-diagnostics-"));
  const projectRoot = path.join(allowedRoot, "installed-addon");

  try {
    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      await server.request("tools/call", {
        name: "create_project",
        arguments: {
          projectRoot,
          name: "Installed Addon",
          installAddon: true
        }
      });

      const response = await server.request("tools/call", {
        name: "diagnose_project_setup",
        arguments: {
          projectRoot,
          checkBridge: false
        }
      });
      const payload = JSON.parse(response.result.content[0].text);
      const checks = Object.fromEntries(payload.data.checks.map((check) => [check.code, check]));

      assert.equal(payload.ok, true);
      assert.equal(payload.data.ready, true);
      for (const code of [
        "addon_plugin_cfg",
        "addon_plugin_script",
        "addon_bridge_script",
        "addon_bridge_http",
        "addon_bridge_router",
        "addon_bridge_read_route_catalog",
        "addon_bridge_write_route_catalog",
        "addon_bridge_write_route_endpoints",
        "addon_bridge_write_route_table",
        "addon_bridge_read_routes",
        "addon_bridge_write_routes",
        "addon_bridge_read_route_context",
        "addon_bridge_read_editor_routes",
        "addon_bridge_read_scene_routes",
        "addon_bridge_read_filesystem_routes",
        "addon_bridge_read_project_routes",
        "addon_bridge_read_script_routes",
        "addon_bridge_read_import_routes",
        "addon_bridge_read_run_routes",
        "addon_bridge_read_debugger_routes",
        "addon_bridge_read_viewport_routes",
        "addon_bridge_write_route_context",
        "addon_bridge_write_filesystem_routes",
        "addon_bridge_write_resource_routes",
        "addon_bridge_write_project_routes",
        "addon_bridge_write_script_routes",
        "addon_bridge_write_import_routes",
        "addon_bridge_write_debugger_routes",
        "addon_bridge_write_run_routes",
        "addon_bridge_write_editor_routes",
        "addon_bridge_write_scene_routes",
        "addon_bridge_write_scene_tab_routes",
        "addon_bridge_write_scene_document_routes",
        "addon_bridge_write_scene_tile_map_routes",
        "addon_bridge_write_scene_node_routes",
        "addon_bridge_write_scene_script_routes",
        "addon_bridge_context",
        "addon_bridge_memory",
        "addon_import_event_tracker",
        "addon_runtime_probe",
        "addon_runtime_probe_protocol",
        "addon_runtime_probe_variant_codec",
        "addon_runtime_probe_state",
        "addon_runtime_probe_logging",
        "addon_runtime_probe_node_properties",
        "addon_runtime_probe_node_lookup",
        "addon_runtime_probe_node_property_reader",
        "addon_runtime_probe_node_property_writer",
        "addon_runtime_probe_screenshot",
        "addon_debugger_probe",
        "addon_debugger_probe_sessions",
        "addon_debugger_probe_events",
        "addon_debugger_probe_capture",
        "addon_debugger_probe_state",
        "addon_debugger_probe_session_commands",
        "addon_debugger_probe_runtime_requests",
        "addon_debugger_probe_store",
        "addon_debugger_probe_event_log",
        "addon_debugger_probe_runtime_data",
        "addon_debugger_probe_runtime_core",
        "addon_debugger_probe_runtime_node_data",
        "addon_debugger_probe_runtime_screenshot_data",
        "addon_debugger_probe_runtime_data_utils",
        "addon_debugger_probe_host",
        "addon_debugger_runtime_operations",
        "addon_debugger_control_operations",
        "addon_debugger_control_state",
        "addon_debugger_control_commands",
        "addon_debugger_control_side_effects",
        "addon_debugger_control_utils",
        "addon_runtime_state_operations",
        "addon_runtime_node_operations",
        "addon_runtime_screenshot_operations",
        "addon_runtime_probe_installer",
        "addon_config_file_codec",
        "addon_filesystem_operations",
        "addon_filesystem_result",
        "addon_filesystem_state_operations",
        "addon_filesystem_read_operations",
        "addon_filesystem_mutation_operations",
        "addon_filesystem_copy_operations",
        "addon_filesystem_side_effects",
        "addon_filesystem_batch_operations",
        "addon_filesystem_batch_runner",
        "addon_filesystem_batch_executor",
        "addon_filesystem_batch_dry_run",
        "addon_filesystem_batch_result",
        "addon_resource_operations",
        "addon_resource_operation_utils",
        "addon_resource_generic_operations",
        "addon_resource_shader_material_operations",
        "addon_resource_sprite_frames_operations",
        "addon_resource_tile_set_operations",
        "addon_resource_side_effects",
        "addon_resource_builder",
        "addon_script_file_operations",
        "addon_script_file_utils",
        "addon_script_file_basic_operations",
        "addon_script_replace_operations",
        "addon_script_replace_paths",
        "addon_script_replace_literal",
        "addon_script_replace_writer",
        "addon_script_analysis_operations",
        "addon_script_file_side_effects",
        "addon_script_editor_operations",
        "addon_script_editor_authoring_operations",
        "addon_script_editor_create_operations",
        "addon_script_editor_attach_operations",
        "addon_script_editor_authoring_utils",
        "addon_script_editor_navigation_operations",
        "addon_script_editor_state_operations",
        "addon_script_editor_overview_state",
        "addon_script_editor_cursor_state",
        "addon_script_editor_cursor_context",
        "addon_script_editor_caret_snapshot",
        "addon_script_editor_side_effects",
        "addon_editor_actions",
        "addon_editor_action_catalog",
        "addon_editor_action_dispatch",
        "addon_editor_action_utils",
        "addon_editor_action_ui",
        "addon_editor_action_filesystem",
        "addon_editor_action_scene",
        "addon_editor_selection_operations",
        "addon_editor_selection_node_operations",
        "addon_editor_selection_resource_operations",
        "addon_editor_selection_utils",
        "addon_editor_state_operations",
        "addon_editor_surface_operations",
        "addon_editor_surface_screenshot_operations",
        "addon_editor_surface_main_screen_operations",
        "addon_scene_graph_operations",
        "addon_scene_graph_utils",
        "addon_scene_graph_context",
        "addon_scene_document_operations",
        "addon_scene_document_create_operations",
        "addon_scene_document_save_operations",
        "addon_scene_document_side_effects",
        "addon_scene_document_utils",
        "addon_scene_inspector_operations",
        "addon_scene_property_operations",
        "addon_scene_material_operations",
        "addon_scene_node_context",
        "addon_scene_node_creation_operations",
        "addon_scene_node_instance_creation",
        "addon_scene_node_script_creation",
        "addon_scene_node_tree_operations",
        "addon_scene_node_tree_basic_operations",
        "addon_scene_node_tree_hierarchy_operations",
        "addon_scene_node_side_effects",
        "addon_viewport_operations",
        "addon_viewport_utils",
        "addon_viewport_resolver",
        "addon_viewport_state_operations",
        "addon_viewport_camera_operations",
        "addon_viewport_input_operations",
        "addon_viewport_screenshot_operations",
        "addon_viewport_side_effects",
        "addon_tile_map_layer_operations",
        "addon_tile_map_layer_context",
        "addon_tile_map_layer_cell_operations",
        "addon_tile_map_layer_terrain_operations",
        "addon_scene_tab_operations",
        "addon_scene_tab_utils",
        "addon_scene_tab_state",
        "addon_scene_tab_control",
        "addon_scene_tab_undo_redo",
        "addon_scene_tab_side_effects",
        "addon_run_operations",
        "addon_run_utils",
        "addon_run_settings_operations",
        "addon_run_control_operations",
        "addon_run_side_effects",
        "addon_sprite_frames_builder",
        "addon_sprite_frames_utils",
        "addon_sprite_frames_sheet_builder",
        "addon_sprite_frames_sheet_grid",
        "addon_sprite_frames_sheet_expander",
        "addon_sprite_frames_frame_builder",
        "addon_sprite_frames_animation_builder",
        "addon_tile_set_builder",
        "addon_tile_set_source_builder",
        "addon_tile_set_tile_builder",
        "addon_tile_set_terrain_builder",
        "addon_tile_set_terrain_sets_builder",
        "addon_tile_set_tile_terrain_builder",
        "addon_tile_set_terrain_peering_builder",
        "addon_tile_set_terrain_utils",
        "addon_tile_set_physics_builder",
        "addon_tile_set_physics_layer_builder",
        "addon_tile_set_collision_polygon_builder",
        "addon_tile_set_collision_polygon_settings",
        "addon_tile_set_collision_polygon_points",
        "addon_tile_set_physics_utils",
        "addon_shader_material_builder",
        "addon_import_operations",
        "addon_import_query_operations",
        "addon_import_event_operations",
        "addon_import_option_operations",
        "addon_import_reimport_operations",
        "addon_import_side_effects",
        "addon_import_utils",
        "addon_import_metadata",
        "addon_import_asset_listing",
        "addon_import_metadata_queries",
        "addon_import_metadata_query_reader",
        "addon_import_metadata_loader",
        "addon_import_metadata_summary",
        "addon_import_metadata_diagnostics",
        "addon_import_event_summary",
        "addon_inspector_metadata",
        "addon_inspector_metadata_builder",
        "addon_inspector_metadata_control",
        "addon_inspector_metadata_hint_parser",
        "addon_inspector_metadata_file_mode",
        "addon_input_event_codec",
        "addon_input_event_json_writer",
        "addon_input_event_json_writer_shared",
        "addon_input_event_json_writer_keyboard_action",
        "addon_input_event_json_writer_pointer",
        "addon_input_event_json_writer_device",
        "addon_input_event_json_reader",
        "addon_json_args",
        "addon_json_arg_errors",
        "addon_json_scalar_args",
        "addon_json_vector2i_args",
        "addon_json_typed_variant_args",
        "addon_node_snapshot",
        "addon_node_type_operations",
        "addon_project_settings_operations",
        "addon_project_settings_state_operations",
        "addon_project_setting_mutation_operations",
        "addon_input_map_operations",
        "addon_project_settings_side_effects",
        "addon_project_settings_utils",
        "addon_project_settings_metadata",
        "addon_project_settings_query_metadata",
        "addon_project_settings_summary_metadata",
        "addon_project_settings_category_metadata",
        "addon_property_metadata",
        "addon_export_operations",
        "addon_export_presets",
        "addon_path_utils",
        "addon_script_templates",
        "addon_variant_codec",
        "editor_plugin_enabled"
      ]) {
        assert.equal(checks[code].ok, true);
      }
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server suggests bridge recovery actions when an installed project bridge is offline", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-bridge-recovery-"));
  const projectRoot = path.join(allowedRoot, "installed-addon");
  const bridgePort = await getFreeHttpPort();

  try {
    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      await server.request("tools/call", {
        name: "create_project",
        arguments: {
          projectRoot,
          name: "Installed Addon",
          installAddon: true
        }
      });

      const response = await server.request("tools/call", {
        name: "diagnose_project_setup",
        arguments: {
          projectRoot,
          checkBridge: true,
          bridgePort,
          timeoutMs: 50
        }
      });
      const payload = JSON.parse(response.result.content[0].text);
      const checks = Object.fromEntries(payload.data.checks.map((check) => [check.code, check]));

      assert.equal(payload.ok, true);
      assert.equal(payload.data.ready, false);
      assert.equal(checks.bridge_health.ok, false);
      assert.match(checks.bridge_health.message, /not reachable/);
      assert.deepEqual(payload.data.recoveryActions.map((action) => action.code), [
        "restart_or_toggle_plugin",
        "open_project_with_bridge",
        "discover_editor_bridges"
      ]);
      assert.deepEqual(payload.data.recoveryActions[1].toolCall, {
        name: "open_project",
        arguments: {
          projectRoot,
          installAddon: true,
          waitForBridge: true,
          bridgeHost: "127.0.0.1",
          bridgePort
        }
      });
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});
