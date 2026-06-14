import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

const GENERATOR_SCHEMA = {
  type: "object",
  properties: {
    mixRate: {
      type: "number",
      description: "AudioStreamGenerator mix rate in Hz. Defaults to 44100."
    },
    bufferLength: {
      type: "number",
      description: "AudioStreamGenerator buffer length in seconds. Defaults to 0.5."
    }
  },
  additionalProperties: false
};

export const LIST_AUDIO_BUSES_SCHEMA = {
  type: "object",
  properties: CONNECTION_PROPERTIES,
  additionalProperties: false
};

export const UPSERT_AUDIO_BUS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    name: {
      type: "string",
      description: "Audio bus name to create or update."
    },
    fromName: {
      type: "string",
      description: "Optional existing bus name to rename to name."
    },
    index: {
      type: "integer",
      description: "Optional insertion index when creating a new bus."
    },
    volumeDb: {
      type: "number",
      description: "Bus volume in decibels."
    },
    muted: {
      type: "boolean",
      description: "Whether the bus is muted."
    },
    send: {
      type: "string",
      description: "Destination bus name. Defaults to Master for new buses."
    },
    save: {
      type: "boolean",
      description: "Persist the generated bus layout. Defaults to true."
    },
    layoutPath: {
      type: "string",
      description: "Bus layout resource path. Defaults to res://default_bus_layout.tres."
    }
  },
  required: ["name"],
  additionalProperties: false
};

export const REMOVE_AUDIO_BUS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    name: {
      type: "string",
      description: "Audio bus name to remove. Master cannot be removed."
    },
    save: {
      type: "boolean",
      description: "Persist the generated bus layout. Defaults to true."
    },
    layoutPath: {
      type: "string",
      description: "Bus layout resource path. Defaults to res://default_bus_layout.tres."
    }
  },
  required: ["name"],
  additionalProperties: false
};

export const UPSERT_AUDIO_BUS_EFFECT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    busName: {
      type: "string",
      description: "Audio bus that owns the effect."
    },
    effectKind: {
      type: "string",
      enum: ["reverb", "limiter"],
      description: "Curated AudioEffect kind."
    },
    effectIndex: {
      type: "integer",
      description: "Existing effect index to replace/update. Omit to append."
    },
    enabled: {
      type: "boolean",
      description: "Whether the effect starts enabled."
    },
    parameters: {
      type: "object",
      description: "Effect properties such as wet, room_size, threshold_db, or ceiling_db.",
      additionalProperties: true
    },
    save: {
      type: "boolean",
      description: "Persist the generated bus layout. Defaults to true."
    },
    layoutPath: {
      type: "string",
      description: "Bus layout resource path. Defaults to res://default_bus_layout.tres."
    }
  },
  required: ["busName", "effectKind"],
  additionalProperties: false
};

export const CREATE_AUDIO_STREAM_PLAYER_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    parentPath: {
      type: "string",
      description: "Parent path under the edited scene root. Empty string means the scene root."
    },
    name: { type: "string" },
    busName: {
      type: "string",
      description: "Audio bus assigned to AudioStreamPlayer.bus."
    },
    volumeDb: {
      type: "number",
      description: "Player volume in decibels."
    },
    autoplay: {
      type: "boolean",
      description: "Set AudioStreamPlayer.autoplay."
    },
    play: {
      type: "boolean",
      description: "Start playback immediately in the editor after creation."
    },
    generator: GENERATOR_SCHEMA
  },
  additionalProperties: false
};
