@tool
extends RefCounted

const CAPTURE_NAME := "niua_mcp"
const RUNTIME_READY_MESSAGE := "niua_mcp:runtime_ready"
const RUNTIME_STATE_MESSAGE := "niua_mcp:runtime_state"
const RUNTIME_LOG_MESSAGE := "niua_mcp:runtime_log"
const NODE_PROPERTIES_MESSAGE := "niua_mcp:node_properties"
const NODE_PROPERTY_SET_MESSAGE := "niua_mcp:node_property_set"
const NODE_METHOD_CALL_RESULT_MESSAGE := "niua_mcp:node_method_call_result"
const RUNTIME_SCREENSHOT_RESULT_MESSAGE := "niua_mcp:runtime_screenshot_result"
const RUNTIME_INPUT_RESULT_MESSAGE := "niua_mcp:runtime_input_result"
const MAX_CHILDREN_PER_NODE := 64
const MAX_PROPERTIES_PER_NODE := 200
const MAX_SERIALIZED_COLLECTION_ITEMS := 64
const MAX_LOG_MESSAGE_LENGTH := 2000
const MAX_TREE_DEPTH := 8
const LOG_LEVELS := ["debug", "info", "warning", "error"]


static func request_payload(data: Array) -> Dictionary:
	if data.size() > 0 and typeof(data[0]) == TYPE_DICTIONARY:
		return data[0]
	return {}
