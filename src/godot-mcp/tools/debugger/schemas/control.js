import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";

export const DEBUGGER_BREAKPOINT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "GDScript path under res://, for example res://player.gd."
    },
    line: {
      type: "number",
      description: "Godot script line number for the breakpoint."
    },
    enabled: {
      type: "boolean",
      description: "Whether the breakpoint should be enabled. Defaults to true."
    }
  },
  required: ["path", "line"],
  additionalProperties: false
};

export const DEBUGGER_PROFILER_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    profiler: {
      type: "string",
      description: "Godot EngineProfiler name passed to EditorDebuggerSession.toggle_profiler, for example scripts or servers."
    },
    enabled: {
      type: "boolean",
      description: "Whether to enable or disable the debugger profiler."
    },
    data: {
      type: "array",
      description: "Optional profiler toggle data array forwarded to Godot. Defaults to []."
    }
  },
  required: ["profiler", "enabled"],
  additionalProperties: false
};

export const DEBUGGER_MESSAGE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    message: {
      type: "string",
      description: "Debugger message name passed to EditorDebuggerSession.send_message, for example niua_mcp:snapshot."
    },
    data: {
      type: "array",
      description: "Optional debugger message data array forwarded to Godot. Defaults to []."
    },
    activeOnly: {
      type: "boolean",
      description: "Only send to active debugger sessions. Defaults to true."
    }
  },
  required: ["message"],
  additionalProperties: false
};
