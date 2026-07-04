import {
  SERVER_INFO,
  TOOL_DEFINITIONS,
  callTool
} from "./tool-catalog.js";
import { RESOURCE_DEFINITIONS, readBridgeResource } from "./resources.js";
import { serverInstructions } from "./instructions.js";

export async function handleRequest(message) {
  switch (message.method) {
    case "initialize":
      return {
        protocolVersion: message.params?.protocolVersion ?? "2024-11-05",
        capabilities: {
          tools: {},
          resources: {}
        },
        serverInfo: SERVER_INFO,
        instructions: serverInstructions()
      };
    case "ping":
      return {};
    case "prompts/list":
      return { prompts: [] };
    case "tools/list":
      return { tools: TOOL_DEFINITIONS };
    case "tools/call":
      return callTool(message.params?.name, message.params?.arguments ?? {});
    case "resources/list":
      return { resources: RESOURCE_DEFINITIONS };
    case "resources/read": {
      const uri = message.params?.uri;
      const resource = await readBridgeResource(uri, message.params?.arguments ?? {});
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            // Compact on purpose — resources land in agent context like tool results.
            text: `${JSON.stringify(resource)}\n`
          }
        ]
      };
    }
    default:
      throw Object.assign(new Error(`Unknown MCP method: ${message.method}`), { code: -32601 });
  }
}
