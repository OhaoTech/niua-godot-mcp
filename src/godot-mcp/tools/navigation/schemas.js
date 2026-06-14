import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

const VECTOR3_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["Vector3"] },
    x: { type: "number" },
    y: { type: "number" },
    z: { type: "number" }
  },
  required: ["x", "y", "z"],
  additionalProperties: false
};

const NAVMESH_SETTINGS = {
  cellSize: { type: "number" },
  cellHeight: { type: "number" },
  agentRadius: { type: "number" },
  agentHeight: { type: "number" },
  agentMaxClimb: { type: "number" },
  agentMaxSlope: { type: "number" },
  sourceGeometryMode: {
    type: "integer",
    description: "Raw NavigationMesh geometry_source_geometry_mode enum value for advanced workflows."
  },
  parsedGeometryType: {
    type: "integer",
    description: "Raw NavigationMesh parsed_geometry_type enum value for advanced workflows."
  }
};

export const CREATE_NAVIGATION_REGION_3D_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    parentPath: {
      type: "string",
      description: "Parent path under the edited scene root. Empty string means the scene root."
    },
    name: { type: "string" },
    enabled: { type: "boolean" },
    ...NAVMESH_SETTINGS
  },
  additionalProperties: false
};

export const BAKE_NAVIGATION_MESH_3D_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    regionPath: {
      type: "string",
      description: "NavigationRegion3D path under the edited scene root."
    },
    onThread: {
      type: "boolean",
      description: "Run Godot's bake on a thread. Defaults to false for deterministic probe behavior."
    },
    timeoutMs: {
      type: "number",
      description: "Bridge request timeout in milliseconds for the bake operation. Defaults to 120000."
    }
  },
  required: ["regionPath"],
  additionalProperties: false
};

export const CREATE_NAVIGATION_AGENT_3D_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    parentPath: {
      type: "string",
      description: "Parent node path under the edited scene root."
    },
    name: { type: "string" },
    radius: { type: "number" },
    height: { type: "number" },
    pathDesiredDistance: { type: "number" },
    targetDesiredDistance: { type: "number" },
    pathMaxDistance: { type: "number" },
    maxSpeed: { type: "number" },
    targetPosition: VECTOR3_SCHEMA
  },
  required: ["parentPath"],
  additionalProperties: false
};

export const CREATE_NAVIGATION_TARGET_FOLLOW_SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "CharacterBody3D node path that will receive the generated script."
    },
    agentPath: {
      type: "string",
      description: "NavigationAgent3D path relative to nodePath. Defaults to NavigationAgent3D."
    },
    targetPath: {
      type: "string",
      description: "Target Node3D path relative to nodePath. Defaults to ../Target."
    },
    scriptPath: {
      type: "string",
      description: "Output script path under res://."
    },
    speed: { type: "number" },
    overwrite: { type: "boolean" }
  },
  required: ["nodePath", "scriptPath"],
  additionalProperties: false
};
