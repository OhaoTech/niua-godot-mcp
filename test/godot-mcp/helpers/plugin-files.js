import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const addonRoot = path.join(repoRoot, "godot/addons/niua_mcp");
const readRouteDomainFiles = [
  "niua_mcp_bridge_read_route_context.gd",
  "niua_mcp_bridge_read_editor_routes.gd",
  "niua_mcp_bridge_read_scene_routes.gd",
  "niua_mcp_bridge_read_filesystem_routes.gd",
  "niua_mcp_bridge_read_project_routes.gd",
  "niua_mcp_bridge_read_script_routes.gd",
  "niua_mcp_bridge_read_import_routes.gd",
  "niua_mcp_bridge_read_run_routes.gd",
  "niua_mcp_bridge_read_debugger_routes.gd",
  "niua_mcp_bridge_read_viewport_routes.gd"
];
const editorActionDomainFiles = [
  "niua_mcp_editor_action_catalog.gd",
  "niua_mcp_editor_action_dispatch.gd",
  "niua_mcp_editor_action_utils.gd",
  "niua_mcp_editor_action_ui.gd",
  "niua_mcp_editor_action_filesystem.gd",
  "niua_mcp_editor_action_scene.gd"
];
const tileSetTerrainDomainFiles = [
  "niua_mcp_tile_set_terrain_sets_builder.gd",
  "niua_mcp_tile_set_tile_terrain_builder.gd",
  "niua_mcp_tile_set_terrain_peering_builder.gd",
  "niua_mcp_tile_set_terrain_utils.gd"
];
const writeSceneRouteDomainFiles = [
  "niua_mcp_bridge_write_scene_tab_routes.gd",
  "niua_mcp_bridge_write_scene_document_routes.gd",
  "niua_mcp_bridge_write_scene_tile_map_routes.gd",
  "niua_mcp_bridge_write_scene_node_routes.gd",
  "niua_mcp_bridge_write_scene_script_routes.gd"
];
const debuggerControlDomainFiles = [
  "niua_mcp_debugger_control_state.gd",
  "niua_mcp_debugger_control_commands.gd",
  "niua_mcp_debugger_control_side_effects.gd",
  "niua_mcp_debugger_control_utils.gd"
];
const projectSettingsDomainFiles = [
  "niua_mcp_project_settings_state_operations.gd",
  "niua_mcp_project_setting_mutation_operations.gd",
  "niua_mcp_input_map_operations.gd",
  "niua_mcp_project_settings_side_effects.gd",
  "niua_mcp_project_settings_utils.gd"
];
const projectSettingsMetadataDomainFiles = [
  "niua_mcp_project_settings_query_metadata.gd",
  "niua_mcp_project_settings_summary_metadata.gd",
  "niua_mcp_project_settings_category_metadata.gd"
];
const spriteFramesSheetDomainFiles = [
  "niua_mcp_sprite_frames_sheet_grid.gd",
  "niua_mcp_sprite_frames_sheet_expander.gd"
];
const filesystemBatchDomainFiles = [
  "niua_mcp_filesystem_batch_runner.gd",
  "niua_mcp_filesystem_batch_executor.gd",
  "niua_mcp_filesystem_batch_dry_run.gd",
  "niua_mcp_filesystem_batch_result.gd"
];
const tileSetPhysicsDomainFiles = [
  "niua_mcp_tile_set_physics_layer_builder.gd",
  "niua_mcp_tile_set_collision_polygon_builder.gd",
  "niua_mcp_tile_set_collision_polygon_settings.gd",
  "niua_mcp_tile_set_collision_polygon_points.gd",
  "niua_mcp_tile_set_physics_utils.gd"
];
const importOperationDomainFiles = [
  "niua_mcp_import_query_operations.gd",
  "niua_mcp_import_event_operations.gd",
  "niua_mcp_import_option_operations.gd",
  "niua_mcp_import_reimport_operations.gd",
  "niua_mcp_import_side_effects.gd",
  "niua_mcp_import_utils.gd"
];
const importMetadataQueryDomainFiles = [
  "niua_mcp_import_metadata_query_reader.gd",
  "niua_mcp_import_metadata_loader.gd",
  "niua_mcp_import_metadata_summary.gd",
  "niua_mcp_import_metadata_diagnostics.gd"
];
const inspectorMetadataDomainFiles = [
  "niua_mcp_inspector_metadata_builder.gd",
  "niua_mcp_inspector_metadata_control.gd",
  "niua_mcp_inspector_metadata_hint_parser.gd",
  "niua_mcp_inspector_metadata_file_mode.gd"
];
const scriptReplaceDomainFiles = [
  "niua_mcp_script_replace_paths.gd",
  "niua_mcp_script_replace_literal.gd",
  "niua_mcp_script_replace_writer.gd"
];
const scriptEditorAuthoringDomainFiles = [
  "niua_mcp_script_editor_create_operations.gd",
  "niua_mcp_script_editor_attach_operations.gd",
  "niua_mcp_script_editor_authoring_utils.gd"
];
const scriptEditorCursorStateDomainFiles = [
  "niua_mcp_script_editor_cursor_context.gd",
  "niua_mcp_script_editor_caret_snapshot.gd"
];
const debuggerRuntimeDataDomainFiles = [
  "niua_mcp_debugger_probe_runtime_core.gd",
  "niua_mcp_debugger_probe_runtime_node_data.gd",
  "niua_mcp_debugger_probe_runtime_screenshot_data.gd",
  "niua_mcp_debugger_probe_runtime_data_utils.gd"
];
const sceneDocumentDomainFiles = [
  "niua_mcp_scene_document_create_operations.gd",
  "niua_mcp_scene_document_save_operations.gd",
  "niua_mcp_scene_document_side_effects.gd",
  "niua_mcp_scene_document_utils.gd"
];

