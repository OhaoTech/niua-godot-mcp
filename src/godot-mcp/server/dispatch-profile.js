import { toolResult } from "../protocol.js";
import { CONNECTION_PROPERTIES } from "../tools/shared/bridge-schema.js";
import {
  DISPATCH_DOMAINS,
  DOMAIN_BY_CATEGORY,
  STANDALONE_TOOLS,
  firstSentence
} from "./capability-graph.js";

// The dispatch profile collapses the flat catalog (~173 tools ≈ 56K tokens of
// schemas injected per request on clients without deferred tool loading) into
// ~13 action-routed domain tools (~95% schema-tax cut). Every catalog tool stays
// reachable as an action; per-action schemas are served on demand through the
// "describe" action (search-first, implemented server-side). The domain map
// itself lives in capability-graph.js — this module is the projection that
// collapses it. See docs/godot-mcp/token-efficiency-roadmap.md, Tier 3.

export function dispatchToolsFromCatalog(tools) {
  const grouped = new Map();
  const standalone = [];
  for (const tool of tools) {
    if (STANDALONE_TOOLS.has(tool.name)) {
      standalone.push(tool);
      continue;
    }
    const domain = DOMAIN_BY_CATEGORY[tool.category];
    if (!domain) {
      throw new Error(
        `dispatch profile has no domain for tool "${tool.name}" (category "${tool.category}")`
      );
    }
    if (!grouped.has(domain)) {
      grouped.set(domain, []);
    }
    grouped.get(domain).push(tool);
  }

  const dispatchers = [];
  for (const [domain, spec] of Object.entries(DISPATCH_DOMAINS)) {
    const members = grouped.get(domain) ?? [];
    if (members.length === 0) {
      continue;
    }
    dispatchers.push(buildDispatcher(domain, spec, members));
  }

  return [...dispatchers, ...standalone];
}

function buildDispatcher(domain, spec, members) {
  const byAction = new Map(members.map((tool) => [tool.name, tool]));
  const actions = members.map((tool) => tool.name);

  return {
    name: domain,
    description: `${spec.summary} Run one action per call; call { action: "describe" } to list actions or { action: "describe", name: "<action>" } for that action's full argument schema.`,
    category: "dispatch",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: [...actions, "describe"],
          description: "The action to run, or \"describe\" for schemas."
        },
        name: {
          type: "string",
          description: "With action \"describe\": which action to describe."
        },
        args: {
          type: "object",
          additionalProperties: true,
          description: "Arguments for the action (see describe)."
        },
        host: CONNECTION_PROPERTIES.host,
        port: CONNECTION_PROPERTIES.port,
        expectedProjectRoot: CONNECTION_PROPERTIES.expectedProjectRoot
      },
      required: ["action"],
      additionalProperties: false
    },
    async handler(args = {}) {
      const action = String(args.action ?? "");
      if (action === "describe") {
        return describeDomain(domain, members, byAction, args);
      }

      const target = byAction.get(action);
      if (!target) {
        throw Object.assign(
          new Error(
            `Unknown ${domain} action: "${action}". Valid actions: ${actions.join(", ")}, describe.`
          ),
          { code: -32602 }
        );
      }

      return target.handler(mergedActionArgs(args));
    }
  };
}

function mergedActionArgs(args) {
  const connection = {};
  for (const key of ["host", "port", "expectedProjectRoot"]) {
    if (args[key] !== undefined && args[key] !== "") {
      connection[key] = args[key];
    }
  }
  return { ...connection, ...(args.args ?? {}) };
}

function describeDomain(domain, members, byAction, args) {
  const name = String(args.name ?? "").trim();
  if (!name) {
    return toolResult({
      domain,
      actions: members.map((tool) => ({
        name: tool.name,
        summary: firstSentence(tool.description)
      }))
    });
  }

  const target = byAction.get(name);
  if (!target) {
    throw Object.assign(
      new Error(`Unknown ${domain} action to describe: "${name}".`),
      { code: -32602 }
    );
  }

  return toolResult({
    name: target.name,
    description: target.description,
    inputSchema: target.inputSchema
  });
}
