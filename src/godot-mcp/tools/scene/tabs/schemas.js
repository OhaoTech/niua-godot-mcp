import { BRIDGE_INPUT_SCHEMA, CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const SCENE_PATH_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot resource path, for example res://scenes/main.tscn."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export const SCENE_TAB_PATH_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Scene path to activate, for example res://scenes/main.tscn."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export const CLOSE_SCENE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Optional scene path to close. When provided, the editor switches to it before closing."
    },
    saveBeforeClose: {
      type: "boolean",
      description: "Save the target scene before closing it. Defaults to false."
    }
  },
  additionalProperties: false
};

export const EDITOR_UNDO_REDO_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    historyId: {
      type: "number",
      description: "Optional editor undo history id from get_open_scene_tabs. Defaults to the current edited scene root history."
    }
  },
  additionalProperties: false
};

export const CREATE_SCENE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Scene path to create under res://, for example res://scenes/main.tscn."
    },
    rootType: {
      type: "string",
      description: "Godot node class to use as the scene root. Defaults to Node3D."
    },
    rootName: {
      type: "string",
      description: "Optional root node name. Defaults to the root type."
    },
    open: {
      type: "boolean",
      description: "Open the newly created scene in the visible editor. Defaults to true."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing scene file. Defaults to false."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export { BRIDGE_INPUT_SCHEMA };
