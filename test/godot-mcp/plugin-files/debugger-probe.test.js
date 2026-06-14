import assert from "node:assert/strict";
import test from "node:test";

import {
  readAddonFile,
  readAddonFileExact,
  readBridgeWriteSurface
} from "../helpers/plugin-files.js";

test("Godot debugger probe lives in its own Godot module", async () => {
  const bridge = await readBridgeWriteSurface();
  const probe = await readAddonFile("niua_mcp_debugger_probe.gd");
  const capture = await readAddonFile("niua_mcp_debugger_probe_capture.gd");
  const host = await readAddonFile("niua_mcp_debugger_probe_host.gd");

  assert.doesNotMatch(bridge, /preload\("niua_mcp_debugger_probe\.gd"\)/);
  assert.match(bridge, /preload\("niua_mcp_debugger_probe_host\.gd"\)/);
  assert.match(host, /preload\("niua_mcp_debugger_probe\.gd"\)/);
  assert.doesNotMatch(bridge, /class NiuaMcpDebuggerProbe:/);
  assert.match(probe, /extends EditorDebuggerPlugin/);
  assert.match(capture, /const CAPTURE_NAME := "niua_mcp"/);
  assert.match(probe, /func runtime_state\(\) -> Dictionary:/);
});

test("Godot debugger probe delegates runtime capture storage", async () => {
  const probe = await readAddonFile("niua_mcp_debugger_probe.gd");
  const capture = await readAddonFile("niua_mcp_debugger_probe_capture.gd");
  const state = await readAddonFile("niua_mcp_debugger_probe_state.gd");
  const store = await readAddonFile("niua_mcp_debugger_probe_store.gd");
  const eventLog = await readAddonFile("niua_mcp_debugger_probe_event_log.gd");
  const runtimeData = await readAddonFile("niua_mcp_debugger_probe_runtime_data.gd");

  assert.match(probe, /preload\("niua_mcp_debugger_probe_store\.gd"\)/);
  assert.match(probe, /preload\("niua_mcp_debugger_probe_capture\.gd"\)/);
  assert.match(probe, /preload\("niua_mcp_debugger_probe_state\.gd"\)/);
  assert.match(probe, /var _store = NiuaMcpDebuggerProbeStore\.new\(\)/);
  assert.match(capture, /store\.runtime_message_kind\(message, CAPTURE_NAME\)/);
  assert.match(capture, /store\.store_runtime_message\(kind, data, session_id\)/);
  assert.match(capture, /store\.store_runtime_log\(data, session_id\)/);
  assert.match(capture, /store\.store_runtime_node_properties\(data, session_id\)/);
  assert.match(capture, /store\.store_runtime_node_property_set\(data, session_id\)/);
  assert.match(capture, /store\.store_runtime_screenshot\(data, session_id\)/);
  assert.match(state, /store\.filtered_events\(limit, kinds, since_msec\)/);
  assert.match(state, /store\.runtime_node_properties\(sessions\.ids\(\), node_path, request_id\)/);
  assert.match(state, /store\.runtime_node_property_set_result\(request_id\)/);
  assert.match(state, /store\.runtime_screenshot_result\(request_id\)/);
  assert.doesNotMatch(probe, /var _runtime_states :=/);
  assert.doesNotMatch(probe, /var _runtime_node_properties_by_request :=/);
  assert.doesNotMatch(probe, /var _runtime_node_properties_by_path :=/);
  assert.doesNotMatch(probe, /var _runtime_node_property_sets_by_request :=/);
  assert.doesNotMatch(probe, /var _runtime_screenshots_by_request :=/);
  assert.doesNotMatch(probe, /func _store_runtime_message/);
  assert.doesNotMatch(probe, /func _store_runtime_log/);
  assert.doesNotMatch(probe, /func _store_runtime_node_properties/);
  assert.doesNotMatch(probe, /func _store_runtime_screenshot/);
  assert.doesNotMatch(probe, /func _runtime_payload/);
  assert.doesNotMatch(probe, /func _runtime_node_key/);

  assert.match(store, /extends RefCounted/);
  assert.match(store, /preload\("niua_mcp_debugger_probe_event_log\.gd"\)/);
  assert.match(store, /preload\("niua_mcp_debugger_probe_runtime_data\.gd"\)/);
  assert.doesNotMatch(store, /var events: Array\[Dictionary\] = \[\]/);
  assert.match(store, /var events: Array\[Dictionary\]:/);
  assert.match(store, /return _events\.events/);
  assert.doesNotMatch(store, /var _runtime_states := \{\}/);
  assert.doesNotMatch(store, /var _runtime_node_properties_by_request := \{\}/);
  assert.doesNotMatch(store, /var _runtime_screenshots_by_request := \{\}/);
  assert.match(store, /func record_event\(kind: String, data: Dictionary\) -> void:/);
  assert.match(store, /func filtered_events\(limit: int = MAX_EVENTS, kinds: Array = \[\], since_msec: int = -1\) -> Dictionary:/);
  assert.match(store, /func runtime_events\(\) -> Array:/);
  assert.match(store, /func runtime_session_data\(session_id: int\) -> Dictionary:/);
  assert.match(store, /func store_runtime_message\(kind: String, data: Array, session_id: int\) -> void:/);
  assert.match(store, /func store_runtime_log\(data: Array, session_id: int\) -> void:/);
  assert.match(store, /func store_runtime_node_properties\(data: Array, session_id: int\) -> void:/);
  assert.match(store, /func store_runtime_node_property_set\(data: Array, session_id: int\) -> void:/);
  assert.match(store, /func store_runtime_screenshot\(data: Array, session_id: int\) -> void:/);
  assert.match(store, /func runtime_node_properties\(session_ids: Array\[int\], node_path: String, request_id: String = ""\) -> Array:/);
  assert.match(store, /func runtime_node_property_set_result\(request_id: String\) -> Array:/);
  assert.match(store, /func runtime_screenshot_result\(request_id: String\) -> Array:/);
  assert.match(store, /func runtime_payload\(data: Array\) -> Dictionary:/);
  assert.match(store, /func runtime_message_kind\(message: String, capture_name: String\) -> String:/);
  assert.match(store, /func runtime_node_key\(session_id: int, node_path: String\) -> String:/);
  assert.match(eventLog, /const MAX_EVENTS := 100/);
  assert.match(eventLog, /var events: Array\[Dictionary\] = \[\]/);
  assert.match(runtimeData, /var _runtime_states := \{\}/);
  assert.match(runtimeData, /var _runtime_node_properties_by_request := \{\}/);
  assert.match(runtimeData, /var _runtime_screenshots_by_request := \{\}/);
});

