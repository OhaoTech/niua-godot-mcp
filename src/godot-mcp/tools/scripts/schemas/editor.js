import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";

export const GOTO_SCRIPT_LINE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "GDScript path under res://."
    },
    line: {
      type: "number",
      description: "1-based script line number to focus."
    },
    column: {
      type: "number",
      description: "0-based column to focus. Defaults to 0."
    },
    grabFocus: {
      type: "boolean",
      description: "Whether the script editor should grab focus. Defaults to true."
    }
  },
  required: ["path", "line"],
  additionalProperties: false
};
