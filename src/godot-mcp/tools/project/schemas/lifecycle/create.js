export const CREATE_PROJECT_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Filesystem path for the Godot project. Must be inside GODOT_MCP_ALLOWED_PROJECT_ROOTS, or repo runs/ by default."
    },
    name: {
      type: "string",
      description: "Godot project display name. Defaults to the project directory name."
    },
    installAddon: {
      type: "boolean",
      description: "Install and enable the local NIUA Godot MCP editor addon. Defaults to true."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing project.godot file. Defaults to false."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};
