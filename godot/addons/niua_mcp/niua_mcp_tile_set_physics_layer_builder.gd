@tool
extends RefCounted

const NiuaMcpJsonArgs = preload("niua_mcp_json_args.gd")
const NiuaMcpPathUtils = preload("niua_mcp_path_utils.gd")
const NiuaMcpTileSetPhysicsUtils = preload("niua_mcp_tile_set_physics_utils.gd")


static func apply_physics_layers(tile_set: TileSet, raw_layers) -> Dictionary:
	if typeof(raw_layers) != TYPE_ARRAY:
		return NiuaMcpTileSetPhysicsUtils.error("physicsLayers must be an array")

	var summaries := []
	for layer_index in range(raw_layers.size()):
		var raw_layer = raw_layers[layer_index]
		if typeof(raw_layer) != TYPE_DICTIONARY:
			return NiuaMcpTileSetPhysicsUtils.error("each TileSet physics layer must be an object")
		var layer: Dictionary = raw_layer

		tile_set.add_physics_layer()
		var actual_layer_index := tile_set.get_physics_layers_count() - 1

		var collision_layer_result := NiuaMcpJsonArgs.integer(
			layer.get("collisionLayer", 1),
			"physicsLayers[%d].collisionLayer" % layer_index
		)
		if not collision_layer_result.get("ok", false):
			return collision_layer_result
		var collision_layer := int(collision_layer_result.get("value"))
		if collision_layer <= 0:
			return NiuaMcpTileSetPhysicsUtils.error("physicsLayers[%d].collisionLayer must be greater than 0" % layer_index)
		tile_set.set_physics_layer_collision_layer(actual_layer_index, collision_layer)

		var collision_mask_result := NiuaMcpJsonArgs.integer(
			layer.get("collisionMask", 1),
			"physicsLayers[%d].collisionMask" % layer_index
		)
		if not collision_mask_result.get("ok", false):
			return collision_mask_result
		var collision_mask := int(collision_mask_result.get("value"))
		if collision_mask <= 0:
			return NiuaMcpTileSetPhysicsUtils.error("physicsLayers[%d].collisionMask must be greater than 0" % layer_index)
		tile_set.set_physics_layer_collision_mask(actual_layer_index, collision_mask)

		var collision_priority_result := NiuaMcpJsonArgs.non_negative_number(
			layer.get("collisionPriority", 1.0),
			"physicsLayers[%d].collisionPriority" % layer_index
		)
		if not collision_priority_result.get("ok", false):
			return collision_priority_result
		var collision_priority := float(collision_priority_result.get("value"))
		tile_set.set_physics_layer_collision_priority(actual_layer_index, collision_priority)

		var material_path := ""
		if layer.has("physicsMaterialPath"):
			var material_validation := NiuaMcpPathUtils.validate_res_path(str(layer.get("physicsMaterialPath", "")))
			if not material_validation.get("ok", false):
				return material_validation
			material_path = str(material_validation.get("path"))
			var physics_material := ResourceLoader.load(material_path, "", ResourceLoader.CACHE_MODE_IGNORE)
			if physics_material == null:
				return NiuaMcpTileSetPhysicsUtils.error("PhysicsMaterial not found or not loadable: %s" % material_path, "not_found")
			if not (physics_material is PhysicsMaterial):
				return NiuaMcpTileSetPhysicsUtils.error("resource is not a PhysicsMaterial: %s" % material_path, "invalid_resource")
			tile_set.set_physics_layer_physics_material(
				actual_layer_index,
				physics_material as PhysicsMaterial
			)

		summaries.append({
			"index": actual_layer_index,
			"collisionLayer": collision_layer,
			"collisionMask": collision_mask,
			"collisionPriority": collision_priority,
			"physicsMaterialPath": material_path
		})

	return {
		"ok": true,
		"layers": summaries
	}
