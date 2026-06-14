export const IMPORT_PROJECT_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Filesystem path for an existing Godot project to add to the local NIUA project registry."
    },
    installAddon: {
      type: "boolean",
      description: "Install and enable the local NIUA Godot MCP editor addon while importing. Defaults to false."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};

export const INSTALL_PROJECT_ADDON_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Filesystem path for an existing Godot project whose NIUA editor bridge addon should be installed or repaired."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};

export const LIST_KNOWN_PROJECTS_SCHEMA = {
  type: "object",
  properties: {},
  additionalProperties: false
};

export const FORGET_PROJECT_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Allowlisted project root to remove from the local NIUA project registry."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};
