@tool
extends RefCounted

const NiuaMcpVariantCodec = preload("niua_mcp_variant_codec.gd")


static func to_json(config: ConfigFile) -> Dictionary:
	var output := {}
	for section in config.get_sections():
		var values := {}
		for key in config.get_section_keys(section):
			values[str(key)] = NiuaMcpVariantCodec.variant_to_json(config.get_value(section, key))
		output[str(section)] = values
	return output
