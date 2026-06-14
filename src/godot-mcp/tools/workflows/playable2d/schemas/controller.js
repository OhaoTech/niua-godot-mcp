import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";

import { ACTION_NAMES_SCHEMA } from "./shared.js";

export const CREATE_2D_CHARACTER_CONTROLLER_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "CharacterBody2D node path under the edited scene root."
    },
    scriptPath: {
      type: "string",
      description: "GDScript path under res://. Defaults to res://scripts/<node>_controller_2d.gd."
    },
    className: {
      type: "string",
      description: "Optional GDScript class_name. Defaults to <NodeName>Controller2D."
    },
    moveSpeed: {
      type: "number",
      description: "Horizontal movement speed in pixels per second. Defaults to 360."
    },
    jumpVelocity: {
      type: "number",
      description: "Jump velocity. Defaults to -540."
    },
    gravity: {
      type: "number",
      description: "Gravity applied while airborne. Defaults to 1400."
    },
    overwriteScript: {
      type: "boolean",
      description: "Overwrite the target script if it already exists. Defaults to false."
    },
    validateAfterCreate: {
      type: "boolean",
      description: "Validate the generated script before attaching it. Defaults to true."
    },
    saveScene: {
      type: "boolean",
      description: "Save the current scene after attaching the script. Defaults to true."
    },
    configureInputMap: {
      type: "boolean",
      description: "Create or replace default A/D/space input actions before writing the script. Defaults to true."
    },
    actionNames: ACTION_NAMES_SCHEMA
  },
  required: ["nodePath"],
  additionalProperties: false
};
