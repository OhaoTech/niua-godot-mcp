// These three properties repeat in EVERY tool schema (173x), so every character
// here is multiplied across the whole advertised catalog. Keep them terse.
export const BRIDGE_INPUT_SCHEMA = {
  type: "object",
  properties: {
    host: {
      type: "string",
      description: "Bridge host (default 127.0.0.1)."
    },
    port: {
      type: "number",
      description: "Bridge port (default 9174)."
    },
    expectedProjectRoot: {
      type: "string",
      description: "Absolute project root the bridge must match; mismatch fails mutating/run tools."
    }
  },
  additionalProperties: false
};

export const CONNECTION_PROPERTIES = {
  host: BRIDGE_INPUT_SCHEMA.properties.host,
  port: BRIDGE_INPUT_SCHEMA.properties.port,
  expectedProjectRoot: BRIDGE_INPUT_SCHEMA.properties.expectedProjectRoot
};
