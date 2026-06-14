import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const EDITOR_MAIN_SCREEN_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    screen: {
      type: "string",
      description: "Godot editor main screen to activate. Common values are 2D, 3D, Script, Game, and AssetLib."
    }
  },
  required: ["screen"],
  additionalProperties: false
};

export const INVOKE_EDITOR_ACTION_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    action: {
      type: "string",
      enum: [
        "set_distraction_free_mode",
        "select_file",
        "filesystem_scan",
        "filesystem_scan_sources",
        "filesystem_update_file",
        "reload_scene_from_path",
        "save_scene",
        "save_all_scenes",
        "mark_scene_as_unsaved",
        "set_movie_maker_enabled"
      ],
      description: "Allowlisted Godot editor action to invoke."
    },
    params: {
      type: "object",
      description: "Action-specific parameters. Path parameters must be res:// paths and are validated by the Godot bridge.",
      additionalProperties: true
    }
  },
  required: ["action"],
  additionalProperties: false
};
