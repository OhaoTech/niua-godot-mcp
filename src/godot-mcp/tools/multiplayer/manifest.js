import {
  CREATE_ENET_MULTIPLAYER_SCRIPT_SCHEMA,
  CREATE_MULTIPLAYER_SPAWNER_SCHEMA,
  CREATE_MULTIPLAYER_STATE_SCRIPT_SCHEMA,
  CREATE_MULTIPLAYER_SYNCHRONIZER_SCHEMA
} from "./schemas.js";

export const MULTIPLAYER_TOOL_MANIFEST = [
  {
    name: "create_enet_multiplayer_script",
    stability: "experimental",
    description: "Generate and attach a minimal ENet host/join script for localhost multiplayer probes.",
    profile: "full",
    tier: "standard",
    category: "multiplayer",
    inputSchema: CREATE_ENET_MULTIPLAYER_SCRIPT_SCHEMA,
    bridge: {
      clientMethod: "createEnetMultiplayerScript",
      endpoint: "/multiplayer/enet-script/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/multiplayer/enet-script/create",
      handler: "_create_enet_multiplayer_script",
      arg: "body",
      methodError: "ENet multiplayer script creation requires POST"
    },
    conformance: {
      happy: "generate and attach an ENet multiplayer script",
      error: "reject script paths outside res://"
    },
    docs: {
      summary: "Generates and attaches a minimal ENet host/join script."
    }
  },
  {
    name: "create_multiplayer_spawner",
    stability: "experimental",
    description: "Create a MultiplayerSpawner with spawn path, limit, and optional spawnable scenes.",
    profile: "full",
    tier: "standard",
    category: "multiplayer",
    inputSchema: CREATE_MULTIPLAYER_SPAWNER_SCHEMA,
    bridge: {
      clientMethod: "createMultiplayerSpawner",
      endpoint: "/multiplayer/spawner/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/multiplayer/spawner/create",
      handler: "_create_multiplayer_spawner",
      arg: "body",
      methodError: "multiplayer spawner creation requires POST"
    },
    conformance: {
      happy: "create a MultiplayerSpawner node",
      error: "reject invalid scene or spawn paths"
    },
    docs: {
      summary: "Creates a MultiplayerSpawner with spawn settings."
    }
  },
  {
    name: "create_multiplayer_synchronizer",
    stability: "experimental",
    description: "Create a MultiplayerSynchronizer with a SceneReplicationConfig for selected property paths.",
    profile: "full",
    tier: "standard",
    category: "multiplayer",
    inputSchema: CREATE_MULTIPLAYER_SYNCHRONIZER_SCHEMA,
    bridge: {
      clientMethod: "createMultiplayerSynchronizer",
      endpoint: "/multiplayer/synchronizer/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/multiplayer/synchronizer/create",
      handler: "_create_multiplayer_synchronizer",
      arg: "body",
      methodError: "multiplayer synchronizer creation requires POST"
    },
    conformance: {
      happy: "create a MultiplayerSynchronizer with replication config",
      error: "reject missing parent path or property paths"
    },
    docs: {
      summary: "Creates a MultiplayerSynchronizer for selected property paths."
    }
  },
  {
    name: "create_multiplayer_state_script",
    stability: "experimental",
    description: "Generate and attach a small Node script exposing one synchronized string property.",
    profile: "full",
    tier: "standard",
    category: "multiplayer",
    inputSchema: CREATE_MULTIPLAYER_STATE_SCRIPT_SCHEMA,
    bridge: {
      clientMethod: "createMultiplayerStateScript",
      endpoint: "/multiplayer/state-script/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/multiplayer/state-script/create",
      handler: "_create_multiplayer_state_script",
      arg: "body",
      methodError: "multiplayer state script creation requires POST"
    },
    conformance: {
      happy: "generate and attach a synchronized state script",
      error: "reject script paths outside res://"
    },
    docs: {
      summary: "Generates and attaches a synchronized state script."
    }
  }
];
