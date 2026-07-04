export const DESCRIBE_TOOL_MANIFEST = [
  {
    name: "describe_tools",
    description: "Navigate the full tool catalog without paying for a flat listing. No args returns the root map of domains; { domain } lists that domain's tools with tier and summary; { name } returns one tool's full description and input schema. Always describes the whole catalog, even for tools hidden by the active profile.",
    profile: "v1",
    tier: "essential",
    category: "catalog",
    implementation: "local",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "List this domain's tools (name, tier, one-line summary)."
        },
        name: {
          type: "string",
          description: "Return this tool's full description and input schema. Takes precedence over domain."
        }
      },
      additionalProperties: false
    },
    local: {
      handler: "describeTools"
    },
    conformance: {
      happy: "return the domain root map, a domain tool listing, and a single tool schema",
      error: "name the valid domains for an unknown domain and point unknown tool names at the domain listing"
    },
    docs: {
      summary: "Navigates the full tool catalog: root domain map, per-domain tool listings, and per-tool schemas on demand."
    }
  }
];
