import {
  CREATE_2D_CHARACTER_CONTROLLER_SCHEMA,
  CREATE_2D_PLAYABLE_BLOCKOUT_SCHEMA,
  CREATE_2D_TRIGGER_ZONE_SCHEMA
} from "./schemas.js";

export const PLAYABLE2D_WORKFLOW_TOOL_MANIFEST = [
  {
    name: "create_2d_playable_blockout",
    description: "Compose a practical 2D playable scene blockout with root, ground collision, player body, visible sprites, camera, inputs, and controller script.",
    profile: "full",
    category: "playable2d-workflow",
    implementation: "local",
    inputSchema: CREATE_2D_PLAYABLE_BLOCKOUT_SCHEMA,
    local: {
      handler: "create2DPlayableBlockout"
    },
    conformance: {
      happy: "compose a playable 2D blockout scene through the editor bridge",
      error: "surface partial blockout step failures with context"
    },
    docs: {
      summary: "Composes a practical 2D playable scene blockout with root, ground, player, camera, inputs, and controller script."
    }
  },
  {
    name: "create_2d_character_controller",
    description: "Create default A/D/space input actions, write a curated CharacterBody2D movement script, and attach it to a player node.",
    profile: "full",
    category: "playable2d-workflow",
    implementation: "local",
    inputSchema: CREATE_2D_CHARACTER_CONTROLLER_SCHEMA,
    local: {
      handler: "create2DCharacterController"
    },
    conformance: {
      happy: "create input actions, write a CharacterBody2D controller script, and attach it",
      error: "surface input-map, script-write, validation, or attachment failures"
    },
    docs: {
      summary: "Creates default 2D input actions, writes a CharacterBody2D movement script, and attaches it."
    }
  },
  {
    name: "create_2d_trigger_zone",
    description: "Create an Area2D trigger zone with collision, an optional visible Sprite2D helper, and a generated runtime-probe script.",
    profile: "full",
    category: "playable2d-workflow",
    implementation: "local",
    inputSchema: CREATE_2D_TRIGGER_ZONE_SCHEMA,
    local: {
      handler: "create2DTriggerZone"
    },
    conformance: {
      happy: "create an Area2D trigger zone with collision and generated script",
      error: "surface resource, node, script-write, validation, or attachment failures"
    },
    docs: {
      summary: "Creates an Area2D trigger zone with collision, optional Sprite2D helper, and generated runtime-probe script."
    }
  }
];
