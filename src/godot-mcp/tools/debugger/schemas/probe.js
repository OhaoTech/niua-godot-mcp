import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";

export const INSTALL_RUNTIME_PROBE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    save: {
      type: "boolean",
      description: "Save project.godot after enabling the runtime probe autoload. Defaults to true."
    }
  },
  additionalProperties: false
};
