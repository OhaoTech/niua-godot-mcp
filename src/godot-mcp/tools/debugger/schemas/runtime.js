import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";
import { SAVE_PATH_PROPERTY } from "../../shared/screenshot-io.js";

export const RUNTIME_STATE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    maxDepth: {
      type: "number",
      description: "Maximum runtime tree depth to return. 0 or omitted means the full tree (up to the probe's internal cap); truncated nodes report childrenTruncated."
    },
    pathFilter: {
      type: "string",
      description: "Only serialize the runtime subtree rooted at this live node path, for example /root/Player. An unknown path reports an error in the snapshot naming get_runtime_node_properties."
    },
    timeoutMsec: {
      type: "number",
      description: "How long to poll for the freshly requested snapshot before returning. Defaults to 3000. On timeout the response reports pending: true and the sessions still hold the previous snapshot."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between snapshot result polling requests. Defaults to 100."
    }
  },
  additionalProperties: false
};

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

export const CALL_RUNTIME_NODE_METHOD_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Runtime node path, for example /root/Player."
    },
    method: {
      type: "string",
      description: "Method to invoke on the runtime node, for example reset_score or take_damage. The node must expose it (node.has_method); unknown methods fail with a hint."
    },
    args: {
      type: "array",
      description: "Positional arguments passed to node.callv. Plain JSON scalars, arrays, and objects pass through; typed values may use { type: 'Vector2'|'Vector3'|'Color'|'NodePath', ... } wrappers. Defaults to [].",
      items: {
        description: "One positional argument: a JSON value or a typed wrapper object."
      }
    },
    timeoutMsec: {
      type: "number",
      description: "How long the MCP client should poll for the debugger response. Defaults to 3000."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between runtime method call polling requests. Defaults to 100."
    }
  },
  required: ["nodePath", "method"],
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
    keys: {
      type: "array",
      description: "Raw keyboard events fed via Input.parse_input_event as InputEventKey, for games that check keys directly (Input.is_physical_key_pressed, match event.physical_keycode) instead of input-map actions. Use physicalKeycode for layout-independent game keys (the common case); keycode targets the logical key. Godot key constants, for example R = 82, F1 = 4194332.",
      items: {
        type: "object",
        properties: {
          keycode: {
            type: "integer",
            description: "Logical Key constant to stamp on the event. At least one of keycode or physicalKeycode is required."
          },
          physicalKeycode: {
            type: "integer",
            description: "Physical Key constant to stamp on the event — what Input.is_physical_key_pressed and physical-key bindings check."
          },
          pressed: {
            type: "boolean",
            description: "true sends a key-down event; false sends the matching key-up."
          }
        },
        required: ["pressed"],
        additionalProperties: false
      }
    },
    mouseButtons: {
      type: "array",
      description: "Mouse button events fed via Input.parse_input_event as InputEventMouseButton. Pass position to click at a viewport point (UI buttons route by position).",
      items: {
        type: "object",
        properties: {
          button: {
            type: "string",
            enum: ["left", "right", "middle", "wheel_up", "wheel_down"],
            description: "Which mouse button the event carries."
          },
          pressed: {
            type: "boolean",
            description: "true sends button-down; false sends button-up. Send both for a full click."
          },
          position: {
            type: "object",
            description: "Viewport position for the event in pixels. Omit for position-independent checks.",
            properties: {
              x: { type: "number" },
              y: { type: "number" }
            },
            required: ["x", "y"],
            additionalProperties: false
          }
        },
        required: ["button", "pressed"],
        additionalProperties: false
      }
    },
    holdMs: {
      type: "number",
      description: "When set, press the actions and keys, wait this many milliseconds, then release what was pressed (a timed tap). Omit to leave the press/release states applied so the caller can release them in a later call. Set timeoutMsec above holdMs so the tap completes before the poll deadline."
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
