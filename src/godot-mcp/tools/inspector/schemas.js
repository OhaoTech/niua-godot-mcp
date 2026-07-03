import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

export const INSPECTOR_PROPERTIES_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Path under the edited scene root. Empty string means current editor selection."
    },
    properties: {
      type: "array",
      description: "Only return these property names. Omit for all editable properties.",
      items: {
        type: "string"
      }
    },
    verbose: {
      type: "boolean",
      description: "Include full editor metadata (hints, usage flags, sections, revert values). Defaults to false: compact name/type/value entries."
    }
  },
  additionalProperties: false
};

export const SET_NODE_PROPERTY_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Path under the edited scene root."
    },
    property: {
      type: "string",
      description: "Godot property name."
    },
    value: {
      description: "JSON value or typed object such as { type: 'Vector3', x: 1, y: 2, z: 3 }."
    }
  },
  required: ["nodePath", "property", "value"],
  additionalProperties: false
};
