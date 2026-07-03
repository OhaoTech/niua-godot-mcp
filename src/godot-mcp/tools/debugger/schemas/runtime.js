import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";
import { SAVE_PATH_PROPERTY } from "../../shared/screenshot-io.js";

export const RUNTIME_EVENTS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    limit: {
      type: "integer",
      description: "Maximum runtime/debugger events to return. Defaults to 100 and is capped by the editor bridge."
    },
    kinds: {
      type: "array",
      items: { type: "string" },
      description: "Optional event kind filter, for example ['session_started', 'runtime_state']."
    },
    sinceMsec: {
      type: "number",
      description: "Only return events with timeMsec greater than this value. Defaults to -1, meaning no lower bound."
    }
  },
  additionalProperties: false
};

export const RUNTIME_NODE_PROPERTIES_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Runtime node path, for example /root/Player. Defaults to /root."
    },
    properties: {
      type: "array",
      items: { type: "string" },
      description: "Optional property-name allowlist, for example [\"hp\", \"score\"]. When set, only matching properties are returned instead of the full ~100-entry dump; totalPropertyCount reports the unfiltered count."
    },
    timeoutMsec: {
      type: "number",
      description: "How long the MCP client should poll for the debugger response. Defaults to 3000."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between runtime property polling requests. Defaults to 100."
    }
  },
  additionalProperties: false
};

export const SET_RUNTIME_NODE_PROPERTY_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Runtime node path, for example /root/Player."
    },
    property: {
      type: "string",
      description: "Runtime node property name to set, for example visible or name."
    },
    value: {
      description: "JSON value to set. Typed values may use { type: 'Vector3', x, y, z }, { type: 'Color', r, g, b, a }, or { type: 'NodePath', path }."
    },
    timeoutMsec: {
      type: "number",
      description: "How long the MCP client should poll for the debugger response. Defaults to 3000."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between runtime property polling requests. Defaults to 100."
    }
  },
  required: ["nodePath", "property", "value"],
  additionalProperties: false
};

export const RUNTIME_SCREENSHOT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    ...SAVE_PATH_PROPERTY,
    timeoutMsec: {
      type: "number",
      description: "How long the MCP client should poll for the runtime screenshot response. Defaults to 3000."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between runtime screenshot polling requests. Defaults to 100."
    }
  },
  additionalProperties: false
};

export const SEND_RUNTIME_INPUT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    actions: {
      type: "array",
      description: "Input-map actions to press or release in the running game, for example [{ action: \"move_forward\", pressed: true }]. Each action must already exist in the project input map.",
      items: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "Input-map action name, for example move_forward or jump."
          },
          pressed: {
            type: "boolean",
            description: "true calls Input.action_press(action, strength); false calls Input.action_release(action)."
          },
          strength: {
            type: "number",
            description: "Press strength between 0.0 and 1.0. Defaults to 1.0. Ignored when pressed is false."
          }
        },
        required: ["action", "pressed"],
        additionalProperties: false
      }
    },
    holdMs: {
      type: "number",
      description: "When set, press the actions, wait this many milliseconds, then release the pressed actions (a timed tap). Omit to leave the press/release states applied so the caller can release them in a later call. Set timeoutMsec above holdMs so the tap completes before the poll deadline."
    },
    mouseMotion: {
      type: "object",
      description: "Relative mouse-look motion fed via Input.parse_input_event as an InputEventMouseMotion with relative = Vector2(dx, dy).",
      properties: {
        dx: {
          type: "number",
          description: "Relative horizontal motion in pixels."
        },
        dy: {
          type: "number",
          description: "Relative vertical motion in pixels."
        }
      },
      required: ["dx", "dy"],
      additionalProperties: false
    },
    timeoutMsec: {
      type: "number",
      description: "How long the MCP client should poll for the runtime input response. Defaults to 3000."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between runtime input polling requests. Defaults to 100."
    }
  },
  additionalProperties: false
};
