import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { NAVIGATION_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/navigation/index.js";

async function withJsonBridge(handler, run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    return await run(port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function toolByName(name) {
  return NAVIGATION_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("NAVIGATION_TOOL_DEFINITIONS exposes the curated Navigation subsystem tools", () => {
  assert.deepEqual(NAVIGATION_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "create_navigation_region_3d",
    "bake_navigation_mesh_3d",
    "create_navigation_agent_3d",
    "create_navigation_target_follow_script"
  ]);
  assert.ok(NAVIGATION_TOOL_DEFINITIONS.length <= 10);
  assert.ok(NAVIGATION_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("create_navigation_region_3d handler forwards navmesh settings", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        nodePath: "NavRegion",
        type: "NavigationRegion3D"
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_navigation_region_3d").handler({
      port,
      name: "NavRegion",
      agentRadius: 0.35,
      cellSize: 0.25
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.type, "NavigationRegion3D");
    assert.deepEqual(receivedBody, {
      name: "NavRegion",
      agentRadius: 0.35,
      cellSize: 0.25
    });
  });
});

test("create_navigation_target_follow_script forwards script template requests", async () => {
  let seenUrl = null;
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    seenUrl = req.url;
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        nodePath: "AgentBody",
        scriptPath: "res://scripts/nav_agent.gd"
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_navigation_target_follow_script").handler({
      port,
      nodePath: "AgentBody",
      agentPath: "NavigationAgent3D",
      targetPath: "../Target",
      scriptPath: "res://scripts/nav_agent.gd",
      speed: 4.5
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/navigation/script/target-follow/create");
    assert.equal(payload.data.scriptPath, "res://scripts/nav_agent.gd");
    assert.deepEqual(receivedBody, {
      nodePath: "AgentBody",
      agentPath: "NavigationAgent3D",
      targetPath: "../Target",
      scriptPath: "res://scripts/nav_agent.gd",
      speed: 4.5
    });
  });
});
