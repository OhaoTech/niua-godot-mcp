import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";

export const CREATE_SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "GDScript path under res://, for example res://scripts/player.gd."
    },
    baseType: {
      type: "string",
      description: "Godot class extended by the generated script when content is omitted. Defaults to Node."
    },
    template: {
      type: "string",
      enum: ["extends_only", "node_lifecycle", "node_process", "tool_node"],
      description: "Generated script template to use when content is omitted. Defaults to extends_only."
    },
    className: {
      type: "string",
      description: "Optional GDScript class_name to include when generated content is used."
    },
    content: {
      type: "string",
      description: "Optional full GDScript content. When omitted, the bridge writes the selected generated template."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing script file. Defaults to false."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export const ATTACH_SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Scene-tree node path under the edited scene root."
    },
    scriptPath: {
      type: "string",
      description: "GDScript path under res:// to attach to the node."
    },
    createIfMissing: {
      type: "boolean",
      description: "Create the script before attaching it when the file does not exist. Defaults to false."
    },
    baseType: {
      type: "string",
      description: "Base type for createIfMissing script templates. Defaults to the node class."
    },
    template: {
      type: "string",
      enum: ["extends_only", "node_lifecycle", "node_process", "tool_node"],
      description: "Generated template used when createIfMissing creates the script and content is omitted. Defaults to extends_only."
    },
    className: {
      type: "string",
      description: "Optional GDScript class_name used when createIfMissing generates script content."
    },
    content: {
      type: "string",
      description: "Optional script content used when createIfMissing creates the script."
    },
    saveScene: {
      type: "boolean",
      description: "Save the current edited scene after attaching the script. Defaults to false."
    }
  },
  required: ["nodePath", "scriptPath"],
  additionalProperties: false
};
