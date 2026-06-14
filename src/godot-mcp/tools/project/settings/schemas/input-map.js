import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";

export const INPUT_MAP_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES
  },
  additionalProperties: false
};

export const SET_INPUT_ACTION_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    name: {
      type: "string",
      description: "Input action name."
    },
    deadzone: {
      type: "number",
      description: "Input action deadzone. Defaults to 0.2."
    },
    replace: {
      type: "boolean",
      description: "Clear existing events before adding supplied events. Defaults to true."
    },
    events: {
      type: "array",
      description: "Input event specs. Supports Input Map assignable events: { type: 'key' }, { type: 'action' }, { type: 'mouse_button' }, { type: 'joypad_button' }, and { type: 'joypad_motion' }."
    },
    save: {
      type: "boolean",
      description: "Save project.godot after updating the action. Defaults to true."
    }
  },
  required: ["name"],
  additionalProperties: false
};
