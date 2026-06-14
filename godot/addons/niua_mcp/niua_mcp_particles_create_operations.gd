@tool
extends RefCounted

const NiuaMcpParticlesMaterialOperations = preload("niua_mcp_particles_material_operations.gd")
const NiuaMcpSceneNodeContext = preload("niua_mcp_scene_node_context.gd")


static func create_gpu_particles_3d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var parent_result := _resolve_parent(editor, body, root)
	if not bool(parent_result.get("ok", false)):
		return parent_result
	var parent: Node = parent_result.get("parent")

	var particles := GPUParticles3D.new()
	particles.name = str(body.get("name", "GPUParticles3D"))
	_apply_common_settings(particles, body)
	_apply_node3d_transform(particles, body)
	particles.set("draw_passes", 1)
	particles.set("draw_pass_1", _mesh_from_body(body))

	var material := ParticleProcessMaterial.new()
	var material_result := NiuaMcpParticlesMaterialOperations.apply_process_material(material, _defaulted_material(body))
	if not bool(material_result.get("ok", false)):
		particles.free()
		return material_result
	particles.set("process_material", material)

	parent.add_child(particles)
	particles.owner = root

	return {
		"ok": true,
		"data": _particles_response(editor, particles, material_result.get("data", {}), NiuaMcpSceneNodeContext.node_path_for_response(editor, parent))
	}


static func create_gpu_particles_2d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	var root := NiuaMcpSceneNodeContext.edited_scene_root(editor)
	if root == null:
		return NiuaMcpSceneNodeContext.error("no edited scene is open")

	var parent_result := _resolve_parent(editor, body, root)
	if not bool(parent_result.get("ok", false)):
		return parent_result
	var parent: Node = parent_result.get("parent")

	var particles := GPUParticles2D.new()
	particles.name = str(body.get("name", "GPUParticles2D"))
	_apply_common_settings(particles, body)
	_apply_node2d_transform(particles, body)
	particles.texture = _default_particle_texture(int(body.get("textureSize", 16)))

	var material := ParticleProcessMaterial.new()
	var material_result := NiuaMcpParticlesMaterialOperations.apply_process_material(material, _defaulted_material(body))
	if not bool(material_result.get("ok", false)):
		particles.free()
		return material_result
	particles.set("process_material", material)

	parent.add_child(particles)
	particles.owner = root

	return {
		"ok": true,
		"data": _particles_response(editor, particles, material_result.get("data", {}), NiuaMcpSceneNodeContext.node_path_for_response(editor, parent))
	}


static func _resolve_parent(editor: EditorInterface, body: Dictionary, root: Node) -> Dictionary:
	var parent: Node = root
	var parent_path := str(body.get("parentPath", ""))
	if not parent_path.is_empty():
		parent = NiuaMcpSceneNodeContext.resolve_node(editor, parent_path)
		if parent == null:
			return NiuaMcpSceneNodeContext.error("parent node not found: %s" % parent_path, "not_found")
	return {
		"ok": true,
		"parent": parent
	}


static func _apply_common_settings(particles: Node, body: Dictionary) -> void:
	particles.set("amount", int(body.get("amount", 64)))
	particles.set("lifetime", float(body.get("lifetime", 2.0)))
	particles.set("one_shot", bool(body.get("oneShot", false)))
	particles.set("emitting", bool(body.get("emitting", true)))
	if body.has("preprocess"):
		particles.set("preprocess", float(body.get("preprocess")))


static func _apply_node3d_transform(node: Node3D, body: Dictionary) -> void:
	if body.has("position"):
		node.position = NiuaMcpParticlesMaterialOperations.vector3_from_json(body.get("position"), Vector3.ZERO)
	if body.has("rotationDegrees"):
		node.rotation_degrees = NiuaMcpParticlesMaterialOperations.vector3_from_json(body.get("rotationDegrees"), Vector3.ZERO)
	if body.has("scale"):
		node.scale = NiuaMcpParticlesMaterialOperations.vector3_from_json(body.get("scale"), Vector3.ONE)


static func _apply_node2d_transform(node: Node2D, body: Dictionary) -> void:
	if body.has("position"):
		node.position = NiuaMcpParticlesMaterialOperations.vector2_from_json(body.get("position"), Vector2.ZERO)
	if body.has("scale"):
		node.scale = NiuaMcpParticlesMaterialOperations.vector2_from_json(body.get("scale"), Vector2.ONE)


static func _mesh_from_body(body: Dictionary) -> Mesh:
	var mesh_type := str(body.get("meshType", "sphere"))
	var mesh: Mesh
	match mesh_type:
		"box":
			var box := BoxMesh.new()
			box.size = NiuaMcpParticlesMaterialOperations.vector3_from_json(body.get("meshSize", {}), Vector3(0.18, 0.18, 0.18))
			mesh = box
		"quad":
			var quad := QuadMesh.new()
			quad.size = NiuaMcpParticlesMaterialOperations.vector2_from_json(body.get("quadSize", {}), Vector2(0.22, 0.22))
			mesh = quad
		_:
			var sphere := SphereMesh.new()
			var radius := float(body.get("meshRadius", 0.12))
			sphere.radius = radius
			sphere.height = radius * 2.0
			sphere.radial_segments = 12
			sphere.rings = 6
			mesh = sphere

	var material := StandardMaterial3D.new()
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.vertex_color_use_as_albedo = true
	material.albedo_color = Color(1.0, 0.05, 0.8, 1.0)
	if mesh.has_method("surface_set_material"):
		mesh.surface_set_material(0, material)
	else:
		mesh.set("material", material)
	return mesh


static func _default_particle_texture(size: int) -> Texture2D:
	var safe_size := maxi(size, 2)
	var image := Image.create(safe_size, safe_size, false, Image.FORMAT_RGBA8)
	image.fill(Color.WHITE)
	return ImageTexture.create_from_image(image)


static func _defaulted_material(body: Dictionary) -> Dictionary:
	var material := {}
	var raw = body.get("material", {})
	if typeof(raw) == TYPE_DICTIONARY:
		material = raw.duplicate(true)
	if not material.has("emissionShape"):
		material["emissionShape"] = "sphere"
	if not material.has("initialVelocityMin"):
		material["initialVelocityMin"] = 1.0
	if not material.has("initialVelocityMax"):
		material["initialVelocityMax"] = 2.0
	if not material.has("gravity"):
		material["gravity"] = { "type": "Vector3", "x": 0.0, "y": -0.8, "z": 0.0 }
	if not material.has("color"):
		material["color"] = { "type": "Color", "r": 1.0, "g": 0.2, "b": 0.85, "a": 1.0 }
	if not material.has("colorRamp"):
		material["colorRamp"] = [
			{ "offset": 0.0, "color": { "type": "Color", "r": 0.1, "g": 1.0, "b": 0.95, "a": 1.0 } },
			{ "offset": 1.0, "color": { "type": "Color", "r": 1.0, "g": 0.05, "b": 0.7, "a": 1.0 } }
		]
	return material


static func _particles_response(editor: EditorInterface, particles: Node, material_data: Dictionary, parent_path: String) -> Dictionary:
	return {
		"nodePath": NiuaMcpSceneNodeContext.node_path_for_response(editor, particles),
		"name": particles.name,
		"type": particles.get_class(),
		"parentPath": parent_path,
		"amount": particles.get("amount"),
		"lifetime": particles.get("lifetime"),
		"oneShot": particles.get("one_shot"),
		"emitting": particles.get("emitting"),
		"material": material_data
	}
