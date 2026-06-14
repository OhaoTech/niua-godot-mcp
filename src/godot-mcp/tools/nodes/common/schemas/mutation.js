import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";

export const RENAME_NODE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Path under the edited scene root."
    },
    newName: {
      type: "string",
      description: "New node name."
    }
  },
  required: ["nodePath", "newName"],
  additionalProperties: false
};

export const DELETE_NODE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Path under the edited scene root."
    }
  },
  required: ["nodePath"],
  additionalProperties: false
};

export const DUPLICATE_NODE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Path under the edited scene root."
    },
    newName: {
      type: "string",
      description: "Optional name for the duplicate node."
    },
    parentPath: {
      type: "string",
      description: "Optional destination parent. Defaults to the source node's parent."
    }
  },
  required: ["nodePath"],
  additionalProperties: false
};

export const REPARENT_NODE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Path under the edited scene root."
    },
    newParentPath: {
      type: "string",
      description: "Destination parent path under the edited scene root."
    },
    keepGlobalTransform: {
      type: "boolean",
      description: "Preserve Node2D/Node3D global transform where possible. Defaults to true."
    }
  },
  required: ["nodePath", "newParentPath"],
  additionalProperties: false
};

export const REORDER_NODE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Path under the edited scene root."
    },
    index: {
      type: "integer",
      description: "Target sibling index under the node's current parent. Zero moves the node to the top of the Scene dock parent."
    }
  },
  required: ["nodePath", "index"],
  additionalProperties: false
};
