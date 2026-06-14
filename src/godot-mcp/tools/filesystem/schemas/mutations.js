import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const MOVE_FILESYSTEM_ENTRY_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    fromPath: {
      type: "string",
      description: "Existing Godot project path under res://."
    },
    toPath: {
      type: "string",
      description: "Destination Godot project path under res://."
    }
  },
  required: ["fromPath", "toPath"],
  additionalProperties: false
};

export const COPY_FILESYSTEM_ENTRY_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    fromPath: {
      type: "string",
      description: "Existing file or folder path under res://."
    },
    toPath: {
      type: "string",
      description: "Destination Godot project path under res://."
    },
    overwrite: {
      type: "boolean",
      description: "Allow replacing colliding files or merging into an existing destination directory. Defaults to false."
    }
  },
  required: ["fromPath", "toPath"],
  additionalProperties: false
};
