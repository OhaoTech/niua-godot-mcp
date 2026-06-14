import {
  CONNECTION_PROPERTIES,
  MATERIAL_ASSIGNMENT_TARGET_SCHEMA
} from "../shared.js";

export const CREATE_MATERIAL_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot material resource output path under res://, usually ending in .tres."
    },
    className: {
      type: "string",
      description: "Godot material class to create. Defaults to StandardMaterial3D."
    },
    name: {
      type: "string",
      description: "Optional Godot resource_name for the saved material."
    },
    albedoColor: {
      description: "Base color as #RRGGBB, #RRGGBBAA, or { r, g, b, a } values in 0..1."
    },
    baseColor: {
      description: "Alias for albedoColor."
    },
    alpha: {
      type: "number",
      description: "Optional alpha override for the albedo color."
    },
    metallic: {
      type: "number",
      description: "StandardMaterial3D metallic value."
    },
    roughness: {
      type: "number",
      description: "StandardMaterial3D roughness value."
    },
    emissionColor: {
      description: "Emission color as #RRGGBB, #RRGGBBAA, or { r, g, b, a } values in 0..1."
    },
    emissionEnabled: {
      type: "boolean",
      description: "Whether emission is enabled. Automatically true when emissionColor is provided."
    },
    emissionEnergyMultiplier: {
      type: "number",
      description: "StandardMaterial3D emission_energy_multiplier value."
    },
    transparency: {
      description: "Transparency mode: disabled, alpha, alpha_scissor, alpha_hash, alpha_depth_pre_pass, or the Godot enum integer."
    },
    cullMode: {
      description: "Cull mode: back, front, disabled, or the Godot enum integer."
    },
    shadingMode: {
      description: "Shading mode: per_pixel, per_vertex, unshaded, or the Godot enum integer."
    },
    open: {
      type: "boolean",
      description: "Open the material in the visible editor after creation. Defaults to true."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing material file. Defaults to false."
    },
    assignToNode: MATERIAL_ASSIGNMENT_TARGET_SCHEMA,
    properties: {
      type: "object",
      description: "Advanced Godot material properties merged after curated fields.",
      additionalProperties: true
    }
  },
  required: ["path"],
  additionalProperties: false
};
