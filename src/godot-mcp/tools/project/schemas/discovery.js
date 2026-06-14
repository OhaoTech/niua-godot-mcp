export const DISCOVER_PROJECTS_SCHEMA = {
  type: "object",
  properties: {
    roots: {
      type: "array",
      description: "Optional filesystem roots to scan. Every root must be inside GODOT_MCP_ALLOWED_PROJECT_ROOTS.",
      items: {
        type: "string"
      }
    },
    maxDepth: {
      type: "number",
      description: "Maximum directory depth to scan under each root. Defaults to 4 and is clamped to 1..8."
    },
    remember: {
      type: "boolean",
      description: "Persist discovered projects in the local NIUA project registry with source discovered. Defaults to false."
    }
  },
  additionalProperties: false
};

export const DISCOVER_EDITOR_BRIDGES_SCHEMA = {
  type: "object",
  properties: {
    host: {
      type: "string",
      description: "Local Godot bridge host to probe. Defaults to GODOT_MCP_HOST or 127.0.0.1."
    },
    ports: {
      type: "array",
      description: "Explicit bridge ports to probe. Defaults to GODOT_MCP_DISCOVERY_PORTS or 9174..9194.",
      items: {
        type: "number"
      }
    },
    startPort: {
      type: "number",
      description: "First bridge port to probe when ports is omitted. Defaults to 9174."
    },
    endPort: {
      type: "number",
      description: "Last bridge port to probe when ports is omitted. Defaults to 9194."
    },
    timeoutMs: {
      type: "number",
      description: "Per-request timeout in milliseconds. Defaults to 500."
    },
    includeUnavailable: {
      type: "boolean",
      description: "Return failed probe diagnostics. Defaults to false."
    }
  },
  additionalProperties: false
};

export const LIST_SCENES_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Allowlisted Godot project root to scan for scene files."
    },
    rootPath: {
      type: "string",
      description: "res:// directory to scan. Defaults to res://."
    },
    recursive: {
      type: "boolean",
      description: "Scan nested directories. Defaults to true."
    },
    maxScenes: {
      type: "number",
      description: "Maximum scene files to return. Defaults to 500."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};
