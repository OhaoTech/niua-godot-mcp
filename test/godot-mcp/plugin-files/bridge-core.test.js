import assert from "node:assert/strict";
import test from "node:test";

import {
  assertEndpointRoutes,
  readAddonFile,
  readAddonFileExact,
  readBridgeWriteSurface
} from "../helpers/plugin-files.js";

test("Godot plugin manifest points at the NIUA MCP editor plugin", async () => {
  const manifest = await readAddonFile("plugin.cfg");

  assert.match(manifest, /\[plugin\]/);
  assert.match(manifest, /name="NIUA Godot MCP"/);
  assert.match(manifest, /script="niua_mcp_plugin\.gd"/);
});

test("Godot plugin entrypoint starts and stops the bridge", async () => {
  const plugin = await readAddonFile("niua_mcp_plugin.gd");

  assert.match(plugin, /@tool/);
  assert.match(plugin, /extends EditorPlugin/);
  assert.match(plugin, /OS\.get_environment/);
  assert.match(plugin, /func _bridge_port\(\) -> int:/);
  assert.match(plugin, /func _bridge_token\(\) -> String:/);
  assert.match(plugin, /bridge\.start\(self, _bridge_port\(\), _bridge_token\(\)\)/);
  assert.match(plugin, /bridge\.stop\(\)/);
});

test("Godot bridge exposes Milestone 0A read endpoints", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");
  const server = await readAddonFile("niua_mcp_bridge_server.gd");

  await assertEndpointRoutes([
    "/health",
    "/project/info",
    "/editor/state",
    "/scene/tree",
    "/selection",
    "/logs"
  ]);

  assert.match(bridge, /NiuaMcpBridgeServer\.new\(\)/);
  assert.match(server, /TCPServer\.new\(\)/);
  assert.match(bridge, /127\.0\.0\.1/);
  assert.match(bridge, /9174/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.health/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.project_info/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.editor_state/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.scene_tree/);
});

test("Godot bridge memory buffer lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const memory = await readAddonFile("niua_mcp_bridge_memory.gd");
  const readRoutes = await readAddonFile("niua_mcp_bridge_read_routes.gd");

  assert.match(bridge, /preload\("niua_mcp_bridge_memory\.gd"\)/);
  assert.match(bridge, /NiuaMcpBridgeMemory\.new\(\)/);
  assert.match(readRoutes, /NiuaMcpEditorStateOperations\.editor_state\([\s\S]*_context\.logs\(\)/);
  assert.match(readRoutes, /return _context\.memory_response\(\)/);
  assert.match(bridge, /_memory\.remember\(message\)/);
  assert.doesNotMatch(bridge, /MAX_LOG_LINES/);
  assert.doesNotMatch(bridge, /var _logs: Array\[String\] = \[\]/);
  assert.doesNotMatch(bridge, /_logs\.append/);
  assert.match(memory, /extends RefCounted/);
  assert.match(memory, /const MAX_LOG_LINES := 200/);
  assert.match(memory, /var _logs: Array\[String\] = \[\]/);
  assert.match(memory, /func remember\(message: String\) -> void:/);
  assert.match(memory, /func logs\(\) -> Array:/);
  assert.match(memory, /func response\(\) -> Dictionary:/);
  assert.match(memory, /_logs\.append\(message\)/);
  assert.match(memory, /_logs\.pop_front\(\)/);
  assert.match(memory, /_logs\.duplicate\(\)/);
});

