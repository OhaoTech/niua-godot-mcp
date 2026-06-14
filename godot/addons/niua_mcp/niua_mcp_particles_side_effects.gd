@tool
extends RefCounted

const NiuaMcpParticlesCreateOperations = preload("niua_mcp_particles_create_operations.gd")
const NiuaMcpParticlesMaterialOperations = preload("niua_mcp_particles_material_operations.gd")
const NiuaMcpParticlesStateOperations = preload("niua_mcp_particles_state_operations.gd")
const NiuaMcpSceneGraphUtils = preload("niua_mcp_scene_graph_utils.gd")


static func create_gpu_particles_3d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpParticlesCreateOperations.create_gpu_particles_3d(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Created GPUParticles3D %s" % str(data.get("nodePath", "")))
	return response


static func create_gpu_particles_2d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpParticlesCreateOperations.create_gpu_particles_2d(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Created GPUParticles2D %s" % str(data.get("nodePath", "")))
	return response


static func configure_particle_process_material_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpParticlesMaterialOperations.configure_particle_process_material(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Configured particle material %s" % str(data.get("nodePath", "")))
	return response


static func set_particles_emitting_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	var response := NiuaMcpParticlesStateOperations.set_particles_emitting(editor, body)
	if bool(response.get("ok", false)):
		var data: Dictionary = response.get("data", {})
		NiuaMcpSceneGraphUtils.remember(remember, "Updated particle emission %s" % str(data.get("nodePath", "")))
	return response
