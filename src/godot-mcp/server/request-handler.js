import {
  SERVER_INFO,
  TOOL_DEFINITIONS,
  callTool
} from "./tool-catalog.js";
import { RESOURCE_DEFINITIONS, readBridgeResource } from "./resources.js";

export async function handleRequest(message) {
  switch (message.method) {
    case "initialize":
      return {
        protocolVersion: message.params?.protocolVersion ?? "2024-11-05",
        capabilities: {
          tools: {},
          resources: {}
        },
        serverInfo: SERVER_INFO
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
            text: `${JSON.stringify(resource, null, 2)}\n`
          }
        ]
      };
    }
    default:
      throw Object.assign(new Error(`Unknown MCP method: ${message.method}`), { code: -32601 });
  }
}
