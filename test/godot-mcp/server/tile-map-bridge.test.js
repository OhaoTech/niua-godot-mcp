import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server forwards paint_tile_map_layer_terrain calls to the editor bridge", async () => {
  let receivedBody = null;

  await withBridgeServer(async (req, res) => {
    if (req.url === "/scene/tile-map-layer/terrain/paint" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: receivedBody.nodePath,
          mode: receivedBody.mode,
          paintedCount: receivedBody.coords.length
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const server = createMcpProcess({ GODOT_MCP_PORT: String(port) });

    try {
      const response = await server.request("tools/call", {
        name: "paint_tile_map_layer_terrain",
        arguments: {
          nodePath: "World/GroundLayer",
          mode: "connect",
          terrainSet: "0",
          terrain: "1",
          coords: [[0, 0], [1, 0]],
          ignoreEmptyTerrains: true
        }
      });

      assert.match(response.result.content[0].text, /"paintedCount": 2/);
      assert.deepEqual(receivedBody, {
        nodePath: "World/GroundLayer",
        mode: "connect",
        terrainSet: 0,
        terrain: 1,
        coords: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
        ignoreEmptyTerrains: true
      });
    } finally {
      await server.close();
    }
  });
});
