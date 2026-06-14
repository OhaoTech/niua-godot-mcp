import { CONNECTION_PROPERTIES } from "./shared.js";

export const FILESYSTEM_PATH_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot project path under res://."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export const CREATE_RESOURCE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot resource output path under res://."
    },
    className: {
      type: "string",
      description: "Godot Resource-derived class to instantiate, such as StandardMaterial3D."
    },
    properties: {
      type: "object",
      description: "Optional resource properties encoded with NIUA variant JSON.",
      additionalProperties: true
    },
    open: {
      type: "boolean",
      description: "Open the resource in the visible editor after creation. Defaults to true."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing resource file. Defaults to false."
    }
  },
  required: ["path", "className"],
  additionalProperties: false
};

export const SAVE_RESOURCE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Existing Godot resource path under res://."
    },
    properties: {
      type: "object",
      description: "Optional resource properties encoded with NIUA variant JSON.",
      additionalProperties: true
    },
    open: {
      type: "boolean",
      description: "Open the resource in the visible editor after saving. Defaults to false."
    }
  },
  required: ["path"],
  additionalProperties: false
};
