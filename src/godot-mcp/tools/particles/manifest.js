import {
  CONFIGURE_PARTICLE_PROCESS_MATERIAL_SCHEMA,
  CREATE_GPU_PARTICLES_2D_SCHEMA,
  CREATE_GPU_PARTICLES_3D_SCHEMA,
  SET_PARTICLES_EMITTING_SCHEMA
} from "./schemas.js";

export const PARTICLES_TOOL_MANIFEST = [
  {
    name: "create_gpu_particles_3d",
    description: "Create a GPUParticles3D emitter with a draw-pass mesh and optional ParticleProcessMaterial settings.",
    profile: "full",
    category: "particles",
    inputSchema: CREATE_GPU_PARTICLES_3D_SCHEMA,
    bridge: {
      clientMethod: "createGpuParticles3D",
      endpoint: "/particles/create-3d",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/particles/create-3d",
      handler: "_create_gpu_particles_3d",
      arg: "body",
      methodError: "GPUParticles3D creation requires POST"
    },
    conformance: {
      happy: "create a GPUParticles3D emitter",
      error: "reject invalid parent node paths"
    },
    docs: {
      summary: "Creates a GPUParticles3D emitter with optional process material settings."
    }
  },
  {
    name: "create_gpu_particles_2d",
    description: "Create a GPUParticles2D emitter with a default texture and optional ParticleProcessMaterial settings.",
    profile: "full",
    category: "particles",
    inputSchema: CREATE_GPU_PARTICLES_2D_SCHEMA,
    bridge: {
      clientMethod: "createGpuParticles2D",
      endpoint: "/particles/create-2d",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/particles/create-2d",
      handler: "_create_gpu_particles_2d",
      arg: "body",
      methodError: "GPUParticles2D creation requires POST"
    },
    conformance: {
      happy: "create a GPUParticles2D emitter",
      error: "reject invalid parent node paths"
    },
    docs: {
      summary: "Creates a GPUParticles2D emitter with optional process material settings."
    }
  },
  {
    name: "configure_particle_process_material",
    description: "Create or update the ParticleProcessMaterial on a GPUParticles2D or GPUParticles3D node.",
    profile: "full",
    category: "particles",
    inputSchema: CONFIGURE_PARTICLE_PROCESS_MATERIAL_SCHEMA,
    bridge: {
      clientMethod: "configureParticleProcessMaterial",
      endpoint: "/particles/material/configure",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/particles/material/configure",
      handler: "_configure_particle_process_material",
      arg: "body",
      methodError: "particle material configuration requires POST"
    },
    conformance: {
      happy: "configure a ParticleProcessMaterial on an emitter",
      error: "reject unsupported particle node paths"
    },
    docs: {
      summary: "Creates or updates an emitter ParticleProcessMaterial."
    }
  },
  {
    name: "set_particles_emitting",
    description: "Set a GPUParticles2D or GPUParticles3D node's emitting and one-shot state, optionally restarting it.",
    profile: "full",
    category: "particles",
    inputSchema: SET_PARTICLES_EMITTING_SCHEMA,
    bridge: {
      clientMethod: "setParticlesEmitting",
      endpoint: "/particles/emitting/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/particles/emitting/set",
      handler: "_set_particles_emitting",
      arg: "body",
      methodError: "particle emission state requires POST"
    },
    conformance: {
      happy: "set particle emitting state",
      error: "reject unsupported particle node paths"
    },
    docs: {
      summary: "Sets particle emitting and one-shot state, optionally restarting the emitter."
    }
  }
];
