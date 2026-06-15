export const BRIDGE_INPUT_SCHEMA = {
  type: "object",
  properties: {
    host: {
      type: "string",
      description: "Godot editor bridge host. Defaults to 127.0.0.1."
    },
    port: {
      type: "number",
      description: "Godot editor bridge port. Defaults to 9174."
    },
    expectedProjectRoot: {
      type: "string",
      description: "Absolute Godot project root expected on the bridge. Mutating/run tools fail if the connected editor reports a different project."
    }
  },
  additionalProperties: false
};

export const CONNECTION_PROPERTIES = {
  host: BRIDGE_INPUT_SCHEMA.properties.host,
  port: BRIDGE_INPUT_SCHEMA.properties.port,
  expectedProjectRoot: BRIDGE_INPUT_SCHEMA.properties.expectedProjectRoot
};
