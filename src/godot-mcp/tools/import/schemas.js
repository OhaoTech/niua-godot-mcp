import {
  CONNECTION_PROPERTIES
} from "../shared/bridge-schema.js";
import {
  FILESYSTEM_PATH_SCHEMA
} from "../filesystem/schemas.js";

export {
  FILESYSTEM_PATH_SCHEMA
};

export const IMPORT_PROJECT_ASSETS_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Allowlisted Godot project root to import with the local Godot CLI."
    },
    timeoutMs: {
      type: "number",
      description: "Import process timeout in milliseconds. Defaults to 120000."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};

export const IMPORT_ASSETS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot project folder path to search for imported assets. Defaults to res://."
    },
    recursive: {
      type: "boolean",
      description: "Whether to include nested imported assets. Defaults to true."
    }
  },
  additionalProperties: false
};

export const REIMPORT_ASSETS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    paths: {
      type: "array",
      description: "Godot resource paths to reimport.",
      items: {
        type: "string"
      },
      minItems: 1
    },
    timeoutMs: {
      type: "number",
      description: "Bridge request timeout in milliseconds for the reimport operation. Defaults to 120000."
    }
  },
  required: ["paths"],
  additionalProperties: false
};

export const IMPORT_EVENTS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    limit: {
      type: "integer",
      description: "Maximum import/reimport events to return. Defaults to 100 and is capped by the editor bridge."
    },
    kinds: {
      type: "array",
      items: { type: "string" },
      description: "Optional event kind filter, for example ['resources_reimported', 'sources_changed']."
    },
    sinceMsec: {
      type: "number",
      description: "Only return events with timeMsec greater than this value. Defaults to -1, meaning no lower bound."
    }
  },
  additionalProperties: false
};

export const SET_IMPORT_OPTIONS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Godot asset path whose .import sidecar should be updated."
    },
    options: {
      type: "object",
      description: "Import option keys and JSON-compatible values to write under the .import [params] section.",
      additionalProperties: true,
      minProperties: 1
    },
    reimport: {
      type: "boolean",
      description: "Reimport the asset after saving import options. Defaults to false."
    }
  },
  required: ["path", "options"],
  additionalProperties: false
};
