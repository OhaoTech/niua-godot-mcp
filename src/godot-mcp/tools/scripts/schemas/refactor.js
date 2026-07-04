import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";

export const SEARCH_IN_SCRIPTS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    query: {
      type: "string",
      description: "Text to find in .gd files. Plain text unless regex is true."
    },
    regex: {
      type: "boolean",
      description: "Treat query as a Godot RegEx pattern. Invalid patterns fail naming the pattern. Defaults to false."
    },
    pathPrefix: {
      type: "string",
      description: "res:// directory to search. Defaults to res://."
    },
    exclude: {
      type: "array",
      items: { type: "string" },
      description: "Path substrings to skip, such as [\"addons\", \".godot\"]."
    },
    maxResults: {
      type: "integer",
      description: "Maximum matches returned. Defaults to 50, capped at 200; truncated:true when hit."
    },
    caseSensitive: {
      type: "boolean",
      description: "Case-sensitive matching. Defaults to false."
    }
  },
  required: ["query"],
  additionalProperties: false
};

export const EDIT_SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "GDScript path under res:// to edit."
    },
    oldText: {
      type: "string",
      description: "Exact text to replace, including whitespace."
    },
    newText: {
      type: "string",
      description: "Replacement text. Must differ from oldText."
    },
    replaceAll: {
      type: "boolean",
      description: "Replace every occurrence. Defaults to false; oldText must then be unique."
    },
    validate: {
      type: "boolean",
      description: "Parse-check the edited script after writing. Defaults to true."
    }
  },
  required: ["path", "oldText", "newText"],
  additionalProperties: false
};

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
