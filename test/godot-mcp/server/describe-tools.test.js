import test from "node:test";
import assert from "node:assert/strict";

import {
  DISPATCH_DOMAINS,
  STANDALONE_TOOLS
} from "../../../src/godot-mcp/server/capability-graph.js";
import {
  CORE_TOOL_NAMES,
  selectProfileTools
} from "../../../src/godot-mcp/server/tool-profiles.js";
import { GODOT_MCP_TOOLS } from "../../../src/godot-mcp/tools/index.js";
import { describeTools } from "../../../src/godot-mcp/tools/describe/index.js";
import { createMcpProcess } from "../helpers/server-harness.js";

// describe_tools is the universal navigation primitive: root map -> domain
// listing -> single-tool schema, in every projection, over the FULL catalog.

test("describe_tools with no args returns the root domain map", async () => {
  const result = await describeTools({});

  assert.equal(result.ok, true);
  const { domains, totalTools, profile } = result.data;
  // experimentalHidden/Note appear because unit tests run without
  // NIUA_MCP_EXPERIMENTAL: the root map tells agents what exists but is
  // hidden, and how to enable it (experimental-gating.test.js pins content).
  assert.deepEqual(Object.keys(result.data).sort(), ["domains", "experimentalHidden", "experimentalNote", "profile", "totalTools"]);

  // one entry per capability-graph domain, in graph order
  assert.deepEqual(domains.map(({ domain }) => domain), Object.keys(DISPATCH_DOMAINS));
  for (const entry of domains) {
    assert.deepEqual(Object.keys(entry).sort(), ["domain", "summary", "toolCount"]);
    assert.ok(entry.toolCount > 0, `${entry.domain} lists no tools`);
    assert.equal(entry.summary, DISPATCH_DOMAINS[entry.domain].summary);
  }

  // totalTools counts the whole catalog (domain members + standalone tools)
  assert.equal(totalTools, GODOT_MCP_TOOLS.length);
  const domainToolCount = domains.reduce((sum, entry) => sum + entry.toolCount, 0);
  assert.equal(domainToolCount + STANDALONE_TOOLS.size, totalTools);

  assert.equal(typeof profile, "string");
  assert.ok(profile.length > 0);
});

test("describe_tools lists a domain's tools with tier and first-sentence summary", async () => {
  const result = await describeTools({ domain: "godot_node" });

  assert.equal(result.ok, true);
  assert.equal(result.data.domain, "godot_node");
  const tools = result.data.tools;
  assert.ok(tools.length > 0);
  for (const tool of tools) {
    assert.deepEqual(Object.keys(tool).sort(), ["name", "summary", "tier"]);
    assert.ok(["essential", "standard"].includes(tool.tier), `${tool.name} tier ${tool.tier}`);
    assert.ok(tool.summary.length > 0);
    assert.doesNotMatch(tool.summary, /\. .+/, `${tool.name} summary is more than one sentence`);
  }
  assert.ok(tools.some(({ name }) => name === "create_node"));
  assert.ok(tools.some(({ name }) => name === "set_node_property"));
});

test("describe_tools serves one tool's full schema by name", async () => {
  const result = await describeTools({ name: "create_node" });
  const catalogEntry = GODOT_MCP_TOOLS.find(({ name }) => name === "create_node");

  assert.equal(result.ok, true);
  assert.deepEqual(result.data, {
    name: "create_node",
    description: catalogEntry.description,
    tier: "essential",
    inputSchema: catalogEntry.inputSchema
  });
});

test("describe_tools errors carry the fix: valid domains / the domain listing", async () => {
  const unknownDomain = await describeTools({ domain: "godot_warp" });
  assert.equal(unknownDomain.ok, false);
  assert.equal(unknownDomain.errorCode, "not_found");
  assert.match(unknownDomain.error, /"godot_warp"/);
  for (const domain of Object.keys(DISPATCH_DOMAINS)) {
    assert.ok(unknownDomain.error.includes(domain), `error does not name domain ${domain}`);
  }

  const unknownName = await describeTools({ name: "not_a_tool" });
  assert.equal(unknownName.ok, false);
  assert.equal(unknownName.errorCode, "not_found");
  assert.match(unknownName.error, /"not_a_tool"/);
  assert.match(unknownName.error, /describe_tools \{ domain/);
});

test("describe_tools describes the FULL catalog regardless of the active profile", async () => {
  // list_export_presets is standard-tier: hidden from the core projection,
  // but navigation must still reveal it — that pairing is the design.
  assert.ok(!CORE_TOOL_NAMES.includes("remove_audio_bus"));

  const server = createMcpProcess({ NIUA_MCP_PROFILE: "" }); // core default

  try {
    await server.request("initialize", {});

    const described = await server.request("tools/call", {
      name: "describe_tools",
      arguments: { name: "remove_audio_bus" }
    });
    const payload = JSON.parse(described.result.content[0].text);
    assert.equal(payload.ok, true);
    assert.equal(payload.data.name, "remove_audio_bus");
    assert.equal(payload.data.tier, "standard");
    assert.ok(payload.data.inputSchema);

    const rootMap = await server.request("tools/call", {
      name: "describe_tools",
      arguments: {}
    });
    const root = JSON.parse(rootMap.result.content[0].text);
    assert.equal(root.data.totalTools, GODOT_MCP_TOOLS.length);
    assert.equal(root.data.profile, "core");

    // calling the non-exposed tool still errors with the profile guidance
    const blocked = await server.request("tools/call", {
      name: "remove_audio_bus",
      arguments: {}
    });
    assert.match(blocked.error.message, /not in the "core" tool profile/);
  } finally {
    await server.close();
  }
});

test("describe_tools is present in every projection", () => {
  const coreNames = selectProfileTools(GODOT_MCP_TOOLS, "core").map(({ name }) => name);
  assert.ok(coreNames.includes("describe_tools"));

  const fullNames = selectProfileTools(GODOT_MCP_TOOLS, "full").map(({ name }) => name);
  assert.ok(fullNames.includes("describe_tools"));

  const compactNames = selectProfileTools(GODOT_MCP_TOOLS, "compact").map(({ name }) => name);
  assert.ok(compactNames.includes("describe_tools"));
});
