import { BRIDGE_INPUT_SCHEMA } from "../shared/bridge-schema.js";
import {
  CALL_RUNTIME_NODE_METHOD_SCHEMA,
  DEBUGGER_BREAKPOINT_SCHEMA,
  DEBUGGER_MESSAGE_SCHEMA,
  DEBUGGER_PROFILER_SCHEMA,
  INSTALL_RUNTIME_PROBE_SCHEMA,
  RUNTIME_EVENTS_SCHEMA,
  RUNTIME_NODE_PROPERTIES_SCHEMA,
  RUNTIME_SCREENSHOT_SCHEMA,
  RUNTIME_STATE_SCHEMA,
  SEND_RUNTIME_INPUT_SCHEMA,
  SET_RUNTIME_NODE_PROPERTY_SCHEMA
} from "./schemas.js";

export const DEBUGGER_CONTROL_TOOL_MANIFEST = [
  {
    name: "get_debugger_state",
    stability: "experimental",
    description: "Read Godot debugger-panel state: sessions, breakpoints, recent debugger events, and performance monitors.",
    profile: "full",
    tier: "standard",
    category: "debugger",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      clientMethod: "getDebuggerState",
      endpoint: "/debugger/state",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/debugger/state",
      handler: "_debugger_state",
      arg: "none"
    },
    conformance: {
      happy: "read debugger panel state",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads debugger sessions, breakpoints, events, and performance monitors."
    }
  },
  {
    name: "set_debugger_breakpoint",
    stability: "experimental",
    description: "Set or clear a Godot debugger breakpoint in a GDScript file.",
    profile: "full",
    tier: "standard",
    category: "debugger",
    inputSchema: DEBUGGER_BREAKPOINT_SCHEMA,
    bridge: {
      clientMethod: "setDebuggerBreakpoint",
      endpoint: "/debugger/breakpoint/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/debugger/breakpoint/set",
      handler: "_set_debugger_breakpoint",
      arg: "body",
      methodError: "debugger breakpoint update requires POST"
    },
    conformance: {
      happy: "set or clear a script breakpoint",
      error: "reject missing script path or line"
    },
    docs: {
      summary: "Sets or clears a debugger breakpoint in a GDScript file."
    }
  },
  {
    name: "toggle_debugger_profiler",
    stability: "experimental",
    description: "Enable or disable a Godot debugger profiler on active editor debugger sessions.",
    profile: "full",
    tier: "standard",
    category: "debugger",
    inputSchema: DEBUGGER_PROFILER_SCHEMA,
    bridge: {
      clientMethod: "toggleDebuggerProfiler",
      endpoint: "/debugger/profiler/toggle",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/debugger/profiler/toggle",
      handler: "_toggle_debugger_profiler",
      arg: "body",
      methodError: "debugger profiler toggle requires POST"
    },
    conformance: {
      happy: "toggle a debugger profiler",
      error: "reject missing profiler name"
    },
    docs: {
      summary: "Enables or disables a debugger profiler on active sessions."
    }
  },
  {
    name: "send_debugger_message",
    stability: "experimental",
    description: "Send a low-level Godot debugger message to editor debugger sessions through the public debugger API.",
    profile: "full",
    tier: "standard",
    category: "debugger",
    inputSchema: DEBUGGER_MESSAGE_SCHEMA,
    bridge: {
      clientMethod: "sendDebuggerMessage",
      endpoint: "/debugger/message/send",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/debugger/message/send",
      handler: "_send_debugger_message",
      arg: "body",
      methodError: "debugger message send requires POST"
    },
    conformance: {
      happy: "send a debugger message to active sessions",
      error: "reject missing debugger message name"
    },
    docs: {
      summary: "Sends a low-level debugger message through the public debugger API."
    }
  }
];

