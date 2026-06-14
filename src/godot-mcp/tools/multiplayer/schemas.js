import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

export const CREATE_ENET_MULTIPLAYER_SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Node that receives the generated ENet host/join script. Empty string means scene root."
    },
    scriptPath: { type: "string" },
    statePath: {
      type: "string",
      description: "NodePath from the scripted node to the synchronized state node."
    },
    propertyName: { type: "string" },
    hostValue: { type: "string" },
    defaultPort: { type: "integer" },
    overwrite: { type: "boolean" }
  },
  required: ["nodePath", "scriptPath", "statePath", "propertyName"],
  additionalProperties: false
};

export const CREATE_MULTIPLAYER_SPAWNER_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    parentPath: { type: "string" },
    name: { type: "string" },
    spawnPath: { type: "string" },
    spawnLimit: { type: "integer" },
    spawnableScenes: {
      type: "array",
      items: { type: "string" }
    }
  },
  additionalProperties: false
};

export const CREATE_MULTIPLAYER_SYNCHRONIZER_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    parentPath: { type: "string" },
    name: { type: "string" },
    rootPath: { type: "string" },
    propertyPaths: {
      type: "array",
      items: { type: "string" }
    },
    replicationInterval: { type: "number" },
    deltaInterval: { type: "number" },
    publicVisibility: { type: "boolean" }
  },
  required: ["parentPath", "propertyPaths"],
  additionalProperties: false
};

export const CREATE_MULTIPLAYER_STATE_SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: { type: "string" },
    scriptPath: { type: "string" },
    propertyName: { type: "string" },
    initialValue: { type: "string" },
    overwrite: { type: "boolean" }
  },
  required: ["nodePath", "scriptPath", "propertyName"],
  additionalProperties: false
};
