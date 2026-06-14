export const OPEN_PROJECT_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Filesystem path for an existing Godot project. Must be inside GODOT_MCP_ALLOWED_PROJECT_ROOTS, or repo runs/ by default."
    },
    headless: {
      type: "boolean",
      description: "Launch Godot with --headless before opening the editor. Defaults to false."
    },
    installAddon: {
      type: "boolean",
      description: "Install and enable the local NIUA Godot MCP editor addon before launch. Defaults to true."
    },
    waitForBridge: {
      type: "boolean",
      description: "Poll the NIUA editor bridge health endpoint after launch. Defaults to true."
    },
    bridgeHost: {
      type: "string",
      description: "NIUA editor bridge host to poll. Defaults to GODOT_MCP_HOST or 127.0.0.1."
    },
    bridgePort: {
      type: "number",
      description: "NIUA editor bridge port to poll. Defaults to GODOT_MCP_PORT or 9174."
    },
    timeoutMs: {
      type: "number",
      description: "Bridge wait and close timeout in milliseconds. Defaults to 10000 for open."
    },
    reuseExisting: {
      type: "boolean",
      description: "Return an existing running project process for the same root instead of launching another. Defaults to true."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};