export const DEBUGGER_RUNTIME_TOOL_MANIFEST = [
  {
    name: "install_runtime_probe",
    description: "Enable the NIUA runtime probe as a Godot autoload for runtime inspection workflows.",
    profile: "v1",
    tier: "essential",
    category: "debugger",
    inputSchema: INSTALL_RUNTIME_PROBE_SCHEMA,
    bridge: {
      clientMethod: "installRuntimeProbe",
      endpoint: "/runtime/probe/install",
      method: "POST",
      request: "body",
      generate: false
    },
    godotRoute: {
      side: "write",
      endpoint: "/runtime/probe/install",
      handler: "_install_runtime_probe",
      arg: "body",
      methodError: "runtime probe install requires POST"
    },
    conformance: {
      happy: "install the runtime probe autoload into the project",
      error: "reject invalid project or runtime probe install payloads"
    },
    docs: {
      summary: "Enables the NIUA runtime probe as a Godot autoload for runtime inspection workflows."
    }
  },
  {
    name: "get_runtime_state",
    description: "Read a FRESH runtime scene-tree snapshot from the running game: the call requests a snapshot and polls until the probe answers (pending: false, sessions[].runtimeState.kind == \"snapshot\"), so the returned tree is current truth rather than a cached earlier state. Pass maxDepth to keep large runtime trees shallow (truncated nodes report childrenTruncated) and pathFilter to serialize only the subtree rooted at a live node path.",
    profile: "full",
    tier: "essential",
    category: "debugger",
    inputSchema: RUNTIME_STATE_SCHEMA,
    bridge: {
      clientMethod: "getRuntimeState",
      endpoint: "/runtime/state",
      method: "GET",
      request: "query",
      generate: false,
      query: {
        fields: {
          maxDepth: {},
          pathFilter: { omitEmpty: true }
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/runtime/state",
      handler: "_runtime_state",
      arg: "query"
    },
    conformance: {
      happy: "read the latest runtime scene-tree snapshot",
      error: "return unavailable runtime state when the probe has not captured data"
    },
    docs: {
      summary: "Reads runtime scene-tree state captured from NIUA runtime probe debugger messages."
    }
  },
  {
    name: "get_runtime_events",
    description: "Read filtered runtime/debugger events captured by the NIUA Godot debugger probe without requesting a fresh runtime snapshot.",
    profile: "v1",
    tier: "essential",
    category: "debugger",
    inputSchema: RUNTIME_EVENTS_SCHEMA,
    bridge: {
      clientMethod: "getRuntimeEvents",
      endpoint: "/runtime/events",
      method: "GET",
      request: "query",
      generate: false,
      query: {
        fields: {
          limit: {},
          kinds: {
            array: "csv",
            trim: true
          },
          sinceMsec: {}
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/runtime/events",
      handler: "_runtime_events",
      arg: "query"
    },
    conformance: {
      happy: "read filtered runtime debugger events",
      error: "return an empty event list when no matching runtime events exist"
    },
    docs: {
      summary: "Reads filtered runtime/debugger events captured by the NIUA Godot debugger probe."
    }
  },
  {
    name: "get_runtime_node_properties",
    description: "Inspect runtime node properties from the running Godot game through the NIUA runtime probe. Pass properties: [\"hp\", \"score\"] to return only those properties instead of the full ~100-entry dump.",
    profile: "full",
    tier: "essential",
    category: "debugger",
    inputSchema: RUNTIME_NODE_PROPERTIES_SCHEMA,
    bridge: {
      clientMethod: "getRuntimeNodeProperties",
      endpoint: "/runtime/node/properties",
      method: "GET",
      request: "query",
      generate: false,
      query: {
        fields: {
          nodePath: {
            default: "/root"
          },
          refresh: {
            default: true,
            type: "boolean"
          },
          requestId: {}
        }
      }
    },
    adapter: {
      handler: "getRuntimeNodeProperties"
    },
    godotRoute: {
      side: "read",
      endpoint: "/runtime/node/properties",
      handler: "_runtime_node_properties",
      arg: "query"
    },
    conformance: {
      happy: "read properties from a runtime node through the probe",
      error: "surface timeout or missing node failures"
    },
    docs: {
      summary: "Inspects runtime node properties from the running Godot game through the NIUA runtime probe."
    }
  },
  {
    name: "set_runtime_node_property",
    description: "Set a live runtime node property in the running Godot game through the NIUA runtime probe.",
    profile: "full",
    tier: "essential",
    category: "debugger",
    inputSchema: SET_RUNTIME_NODE_PROPERTY_SCHEMA,
    bridge: {
      clientMethod: "setRuntimeNodeProperty",
      endpoint: "/runtime/node/property/set",
      method: "POST",
      request: "body",
      generate: false
    },
    godotRoute: {
      side: "write",
      endpoint: "/runtime/node/property/set",
      handler: "_set_runtime_node_property",
      arg: "body",
      methodError: "runtime node property set requires POST"
    },
    conformance: {
      happy: "set a live runtime node property through the probe",
      error: "surface timeout, missing node, or invalid property failures"
    },
    docs: {
      summary: "Sets a live runtime node property in the running Godot game through the NIUA runtime probe."
    }
  },
  {
    name: "capture_runtime_screenshot",
    description: "Capture a PNG screenshot from the running Godot game through the NIUA runtime probe. Pass savePath to write the PNG to disk and keep large base64 payloads out of the tool result. Returns available=false when the runtime renderer cannot expose pixels, such as headless mode.",
    profile: "v1",
    tier: "essential",
    category: "debugger",
    inputSchema: RUNTIME_SCREENSHOT_SCHEMA,
    bridge: {
      clientMethod: "captureRuntimeScreenshot",
      endpoint: "/runtime/screenshot",
      method: "POST",
      request: "body",
      generate: false
    },
    adapter: {
      handler: "captureRuntimeScreenshot"
    },
    godotRoute: {
      side: "write",
      endpoint: "/runtime/screenshot",
      handler: "_capture_runtime_screenshot",
      arg: "body",
      methodError: "runtime screenshot requires POST"
    },
    conformance: {
      happy: "capture a runtime screenshot through the probe",
      error: "return available=false or timeout when runtime pixels are unavailable"
    },
    docs: {
      summary: "Captures a PNG screenshot from the running Godot game through the NIUA runtime probe."
    }
  },
  {
    name: "send_runtime_input",
    description: "Inject input into the running Godot game through the NIUA runtime probe: press or release input-map actions (for example move_forward, jump) with an optional timed hold, send raw key events (for games that check physical keycodes directly — restart keys, menu shortcuts), click mouse buttons at viewport positions, and feed relative mouse-look motion. Lets an agent script a playthrough and verify gameplay without a human.",
    profile: "full",
    tier: "essential",
    category: "debugger",
    inputSchema: SEND_RUNTIME_INPUT_SCHEMA,
    bridge: {
      clientMethod: "sendRuntimeInput",
      endpoint: "/runtime/input/send",
      method: "POST",
      request: "body",
      generate: false
    },
    godotRoute: {
      side: "write",
      endpoint: "/runtime/input/send",
      handler: "_send_runtime_input",
      arg: "body",
      methodError: "runtime input send requires POST"
    },
    conformance: {
      happy: "inject runtime input-map actions, raw key events, and mouse motion through the probe",
      error: "reject unknown input actions and surface timeouts when the runtime probe is unavailable"
    },
    docs: {
      summary: "Injects input-map actions, raw key and mouse-button events, and mouse-look motion into the running Godot game through the NIUA runtime probe."
    }
  },
  {
    name: "call_runtime_node_method",
    description: "Call a method on a live node in the running Godot game through the NIUA runtime probe (node.callv). Completes the runtime verification surface: read properties + write properties + inject input + call methods. The node must exist and expose the method; the return value is serialized back (Objects as class name + path only).",
    profile: "v1",
    tier: "essential",
    category: "debugger",
    inputSchema: CALL_RUNTIME_NODE_METHOD_SCHEMA,
    bridge: {
      clientMethod: "callRuntimeNodeMethod",
      endpoint: "/runtime/node/method/call",
      method: "POST",
      request: "body",
      generate: false
    },
    godotRoute: {
      side: "write",
      endpoint: "/runtime/node/method/call",
      handler: "_call_runtime_node_method",
      arg: "body",
      methodError: "runtime node method call requires POST"
    },
    conformance: {
      happy: "call a method on a live runtime node through the probe and return its result",
      error: "surface timeout, missing node, or unknown method failures with a recovery hint"
    },
    docs: {
      summary: "Calls a method on a live node in the running Godot game through the NIUA runtime probe."
    }
  }
];

export const DEBUGGER_TOOL_MANIFEST = [
  ...DEBUGGER_CONTROL_TOOL_MANIFEST,
  ...DEBUGGER_RUNTIME_TOOL_MANIFEST
];
