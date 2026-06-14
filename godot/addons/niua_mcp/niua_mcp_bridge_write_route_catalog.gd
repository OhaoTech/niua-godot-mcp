@tool
extends RefCounted

const NiuaMcpBridgeWriteRouteEndpoints = preload("niua_mcp_bridge_write_route_endpoints.gd")
const NiuaMcpBridgeWriteRouteTable = preload("niua_mcp_bridge_write_route_table.gd")

const ENDPOINTS := NiuaMcpBridgeWriteRouteEndpoints.ENDPOINTS
const ROUTES := NiuaMcpBridgeWriteRouteTable.ROUTES
