import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

const KEYFRAME_SCHEMA = {
  type: "object",
  properties: {
    time: {
      type: "number",
      description: "Key time in seconds."
    },
    value: {
      description: "JSON-encoded Godot Variant value, such as { type: 'Vector3', x, y, z }."
    },
    transition: {
      type: "number",
      description: "Optional key transition value. Defaults to 1.0."
    }
  },
  required: ["time", "value"],
  additionalProperties: false
};

const ANIMATION_TRACK_SCHEMA = {
  type: "object",
  properties: {
    targetPath: {
      type: "string",
      description: "Node path relative to the AnimationPlayer root node."
    },
    property: {
      type: "string",
      description: "Property to animate, for example position or modulate."
    },
    type: {
      type: "string",
      enum: ["value", "position_3d", "rotation_3d", "scale_3d"],
      description: "Optional explicit Godot animation track type. Defaults to value."
    },
    updateMode: {
      type: "string",
      enum: ["continuous", "discrete", "capture"],
      description: "Value-track update mode. Defaults to continuous."
    },
    interpolation: {
      type: "string",
      enum: ["nearest", "linear", "cubic", "linear_angle", "cubic_angle"],
      description: "Key interpolation mode. Defaults to linear."
    },
    keyframes: {
      type: "array",
      items: KEYFRAME_SCHEMA,
      description: "Keyframes to insert into this track."
    }
  },
  required: ["targetPath", "keyframes"],
  additionalProperties: false
};

export const UPSERT_ANIMATION_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    playerPath: {
      type: "string",
      description: "Existing AnimationPlayer node path under the edited scene root."
    },
    parentPath: {
      type: "string",
      description: "Parent path used when creating the AnimationPlayer. Empty string means the scene root."
    },
    playerName: {
      type: "string",
      description: "AnimationPlayer name used when playerPath is omitted. Defaults to AnimationPlayer."
    },
    rootNodePath: {
      type: "string",
      description: "AnimationPlayer root_node path. Defaults to '..' for a player under the scene root."
    },
    animationName: {
      type: "string",
      description: "Animation name to create or replace."
    },
    length: {
      type: "number",
      description: "Animation length in seconds. Defaults to the last keyframe time."
    },
    loopMode: {
      type: "string",
      enum: ["none", "linear", "pingpong"],
      description: "Animation loop mode. Defaults to none."
    },
    tracks: {
      type: "array",
      items: ANIMATION_TRACK_SCHEMA
    }
  },
  required: ["animationName", "tracks"],
  additionalProperties: false
};

export const LIST_ANIMATIONS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    playerPath: {
      type: "string",
      description: "Optional AnimationPlayer node path to inspect."
    },
    nodePath: {
      type: "string",
      description: "Optional scene node subtree to scan for AnimationPlayers."
    },
    scenePath: {
      type: "string",
      description: "Optional imported PackedScene path, including .glb, to inspect without instancing into the edited scene."
    }
  },
  additionalProperties: false
};

export const PLAY_ANIMATION_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    playerPath: {
      type: "string",
      description: "AnimationPlayer node path under the edited scene root."
    },
    animationName: {
      type: "string",
      description: "Animation name to play."
    },
    customBlend: {
      type: "number",
      description: "Optional custom blend duration."
    },
    customSpeed: {
      type: "number",
      description: "Optional playback speed multiplier."
    },
    fromEnd: {
      type: "boolean",
      description: "Play from the end."
    }
  },
  required: ["playerPath", "animationName"],
  additionalProperties: false
};

export const STOP_ANIMATION_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    playerPath: {
      type: "string",
      description: "AnimationPlayer node path under the edited scene root."
    },
    keepState: {
      type: "boolean",
      description: "Keep the current animated values when stopping. Defaults to false."
    }
  },
  required: ["playerPath"],
  additionalProperties: false
};

export const GET_ANIMATION_STATE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    playerPath: {
      type: "string",
      description: "AnimationPlayer node path under the edited scene root."
    }
  },
  required: ["playerPath"],
  additionalProperties: false
};

export const INSTANCE_ANIMATED_SCENE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    scenePath: {
      type: "string",
      description: "Imported PackedScene path, including .glb, to instance into the edited scene."
    },
    parentPath: {
      type: "string",
      description: "Parent path under the edited scene root. Empty string means the scene root."
    },
    name: {
      type: "string",
      description: "Optional name for the instanced scene root."
    }
  },
  required: ["scenePath"],
  additionalProperties: false
};

export const CREATE_ANIMATION_TREE_STATE_MACHINE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    treePath: {
      type: "string",
      description: "Existing AnimationTree path to update."
    },
    parentPath: {
      type: "string",
      description: "Parent path used when creating the AnimationTree. Empty string means the scene root."
    },
    treeName: {
      type: "string",
      description: "AnimationTree name used when treePath is omitted. Defaults to AnimationTree."
    },
    playerPath: {
      type: "string",
      description: "AnimationPlayer path used by the AnimationTree."
    },
    states: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          animationName: { type: "string" },
          position: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" }
            },
            additionalProperties: false
          }
        },
        required: ["name", "animationName"],
        additionalProperties: false
      }
    },
    transitions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          from: { type: "string" },
          to: { type: "string" },
          advanceCondition: { type: "string" },
          xfadeTime: { type: "number" }
        },
        required: ["from", "to"],
        additionalProperties: false
      }
    },
    active: {
      type: "boolean",
      description: "Activate the AnimationTree after creation. Defaults to true."
    }
  },
  required: ["playerPath", "states"],
  additionalProperties: false
};

export const TRAVEL_ANIMATION_TREE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    treePath: {
      type: "string",
      description: "AnimationTree node path under the edited scene root."
    },
    state: {
      type: "string",
      description: "State-machine state to travel to."
    }
  },
  required: ["treePath", "state"],
  additionalProperties: false
};