test("Godot bridge HTTP helpers live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const http = await readAddonFile("niua_mcp_bridge_http.gd");
  const server = await readAddonFile("niua_mcp_bridge_server.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_bridge_http\.gd"\)/);
  assert.doesNotMatch(bridge, /NiuaMcpBridgeHttp\.read_request/);
  assert.doesNotMatch(bridge, /NiuaMcpBridgeHttp\.parse_request/);
  assert.doesNotMatch(bridge, /NiuaMcpBridgeHttp\.status_code/);
  assert.doesNotMatch(bridge, /NiuaMcpBridgeHttp\.write_json/);
  assert.match(server, /preload\("niua_mcp_bridge_http\.gd"\)/);
  assert.match(server, /NiuaMcpBridgeHttp\.read_request/);
  assert.match(server, /NiuaMcpBridgeHttp\.parse_request/);
  assert.match(server, /NiuaMcpBridgeHttp\.status_code/);
  assert.match(server, /NiuaMcpBridgeHttp\.write_json/);
  assert.doesNotMatch(bridge, /func _read_request/);
  assert.doesNotMatch(bridge, /func _parse_request/);
  assert.doesNotMatch(bridge, /func _content_length/);
  assert.doesNotMatch(bridge, /func _parse_query/);
  assert.doesNotMatch(bridge, /func _parse_json_body/);
  assert.doesNotMatch(bridge, /func _status_code/);
  assert.doesNotMatch(bridge, /func _write_json/);
  assert.match(http, /extends RefCounted/);
  assert.match(http, /DEFAULT_READ_TIMEOUT_MSEC/);
  assert.match(http, /static func read_request\(peer: StreamPeerTCP, max_body_bytes: int = NiuaMcpPayloadLimits\.DEFAULT_MAX_BYTES, timeout_msec: int = DEFAULT_READ_TIMEOUT_MSEC\) -> Dictionary:/);
  assert.match(http, /static func parse_request\(request: String\) -> Dictionary:/);
  assert.match(http, /static func parse_headers\(headers: String\) -> Dictionary:/);
  assert.match(http, /static func content_length\(headers: String\) -> int:/);
  assert.match(http, /static func parse_query\(raw_query: String\) -> Dictionary:/);
  assert.match(http, /static func parse_json_body\(body: String\) -> Dictionary:/);
  assert.match(http, /static func status_code\(payload: Dictionary\) -> int:/);
  assert.match(http, /static func write_json\(peer: StreamPeerTCP, status_code: int, payload: Dictionary\) -> void:/);
  assert.match(http, /payload_too_large/);
  assert.match(http, /Request Entity Too Large/);
  assert.match(http, /Unauthorized/);
  assert.match(http, /Content-Length/);
  assert.match(http, /Access-Control-Allow-Origin/);
  assert.match(server, /func start\(host: String, port: int, token: String = ""\) -> int:/);
  assert.match(server, /func _authorized\(request: Dictionary\) -> bool:/);
  assert.match(server, /x-niua-mcp-token/);
  assert.match(server, /missing or invalid X-NIUA-MCP-Token header/);
});

