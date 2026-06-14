@tool
extends RefCounted

const NiuaMcpParticlesOperations = preload("niua_mcp_particles_operations.gd")

const HANDLERS := {
	"_create_gpu_particles_3d": true,
	"_create_gpu_particles_2d": true,
	"_configure_particle_process_material": true,
	"_set_particles_emitting": true
}

var _context


func configure(context) -> void:
	_context = context


func handles(handler: String) -> bool:
	return HANDLERS.has(handler)


func _create_gpu_particles_3d(body: Dictionary) -> Dictionary:
	return NiuaMcpParticlesOperations.create_gpu_particles_3d_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _create_gpu_particles_2d(body: Dictionary) -> Dictionary:
	return NiuaMcpParticlesOperations.create_gpu_particles_2d_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _configure_particle_process_material(body: Dictionary) -> Dictionary:
	return NiuaMcpParticlesOperations.configure_particle_process_material_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)


func _set_particles_emitting(body: Dictionary) -> Dictionary:
	return NiuaMcpParticlesOperations.set_particles_emitting_with_side_effects(
		_context.editor,
		body,
		Callable(_context, "remember")
	)
