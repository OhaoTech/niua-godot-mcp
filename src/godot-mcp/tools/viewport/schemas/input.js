import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";
import { VIEWPORT_TARGET_PROPERTIES } from "./shared.js";

export const VIEWPORT_INPUT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    viewport: VIEWPORT_TARGET_PROPERTIES.viewport.receiveInput,
    index: VIEWPORT_TARGET_PROPERTIES.index,
    local: {
      type: "boolean",
      description: "When true, pointer positions are already in viewport coordinates. Defaults to true."
    },
    notifyMouseEntered: {
      type: "boolean",
      description: "Call Viewport.notify_mouse_entered before sending events. Defaults to true."
    },
    updateMouseCursorState: {
      type: "boolean",
      description: "Call Viewport.update_mouse_cursor_state after sending events. Defaults to true."
    },
    events: {
      type: "array",
      minItems: 1,
      description: "Pointer event specs. Supports mouse_motion, mouse_button, mouse_click, and mouse_drag.",
      items: {
        type: "object",
        additionalProperties: true
      }
    }
  },
  required: ["events"],
  additionalProperties: false
};
