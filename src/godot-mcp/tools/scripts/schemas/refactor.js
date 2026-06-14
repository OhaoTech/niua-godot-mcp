import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";

export const REPLACE_IN_SCRIPTS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    search: {
      type: "string",
      description: "Literal text to search for in GDScript files. Regex is not supported."
    },
    replacement: {
      type: "string",
      description: "Literal replacement text."
    },
    paths: {
      type: "array",
      items: { type: "string" },
      description: "Optional explicit GDScript paths under res://. When omitted, the bridge scans rootPath recursively."
    },
    rootPath: {
      type: "string",
      description: "Directory under res:// to scan when paths is omitted. Defaults to res://."
    },
    caseSensitive: {
      type: "boolean",
      description: "Use case-sensitive literal matching. Defaults to true."
    },
    dryRun: {
      type: "boolean",
      description: "Preview changes without writing files. Defaults to true."
    },
    maxFiles: {
      type: "integer",
      description: "Maximum scripts to scan. Clamped by the bridge. Defaults to 200."
    },
    maxReplacements: {
      type: "integer",
      description: "Maximum replacements allowed before the operation aborts. Defaults to 1000."
    }
  },
  required: ["search", "replacement"],
  additionalProperties: false
};
