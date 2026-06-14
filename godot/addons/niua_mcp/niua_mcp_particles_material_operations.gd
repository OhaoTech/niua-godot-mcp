@tool
extends RefCounted

const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")

const EMISSION_SHAPES := {
	"point": 0,
	"sphere": 1,
	"sphere_surface": 2,
	"box": 3,
	"ring": 6
}


static func configure_particle_process_material(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var node := resolve_particles_node(editor, str(body.get("nodePath", "")))
	if node == null:
		return NiuaMcpSceneNodeContext.error("particles node not found: %s" % str(body.get("nodePath", "")), "not_found")

	var material := particle_material_for(node, bool(body.get("replace", false)))
	var material_result := apply_process_material(material, body.get("material", {}))
	if not bool(material_result.get("ok", false)):
		return material_result

	node.set("process_material", material)
	return {
		"ok": true,
		"data": {
			"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, node),
			"type": node.get_class(),
			"material": material_result.get("data", {})
		}
	}


static func apply_process_material(material: ParticleProcessMaterial, raw_data) -> Dictionary:
	var data: Dictionary = raw_data if typeof(raw_data) == TYPE_DICTIONARY else {}

	if data.has("emissionShape"):
		var shape := str(data.get("emissionShape", ""))
		if not EMISSION_SHAPES.has(shape):
			return NiuaMcpSceneNodeContext.error("unsupported particle emission shape: %s" % shape)
		material.set("emission_shape", int(EMISSION_SHAPES[shape]))

	if data.has("emissionSphereRadius"):
		material.set("emission_sphere_radius", float(data.get("emissionSphereRadius")))
	if data.has("emissionBoxExtents"):
		material.set("emission_box_extents", vector3_from_json(data.get("emissionBoxExtents"), Vector3.ONE))
	if data.has("emissionRingRadius"):
		material.set("emission_ring_radius", float(data.get("emissionRingRadius")))
	if data.has("emissionRingInnerRadius"):
		material.set("emission_ring_inner_radius", float(data.get("emissionRingInnerRadius")))
	if data.has("direction"):
		material.set("direction", vector3_from_json(data.get("direction"), Vector3.UP))
	if data.has("spread"):
		material.set("spread", float(data.get("spread")))
	if data.has("initialVelocityMin"):
		material.set("initial_velocity_min", float(data.get("initialVelocityMin")))
	if data.has("initialVelocityMax"):
		material.set("initial_velocity_max", float(data.get("initialVelocityMax")))
	if data.has("gravity"):
		material.set("gravity", vector3_from_json(data.get("gravity"), Vector3.ZERO))
	if data.has("scaleMin"):
		material.set("scale_min", float(data.get("scaleMin")))
	if data.has("scaleMax"):
		material.set("scale_max", float(data.get("scaleMax")))
	if data.has("color"):
		var color_result := color_from_json(data.get("color"))
		if not bool(color_result.get("ok", false)):
			return color_result
		material.set("color", color_result.get("color"))
	if data.has("colorRamp"):
		var ramp_result := gradient_texture_from_stops(data.get("colorRamp"))
		if not bool(ramp_result.get("ok", false)):
			return ramp_result
		material.set("color_ramp", ramp_result.get("texture"))

	return {
		"ok": true,
		"data": material_snapshot(material)
	}


static func particle_material_for(node: Node, replace: bool) -> ParticleProcessMaterial:
	if not replace:
		var existing = node.get("process_material")
		if existing is ParticleProcessMaterial:
			return existing
	return ParticleProcessMaterial.new()


static func resolve_particles_node(editor: EditorInterface, node_path: String) -> Node:
	var node := NiuaMcpSceneNodeContext.resolve_node(editor, node_path)
	if node == null:
		return null
	if node is GPUParticles3D or node is GPUParticles2D:
		return node
	return null


static func material_snapshot(material: ParticleProcessMaterial) -> Dictionary:
	return {
		"emissionShape": material.get("emission_shape"),
		"emissionSphereRadius": material.get("emission_sphere_radius"),
		"emissionBoxExtents": vector3_to_json(material.get("emission_box_extents")),
		"direction": vector3_to_json(material.get("direction")),
		"spread": material.get("spread"),
		"initialVelocityMin": material.get("initial_velocity_min"),
		"initialVelocityMax": material.get("initial_velocity_max"),
		"gravity": vector3_to_json(material.get("gravity")),
		"scaleMin": material.get("scale_min"),
		"scaleMax": material.get("scale_max"),
		"color": color_to_json(material.get("color")),
		"hasColorRamp": material.get("color_ramp") != null
	}


static func gradient_texture_from_stops(raw_stops) -> Dictionary:
	if typeof(raw_stops) != TYPE_ARRAY or raw_stops.is_empty():
		return NiuaMcpSceneNodeContext.error("colorRamp must contain at least one color stop")

	var gradient := Gradient.new()
	var first_stop: Dictionary = raw_stops[0]
	var first_color := color_from_json(first_stop.get("color", {}))
	if not bool(first_color.get("ok", false)):
		return first_color
	gradient.set_offset(0, clampf(float(first_stop.get("offset", 0.0)), 0.0, 1.0))
	gradient.set_color(0, first_color.get("color"))

	for index in range(1, raw_stops.size()):
		var stop = raw_stops[index]
		if typeof(stop) != TYPE_DICTIONARY:
			return NiuaMcpSceneNodeContext.error("colorRamp stops must be objects")
		var color_result := color_from_json(stop.get("color", {}))
		if not bool(color_result.get("ok", false)):
			return color_result
		gradient.add_point(clampf(float(stop.get("offset", 1.0)), 0.0, 1.0), color_result.get("color"))

	var texture := GradientTexture1D.new()
	texture.width = 256
	texture.gradient = gradient
	return {
		"ok": true,
		"texture": texture
	}


static func vector3_from_json(value, fallback: Vector3) -> Vector3:
	if value is Vector3:
		return value
	if typeof(value) != TYPE_DICTIONARY:
		return fallback
	return Vector3(float(value.get("x", fallback.x)), float(value.get("y", fallback.y)), float(value.get("z", fallback.z)))


static func vector2_from_json(value, fallback: Vector2) -> Vector2:
	if value is Vector2:
		return value
	if typeof(value) != TYPE_DICTIONARY:
		return fallback
	return Vector2(float(value.get("x", fallback.x)), float(value.get("y", fallback.y)))


static func color_from_json(value) -> Dictionary:
	if value is Color:
		return {
			"ok": true,
			"color": value
		}
	if typeof(value) != TYPE_DICTIONARY:
		return NiuaMcpSceneNodeContext.error("particle color must be a Color object")
	return {
		"ok": true,
		"color": Color(
			float(value.get("r", 1.0)),
			float(value.get("g", 1.0)),
			float(value.get("b", 1.0)),
			float(value.get("a", 1.0))
		)
	}


static func vector3_to_json(value) -> Dictionary:
	if not (value is Vector3):
		return {
			"type": "Vector3",
			"x": 0.0,
			"y": 0.0,
			"z": 0.0
		}
	return {
		"type": "Vector3",
		"x": value.x,
		"y": value.y,
		"z": value.z
	}


static func color_to_json(value) -> Dictionary:
	if not (value is Color):
		return {
			"type": "Color",
			"r": 1.0,
			"g": 1.0,
			"b": 1.0,
			"a": 1.0
		}
	return {
		"type": "Color",
		"r": value.r,
		"g": value.g,
		"b": value.b,
		"a": value.a
	}
