import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

export const OUTPUT_LOGS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    projectId: {
      type: "string",
      description: "Optional project process id returned by open_project. When omitted, process logs from all open projects are returned."
    },
    projectRoot: {
      type: "string",
      description: "Optional allowed Godot project root to filter launched editor process logs."
    },
    includeBridge: {
      type: "boolean",
      description: "Read bridge-local logs from the Godot editor plugin. Defaults to true."
    },
    includeProcess: {
      type: "boolean",
      description: "Include stdout/stderr captured from Godot editor processes launched by this MCP server. Defaults to true."
    },
    maxLines: {
      type: "number",
      description: "Maximum recent lines per process stream to return. Defaults to 100."
    }
  },
  additionalProperties: false
};
