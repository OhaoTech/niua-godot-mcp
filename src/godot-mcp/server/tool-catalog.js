import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GODOT_MCP_TOOLS } from "../tools/index.js";
import { EXPERIMENTAL_ENV_VAR, experimentalEnabled, servableTools } from "./capability-graph.js";
import { createToolRegistry } from "./registry.js";
import {
  TOOL_PROFILE_ENV_VAR,
  resolveToolProfile,
  selectProfileTools
} from "./tool-profiles.js";
import { createUsageRecorder } from "./usage-stats.js";

function packageVersion() {
  // Single source of truth: a hardcoded copy here shipped 0.1.5 announcing
  // itself as 0.1.0 at initialize.
  try {
    const packagePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "package.json");
    return String(JSON.parse(readFileSync(packagePath, "utf8")).version ?? "0.0.0");
  } catch {
    return "0.0.0";
  }
}

export const SERVER_INFO = {
  name: "niua-godot-mcp",
  version: packageVersion()
};

export const ACTIVE_TOOL_PROFILE = resolveToolProfile();

// Local-only usage counters (see usage-stats.js): which tools sessions
// actually call is the evidence base for usage-derived core tiers. In the
// compact profile the router tool name is recorded, not the routed action —
// acceptable for the rails; leaf-level attribution can come with the router.
export const USAGE_RECORDER = createUsageRecorder({
  profile: ACTIVE_TOOL_PROFILE,
  serverVersion: SERVER_INFO.version
});

export const TOOL_REGISTRY = createToolRegistry([
  selectProfileTools(servableTools(GODOT_MCP_TOOLS), ACTIVE_TOOL_PROFILE)
]);

export const TOOL_DEFINITIONS = TOOL_REGISTRY.definitions;

export async function callTool(name, args = {}) {
  try {
    const result = await TOOL_REGISTRY.call(name, args);
    USAGE_RECORDER.record(name, true);
    return result;
  } catch (error) {
    if (error?.code !== -32601) {
      USAGE_RECORDER.record(name, false);
    }
    if (error?.code === -32601) {
      const catalogTool = GODOT_MCP_TOOLS.find((tool) => tool.name === name);
      if (catalogTool?.stability === "experimental" && !experimentalEnabled()) {
        throw Object.assign(
          new Error(
            `Tool "${name}" is under development and hidden by default. ` +
              `Set ${EXPERIMENTAL_ENV_VAR}=on and restart the server to use it.`
          ),
          { code: -32602 }
        );
      }
      if (catalogTool) {
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
