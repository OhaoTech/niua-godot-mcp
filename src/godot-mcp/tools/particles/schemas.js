import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

const VECTOR2_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["Vector2"] },
    x: { type: "number" },
    y: { type: "number" }
  },
  required: ["x", "y"],
  additionalProperties: false
};

const VECTOR3_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["Vector3"] },
    x: { type: "number" },
    y: { type: "number" },
    z: { type: "number" }
  },
  required: ["x", "y", "z"],
  additionalProperties: false
};

const COLOR_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["Color"] },
    r: { type: "number" },
    g: { type: "number" },
    b: { type: "number" },
    a: { type: "number" }
  },
  required: ["r", "g", "b"],
  additionalProperties: false
};

export const PARTICLE_PROCESS_MATERIAL_SCHEMA = {
  type: "object",
  properties: {
    emissionShape: {
      type: "string",
      enum: ["point", "sphere", "sphere_surface", "box", "ring"],
      description: "ParticleProcessMaterial emission shape."
    },
    emissionSphereRadius: { type: "number" },
    emissionBoxExtents: VECTOR3_SCHEMA,
    emissionRingRadius: { type: "number" },
    emissionRingInnerRadius: { type: "number" },
    direction: VECTOR3_SCHEMA,
    spread: { type: "number" },
    initialVelocityMin: { type: "number" },
    initialVelocityMax: { type: "number" },
    gravity: VECTOR3_SCHEMA,
    scaleMin: { type: "number" },
    scaleMax: { type: "number" },
    color: COLOR_SCHEMA,
    colorRamp: {
      type: "array",
      items: {
        type: "object",
        properties: {
          offset: { type: "number" },
          color: COLOR_SCHEMA
        },
        required: ["offset", "color"],
        additionalProperties: false
      },
      description: "Gradient stops used to build a GradientTexture1D color ramp."
    }
  },
  additionalProperties: false
};

const COMMON_PARTICLE_PROPERTIES = {
  parentPath: {
    type: "string",
    description: "Parent path under the edited scene root. Empty string means the scene root."
  },
  name: { type: "string" },
  amount: { type: "integer" },
  lifetime: { type: "number" },
  oneShot: { type: "boolean" },
  emitting: { type: "boolean" },
  preprocess: { type: "number" },
  material: PARTICLE_PROCESS_MATERIAL_SCHEMA
};

export const CREATE_GPU_PARTICLES_3D_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    ...COMMON_PARTICLE_PROPERTIES,
    position: VECTOR3_SCHEMA,
    rotationDegrees: VECTOR3_SCHEMA,
    scale: VECTOR3_SCHEMA,
    meshType: {
      type: "string",
      enum: ["sphere", "box", "quad"],
      description: "Draw-pass mesh type. Defaults to sphere."
    },
    meshRadius: { type: "number" },
    meshSize: VECTOR3_SCHEMA,
    quadSize: VECTOR2_SCHEMA
  },
  additionalProperties: false
};

export const CREATE_GPU_PARTICLES_2D_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    ...COMMON_PARTICLE_PROPERTIES,
    position: VECTOR2_SCHEMA,
    scale: VECTOR2_SCHEMA,
    textureSize: { type: "integer" }
  },
  additionalProperties: false
};

export const CONFIGURE_PARTICLE_PROCESS_MATERIAL_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "GPUParticles2D or GPUParticles3D node path under the edited scene root."
    },
    replace: {
      type: "boolean",
      description: "Create a fresh ParticleProcessMaterial instead of reusing the current one."
    },
    material: PARTICLE_PROCESS_MATERIAL_SCHEMA
  },
  required: ["nodePath", "material"],
  additionalProperties: false
};

export const SET_PARTICLES_EMITTING_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "GPUParticles2D or GPUParticles3D node path under the edited scene root."
    },
    emitting: { type: "boolean" },
    oneShot: { type: "boolean" },
    restart: {
      type: "boolean",
      description: "Call restart() after changing state."
    }
  },
  required: ["nodePath"],
  additionalProperties: false
};