test("Godot bridge payload limits live in a focused module", async () => {
  const limits = await readAddonFile("niua_mcp_payload_limits.gd");
  const http = await readAddonFile("niua_mcp_bridge_http.gd");
  const filesystem = await readAddonFile("niua_mcp_filesystem_mutation_operations.gd");

  assert.match(limits, /extends RefCounted/);
  assert.match(limits, /const DEFAULT_MAX_BYTES := 67108864/);
  assert.match(limits, /NIUA_MCP_MAX_PAYLOAD_BYTES/);
  assert.match(limits, /GODOT_MCP_MAX_PAYLOAD_BYTES/);
  assert.match(limits, /static func max_bytes\(\) -> int:/);
  assert.match(limits, /static func validate_size\(label: String, byte_count: int\) -> Dictionary:/);
  assert.match(http, /NiuaMcpPayloadLimits/);
  assert.match(filesystem, /NiuaMcpPayloadLimits\.validate_size\("content"/);
});

test("Godot bridge health reports version support from a focused module", async () => {
  const editorRoutes = await readAddonFile("niua_mcp_editor_state_operations.gd");
  const versionSupport = await readAddonFile("niua_mcp_version_support.gd");

  assert.match(editorRoutes, /preload\("niua_mcp_version_support\.gd"\)/);
  assert.match(editorRoutes, /NiuaMcpVersionSupport\.health\(\)/);
  assert.match(versionSupport, /extends RefCounted/);
  assert.match(versionSupport, /static func health\(\) -> Dictionary:/);
  assert.match(versionSupport, /supported: 4\.6\.x/);
  assert.match(versionSupport, /best-effort: 4\.5\.x and 4\.7\.x/);
  assert.match(versionSupport, /"warning": "" if status == "supported" else message/);
});

test("Godot path utilities reject symlink escapes and protected project paths for writes", async () => {
  const pathUtils = await readAddonFile("niua_mcp_path_utils.gd");
  const filesystem = await readAddonFile("niua_mcp_filesystem_mutation_operations.gd");

  assert.match(pathUtils, /static func validate_writable_res_path\(raw_path: String, allow_root: bool = false\) -> Dictionary:/);
  assert.match(pathUtils, /path points into protected project metadata/);
  assert.match(pathUtils, /path points into the NIUA MCP addon and cannot overwrite the bridge/);
  assert.match(pathUtils, /path crosses a symbolic link and may escape res:\/\//);
  assert.match(pathUtils, /\.is_link/);
  assert.match(pathUtils, /\.read_link/);
  assert.match(filesystem, /validate_writable_res_path/);
});

test("Godot bridge TCP server lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const server = await readAddonFile("niua_mcp_bridge_server.gd");

  assert.match(bridge, /preload\("niua_mcp_bridge_server\.gd"\)/);
  assert.match(bridge, /NiuaMcpBridgeServer\.new\(\)/);
  assert.match(bridge, /_server\.start\(DEFAULT_HOST, _port, token\)/);
  assert.match(bridge, /_server\.process_clients\(Callable\(self, "_route"\)\)/);
  assert.doesNotMatch(bridge, /TCPServer\.new\(\)/);
  assert.doesNotMatch(bridge, /func _handle_client/);

  assert.match(server, /extends RefCounted/);
  assert.match(server, /var _server := TCPServer\.new\(\)/);
  assert.match(server, /func start\(host: String, port: int, token: String = ""\) -> int:/);
  assert.match(server, /func stop\(\) -> void:/);
  assert.match(server, /func is_running\(\) -> bool:/);
  assert.match(server, /func process_clients\(route_request: Callable\) -> void:/);
  assert.match(server, /func _handle_client\(peer: StreamPeerTCP, route_request: Callable\) -> void:/);
});

test("Godot bridge read routes live in their own route module", async () => {
  const bridge = await readBridgeWriteSurface();
  const readRoutes = await readAddonFileExact("niua_mcp_bridge_read_routes.gd");
  const readContext = await readAddonFile("niua_mcp_bridge_read_route_context.gd");
  const editorRoutes = await readAddonFile("niua_mcp_bridge_read_editor_routes.gd");
  const sceneRoutes = await readAddonFile("niua_mcp_bridge_read_scene_routes.gd");
  const filesystemRoutes = await readAddonFile("niua_mcp_bridge_read_filesystem_routes.gd");
  const projectRoutes = await readAddonFile("niua_mcp_bridge_read_project_routes.gd");
  const scriptRoutes = await readAddonFile("niua_mcp_bridge_read_script_routes.gd");
  const importRoutes = await readAddonFile("niua_mcp_bridge_read_import_routes.gd");
  const runRoutes = await readAddonFile("niua_mcp_bridge_read_run_routes.gd");
  const debuggerRoutes = await readAddonFile("niua_mcp_bridge_read_debugger_routes.gd");
  const viewportRoutes = await readAddonFile("niua_mcp_bridge_read_viewport_routes.gd");
  const router = await readAddonFile("niua_mcp_bridge_router.gd");

  assert.match(bridge, /preload\("niua_mcp_bridge_read_routes\.gd"\)/);
  assert.match(bridge, /NiuaMcpBridgeReadRoutes\.new\(\)/);
  assert.match(bridge, /_read_routes\.configure/);
  assert.match(bridge, /func route_target_for\(handler: String\)/);
  assert.doesNotMatch(bridge, /func _health\(\)/);
  assert.doesNotMatch(bridge, /func _editor_state\(\)/);
  assert.doesNotMatch(bridge, /func _scene_tree\(\)/);
  assert.doesNotMatch(bridge, /func _logs_response\(\)/);
  assert.doesNotMatch(bridge, /func _filesystem_state\(\)/);
  assert.doesNotMatch(bridge, /func _read_text_file\(query: Dictionary\)/);
  assert.doesNotMatch(bridge, /func _debugger_state\(\)/);
  assert.doesNotMatch(bridge, /func _viewport_state\(query: Dictionary\)/);

  assert.match(readRoutes, /extends RefCounted/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_route_context\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_editor_routes\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_scene_routes\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_filesystem_routes\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_project_routes\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_script_routes\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_import_routes\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_run_routes\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_debugger_routes\.gd"\)/);
  assert.match(readRoutes, /preload\("niua_mcp_bridge_read_viewport_routes\.gd"\)/);
  assert.match(readRoutes, /var _context = NiuaMcpBridgeReadRouteContext\.new\(\)/);
  assert.match(readRoutes, /var _domains := \[/);
  assert.match(readRoutes, /func configure\(/);
  assert.match(readRoutes, /func handles\(handler: String\) -> bool:/);
  assert.match(readRoutes, /func route_target_for\(handler: String\) -> Object:/);
  assert.doesNotMatch(readRoutes, /func _health\(\) -> Dictionary:/);
  assert.doesNotMatch(readRoutes, /func _editor_state\(\) -> Dictionary:/);
  assert.doesNotMatch(readRoutes, /func _scene_tree\(\) -> Dictionary:/);
  assert.doesNotMatch(readRoutes, /func _logs_response\(\) -> Dictionary:/);
  assert.doesNotMatch(readRoutes, /func _filesystem_state\(\) -> Dictionary:/);
  assert.doesNotMatch(readRoutes, /func _read_text_file\(query: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(readRoutes, /func _debugger_state\(\) -> Dictionary:/);
  assert.doesNotMatch(readRoutes, /func _viewport_state\(query: Dictionary\) -> Dictionary:/);
  assert.match(readContext, /extends RefCounted/);
  assert.match(readContext, /func configure\(editor: EditorInterface, server, memory, debugger_probe_host, import_event_tracker, host: String, port: int, read_endpoints: Array, write_endpoints: Array\) -> void:/);
  assert.match(readContext, /func debugger_probe\(\)/);
  assert.match(editorRoutes, /func _health\(\) -> Dictionary:/);
  assert.match(editorRoutes, /func _editor_state\(\) -> Dictionary:/);
  assert.match(editorRoutes, /func _logs_response\(\) -> Dictionary:/);
  assert.match(sceneRoutes, /func _scene_tree\(query: Dictionary\) -> Dictionary:/);
  assert.match(sceneRoutes, /func _open_scene_tabs\(\) -> Dictionary:/);
  assert.match(filesystemRoutes, /func _filesystem_state\(\) -> Dictionary:/);
  assert.match(filesystemRoutes, /func _read_text_file\(query: Dictionary\) -> Dictionary:/);
  assert.match(projectRoutes, /func _search_node_types\(query: Dictionary\) -> Dictionary:/);
  assert.match(projectRoutes, /func _project_settings\(query: Dictionary\) -> Dictionary:/);
  assert.match(projectRoutes, /func _input_map\(\) -> Dictionary:/);
  assert.match(projectRoutes, /func _export_presets\(\) -> Dictionary:/);
  assert.match(scriptRoutes, /func _read_script\(query: Dictionary\) -> Dictionary:/);
  assert.match(scriptRoutes, /func _script_editor_state\(\) -> Dictionary:/);
  assert.match(scriptRoutes, /func _script_cursor_state\(\) -> Dictionary:/);
  assert.match(importRoutes, /func _list_imported_assets\(query: Dictionary\) -> Dictionary:/);
  assert.match(importRoutes, /func _import_events_response\(query: Dictionary\) -> Dictionary:/);
  assert.match(runRoutes, /func _run_settings\(\) -> Dictionary:/);
  assert.match(runRoutes, /func _run_status\(\) -> Dictionary:/);
  assert.match(debuggerRoutes, /func _debugger_state\(\) -> Dictionary:/);
  assert.match(debuggerRoutes, /func _runtime_node_properties\(query: Dictionary\) -> Dictionary:/);
  assert.match(viewportRoutes, /func _capture_viewport_screenshot\(query: Dictionary\) -> Dictionary:/);
  assert.match(viewportRoutes, /func _viewport_state\(query: Dictionary\) -> Dictionary:/);
  assert.match(router, /route_target_for/);
  assert.match(router, /route_target\.callv\(handler, args\)/);
});

test("Godot bridge router owns endpoint catalogs and dispatch", async () => {
  const bridge = await readBridgeWriteSurface();
  const router = await readAddonFile("niua_mcp_bridge_router.gd");
  const readCatalog = await readAddonFile("niua_mcp_bridge_read_route_catalog.gd");
  const writeCatalog = await readAddonFile("niua_mcp_bridge_write_route_catalog.gd");
  const writeEndpoints = await readAddonFile("niua_mcp_bridge_write_route_endpoints.gd");
  const writeRouteTable = await readAddonFile("niua_mcp_bridge_write_route_table.gd");

  assert.match(bridge, /preload\("niua_mcp_bridge_router\.gd"\)/);
  assert.match(bridge, /const READ_ENDPOINTS := NiuaMcpBridgeRouter\.READ_ENDPOINTS/);
  assert.match(bridge, /const WRITE_ENDPOINTS := NiuaMcpBridgeRouter\.WRITE_ENDPOINTS/);
  assert.match(bridge, /func _route\(request: Dictionary\) -> Dictionary:\n\treturn NiuaMcpBridgeRouter\.route\(self, request\)/);
  assert.doesNotMatch(bridge, /match path:/);
  assert.doesNotMatch(bridge, /unknown NIUA MCP bridge endpoint/);

  assert.match(router, /extends RefCounted/);
  assert.match(router, /preload\("niua_mcp_bridge_read_route_catalog\.gd"\)/);
  assert.match(router, /preload\("niua_mcp_bridge_write_route_catalog\.gd"\)/);
  assert.match(router, /const READ_ENDPOINTS := NiuaMcpBridgeReadRouteCatalog\.ENDPOINTS/);
  assert.match(router, /const WRITE_ENDPOINTS := NiuaMcpBridgeWriteRouteCatalog\.ENDPOINTS/);
  assert.match(router, /const READ_ROUTES := NiuaMcpBridgeReadRouteCatalog\.ROUTES/);
  assert.match(router, /const WRITE_ROUTES := NiuaMcpBridgeWriteRouteCatalog\.ROUTES/);
  assert.match(router, /static func route\(target: Object, request: Dictionary\) -> Dictionary:/);
  assert.match(router, /target\.callv\(handler, args\)/);
  assert.match(router, /method_not_allowed/);
  assert.match(router, /unknown NIUA MCP bridge endpoint/);
  assert.doesNotMatch(router, /"\/health": \{ "handler": "_health" \}/);
  assert.doesNotMatch(router, /"\/scene\/node\/create": \{ "handler": "_create_node"/);

  assert.match(readCatalog, /extends RefCounted/);
  assert.match(readCatalog, /const ENDPOINTS := \[/);
  assert.match(readCatalog, /const ROUTES := \{/);
  assert.match(readCatalog, /"\/health": \{ "handler": "_health" \}/);
  assert.match(readCatalog, /"\/filesystem\/list": \{ "handler": "_list_filesystem", "arg": "query" \}/);
  assert.match(readCatalog, /"\/runtime\/node\/properties": \{ "handler": "_runtime_node_properties", "arg": "query" \}/);

  assert.match(writeCatalog, /extends RefCounted/);
  assert.match(writeCatalog, /preload\("niua_mcp_bridge_write_route_endpoints\.gd"\)/);
  assert.match(writeCatalog, /preload\("niua_mcp_bridge_write_route_table\.gd"\)/);
  assert.match(writeCatalog, /const ENDPOINTS := NiuaMcpBridgeWriteRouteEndpoints\.ENDPOINTS/);
  assert.match(writeCatalog, /const ROUTES := NiuaMcpBridgeWriteRouteTable\.ROUTES/);
  assert.doesNotMatch(writeCatalog, /"\/scene\/node\/create": \{ "handler": "_create_node"/);

  assert.match(writeEndpoints, /extends RefCounted/);
  assert.match(writeEndpoints, /const ENDPOINTS := \[/);
  assert.match(writeEndpoints, /"\/scene\/node\/create"/);
  assert.match(writeEndpoints, /"\/editor\/redo"/);
  assert.doesNotMatch(writeEndpoints, /methodError/);

  assert.match(writeRouteTable, /extends RefCounted/);
  assert.match(writeRouteTable, /const ROUTES := \{/);
  assert.match(writeRouteTable, /"\/scene\/node\/create": \{ "handler": "_create_node", "arg": "body", "methodError": "node creation requires POST" \}/);
  assert.match(writeRouteTable, /"\/inspector\/properties": \{ "handler": "_inspector_properties", "arg": "query", "method": "" \}/);
  assert.match(writeRouteTable, /"\/run\/main": \{ "handler": "_run_main_scene", "arg": "body", "methodError": "run main scene requires POST" \}/);
});

test("Godot bridge write routes live in their own route module", async () => {
  const bridge = await readAddonFile("niua_mcp_bridge.gd");
  const writeRoutes = await readAddonFile("niua_mcp_bridge_write_routes.gd");
  const writeSurface = await readBridgeWriteSurface();

  assert.match(bridge, /preload\("niua_mcp_bridge_write_routes\.gd"\)/);
  assert.match(bridge, /NiuaMcpBridgeWriteRoutes\.new\(\)/);
  assert.match(bridge, /_write_routes\.configure/);
  assert.match(bridge, /_write_routes\.handles\(handler\)/);
  assert.match(writeRoutes, /extends RefCounted/);
  assert.match(writeRoutes, /const HANDLERS := \{/);
  assert.match(writeRoutes, /"_create_folder": true/);
  assert.match(writeRoutes, /"_write_binary_file": true/);
  assert.match(writeRoutes, /"_create_node_with_script": true/);
  assert.match(writeRoutes, /"_capture_runtime_screenshot": true/);
  assert.match(writeRoutes, /func configure\(editor: EditorInterface, debugger_probe_host, memory\) -> void:/);
  assert.match(writeRoutes, /func handles\(handler: String\) -> bool:/);
  assert.match(writeSurface, /NiuaMcpFilesystemOperations\.create_folder_with_side_effects/);
  assert.match(writeSurface, /NiuaMcpSceneGraphOperations\.create_node_with_script_with_side_effects/);
  assert.match(writeSurface, /NiuaMcpDebuggerRuntimeOperations\.capture_runtime_screenshot/);
  assert.doesNotMatch(bridge, /func _create_folder\(body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(bridge, /func _create_node_with_script\(body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(bridge, /func _capture_runtime_screenshot\(_body: Dictionary\) -> Dictionary:/);
});

test("Godot bridge write routes delegate domain route modules", async () => {
  const writeRoutes = await readAddonFile("niua_mcp_bridge_write_routes.gd");
  const context = await readAddonFile("niua_mcp_bridge_write_route_context.gd");
  const filesystemRoutes = await readAddonFile("niua_mcp_bridge_write_filesystem_routes.gd");
  const resourceRoutes = await readAddonFile("niua_mcp_bridge_write_resource_routes.gd");
  const projectRoutes = await readAddonFile("niua_mcp_bridge_write_project_routes.gd");
  const scriptRoutes = await readAddonFile("niua_mcp_bridge_write_script_routes.gd");
  const importRoutes = await readAddonFile("niua_mcp_bridge_write_import_routes.gd");
  const debuggerRoutes = await readAddonFile("niua_mcp_bridge_write_debugger_routes.gd");
  const runRoutes = await readAddonFile("niua_mcp_bridge_write_run_routes.gd");
  const editorRoutes = await readAddonFile("niua_mcp_bridge_write_editor_routes.gd");
  const sceneRoutes = await readAddonFile("niua_mcp_bridge_write_scene_routes.gd");

  for (const fileName of [
    "niua_mcp_bridge_write_route_context.gd",
    "niua_mcp_bridge_write_filesystem_routes.gd",
    "niua_mcp_bridge_write_resource_routes.gd",
    "niua_mcp_bridge_write_project_routes.gd",
    "niua_mcp_bridge_write_script_routes.gd",
    "niua_mcp_bridge_write_import_routes.gd",
    "niua_mcp_bridge_write_debugger_routes.gd",
    "niua_mcp_bridge_write_run_routes.gd",
    "niua_mcp_bridge_write_editor_routes.gd",
    "niua_mcp_bridge_write_scene_routes.gd"
  ]) {
    assert.match(writeRoutes, new RegExp(`preload\\("${fileName.replace(".", "\\.")}"\\)`));
  }

  assert.match(writeRoutes, /func route_target_for\(handler: String\) -> Object:/);
  assert.match(writeRoutes, /domain\.handles\(handler\)/);
  assert.match(writeRoutes, /domain\.has_method\("route_target_for"\)/);
  assert.match(writeRoutes, /domain\.route_target_for\(handler\)/);
  assert.doesNotMatch(writeRoutes, /NiuaMcpFilesystemOperations/);
  assert.doesNotMatch(writeRoutes, /NiuaMcpSceneGraphOperations/);
  assert.doesNotMatch(writeRoutes, /func _create_folder\(body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(writeRoutes, /func _create_node_with_script\(body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(writeRoutes, /func _capture_runtime_screenshot\(_body: Dictionary\) -> Dictionary:/);

  assert.match(context, /extends RefCounted/);
  assert.match(context, /func configure\(editor: EditorInterface, debugger_probe_host, memory\) -> void:/);
  assert.match(context, /func refresh_filesystem\(path: String = ""\) -> void:/);
  assert.match(context, /NiuaMcpBridgeContext\.refresh_filesystem\(editor, path\)/);
  assert.match(context, /func debugger_probe\(\)/);

  assert.match(filesystemRoutes, /extends RefCounted/);
  assert.match(filesystemRoutes, /func _create_folder\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystemRoutes, /NiuaMcpFilesystemOperations\.create_folder_with_side_effects/);
  assert.match(filesystemRoutes, /func _write_binary_file\(body: Dictionary\) -> Dictionary:/);
  assert.match(filesystemRoutes, /NiuaMcpFilesystemOperations\.write_binary_file_with_side_effects/);
  assert.match(resourceRoutes, /func _create_shader_material_resource\(body: Dictionary\) -> Dictionary:/);
  assert.match(resourceRoutes, /NiuaMcpResourceOperations\.create_shader_material_resource_with_side_effects/);
  assert.match(projectRoutes, /func _set_project_setting\(body: Dictionary\) -> Dictionary:/);
  assert.match(projectRoutes, /NiuaMcpProjectSettingsOperations\.set_project_setting_with_side_effects/);
  assert.match(scriptRoutes, /func _create_script\(body: Dictionary\) -> Dictionary:/);
  assert.match(scriptRoutes, /NiuaMcpScriptEditorOperations\.create_script_with_side_effects/);
  assert.match(importRoutes, /func _set_import_options\(body: Dictionary\) -> Dictionary:/);
  assert.match(importRoutes, /NiuaMcpImportOperations\.set_import_options_with_side_effects/);
  assert.match(debuggerRoutes, /func _capture_runtime_screenshot\(_body: Dictionary\) -> Dictionary:/);
  assert.match(debuggerRoutes, /NiuaMcpDebuggerRuntimeOperations\.capture_runtime_screenshot/);
  assert.match(runRoutes, /func _run_main_scene\(body: Dictionary\) -> Dictionary:/);
  assert.match(runRoutes, /NiuaMcpRunOperations\.run_main_scene_with_side_effects/);
  assert.match(editorRoutes, /func _send_viewport_input\(body: Dictionary\) -> Dictionary:/);
  assert.match(editorRoutes, /NiuaMcpViewportOperations\.send_viewport_input_with_side_effects/);
  assert.match(sceneRoutes, /func _create_node_with_script\(body: Dictionary\) -> Dictionary:/);
  assert.match(sceneRoutes, /NiuaMcpSceneGraphOperations\.create_node_with_script_with_side_effects/);
});

test("Godot bridge write scene routes delegate nested scene route modules", async () => {
  const sceneRoutes = await readAddonFileExact("niua_mcp_bridge_write_scene_routes.gd");
  const tabRoutes = await readAddonFile("niua_mcp_bridge_write_scene_tab_routes.gd");
  const documentRoutes = await readAddonFile("niua_mcp_bridge_write_scene_document_routes.gd");
  const tileMapRoutes = await readAddonFile("niua_mcp_bridge_write_scene_tile_map_routes.gd");
  const nodeRoutes = await readAddonFile("niua_mcp_bridge_write_scene_node_routes.gd");
  const scriptRoutes = await readAddonFile("niua_mcp_bridge_write_scene_script_routes.gd");

  assert.match(sceneRoutes, /extends RefCounted/);
  assert.match(sceneRoutes, /preload\("niua_mcp_bridge_write_scene_tab_routes\.gd"\)/);
  assert.match(sceneRoutes, /preload\("niua_mcp_bridge_write_scene_document_routes\.gd"\)/);
  assert.match(sceneRoutes, /preload\("niua_mcp_bridge_write_scene_tile_map_routes\.gd"\)/);
  assert.match(sceneRoutes, /preload\("niua_mcp_bridge_write_scene_node_routes\.gd"\)/);
  assert.match(sceneRoutes, /preload\("niua_mcp_bridge_write_scene_script_routes\.gd"\)/);
  assert.match(sceneRoutes, /var _domains := \[/);
  assert.match(sceneRoutes, /func route_target_for\(handler: String\) -> Object:/);
  assert.doesNotMatch(sceneRoutes, /func _open_scene\(body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(sceneRoutes, /func _create_node\(body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(sceneRoutes, /func _set_tile_map_layer_cells\(body: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(sceneRoutes, /func _inspector_properties\(query: Dictionary\) -> Dictionary:/);
  assert.doesNotMatch(sceneRoutes, /func _save_scene_as\(body: Dictionary\) -> Dictionary:/);

  assert.match(tabRoutes, /func _open_scene\(body: Dictionary\) -> Dictionary:/);
  assert.match(tabRoutes, /func _close_scene_tab\(body: Dictionary\) -> Dictionary:/);
  assert.match(tabRoutes, /func _undo_editor_action\(body: Dictionary\) -> Dictionary:/);
  assert.match(documentRoutes, /func _create_scene\(body: Dictionary\) -> Dictionary:/);
  assert.match(documentRoutes, /func _save_current_scene\(body: Dictionary\) -> Dictionary:/);
  assert.match(documentRoutes, /func _save_scene_as\(body: Dictionary\) -> Dictionary:/);
  assert.match(tileMapRoutes, /func _set_tile_map_layer_cells\(body: Dictionary\) -> Dictionary:/);
  assert.match(tileMapRoutes, /func _paint_tile_map_layer_terrain\(body: Dictionary\) -> Dictionary:/);
  assert.match(nodeRoutes, /func _create_node\(body: Dictionary\) -> Dictionary:/);
  assert.match(nodeRoutes, /func _rename_node\(body: Dictionary\) -> Dictionary:/);
  assert.match(nodeRoutes, /func _inspector_properties\(query: Dictionary\) -> Dictionary:/);
  assert.match(nodeRoutes, /func _set_node_property\(body: Dictionary\) -> Dictionary:/);
  assert.match(nodeRoutes, /func _assign_material\(body: Dictionary\) -> Dictionary:/);
  assert.match(scriptRoutes, /func _create_node_with_script\(body: Dictionary\) -> Dictionary:/);
  assert.match(scriptRoutes, /func _create_script\(body: Dictionary\) -> Dictionary:/);
  assert.match(scriptRoutes, /func _attach_script\(body: Dictionary\) -> Dictionary:/);
  assert.match(scriptRoutes, /func _write_text_file\(body: Dictionary\) -> Dictionary:/);
});

test("Godot bridge context helpers live in their own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const context = await readAddonFile("niua_mcp_bridge_context.gd");

  assert.match(bridge, /preload\("niua_mcp_bridge_context\.gd"\)/);
  assert.match(bridge, /NiuaMcpBridgeContext\.editor_resource_filesystem/);
  assert.match(bridge, /NiuaMcpBridgeContext\.refresh_filesystem/);
  assert.match(bridge, /NiuaMcpBridgeContext\.save_project_settings_if_requested/);
  assert.match(bridge, /NiuaMcpBridgeContext\.validate_res_path/);
  assert.match(bridge, /NiuaMcpBridgeContext\.resolve_node/);
  assert.match(bridge, /NiuaMcpBridgeContext\.node_path_for_response/);
  assert.doesNotMatch(bridge, /ProjectSettings\.save\(\)/);
  assert.match(context, /extends RefCounted/);
  assert.match(context, /preload\("niua_mcp_scene_graph_operations\.gd"\)/);
  assert.match(context, /preload\("niua_mcp_path_utils\.gd"\)/);
  assert.match(context, /static func editor_resource_filesystem\(editor: EditorInterface\)/);
  assert.match(context, /static func refresh_filesystem\(editor: EditorInterface, path: String = ""\) -> void:/);
  assert.match(context, /resource_filesystem\.update_file\(path\)/);
  assert.match(context, /scan_sources/);
  assert.match(context, /static func save_project_settings_if_requested\(save_requested: bool\) -> int:/);
  assert.match(context, /static func validate_res_path\(raw_path: String, allow_root: bool = false\) -> Dictionary:/);
  assert.match(context, /static func resolve_node\(editor: EditorInterface, node_path: String\) -> Node:/);
  assert.match(context, /static func node_path_for_response\(editor: EditorInterface, node: Node\) -> String:/);
});
