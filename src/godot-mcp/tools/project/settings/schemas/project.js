import { CONNECTION_PROPERTIES } from "../../../shared/bridge-schema.js";

export const PROJECT_SETTINGS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    prefix: {
      type: "string",
      description: "Optional ProjectSettings key prefix, for example application/."
    },
    query: {
      type: "string",
      description: "Optional case-insensitive search text matched against setting names, category/section/leaf labels, type names, hints, and serialized values."
    },
    editorVisible: {
      type: "boolean",
      description: "When set, include only settings whose editor-visible flag matches this value."
    },
    basic: {
      type: "boolean",
      description: "When set, include only settings whose basic Project Settings visibility matches this value."
    },
    internal: {
      type: "boolean",
      description: "When set, include only settings whose internal flag matches this value."
    },
    restartIfChanged: {
      type: "boolean",
      description: "When set, include only settings whose restart-required flag matches this value."
    }
  },
  additionalProperties: false
};

export const SET_PROJECT_SETTING_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    name: {
      type: "string",
      description: "ProjectSettings key, for example application/config/name."
    },
    value: {
      description: "JSON value to store in ProjectSettings."
    },
    save: {
      type: "boolean",
      description: "Save project.godot after setting the value. Defaults to true."
    }
  },
  required: ["name", "value"],
  additionalProperties: false
};

export const SET_PROJECT_SETTING_METADATA_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    name: {
      type: "string",
      description: "ProjectSettings key, for example application/config/name."
    },
    order: {
      type: "number",
      description: "Project Settings display order for this key."
    },
    initialValue: {
      description: "Initial/default JSON value for this ProjectSettings key."
    },
    basic: {
      type: "boolean",
      description: "Whether this setting appears in basic Project Settings views."
    },
    internal: {
      type: "boolean",
      description: "Whether this setting is marked internal."
    },
    restartIfChanged: {
      type: "boolean",
      description: "Whether changing this setting requires an editor/project restart."
    },
    save: {
      type: "boolean",
      description: "Save project.godot after setting metadata. Defaults to true."
    }
  },
  required: ["name"],
  additionalProperties: false
};