test("Godot debugger probe store delegates event log and runtime data domains", async () => {
  const store = await readAddonFile("niua_mcp_debugger_probe_store.gd");
  const eventLog = await readAddonFile("niua_mcp_debugger_probe_event_log.gd");
  const runtimeData = await readAddonFile("niua_mcp_debugger_probe_runtime_data.gd");
  const runtimeDataFacade = await readAddonFileExact("niua_mcp_debugger_probe_runtime_data.gd");
  const runtimeCore = await readAddonFile("niua_mcp_debugger_probe_runtime_core.gd");
  const runtimeNodeData = await readAddonFile("niua_mcp_debugger_probe_runtime_node_data.gd");
  const runtimeScreenshotData = await readAddonFile("niua_mcp_debugger_probe_runtime_screenshot_data.gd");
  const runtimeDataUtils = await readAddonFile("niua_mcp_debugger_probe_runtime_data_utils.gd");

  assert.match(store, /preload\("niua_mcp_debugger_probe_event_log\.gd"\)/);
  assert.match(store, /preload\("niua_mcp_debugger_probe_runtime_data\.gd"\)/);
  assert.match(store, /var _events = NiuaMcpDebuggerProbeEventLog\.new\(\)/);
  assert.match(store, /var _runtime = NiuaMcpDebuggerProbeRuntimeData\.new\(\)/);
  assert.match(store, /var events: Array\[Dictionary\]:/);
  assert.match(store, /return _events\.events/);
  assert.match(store, /func record_event\(kind: String, data: Dictionary\) -> void:/);
  assert.match(store, /func store_runtime_message\(kind: String, data: Array, session_id: int\) -> void:/);
  assert.match(store, /func runtime_node_properties\(session_ids: Array\[int\], node_path: String, request_id: String = ""\) -> Array:/);
  assert.doesNotMatch(store, /var events: Array\[Dictionary\] = \[\]/);
  assert.doesNotMatch(store, /var _runtime_states := \{\}/);
  assert.doesNotMatch(store, /var _runtime_node_properties_by_request := \{\}/);
  assert.doesNotMatch(store, /var _runtime_screenshots_by_request := \{\}/);
  assert.doesNotMatch(store, /Time\.get_ticks_msec/);

  assert.match(eventLog, /const MAX_EVENTS := 100/);
  assert.match(eventLog, /var events: Array\[Dictionary\] = \[\]/);
  assert.match(eventLog, /func record_event\(kind: String, data: Dictionary\) -> void:/);
  assert.match(eventLog, /func filtered_events\(limit: int = MAX_EVENTS, kinds: Array = \[\], since_msec: int = -1\) -> Dictionary:/);
  assert.match(eventLog, /func runtime_events\(\) -> Array:/);
  assert.match(eventLog, /Time\.get_ticks_msec/);
  assert.match(eventLog, /pop_front/);

  assert.match(runtimeData, /var _runtime_states := \{\}/);
  assert.match(runtimeData, /var _runtime_node_properties_by_request := \{\}/);
  assert.match(runtimeData, /var _runtime_screenshots_by_request := \{\}/);
  assert.match(runtimeData, /func runtime_session_data\(session_id: int\) -> Dictionary:/);
  assert.match(runtimeData, /func store_runtime_message\(kind: String, data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeData, /func store_runtime_log\(data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeData, /func store_runtime_node_properties\(data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeData, /func store_runtime_node_property_set\(data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeData, /func store_runtime_screenshot\(data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeData, /func runtime_node_properties\(session_ids: Array\[int\], node_path: String, request_id: String = ""\) -> Array:/);
  assert.match(runtimeData, /func runtime_node_property_set_result\(request_id: String\) -> Array:/);
  assert.match(runtimeData, /func runtime_screenshot_result\(request_id: String\) -> Array:/);
  assert.match(runtimeData, /func runtime_payload\(data: Array\) -> Dictionary:/);
  assert.match(runtimeData, /func runtime_message_kind\(message: String, capture_name: String\) -> String:/);
  assert.match(runtimeData, /func runtime_node_key\(session_id: int, node_path: String\) -> String:/);

  assert.match(runtimeDataFacade, /preload\("niua_mcp_debugger_probe_runtime_core\.gd"\)/);
  assert.match(runtimeDataFacade, /preload\("niua_mcp_debugger_probe_runtime_node_data\.gd"\)/);
  assert.match(runtimeDataFacade, /preload\("niua_mcp_debugger_probe_runtime_screenshot_data\.gd"\)/);
  assert.match(runtimeDataFacade, /preload\("niua_mcp_debugger_probe_runtime_data_utils\.gd"\)/);
  assert.match(runtimeDataFacade, /var _core = NiuaMcpDebuggerProbeRuntimeCore\.new\(\)/);
  assert.match(runtimeDataFacade, /var _node_data = NiuaMcpDebuggerProbeRuntimeNodeData\.new\(\)/);
  assert.match(runtimeDataFacade, /var _screenshots = NiuaMcpDebuggerProbeRuntimeScreenshotData\.new\(\)/);
  assert.match(runtimeDataFacade, /return _core\.runtime_session_data\(session_id\)/);
  assert.match(runtimeDataFacade, /_node_data\.store_runtime_node_properties\(data, session_id, record_event\)/);
  assert.match(runtimeDataFacade, /return _screenshots\.runtime_screenshot_result\(request_id\)/);
  assert.match(runtimeDataFacade, /return NiuaMcpDebuggerProbeRuntimeDataUtils\.runtime_payload\(data\)/);
  assert.match(runtimeDataFacade, /return NiuaMcpDebuggerProbeRuntimeDataUtils\.runtime_message_kind\(message, capture_name\)/);
  assert.match(runtimeDataFacade, /return NiuaMcpDebuggerProbeRuntimeDataUtils\.runtime_node_key\(session_id, node_path\)/);
  assert.doesNotMatch(runtimeDataFacade, /var _runtime_states := \{\}/);
  assert.doesNotMatch(runtimeDataFacade, /var _runtime_node_properties_by_request := \{\}/);
  assert.doesNotMatch(runtimeDataFacade, /var _runtime_screenshots_by_request := \{\}/);
  assert.doesNotMatch(runtimeDataFacade, /Time\.get_ticks_msec/);
  assert.doesNotMatch(runtimeDataFacade, /func _record_event/);

  assert.match(runtimeCore, /extends RefCounted/);
  assert.match(runtimeCore, /preload\("niua_mcp_debugger_probe_runtime_data_utils\.gd"\)/);
  assert.match(runtimeCore, /var _runtime_states := \{\}/);
  assert.match(runtimeCore, /var _runtime_messages := \{\}/);
  assert.match(runtimeCore, /func runtime_session_data\(session_id: int\) -> Dictionary:/);
  assert.match(runtimeCore, /func store_runtime_message\(kind: String, data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeCore, /func store_runtime_log\(data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeCore, /NiuaMcpDebuggerProbeRuntimeDataUtils\.runtime_payload/);
  assert.match(runtimeCore, /NiuaMcpDebuggerProbeRuntimeDataUtils\.record_event/);

  assert.match(runtimeNodeData, /extends RefCounted/);
  assert.match(runtimeNodeData, /preload\("niua_mcp_debugger_probe_runtime_data_utils\.gd"\)/);
  assert.match(runtimeNodeData, /var _runtime_node_properties_by_request := \{\}/);
  assert.match(runtimeNodeData, /if not request_id\.is_empty\(\):\n\t\tif _runtime_node_properties_by_request\.has\(request_id\):\n\t\t\tresponses\.append\(_runtime_node_properties_by_request\[request_id\]\)\n\t\treturn responses/);
  assert.match(runtimeNodeData, /var _runtime_node_properties_by_path := \{\}/);
  assert.match(runtimeNodeData, /var _runtime_node_property_sets_by_request := \{\}/);
  assert.match(runtimeNodeData, /func store_runtime_node_properties\(data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeNodeData, /func store_runtime_node_property_set\(data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeNodeData, /func runtime_node_properties\(session_ids: Array\[int\], node_path: String, request_id: String = ""\) -> Array:/);
  assert.match(runtimeNodeData, /func runtime_node_property_set_result\(request_id: String\) -> Array:/);
  assert.match(runtimeNodeData, /NiuaMcpDebuggerProbeRuntimeDataUtils\.runtime_node_key/);

  assert.match(runtimeScreenshotData, /extends RefCounted/);
  assert.match(runtimeScreenshotData, /preload\("niua_mcp_debugger_probe_runtime_data_utils\.gd"\)/);
  assert.match(runtimeScreenshotData, /var _runtime_screenshots_by_request := \{\}/);
  assert.match(runtimeScreenshotData, /func store_runtime_screenshot\(data: Array, session_id: int, record_event: Callable\) -> void:/);
  assert.match(runtimeScreenshotData, /func runtime_screenshot_result\(request_id: String\) -> Array:/);
  assert.match(runtimeScreenshotData, /NiuaMcpDebuggerProbeRuntimeDataUtils\.record_event/);

  assert.match(runtimeDataUtils, /extends RefCounted/);
  assert.match(runtimeDataUtils, /static func runtime_payload\(data: Array\) -> Dictionary:/);
  assert.match(runtimeDataUtils, /static func runtime_message_kind\(message: String, capture_name: String\) -> String:/);
  assert.match(runtimeDataUtils, /static func runtime_node_key\(session_id: int, node_path: String\) -> String:/);
  assert.match(runtimeDataUtils, /static func record_event\(record_event: Callable, kind: String, data: Dictionary\) -> void:/);
});

test("Godot debugger probe delegates focused plugin domains", async () => {
  const facade = await readAddonFile("niua_mcp_debugger_probe.gd");
  const sessions = await readAddonFile("niua_mcp_debugger_probe_sessions.gd");
  const events = await readAddonFile("niua_mcp_debugger_probe_events.gd");
  const capture = await readAddonFile("niua_mcp_debugger_probe_capture.gd");
  const state = await readAddonFile("niua_mcp_debugger_probe_state.gd");
  const commands = await readAddonFile("niua_mcp_debugger_probe_session_commands.gd");
  const runtimeRequests = await readAddonFile("niua_mcp_debugger_probe_runtime_requests.gd");

  assert.match(facade, /preload\("niua_mcp_debugger_probe_sessions\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_debugger_probe_events\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_debugger_probe_capture\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_debugger_probe_state\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_debugger_probe_session_commands\.gd"\)/);
  assert.match(facade, /preload\("niua_mcp_debugger_probe_runtime_requests\.gd"\)/);
  assert.match(facade, /var _sessions = NiuaMcpDebuggerProbeSessions\.new\(\)/);
  assert.match(facade, /var _runtime_requests = NiuaMcpDebuggerProbeRuntimeRequests\.new\(\)/);
  assert.match(facade, /NiuaMcpDebuggerProbeEvents\.breakpoints_cleared/);
  assert.match(facade, /NiuaMcpDebuggerProbeEvents\.breakpoint_set/);
  assert.match(facade, /NiuaMcpDebuggerProbeEvents\.session_started/);
  assert.match(facade, /NiuaMcpDebuggerProbeEvents\.session_breaked/);
  assert.match(facade, /NiuaMcpDebuggerProbeEvents\.record_event/);
  assert.match(facade, /NiuaMcpDebuggerProbeCapture\.has_capture\(capture\)/);
  assert.match(facade, /NiuaMcpDebuggerProbeCapture\.capture\(_store, _sessions, message, data, session_id\)/);
  assert.match(facade, /NiuaMcpDebuggerProbeState\.state\(self, _sessions, _store\)/);
  assert.match(facade, /NiuaMcpDebuggerProbeState\.runtime_state\(self, _sessions, _store\)/);
  assert.match(facade, /NiuaMcpDebuggerProbeSessionCommands\.set_breakpoint_for_sessions/);
  assert.match(facade, /_runtime_requests\.send_runtime_snapshot_request/);
  assert.doesNotMatch(facade, /"breakpoint_set", \{/);
  assert.doesNotMatch(facade, /"session_started", \{/);
  assert.doesNotMatch(facade, /_store\.record_event\(kind, data\)/);
  assert.doesNotMatch(facade, /var _session_ids/);
  assert.doesNotMatch(facade, /var _connected_session_ids/);
  assert.doesNotMatch(facade, /var _runtime_request_counter/);
  assert.doesNotMatch(facade, /session\.set_breakpoint/);
  assert.doesNotMatch(facade, /session\.toggle_profiler/);
  assert.doesNotMatch(facade, /session\.send_message/);
  assert.doesNotMatch(facade, /store_runtime_message/);

  assert.match(events, /extends RefCounted/);
  assert.match(events, /static func breakpoints_cleared/);
  assert.match(events, /static func breakpoint_set/);
  assert.match(events, /static func session_started/);
  assert.match(events, /static func session_stopped/);
  assert.match(events, /static func session_breaked/);
  assert.match(events, /static func session_continued/);
  assert.match(events, /static func record_event/);
  assert.match(events, /"breakpoint_set"/);
  assert.match(events, /"session_started"/);
  assert.match(events, /store\.record_event\(kind, data\)/);

  assert.match(sessions, /extends RefCounted/);
  assert.match(sessions, /var _session_ids: Array\[int\] = \[\]/);
  assert.match(sessions, /var _connected_session_ids := \{\}/);
  assert.match(sessions, /func setup_session\(debugger_probe: EditorDebuggerPlugin, session_id: int, record_event: Callable, started: Callable, stopped: Callable, breaked: Callable, continued: Callable\) -> void:/);
  assert.match(sessions, /session\.started\.connect/);
  assert.match(sessions, /func ids\(\) -> Array\[int\]:/);
  assert.match(sessions, /func remember_session_id\(session_id: int\) -> void:/);
  assert.match(sessions, /func session_snapshots\(debugger_probe: EditorDebuggerPlugin\) -> Array:/);
  assert.match(sessions, /func runtime_session_snapshots\(debugger_probe: EditorDebuggerPlugin, store\) -> Array:/);

  assert.match(capture, /extends RefCounted/);
  assert.match(capture, /const CAPTURE_NAME := "niua_mcp"/);
  assert.match(capture, /static func has_capture\(capture: String\) -> bool:/);
  assert.match(capture, /static func capture\(store, sessions, message: String, data: Array, session_id: int\) -> bool:/);
  assert.match(capture, /sessions\.remember_session_id\(session_id\)/);
  assert.match(capture, /store\.runtime_message_kind/);

  assert.match(state, /extends RefCounted/);
  assert.match(state, /static func state\(debugger_probe: EditorDebuggerPlugin, sessions, store\) -> Dictionary:/);
  assert.match(state, /static func runtime_state\(debugger_probe: EditorDebuggerPlugin, sessions, store\) -> Dictionary:/);
  assert.match(state, /static func filtered_events\(store, limit: int, kinds: Array, since_msec: int\) -> Dictionary:/);
  assert.match(state, /static func runtime_node_properties\(store, sessions, node_path: String, request_id: String = ""\) -> Array:/);

  assert.match(commands, /extends RefCounted/);
  assert.match(commands, /static func set_breakpoint_for_sessions\(debugger_probe: EditorDebuggerPlugin, session_ids: Array\[int\], path: String, line: int, enabled: bool, record_event: Callable\) -> Array:/);
  assert.match(commands, /static func toggle_profiler_for_sessions\(debugger_probe: EditorDebuggerPlugin, session_ids: Array\[int\], profiler: String, enabled: bool, data: Array, record_event: Callable\) -> Array:/);
  assert.match(commands, /static func send_message_for_sessions\(debugger_probe: EditorDebuggerPlugin, session_ids: Array\[int\], message: String, data: Array, active_only: bool, record_event: Callable\) -> Array:/);
  assert.match(commands, /session\.set_breakpoint/);
  assert.match(commands, /session\.toggle_profiler/);
  assert.match(commands, /session\.send_message/);
  assert.match(commands, /debugger_message_sent/);

  assert.match(runtimeRequests, /extends RefCounted/);
  assert.match(runtimeRequests, /const SNAPSHOT_MESSAGE := "niua_mcp:snapshot"/);
  assert.match(runtimeRequests, /const NODE_PROPERTIES_MESSAGE := "niua_mcp:node_properties"/);
  assert.match(runtimeRequests, /const SET_NODE_PROPERTY_MESSAGE := "niua_mcp:set_node_property"/);
  assert.match(runtimeRequests, /const RUNTIME_SCREENSHOT_MESSAGE := "niua_mcp:runtime_screenshot"/);
  assert.match(runtimeRequests, /var _runtime_request_counter := 0/);
  assert.match(runtimeRequests, /func next_runtime_request_id\(prefix: String\) -> String:/);
  assert.match(runtimeRequests, /func send_runtime_snapshot_request\(debugger_probe: EditorDebuggerPlugin, session_ids: Array\[int\], record_event: Callable\) -> Array:/);
  assert.match(runtimeRequests, /func send_runtime_node_properties_request\(debugger_probe: EditorDebuggerPlugin, session_ids: Array\[int\], node_path: String, request_id: String, record_event: Callable\) -> Array:/);
  assert.match(runtimeRequests, /func send_runtime_node_property_set_request\(debugger_probe: EditorDebuggerPlugin, session_ids: Array\[int\], node_path: String, property_name: String, value, request_id: String, record_event: Callable\) -> Array:/);
  assert.match(runtimeRequests, /func send_runtime_screenshot_request\(debugger_probe: EditorDebuggerPlugin, session_ids: Array\[int\], request_id: String, record_event: Callable\) -> Array:/);
});

test("Godot debugger probe host owns debugger plugin lifecycle", async () => {
  const bridge = await readBridgeWriteSurface();
  const host = await readAddonFile("niua_mcp_debugger_probe_host.gd");

  assert.match(bridge, /NiuaMcpDebuggerProbeHost\.new\(\)/);
  assert.match(bridge, /_debugger_probe_host\.register\(_plugin, Callable\(self, "_remember"\)\)/);
  assert.match(bridge, /_debugger_probe_host\.unregister\(_plugin, Callable\(self, "_remember"\)\)/);
  assert.match(bridge, /_debugger_probe_host\.probe\(\)/);
  assert.doesNotMatch(bridge, /var _debugger_probe\s*=/);
  assert.doesNotMatch(bridge, /func _register_debugger_probe/);
  assert.doesNotMatch(bridge, /func _unregister_debugger_probe/);
  assert.doesNotMatch(bridge, /add_debugger_plugin/);
  assert.doesNotMatch(bridge, /remove_debugger_plugin/);
  assert.match(host, /extends RefCounted/);
  assert.match(host, /var _probe = null/);
  assert.match(host, /func register\(plugin: EditorPlugin, remember: Callable\) -> void:/);
  assert.match(host, /func unregister\(plugin: EditorPlugin, remember: Callable\) -> void:/);
  assert.match(host, /func probe\(\)/);
  assert.match(host, /NiuaMcpDebuggerProbe\.new\(\)/);
  assert.match(host, /add_debugger_plugin/);
  assert.match(host, /remove_debugger_plugin/);
  assert.match(host, /Registered debugger state probe/);
  assert.match(host, /Unregistered debugger state probe/);
});
