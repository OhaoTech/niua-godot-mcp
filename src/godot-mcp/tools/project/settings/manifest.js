import {
  INPUT_MAP_SCHEMA,
  PROJECT_SETTINGS_SCHEMA,
  SET_INPUT_ACTION_SCHEMA,
  SET_PROJECT_SETTING_METADATA_SCHEMA,
  SET_PROJECT_SETTING_SCHEMA
} from "./schemas.js";

export const PROJECT_SETTINGS_TOOL_MANIFEST = [
  {
    name: "get_project_settings",
    description: "Read Godot Project Settings values, category tree, usage flags, and editor metadata, optionally filtered by prefix.",
    profile: "full",
    tier: "standard",
    category: "project-settings",
    inputSchema: PROJECT_SETTINGS_SCHEMA,
    bridge: {
      clientMethod: "getProjectSettings",
      endpoint: "/project/settings",
      method: "GET",
      request: "query",
      query: {
        fields: {
          prefix: { default: "" },
          query: { omitEmpty: true },
          editorVisible: { type: "boolean" },
          basic: { type: "boolean" },
          internal: { type: "boolean" },
          restartIfChanged: { type: "boolean" }
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/project/settings",
      handler: "_project_settings",
      arg: "query"
    },
    conformance: {
      happy: "read filtered project settings",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads Project Settings values, category tree, usage flags, and editor metadata."
    }
  },
  {
    name: "set_project_setting",
    description: "Set a Godot Project Settings value and optionally save project.godot.",
    profile: "full",
    tier: "standard",
    category: "project-settings",
    inputSchema: SET_PROJECT_SETTING_SCHEMA,
    bridge: {
      clientMethod: "setProjectSetting",
      endpoint: "/project/setting/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/project/setting/set",
      handler: "_set_project_setting",
      arg: "body",
      methodError: "project setting update requires POST"
    },
    conformance: {
      happy: "set and optionally save a project setting",
      error: "reject missing ProjectSettings key"
    },
    docs: {
      summary: "Sets a Project Settings value and optionally saves project.godot."
    }
  },
  {
    name: "set_project_setting_metadata",
    description: "Update Godot Project Settings metadata such as order, initial value, basic/internal visibility, and restart-required flags.",
    profile: "full",
    tier: "standard",
    category: "project-settings",
    inputSchema: SET_PROJECT_SETTING_METADATA_SCHEMA,
    bridge: {
      clientMethod: "setProjectSettingMetadata",
      endpoint: "/project/setting/metadata/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/project/setting/metadata/set",
      handler: "_set_project_setting_metadata",
      arg: "body",
      methodError: "project setting metadata update requires POST"
    },
    conformance: {
      happy: "set metadata for a project setting",
      error: "reject missing ProjectSettings key"
    },
    docs: {
      summary: "Updates Project Settings metadata such as order and visibility flags."
    }
  },
  {
    name: "get_input_map",
    description: "Read Godot Input Map actions and supported event bindings.",
    profile: "full",
    tier: "standard",
    category: "project-settings",
    inputSchema: INPUT_MAP_SCHEMA,
    bridge: {
      clientMethod: "getInputMap",
      endpoint: "/input/map",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/input/map",
      handler: "_input_map",
      arg: "none"
    },
    conformance: {
      happy: "read input map actions",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads Godot Input Map actions and supported event bindings."
    }
  },
  {
    name: "set_input_action",
    description: "Create or replace a Godot Input Map action with keyboard or joypad button events.",
    profile: "full",
    tier: "standard",
    category: "project-settings",
    inputSchema: SET_INPUT_ACTION_SCHEMA,
    bridge: {
      clientMethod: "setInputAction",
      endpoint: "/input/action/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/input/action/set",
      handler: "_set_input_action",
      arg: "body",
      methodError: "input action update requires POST"
    },
    conformance: {
      happy: "create or replace an input action",
      error: "reject missing input action name"
    },
    docs: {
      summary: "Creates or replaces an Input Map action with supported event bindings."
    }
  }
];
