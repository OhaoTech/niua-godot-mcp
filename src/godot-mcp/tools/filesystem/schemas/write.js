import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const WRITE_TEXT_FILE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot project path under res://."
    },
    content: {
      type: "string",
      description: "UTF-8 text content to write."
    }
  },
  required: ["path", "content"],
  additionalProperties: false
};

export const WRITE_BINARY_FILE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot project path under res://."
    },
    contentBase64: {
      type: "string",
      description: "Base64-encoded binary file content."
    }
  },
  required: ["path", "contentBase64"],
  additionalProperties: false
};
