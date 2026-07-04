import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import {
  DISPATCH_DOMAINS,
  DOMAIN_BY_CATEGORY,
  STANDALONE_TOOLS,
  firstSentence,
  resolveToolProfile
} from "../../server/capability-graph.js";
// Import cycle note: tools/index.js imports this module, so GODOT_MCP_TOOLS is
// a live binding that is only safe to touch at call time (inside the handler),
// never during module evaluation.
import { GODOT_MCP_TOOLS } from "../index.js";
import { DESCRIBE_TOOL_MANIFEST } from "./manifest.js";

// describe_tools is the navigation primitive of the capability graph
// (docs/godot-mcp/capability-graph-architecture.md): connect -> root map ->
// describe(domain) -> describe(name) -> call. It is present in every
// projection (core: tier essential; full: automatic; compact: standalone) and
// always describes the FULL catalog — navigation reveals the whole graph, and
// calling a non-exposed tool still errors with the profile guidance.

function groupCatalogByDomain(tools) {
  const grouped = new Map(Object.keys(DISPATCH_DOMAINS).map((domain) => [domain, []]));
  for (const tool of tools) {
    if (STANDALONE_TOOLS.has(tool.name)) {
      continue;
    }
    const domain = DOMAIN_BY_CATEGORY[tool.category];
    if (domain !== undefined) {
      grouped.get(domain).push(tool);
    }
  }
  return grouped;
}

export async function describeTools(args = {}) {
  const name = String(args.name ?? "").trim();
  if (name !== "") {
    return describeOneTool(name);
  }

  const domain = String(args.domain ?? "").trim();
  if (domain !== "") {
    return describeDomainTools(domain);
  }

  return describeRootMap();
}

function describeRootMap() {
  const grouped = groupCatalogByDomain(GODOT_MCP_TOOLS);
  return {
    ok: true,
    data: {
      domains: Object.entries(DISPATCH_DOMAINS).map(([domain, spec]) => ({
        domain,
        toolCount: grouped.get(domain).length,
        summary: spec.summary
      })),
      totalTools: GODOT_MCP_TOOLS.length,
      profile: resolveToolProfile()
    }
  };
}

function describeDomainTools(domain) {
  const spec = DISPATCH_DOMAINS[domain];
  if (!spec) {
    return {
      ok: false,
      error: `Domain "${domain}" not found. Valid domains: ${Object.keys(DISPATCH_DOMAINS).join(", ")}.`,
      errorCode: "not_found"
    };
  }

  const grouped = groupCatalogByDomain(GODOT_MCP_TOOLS);
  return {
    ok: true,
    data: {
      domain,
      tools: grouped.get(domain).map((tool) => ({
        name: tool.name,
        tier: tool.tier,
        summary: firstSentence(tool.description)
      }))
    }
  };
}

function describeOneTool(name) {
  const tool = GODOT_MCP_TOOLS.find((candidate) => candidate.name === name);
  if (!tool) {
    return {
      ok: false,
      error: `Tool "${name}" not found in the catalog. Call describe_tools with no arguments for the domain map, or describe_tools { domain: "<domain>" } to list a domain's tools.`,
      errorCode: "not_found"
    };
  }

  return {
    ok: true,
    data: {
      name: tool.name,
      description: tool.description,
      tier: tool.tier,
      inputSchema: tool.inputSchema
    }
  };
}

export const DESCRIBE_TOOL_DEFINITIONS = toolDefinitionsFromManifest(DESCRIBE_TOOL_MANIFEST, {
  localHandlers: {
    describeTools
  }
});
