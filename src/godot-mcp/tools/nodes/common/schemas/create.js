import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";

export const CREATE_NODE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    type: {
      type: "string",
      description: "Godot class name to instantiate, for example Node3D, MeshInstance3D, or Camera3D."
    },
    name: {
      type: "string",
      description: "Optional node name."
    },
    parentPath: {
      type: "string",
      description: "Path under the edited scene root. Empty string means the scene root."
    },
    properties: {
      type: "object",
      description: "Optional initial node properties."
    }
  },
  required: ["type"],
  additionalProperties: false
};

export const CREATE_NODE_WITH_SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    ...CREATE_NODE_SCHEMA.properties,
    scriptPath: {
      type: "string",
      description: "GDScript path under res:// to create or attach to the new node."
    },
    scriptBaseType: {
      type: "string",
      description: "Base type used for generated script content. Defaults to the created node type."
    },
    scriptTemplate: {
      type: "string",
      enum: ["extends_only", "node_lifecycle", "node_process", "tool_node"],
      description: "Generated template used when the script is created and scriptContent is omitted. Defaults to extends_only."
    },
    scriptClassName: {
      type: "string",
      description: "Optional GDScript class_name used when generated script content is created."
    },
    scriptContent: {
      type: "string",
      description: "Optional full GDScript content. When omitted and the script is created, the bridge writes the selected generated template."
    },
    overwriteScript: {
      type: "boolean",
      description: "Overwrite an existing script before attaching it. Defaults to false."
    },
    saveScene: {
      type: "boolean",
      description: "Save the current edited scene after attaching the script. Defaults to false."
    }
  },
  required: ["type", "scriptPath"],
  additionalProperties: false
};
