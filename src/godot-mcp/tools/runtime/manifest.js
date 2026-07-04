export const RUNTIME_TOOL_MANIFEST = [
  {
    name: "get_godot_version",
    description: "Return the installed Godot executable version used by the local MCP server.",
    profile: "v1",
    tier: "essential",
    category: "runtime",
    implementation: "local",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    },
    local: {
      handler: "getGodotVersionTool"
    },
    conformance: {
      happy: "return the configured or discovered Godot version",
      error: "surface local Godot executable discovery failures"
    },
    docs: {
      summary: "Returns the installed Godot executable version used by the local MCP server."
    }
  }
];
