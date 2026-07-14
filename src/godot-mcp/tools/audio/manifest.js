import {
  CREATE_AUDIO_STREAM_PLAYER_SCHEMA,
  LIST_AUDIO_BUSES_SCHEMA,
  REMOVE_AUDIO_BUS_SCHEMA,
  UPSERT_AUDIO_BUS_EFFECT_SCHEMA,
  UPSERT_AUDIO_BUS_SCHEMA
} from "./schemas.js";

export const AUDIO_TOOL_MANIFEST = [
  {
    name: "list_audio_buses",
    description: "Read Godot's current audio bus layout, including effects, volume, mute, and send routing.",
    profile: "full",
    tier: "standard",
    category: "audio",
    inputSchema: LIST_AUDIO_BUSES_SCHEMA,
    bridge: {
      clientMethod: "listAudioBuses",
      endpoint: "/audio/buses",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/audio/buses",
      handler: "_list_audio_buses",
      arg: "query"
    },
    conformance: {
      happy: "read current audio bus layout",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads Godot audio buses, effects, volume, mute, and routing."
    }
  },
  {
    name: "upsert_audio_bus",
    description: "Create, rename, route, mute, or set volume for an audio bus, then persist the bus layout.",
    profile: "full",
    tier: "standard",
    category: "audio",
    inputSchema: UPSERT_AUDIO_BUS_SCHEMA,
    bridge: {
      clientMethod: "upsertAudioBus",
      endpoint: "/audio/bus/upsert",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/audio/bus/upsert",
      handler: "_upsert_audio_bus",
      arg: "body",
      methodError: "audio bus upsert requires POST"
    },
    conformance: {
      happy: "create or update an audio bus",
      error: "reject invalid or protected audio bus updates"
    },
    docs: {
      summary: "Creates, renames, routes, mutes, or sets volume for an audio bus."
    }
  },
  {
    name: "remove_audio_bus",
    description: "Remove a non-Master audio bus and persist the bus layout.",
    profile: "full",
    tier: "standard",
    category: "audio",
    inputSchema: REMOVE_AUDIO_BUS_SCHEMA,
    bridge: {
      clientMethod: "removeAudioBus",
      endpoint: "/audio/bus/remove",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/audio/bus/remove",
      handler: "_remove_audio_bus",
      arg: "body",
      methodError: "audio bus remove requires POST"
    },
    conformance: {
      happy: "remove a non-Master audio bus",
      error: "reject removing Master or missing buses"
    },
    docs: {
      summary: "Removes a non-Master audio bus and persists the layout."
    }
  },
  {
    name: "upsert_audio_bus_effect",
    description: "Add or update a curated AudioEffectReverb or AudioEffectLimiter on an audio bus.",
    profile: "full",
    tier: "standard",
    category: "audio",
    inputSchema: UPSERT_AUDIO_BUS_EFFECT_SCHEMA,
    bridge: {
      clientMethod: "upsertAudioBusEffect",
      endpoint: "/audio/bus/effect/upsert",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/audio/bus/effect/upsert",
      handler: "_upsert_audio_bus_effect",
      arg: "body",
      methodError: "audio bus effect upsert requires POST"
    },
    conformance: {
      happy: "add or update a curated bus effect",
      error: "reject unsupported audio effect kinds"
    },
    docs: {
      summary: "Adds or updates a curated audio effect on an audio bus."
    }
  },
  {
    name: "create_audio_stream_player",
    description: "Create an AudioStreamPlayer with an AudioStreamGenerator stream and route it to a named bus.",
    profile: "full",
    tier: "standard",
    category: "audio",
    inputSchema: CREATE_AUDIO_STREAM_PLAYER_SCHEMA,
    bridge: {
      clientMethod: "createAudioStreamPlayer",
      endpoint: "/audio/player/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/audio/player/create",
      handler: "_create_audio_stream_player",
      arg: "body",
      methodError: "audio stream player creation requires POST"
    },
    conformance: {
      happy: "create an AudioStreamPlayer node",
      error: "reject invalid parent node paths"
    },
    docs: {
      summary: "Creates an AudioStreamPlayer and routes it to a named bus."
    }
  }
];