export async function readAddonFileExact(name) {
  const content = await readFile(path.join(addonRoot, name), "utf8");
  // Source assertions use \n-anchored regexes; tolerate CRLF checkouts.
  return content.replaceAll("\r\n", "\n");
}

export async function readAddonFile(name) {
  const content = await readAddonFileExact(name);
  if (name === "niua_mcp_bridge_read_routes.gd") {
    const domainContents = await Promise.all(readRouteDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_editor_actions.gd") {
    const domainContents = await Promise.all(editorActionDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_tile_set_terrain_builder.gd") {
    const domainContents = await Promise.all(tileSetTerrainDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_bridge_write_scene_routes.gd") {
    const domainContents = await Promise.all(writeSceneRouteDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_debugger_control_operations.gd") {
    const domainContents = await Promise.all(debuggerControlDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_project_settings_operations.gd") {
    const domainContents = await Promise.all(projectSettingsDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_project_settings_metadata.gd") {
    const domainContents = await Promise.all(projectSettingsMetadataDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_sprite_frames_sheet_builder.gd") {
    const domainContents = await Promise.all(spriteFramesSheetDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_filesystem_batch_operations.gd") {
    const domainContents = await Promise.all(filesystemBatchDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_tile_set_physics_builder.gd") {
    const domainContents = await Promise.all(tileSetPhysicsDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_import_operations.gd") {
    const domainContents = await Promise.all(importOperationDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_import_metadata_queries.gd") {
    const domainContents = await Promise.all(importMetadataQueryDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_inspector_metadata.gd") {
    const domainContents = await Promise.all(inspectorMetadataDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_script_replace_operations.gd") {
    const domainContents = await Promise.all(scriptReplaceDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_script_editor_authoring_operations.gd") {
    const domainContents = await Promise.all(scriptEditorAuthoringDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_script_editor_cursor_state.gd") {
    const domainContents = await Promise.all(scriptEditorCursorStateDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_debugger_probe_runtime_data.gd") {
    const domainContents = await Promise.all(debuggerRuntimeDataDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  if (name === "niua_mcp_scene_document_operations.gd") {
    const domainContents = await Promise.all(sceneDocumentDomainFiles.map(readAddonFileExact));
    return [content, ...domainContents].join("\n");
  }
  return content;
}

export async function readBridgeRouteSurface() {
  const [bridge, readRoutes] = await Promise.all([
    readAddonFile("niua_mcp_bridge.gd"),
    readAddonFile("niua_mcp_bridge_read_routes.gd")
  ]);
  return `${bridge}\n${readRoutes}`;
}

export async function readBridgeWriteSurface() {
  const [
    bridge,
    writeRoutes,
    writeContext,
    filesystemRoutes,
    resourceRoutes,
    projectRoutes,
    scriptRoutes,
    importRoutes,
    debuggerRoutes,
    runRoutes,
    editorRoutes,
    sceneRoutes
  ] = await Promise.all([
    readAddonFile("niua_mcp_bridge.gd"),
    readAddonFile("niua_mcp_bridge_write_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_route_context.gd"),
    readAddonFile("niua_mcp_bridge_write_filesystem_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_resource_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_project_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_script_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_import_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_debugger_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_run_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_editor_routes.gd"),
    readAddonFile("niua_mcp_bridge_write_scene_routes.gd")
  ]);
  return [
    bridge,
    writeRoutes,
    writeContext,
    filesystemRoutes,
    resourceRoutes,
    projectRoutes,
    scriptRoutes,
    importRoutes,
    debuggerRoutes,
    runRoutes,
    editorRoutes,
    sceneRoutes
  ].join("\n");
}

export async function readBridgeFullRouteSurface() {
  const [writeSurface, readRoutes] = await Promise.all([
    readBridgeWriteSurface(),
    readAddonFile("niua_mcp_bridge_read_routes.gd"),
  ]);
  return `${writeSurface}\n${readRoutes}`;
}

export async function assertEndpointRoutes(endpoints) {
  const [
    router,
    readCatalog,
    writeCatalog,
    writeEndpoints,
    writeRouteTable
  ] = await Promise.all([
    readAddonFile("niua_mcp_bridge_router.gd"),
    readAddonFile("niua_mcp_bridge_read_route_catalog.gd"),
    readAddonFile("niua_mcp_bridge_write_route_catalog.gd"),
    readAddonFile("niua_mcp_bridge_write_route_endpoints.gd"),
    readAddonFile("niua_mcp_bridge_write_route_table.gd")
  ]);
  const routeSurface = `${router}\n${readCatalog}\n${writeCatalog}\n${writeEndpoints}\n${writeRouteTable}`;

  for (const endpoint of endpoints) {
    assert.match(routeSurface, new RegExp(endpoint.replace("/", "\\/")));
  }
}
