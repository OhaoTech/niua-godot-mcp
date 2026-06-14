import {
  CONNECTION_PROPERTIES,
  MATERIAL_ASSIGNMENT_TARGET_SCHEMA
} from "../shared.js";

export const CREATE_SHADER_MATERIAL_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "ShaderMaterial resource output path under res://, usually ending in .tres."
    },
    shaderPath: {
      type: "string",
      description: "Shader resource output path under res://, usually ending in .gdshader."
    },
    resourceName: {
      type: "string",
      description: "Optional Godot resource_name for the saved ShaderMaterial."
    },
    name: {
      type: "string",
      description: "Alias for resourceName."
    },
    code: {
      type: "string",
      description: "Godot shading language source code for the saved Shader resource."
    },
    parameters: {
      type: "object",
      description: "Shader uniform values keyed by exact uniform name. Values may use NIUA typed variant JSON.",
      additionalProperties: true
    },
    open: {
      type: "boolean",
      description: "Open the ShaderMaterial in the visible editor after creation. Defaults to true."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing ShaderMaterial file. Defaults to false."
    },
    overwriteShader: {
      type: "boolean",
      description: "Overwrite an existing Shader file. Defaults to false."
    },
    assignToNode: {
      ...MATERIAL_ASSIGNMENT_TARGET_SCHEMA,
      description: "Optional scene node assignment after creating the ShaderMaterial."
    }
  },
  required: ["path", "shaderPath", "code"],
  additionalProperties: false
};
