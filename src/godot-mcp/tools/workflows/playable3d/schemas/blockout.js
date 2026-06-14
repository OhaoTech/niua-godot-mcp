import {
  CONNECTION_PROPERTIES
} from "../../../shared/bridge-schema.js";

export const CREATE_3D_PLAYABLE_BLOCKOUT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    rootName: {
      type: "string",
      description: "Name for the generated Node3D blockout root. Defaults to PlayableBlockout."
    },
    parentPath: {
      type: "string",
      description: "Path under the edited scene root where the blockout root should be created."
    },
    resourceDirectory: {
      type: "string",
      description: "res:// directory for generated mesh and collision resources. Defaults to res://niua/generated/blockouts."
    },
    overwriteResources: {
      type: "boolean",
      description: "Overwrite generated mesh and shape resources. Defaults to false."
    },
    groundSize: {
      description: "Ground box size as [x,y,z] or { x, y, z }. Defaults to [24, 0.4, 24]."
    },
    groundPosition: {
      description: "Ground center position as [x,y,z] or { x, y, z }. Defaults to y = -groundSize.y / 2."
    },
    groundVisualName: {
      type: "string",
      description: "Name for the visible ground MeshInstance3D. Defaults to GroundVisual."
    },
    groundBodyName: {
      type: "string",
      description: "Name for the StaticBody3D ground collision body. Defaults to GroundBody."
    },
    groundCollisionName: {
      type: "string",
      description: "Name for the ground CollisionShape3D child. Defaults to GroundCollision."
    },
    playerName: {
      type: "string",
      description: "Name for the CharacterBody3D player body. Defaults to PlayerBody."
    },
    playerVisualName: {
      type: "string",
      description: "Name for the visible player MeshInstance3D. Defaults to PlayerVisual."
    },
    playerCollisionName: {
      type: "string",
      description: "Name for the player CollisionShape3D child. Defaults to PlayerCollision."
    },
    playerPosition: {
      description: "Player body position as [x,y,z] or { x, y, z }. Defaults to [0, playerHeight / 2, 0]."
    },
    playerRadius: {
      type: "number",
      description: "Player capsule radius. Defaults to 0.45."
    },
    playerHeight: {
      type: "number",
      description: "Player capsule height. Defaults to 1.8."
    },
    cameraName: {
      type: "string",
      description: "Name for the Camera3D child under the player body. Defaults to ChaseCamera."
    },
    cameraPosition: {
      description: "Camera3D local position as [x,y,z] or { x, y, z }. Defaults to [0, 2.4, 6]."
    },
    cameraRotationDegrees: {
      description: "Camera3D local rotation_degrees as [x,y,z] or { x, y, z }. Defaults to [-18, 0, 0]."
    },
    cameraFov: {
      type: "number",
      description: "Camera3D FOV. Defaults to 70."
    },
    lightName: {
      type: "string",
      description: "Name for the DirectionalLight3D. Defaults to KeyLight."
    },
    lightRotationDegrees: {
      description: "DirectionalLight3D rotation_degrees as [x,y,z] or { x, y, z }. Defaults to [-55, -35, 0]."
    },
    lightEnergy: {
      type: "number",
      description: "DirectionalLight3D light_energy. Defaults to 1.6."
    },
    rootProperties: {
      type: "object",
      description: "Advanced Godot Node3D properties merged into the blockout root.",
      additionalProperties: true
    }
  },
  additionalProperties: false
};
