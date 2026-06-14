import {
  CREATE_ANIMATION_TREE_STATE_MACHINE_SCHEMA,
  GET_ANIMATION_STATE_SCHEMA,
  INSTANCE_ANIMATED_SCENE_SCHEMA,
  LIST_ANIMATIONS_SCHEMA,
  PLAY_ANIMATION_SCHEMA,
  STOP_ANIMATION_SCHEMA,
  TRAVEL_ANIMATION_TREE_SCHEMA,
  UPSERT_ANIMATION_SCHEMA
} from "./schemas.js";

export const ANIMATION_TOOL_MANIFEST = [
  {
    name: "upsert_animation",
    description: "Create or replace an AnimationPlayer animation with property or transform tracks and keyframes.",
    profile: "full",
    category: "animation",
    inputSchema: UPSERT_ANIMATION_SCHEMA,
    bridge: {
      owner: "animation",
      clientMethod: "upsertAnimation",
      endpoint: "/animation/upsert",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/animation/upsert",
      handler: "_upsert_animation",
      arg: "body",
      methodError: "animation upsert requires POST"
    },
    conformance: {
      happy: "create or replace an AnimationPlayer animation",
      error: "reject invalid animation tracks or keyframes"
    },
    docs: {
      summary: "Creates or replaces an AnimationPlayer animation."
    }
  },
  {
    name: "list_animations",
    description: "List AnimationPlayer animations in the edited scene or inside an imported PackedScene such as a GLB.",
    profile: "full",
    category: "animation",
    inputSchema: LIST_ANIMATIONS_SCHEMA,
    bridge: {
      owner: "animation",
      clientMethod: "listAnimations",
      endpoint: "/animation/list",
      method: "GET",
      request: "query",
      query: {
        fields: {
          playerPath: {},
          nodePath: {},
          scenePath: {}
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/animation/list",
      handler: "_list_animations",
      arg: "query"
    },
    conformance: {
      happy: "list AnimationPlayer animations in the editor scene or an imported PackedScene",
      error: "report invalid imported scene paths"
    },
    docs: {
      summary: "Lists AnimationPlayer animations in the edited scene or inside an imported PackedScene such as a GLB."
    }
  },
  {
    name: "play_animation",
    description: "Play an AnimationPlayer animation in the visible Godot editor.",
    profile: "full",
    category: "animation",
    inputSchema: PLAY_ANIMATION_SCHEMA,
    bridge: {
      owner: "animation",
      clientMethod: "playAnimation",
      endpoint: "/animation/play",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/animation/play",
      handler: "_play_animation",
      arg: "body",
      methodError: "animation playback requires POST"
    },
    conformance: {
      happy: "play an AnimationPlayer animation",
      error: "reject missing players or unknown animation names"
    },
    docs: {
      summary: "Plays an AnimationPlayer animation in the visible Godot editor."
    }
  },
  {
    name: "stop_animation",
    description: "Stop an AnimationPlayer animation in the visible Godot editor.",
    profile: "full",
    category: "animation",
    inputSchema: STOP_ANIMATION_SCHEMA,
    bridge: {
      owner: "animation",
      clientMethod: "stopAnimation",
      endpoint: "/animation/stop",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/animation/stop",
      handler: "_stop_animation",
      arg: "body",
      methodError: "animation stop requires POST"
    },
    conformance: {
      happy: "stop an AnimationPlayer animation",
      error: "reject missing players"
    },
    docs: {
      summary: "Stops an AnimationPlayer animation in the visible Godot editor."
    }
  },
  {
    name: "get_animation_state",
    description: "Read an AnimationPlayer playback state and available animations.",
    profile: "full",
    category: "animation",
    inputSchema: GET_ANIMATION_STATE_SCHEMA,
    bridge: {
      owner: "animation",
      clientMethod: "getAnimationState",
      endpoint: "/animation/state",
      method: "GET",
      request: "query",
      query: {
        fields: {
          playerPath: {}
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/animation/state",
      handler: "_get_animation_state",
      arg: "query"
    },
    conformance: {
      happy: "read AnimationPlayer playback state",
      error: "reject missing players"
    },
    docs: {
      summary: "Reads AnimationPlayer playback state and available animations."
    }
  },
  {
    name: "instance_animated_scene",
    description: "Instance an imported PackedScene that contains animations into the edited scene and report nested AnimationPlayers.",
    profile: "full",
    category: "animation",
    inputSchema: INSTANCE_ANIMATED_SCENE_SCHEMA,
    bridge: {
      owner: "animation",
      clientMethod: "instanceAnimatedScene",
      endpoint: "/animation/scene/instance",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/animation/scene/instance",
      handler: "_instance_animated_scene",
      arg: "body",
      methodError: "animated scene instance requires POST"
    },
    conformance: {
      happy: "instance an imported PackedScene with animations",
      error: "reject invalid imported scene paths"
    },
    docs: {
      summary: "Instances an imported PackedScene that contains animations."
    }
  },
  {
    name: "create_animation_tree_state_machine",
    description: "Create or update a basic AnimationTree StateMachine wired to an AnimationPlayer.",
    profile: "full",
    category: "animation",
    inputSchema: CREATE_ANIMATION_TREE_STATE_MACHINE_SCHEMA,
    bridge: {
      owner: "animation",
      clientMethod: "createAnimationTreeStateMachine",
      endpoint: "/animation/tree/state-machine",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/animation/tree/state-machine",
      handler: "_create_animation_tree_state_machine",
      arg: "body",
      methodError: "animation tree state machine requires POST"
    },
    conformance: {
      happy: "create or update an AnimationTree StateMachine",
      error: "reject missing players or invalid state definitions"
    },
    docs: {
      summary: "Creates or updates an AnimationTree StateMachine wired to an AnimationPlayer."
    }
  },
  {
    name: "travel_animation_tree",
    description: "Travel an AnimationTree StateMachine playback to a named state.",
    profile: "full",
    category: "animation",
    inputSchema: TRAVEL_ANIMATION_TREE_SCHEMA,
    bridge: {
      owner: "animation",
      clientMethod: "travelAnimationTree",
      endpoint: "/animation/tree/travel",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/animation/tree/travel",
      handler: "_travel_animation_tree",
      arg: "body",
      methodError: "animation tree travel requires POST"
    },
    conformance: {
      happy: "travel an AnimationTree StateMachine playback to a state",
      error: "reject missing trees or unknown states"
    },
    docs: {
      summary: "Travels an AnimationTree StateMachine playback to a named state."
    }
  }
];
