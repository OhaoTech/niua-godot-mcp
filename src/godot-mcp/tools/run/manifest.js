import { BRIDGE_INPUT_SCHEMA, CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

const RUN_CONTROL_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    saveBeforeRun: {
      type: "boolean",
      description: "Save all open scenes before starting play. Defaults to false."
    }
  },
  additionalProperties: false
};

const RUN_CUSTOM_SCENE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot scene path to run, for example res://scenes/smoke.tscn."
    },
    saveBeforeRun: {
      type: "boolean",
      description: "Save all open scenes before starting play. Defaults to false."
    }
  },
  required: ["path"],
  additionalProperties: false
};

const SET_MAIN_SCENE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot scene path under res:// to store as application/run/main_scene."
    },
    save: {
      type: "boolean",
      description: "Save project.godot after updating the main scene. Defaults to true."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export const RUN_TOOL_MANIFEST = [
  {
    name: "get_run_settings",
    description: "Read Godot run settings such as the configured main scene.",
    profile: "v1",
    tier: "essential",
    category: "run",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      clientMethod: "getRunSettings",
      endpoint: "/run/settings",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/run/settings",
      handler: "_run_settings",
      arg: "none"
    },
    conformance: {
      happy: "read configured run settings from the editor",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads run settings such as the configured main scene."
    }
  },
  {
    name: "set_main_scene",
    description: "Set application/run/main_scene to a scene path through the visible Godot editor bridge.",
    profile: "full",
    tier: "essential",
    category: "run",
    inputSchema: SET_MAIN_SCENE_SCHEMA,
    bridge: {
      clientMethod: "setMainScene",
      endpoint: "/run/main-scene/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/run/main-scene/set",
      handler: "_set_main_scene",
      arg: "body",
      methodError: "main scene update requires POST"
    },
    conformance: {
      happy: "set the project main scene through the editor",
      error: "reject missing scene path"
    },
    docs: {
      summary: "Sets application/run/main_scene through the editor bridge."
    }
  },
  {
    name: "get_run_status",
    description: "Read whether the Godot editor is currently playing a scene.",
    profile: "full",
    tier: "essential",
    category: "run",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      clientMethod: "getRunStatus",
      endpoint: "/run/status",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/run/status",
      handler: "_run_status",
      arg: "none"
    },
    conformance: {
      happy: "read whether the editor is currently playing a scene",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads editor play state and the currently playing scene."
    }
  },
  {
    name: "run_main_scene",
    description: "Run the project's main scene from the visible Godot editor.",
    profile: "full",
    tier: "essential",
    category: "run",
    inputSchema: RUN_CONTROL_SCHEMA,
    bridge: {
      clientMethod: "runMainScene",
      endpoint: "/run/main",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/run/main",
      handler: "_run_main_scene",
      arg: "body",
      methodError: "run main scene requires POST"
    },
    conformance: {
      happy: "start the configured main scene",
      error: "return an editor error when no main scene is configured"
    },
    docs: {
      summary: "Runs the configured main scene from the visible editor."
    }
  },
  {
    name: "run_current_scene",
    description: "Run the currently edited scene from the visible Godot editor.",
    profile: "full",
    tier: "standard",
    category: "run",
    inputSchema: RUN_CONTROL_SCHEMA,
    bridge: {
      clientMethod: "runCurrentScene",
      endpoint: "/run/current",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/run/current",
      handler: "_run_current_scene",
      arg: "body",
      methodError: "run current scene requires POST"
    },
    conformance: {
      happy: "start the currently edited scene",
      error: "return an editor error when no scene is open"
    },
    docs: {
      summary: "Runs the currently edited scene from the visible editor."
    }
  },
  {
    name: "run_custom_scene",
    description: "Run a specific scene path from the visible Godot editor.",
    profile: "v1",
    tier: "essential",
    category: "run",
    inputSchema: RUN_CUSTOM_SCENE_SCHEMA,
    bridge: {
      clientMethod: "runCustomScene",
      endpoint: "/run/custom",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/run/custom",
      handler: "_run_custom_scene",
      arg: "body",
      methodError: "run custom scene requires POST"
    },
    conformance: {
      happy: "start a specific scene path",
      error: "reject missing scene path"
    },
    docs: {
      summary: "Runs a specific scene path from the visible editor."
    }
  },
  {
    name: "stop_running_scene",
    description: "Stop the scene currently playing from the Godot editor.",
    profile: "full",
    tier: "essential",
    category: "run",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      clientMethod: "stopRunningScene",
      endpoint: "/run/stop",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/run/stop",
      handler: "_stop_running_scene",
      arg: "none",
      methodError: "stop running scene requires POST"
    },
    conformance: {
      happy: "stop the currently playing scene",
      error: "return a no-op success when nothing is playing"
    },
    docs: {
      summary: "Stops the scene currently playing from the editor."
    }
  },
  {
    name: "reload_running_scene",
    description: "Reload the currently running Godot scene by stopping playback and starting the same scene again.",
    profile: "full",
    tier: "standard",
    category: "run",
    inputSchema: RUN_CONTROL_SCHEMA,
    bridge: {
      clientMethod: "reloadRunningScene",
      endpoint: "/run/reload",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/run/reload",
      handler: "_reload_running_scene",
      arg: "body",
      methodError: "reload running scene requires POST"
    },
    conformance: {
      happy: "reload the currently playing scene",
      error: "return an editor error when no scene is playing"
    },
    docs: {
      summary: "Reloads the currently running scene."
    }
  }
];
