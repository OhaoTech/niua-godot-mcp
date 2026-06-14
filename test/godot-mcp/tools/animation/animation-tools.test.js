import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { ANIMATION_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/animation/index.js";
import { ANIMATION_TOOL_MANIFEST } from "../../../../src/godot-mcp/tools/animation/manifest.js";

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
  return ANIMATION_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readSource(relativePath) {
  const { readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../");
  return readFile(resolve(root, relativePath), "utf8");
}

test("ANIMATION_TOOL_DEFINITIONS exposes the curated Animation subsystem tools", () => {
  assert.deepEqual(ANIMATION_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "upsert_animation",
    "list_animations",
    "play_animation",
    "stop_animation",
    "get_animation_state",
    "instance_animated_scene",
    "create_animation_tree_state_machine",
    "travel_animation_tree"
  ]);
  assert.deepEqual(
    ANIMATION_TOOL_DEFINITIONS.map((tool) => tool.name),
    ANIMATION_TOOL_MANIFEST.map((entry) => entry.name)
  );
  assert.ok(ANIMATION_TOOL_DEFINITIONS.length <= 10);
  assert.ok(ANIMATION_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("animation tool implementation is generated from the manifest", async () => {
  const index = await readSource("src/godot-mcp/tools/animation/index.js");
  const bridge = await readSource("src/godot-mcp/bridge-client/animation.js");

  assert.match(index, /toolDefinitionsFromManifest\(ANIMATION_TOOL_MANIFEST\)/);
  assert.doesNotMatch(index, /ANIMATION_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /splitBridgeArgs/);
  assert.match(bridge, /bridgeMethodsFromManifest\(ANIMATION_TOOL_MANIFEST\)/);
  assert.doesNotMatch(bridge, /async listAnimations/);
});

test("upsert_animation handler forwards animation tracks through the bridge", async () => {
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
        playerPath: "AnimationPlayer",
        animation: "hover",
        trackCount: 1
      }
    }));
  }, async (port) => {
    const result = await toolByName("upsert_animation").handler({
      port,
      playerPath: "AnimationPlayer",
      animationName: "hover",
      length: 2,
      loopMode: "linear",
      tracks: [
        {
          targetPath: "Mover",
          property: "position",
          keyframes: [
            { time: 0, value: { type: "Vector3", x: 0, y: 0, z: 0 } },
            { time: 2, value: { type: "Vector3", x: 2, y: 0, z: 0 } }
          ]
        }
      ]
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.animation, "hover");
    assert.deepEqual(receivedBody, {
      playerPath: "AnimationPlayer",
      animationName: "hover",
      length: 2,
      loopMode: "linear",
      tracks: [
        {
          targetPath: "Mover",
          property: "position",
          keyframes: [
            { time: 0, value: { type: "Vector3", x: 0, y: 0, z: 0 } },
            { time: 2, value: { type: "Vector3", x: 2, y: 0, z: 0 } }
          ]
        }
      ]
    });
  });
});

test("list_animations handler supports imported scene paths", async () => {
  let seenUrl = null;

  await withJsonBridge((req, res) => {
    seenUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        source: "res://assets/animated.glb",
        players: [
          { playerPath: "AnimationPlayer", animations: [{ name: "ArmatureAction", length: 1 }] }
        ]
      }
    }));
  }, async (port) => {
    const result = await toolByName("list_animations").handler({
      port,
      scenePath: "res://assets/animated.glb"
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/animation/list?scenePath=res%3A%2F%2Fassets%2Fanimated.glb");
    assert.equal(payload.data.players[0].animations[0].name, "ArmatureAction");
  });
});
