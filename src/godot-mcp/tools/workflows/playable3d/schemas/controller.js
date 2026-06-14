import {
  CONNECTION_PROPERTIES
} from "../../../shared/bridge-schema.js";

import { ACTION_NAMES_SCHEMA } from "./shared.js";

export const CREATE_3D_CHARACTER_CONTROLLER_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "CharacterBody3D node path under the edited scene root."
    },
    scriptPath: {
      type: "string",
      description: "GDScript path under res://. Defaults to res://scripts/<node>_controller_3d.gd."
    },
    className: {
      type: "string",
      description: "Optional GDScript class_name. Defaults to <NodeName>Controller3D."
    },
    speed: {
      type: "number",
      description: "Movement speed in meters per second. Defaults to 7."
    },
    jumpVelocity: {
      type: "number",
      description: "Jump velocity. Defaults to 4.5."
    },
    gravity: {
      type: "number",
      description: "Gravity applied while airborne. Defaults to 9.8."
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
      description: "Create or replace default WASD/space input actions before writing the script. Defaults to true."
    },
    actionNames: ACTION_NAMES_SCHEMA
  },
  required: ["nodePath"],
  additionalProperties: false
};
