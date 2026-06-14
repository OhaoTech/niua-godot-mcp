import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";

import { ACTION_NAMES_SCHEMA } from "./shared.js";

export const CREATE_2D_PLAYABLE_BLOCKOUT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    rootName: {
      type: "string",
      description: "Name for the generated Node2D blockout root. Defaults to PlayableBlockout2D."
    },
    parentPath: {
      type: "string",
      description: "Path under the edited scene root where the blockout root should be created."
    },
    resourceDirectory: {
      type: "string",
      description: "res:// directory for generated 2D shape and placeholder texture resources."
    },
    overwriteResources: {
      type: "boolean",
      description: "Overwrite generated shape and placeholder texture resources. Defaults to false."
    },
    groundSize: {
      description: "Ground rectangle size as [x,y] or { x, y }. Defaults to [640,48]."
    },
    groundPosition: {
      description: "Ground body position as [x,y] or { x, y }. Defaults to [0,0]."
    },
    groundBodyName: {
      type: "string",
      description: "Name for the StaticBody2D ground body. Defaults to GroundBody."
    },
    groundCollisionName: {
      type: "string",
      description: "Name for the ground CollisionShape2D child. Defaults to GroundCollision."
    },
    groundVisualName: {
      type: "string",
      description: "Name for the visible ground Sprite2D child. Defaults to GroundVisual."
    },
    playerSize: {
      description: "Player capsule/sprite size as [x,y] or { x, y }. Defaults to [32,64]."
    },
    playerPosition: {
      description: "Player body position as [x,y] or { x, y }. Defaults to [0,-80]."
    },
    playerName: {
      type: "string",
      description: "Name for the CharacterBody2D player body. Defaults to PlayerBody."
    },
    playerCollisionName: {
      type: "string",
      description: "Name for the player CollisionShape2D child. Defaults to PlayerCollision."
    },
    playerVisualName: {
      type: "string",
      description: "Name for the visible player Sprite2D child. Defaults to PlayerVisual."
    },
    cameraName: {
      type: "string",
      description: "Name for the Camera2D child under the player body. Defaults to PlayerCamera."
    },
    cameraPosition: {
      description: "Camera2D local position as [x,y] or { x, y }. Defaults to [0,-80]."
    },
    cameraZoom: {
      description: "Camera2D zoom as [x,y] or { x, y }. Defaults to [1,1]."
    },
    scriptPath: {
      type: "string",
      description: "GDScript path under res://. Defaults to res://scripts/<node>_controller_2d.gd."
    },
    className: {
      type: "string",
      description: "Optional GDScript class_name. Defaults to <NodeName>Controller2D."
    },
    moveSpeed: {
      type: "number",
      description: "Horizontal movement speed in pixels per second. Defaults to 360."
    },
    jumpVelocity: {
      type: "number",
      description: "Jump velocity. Defaults to -540."
    },
    gravity: {
      type: "number",
      description: "Gravity applied while airborne. Defaults to 1400."
    },
    overwriteScript: {
      type: "boolean",
      description: "Overwrite the generated controller script. Defaults to overwriteResources."
    },
    validateAfterCreate: {
      type: "boolean",
      description: "Validate the generated script before attaching it. Defaults to true."
    },
    saveScene: {
      type: "boolean",
      description: "Save the current scene after attaching the script. Defaults to true."
    },
    configureInputMap: {
      type: "boolean",
      description: "Create or replace default A/D/space input actions before writing the script. Defaults to true."
    },
    actionNames: ACTION_NAMES_SCHEMA,
    rootProperties: {
      type: "object",
      description: "Advanced Godot Node2D properties merged into the blockout root.",
      additionalProperties: true
    }
  },
  additionalProperties: false
};
