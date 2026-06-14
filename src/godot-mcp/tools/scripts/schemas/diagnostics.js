export const SCRIPT_DIAGNOSTICS_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Filesystem path for the Godot project. Must be inside GODOT_MCP_ALLOWED_PROJECT_ROOTS, or repo runs/ by default."
    },
    path: {
      type: "string",
      description: "GDScript path under res:// to parse, for example res://scripts/player.gd."
    },
    timeoutMs: {
      type: "number",
      description: "Godot parser timeout in milliseconds. Defaults to 10000."
    }
  },
  required: ["projectRoot", "path"],
  additionalProperties: false
};

export const PROJECT_SCRIPT_DIAGNOSTICS_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Filesystem path for the Godot project. Must be inside GODOT_MCP_ALLOWED_PROJECT_ROOTS, or repo runs/ by default."
    },
    rootPath: {
      type: "string",
      description: "Directory under res:// to scan recursively when paths is omitted. Defaults to res://."
    },
    paths: {
      type: "array",
      items: { type: "string" },
      description: "Optional explicit GDScript paths under res:// to diagnose."
    },
    maxScripts: {
      type: "integer",
      description: "Maximum number of scripts to diagnose. Defaults to 100 and is capped at 500."
    },
    timeoutMs: {
      type: "number",
      description: "Godot parser timeout in milliseconds per script. Defaults to 10000."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};
