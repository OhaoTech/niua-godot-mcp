import { GODOT_MCP_TOOLS } from "../tools/index.js";
import { createToolRegistry } from "./registry.js";
import {
  TOOL_PROFILE_ENV_VAR,
  resolveToolProfile,
  selectProfileTools
} from "./tool-profiles.js";

export const SERVER_INFO = {
  name: "niua-godot-mcp",
  version: "0.1.0"
};

export const ACTIVE_TOOL_PROFILE = resolveToolProfile();

const FULL_TOOL_NAMES = new Set(GODOT_MCP_TOOLS.map((tool) => tool.name));

export const TOOL_REGISTRY = createToolRegistry([
  selectProfileTools(GODOT_MCP_TOOLS, ACTIVE_TOOL_PROFILE)
]);

export const TOOL_DEFINITIONS = TOOL_REGISTRY.definitions;

export async function callTool(name, args = {}) {
  try {
    return await TOOL_REGISTRY.call(name, args);
  } catch (error) {
    if (error?.code === -32601) {
      if (FULL_TOOL_NAMES.has(name)) {
        throw Object.assign(
          new Error(
            `Tool "${name}" is not in the "${ACTIVE_TOOL_PROFILE}" tool profile. ` +
              `Restart the server with ${TOOL_PROFILE_ENV_VAR}=full to expose it.`
          ),
          { code: -32602 }
        );
      }
      throw Object.assign(new Error(`Unknown Godot MCP tool: ${name}`), { code: -32602 });
    }
    throw error;
  }
}
