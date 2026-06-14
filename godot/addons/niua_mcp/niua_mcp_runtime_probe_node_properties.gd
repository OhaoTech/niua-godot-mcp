@tool
extends RefCounted

const NiuaMcpRuntimeProbeNodeLookup = preload("niua_mcp_runtime_probe_node_lookup.gd")
const NiuaMcpRuntimeProbeNodePropertyReader = preload("niua_mcp_runtime_probe_node_property_reader.gd")
const NiuaMcpRuntimeProbeNodePropertyWriter = preload("niua_mcp_runtime_probe_node_property_writer.gd")


static func node_properties(probe: Node, request: Dictionary) -> Dictionary:
	return NiuaMcpRuntimeProbeNodePropertyReader.node_properties(probe, request)


static func set_node_property(probe: Node, request: Dictionary) -> Dictionary:
	return NiuaMcpRuntimeProbeNodePropertyWriter.set_node_property(probe, request)


static func has_property(node: Node, property_name: String) -> bool:
	return NiuaMcpRuntimeProbeNodePropertyWriter.has_property(node, property_name)


static func find_node(probe: Node, node_path: String) -> Node:
	return NiuaMcpRuntimeProbeNodeLookup.find_node(probe, node_path)
