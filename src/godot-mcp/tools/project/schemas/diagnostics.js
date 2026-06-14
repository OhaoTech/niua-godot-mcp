export const DIAGNOSE_PROJECT_SETUP_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Allowlisted Godot project root to inspect."
    },
    checkBridge: {
      type: "boolean",
      description: "Also probe the configured NIUA bridge health endpoint. Defaults to false."
    },
    bridgeHost: {
      type: "string",
      description: "NIUA editor bridge host to probe. Defaults to GODOT_MCP_HOST or 127.0.0.1."
    },
    bridgePort: {
      type: "number",
      description: "NIUA editor bridge port to probe. Defaults to GODOT_MCP_PORT or 9174."
    },
    timeoutMs: {
      type: "number",
      description: "Bridge health timeout in milliseconds. Defaults to 1000."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};
