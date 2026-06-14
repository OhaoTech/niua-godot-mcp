import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { AUDIO_TOOL_DEFINITIONS } from "../../../../src/godot-mcp/tools/audio/index.js";

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
  return AUDIO_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("AUDIO_TOOL_DEFINITIONS exposes the curated Audio subsystem tools", () => {
  assert.deepEqual(AUDIO_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "list_audio_buses",
    "upsert_audio_bus",
    "remove_audio_bus",
    "upsert_audio_bus_effect",
    "create_audio_stream_player"
  ]);
  assert.ok(AUDIO_TOOL_DEFINITIONS.length <= 10);
  assert.ok(AUDIO_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("list_audio_buses handler forwards query arguments", async () => {
  let seenUrl = null;

  await withJsonBridge((_req, res) => {
    seenUrl = _req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        buses: [
          { name: "Master", volumeDb: 0, muted: false }
        ]
      }
    }));
  }, async (port) => {
    const result = await toolByName("list_audio_buses").handler({ port });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/audio/buses");
    assert.equal(payload.data.buses[0].name, "Master");
  });
});

test("upsert_audio_bus_effect forwards reverb and limiter settings", async () => {
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
        busName: "Music",
        effect: { type: "AudioEffectReverb", enabled: true }
      }
    }));
  }, async (port) => {
    const result = await toolByName("upsert_audio_bus_effect").handler({
      port,
      busName: "Music",
      effectKind: "reverb",
      enabled: true,
      parameters: {
        room_size: 0.65,
        wet: 0.35
      }
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/audio/bus/effect/upsert");
    assert.equal(payload.data.effect.type, "AudioEffectReverb");
    assert.deepEqual(receivedBody, {
      busName: "Music",
      effectKind: "reverb",
      enabled: true,
      parameters: {
        room_size: 0.65,
        wet: 0.35
      }
    });
  });
});

test("create_audio_stream_player forwards bus routing and generator stream settings", async () => {
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
        nodePath: "MusicPlayer",
        busName: "Music",
        streamClass: "AudioStreamGenerator"
      }
    }));
  }, async (port) => {
    const result = await toolByName("create_audio_stream_player").handler({
      port,
      name: "MusicPlayer",
      busName: "Music",
      autoplay: true,
      play: true,
      generator: {
        mixRate: 44100,
        bufferLength: 0.5
      }
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.busName, "Music");
    assert.deepEqual(receivedBody, {
      name: "MusicPlayer",
      busName: "Music",
      autoplay: true,
      play: true,
      generator: {
        mixRate: 44100,
        bufferLength: 0.5
      }
    });
  });
});
