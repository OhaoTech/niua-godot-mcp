@tool
extends RefCounted

const NiuaMcpParticlesCreateOperations = preload("niua_mcp_particles_create_operations.gd")
const NiuaMcpParticlesMaterialOperations = preload("niua_mcp_particles_material_operations.gd")
const NiuaMcpParticlesSideEffects = preload("niua_mcp_particles_side_effects.gd")
const NiuaMcpParticlesStateOperations = preload("niua_mcp_particles_state_operations.gd")


static func create_gpu_particles_3d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpParticlesSideEffects.create_gpu_particles_3d_with_side_effects(editor, body, remember)


static func create_gpu_particles_2d_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpParticlesSideEffects.create_gpu_particles_2d_with_side_effects(editor, body, remember)


static func configure_particle_process_material_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpParticlesSideEffects.configure_particle_process_material_with_side_effects(editor, body, remember)


static func set_particles_emitting_with_side_effects(editor: EditorInterface, body: Dictionary, remember: Callable) -> Dictionary:
	return NiuaMcpParticlesSideEffects.set_particles_emitting_with_side_effects(editor, body, remember)


static func create_gpu_particles_3d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpParticlesCreateOperations.create_gpu_particles_3d(editor, body)


static func create_gpu_particles_2d(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpParticlesCreateOperations.create_gpu_particles_2d(editor, body)


static func configure_particle_process_material(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpParticlesMaterialOperations.configure_particle_process_material(editor, body)


static func set_particles_emitting(editor: EditorInterface, body: Dictionary) -> Dictionary:
	return NiuaMcpParticlesStateOperations.set_particles_emitting(editor, body)
