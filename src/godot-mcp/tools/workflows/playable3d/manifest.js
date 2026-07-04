import {
  CREATE_3D_CHARACTER_CONTROLLER_SCHEMA,
  CREATE_3D_PLAYABLE_BLOCKOUT_SCHEMA
} from "./schemas.js";

export const PLAYABLE3D_WORKFLOW_TOOL_MANIFEST = [
  {
    name: "create_3d_playable_blockout",
    description: "Compose a practical 3D playable scene blockout with root, ground mesh/collision, player body, visual capsule, chase camera, and key light.",
    profile: "full",
    tier: "standard",
    category: "playable3d-workflow",
    implementation: "local",
    inputSchema: CREATE_3D_PLAYABLE_BLOCKOUT_SCHEMA,
    local: {
      handler: "create3DPlayableBlockout"
    },
    conformance: {
      happy: "compose a playable 3D blockout scene through the editor bridge",
      error: "surface partial blockout step failures with context"
    },
    docs: {
      summary: "Composes a practical 3D playable scene blockout with root, ground, player, camera, and key light."
    }
  },
  {
    name: "create_3d_character_controller",
    description: "Create default WASD/space input actions, write a curated CharacterBody3D movement script, and attach it to a player node.",
    profile: "full",
    tier: "essential",
    category: "playable3d-workflow",
    implementation: "local",
    inputSchema: CREATE_3D_CHARACTER_CONTROLLER_SCHEMA,
    local: {
      handler: "create3DCharacterController"
    },
    conformance: {
      happy: "create input actions, write a CharacterBody3D controller script, and attach it",
      error: "surface input-map, script-write, validation, or attachment failures"
    },
    docs: {
      summary: "Creates default 3D input actions, writes a CharacterBody3D movement script, and attaches it."
    }
  }
];
