import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server creates composed 3D playable blockouts", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    received.push({
      method: req.method,
      url: req.url,
      body
    });

    res.setHeader("content-type", "application/json");
    if (req.url === "/scene/node/create" && req.method === "POST") {
      const parentPath = String(body.parentPath ?? "");
      const name = String(body.name ?? body.type);
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: parentPath ? `${parentPath}/${name}` : name,
          type: body.type,
          parentPath
        }
      }));
      return;
    }
    if (req.url === "/resource/create" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: body.path,
          type: body.className,
          properties: body.properties
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
        name: "create_3d_playable_blockout",
        arguments: {
          rootName: "ArenaPrototype",
          parentPath: "",
          resourceDirectory: "res://generated/blockout",
          overwriteResources: true,
          groundSize: [30, 0.4, 18],
          playerRadius: 0.45,
          playerHeight: 1.8,
          playerPosition: [0, 0.9, 0],
          cameraPosition: [0, 2.6, 6.5],
          cameraRotationDegrees: [-18, 0, 0],
          lightEnergy: 2
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.rootPath, "ArenaPrototype");
      assert.equal(payload.data.ground.body.nodePath, "ArenaPrototype/GroundBody");
      assert.equal(payload.data.player.character.nodePath, "ArenaPrototype/PlayerBody");
      assert.equal(payload.data.camera.node.nodePath, "ArenaPrototype/PlayerBody/ChaseCamera");
      assert.equal(payload.data.light.node.nodePath, "ArenaPrototype/KeyLight");
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "Node3D",
            properties: {},
            name: "ArenaPrototype",
            parentPath: ""
          }
        },
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://generated/blockout/arena_prototype_ground_mesh.tres",
            className: "BoxMesh",
            properties: {
              size: { type: "Vector3", x: 30, y: 0.4, z: 18 }
            },
            open: false,
            overwrite: true
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "MeshInstance3D",
            properties: {
              mesh: {
                type: "Resource",
                path: "res://generated/blockout/arena_prototype_ground_mesh.tres"
              },
              position: { type: "Vector3", x: 0, y: -0.2, z: 0 }
            },
            name: "GroundVisual",
            parentPath: "ArenaPrototype"
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "StaticBody3D",
            properties: {
              position: { type: "Vector3", x: 0, y: -0.2, z: 0 },
              collision_layer: 1,
              collision_mask: 1
            },
            name: "GroundBody",
            parentPath: "ArenaPrototype"
          }
        },
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://generated/blockout/arena_prototype_ground_shape.tres",
            className: "BoxShape3D",
            properties: {
              size: { type: "Vector3", x: 30, y: 0.4, z: 18 }
            },
            open: false,
            overwrite: true
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "CollisionShape3D",
            parentPath: "ArenaPrototype/GroundBody",
            properties: {
              shape: {
                type: "Resource",
                path: "res://generated/blockout/arena_prototype_ground_shape.tres"
              }
            },
            name: "GroundCollision"
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "CharacterBody3D",
            properties: {
              position: { type: "Vector3", x: 0, y: 0.9, z: 0 },
              up_direction: { type: "Vector3", x: 0, y: 1, z: 0 },
              motion_mode: 0,
              floor_snap_length: 0.4,
              collision_layer: 1,
              collision_mask: 1
            },
            name: "PlayerBody",
            parentPath: "ArenaPrototype"
          }
        },
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://generated/blockout/arena_prototype_player_shape.tres",
            className: "CapsuleShape3D",
            properties: {
              radius: 0.45,
              height: 1.8
            },
            open: false,
            overwrite: true
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "CollisionShape3D",
            parentPath: "ArenaPrototype/PlayerBody",
            properties: {
              shape: {
                type: "Resource",
                path: "res://generated/blockout/arena_prototype_player_shape.tres"
              }
            },
            name: "PlayerCollision"
          }
        },
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://generated/blockout/arena_prototype_player_mesh.tres",
            className: "CapsuleMesh",
            properties: {
              radius: 0.45,
              height: 1.8
            },
            open: false,
            overwrite: true
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "MeshInstance3D",
            properties: {
              mesh: {
                type: "Resource",
                path: "res://generated/blockout/arena_prototype_player_mesh.tres"
              }
            },
            name: "PlayerVisual",
            parentPath: "ArenaPrototype/PlayerBody"
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "Camera3D",
            properties: {
              position: { type: "Vector3", x: 0, y: 2.6, z: 6.5 },
              rotation_degrees: { type: "Vector3", x: -18, y: 0, z: 0 },
              current: true,
              fov: 70,
              near: 0.05,
              far: 400
            },
            name: "ChaseCamera",
            parentPath: "ArenaPrototype/PlayerBody"
          }
        },
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "DirectionalLight3D",
            properties: {
              rotation_degrees: { type: "Vector3", x: -55, y: -35, z: 0 },
              light_energy: 2,
              shadow_enabled: true
            },
            name: "KeyLight",
            parentPath: "ArenaPrototype"
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server creates and attaches curated 3D character controllers", async () => {
  const received = [];

  await withBridgeServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    received.push({
      method: req.method,
      url: req.url,
      body
    });

    res.setHeader("content-type", "application/json");
    if (req.url === "/input/action/set" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          name: body.name,
          saved: body.save
        }
      }));
      return;
    }
    if (req.url === "/script/create" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: body.path,
          type: "GDScript",
          created: true
        }
      }));
      return;
    }
    if (req.url === "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer_controller.gd" && req.method === "GET") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player_controller.gd",
          valid: true,
          errorCode: 0
        }
      }));
      return;
    }
    if (req.url === "/script/attach" && req.method === "POST") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: body.nodePath,
          scriptPath: body.scriptPath,
          attached: true,
          saved: body.saveScene
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
        name: "create_3d_character_controller",
        arguments: {
          nodePath: "ArenaPrototype/PlayerBody",
          scriptPath: "res://scripts/player_controller.gd",
          className: "ArenaPlayerController",
          speed: 9,
          jumpVelocity: 5.5,
          gravity: 18,
          overwriteScript: true,
          saveScene: true
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.nodePath, "ArenaPrototype/PlayerBody");
      assert.equal(payload.data.scriptPath, "res://scripts/player_controller.gd");
      assert.equal(payload.data.inputActions.length, 5);
      assert.deepEqual(received.slice(0, 5), [
        {
          method: "POST",
          url: "/input/action/set",
          body: {
            name: "move_forward",
            deadzone: 0.2,
            replace: true,
            events: [{ type: "key", keycode: 87 }],
            save: false
          }
        },
        {
          method: "POST",
          url: "/input/action/set",
          body: {
            name: "move_back",
            deadzone: 0.2,
            replace: true,
            events: [{ type: "key", keycode: 83 }],
            save: false
          }
        },
        {
          method: "POST",
          url: "/input/action/set",
          body: {
            name: "move_left",
            deadzone: 0.2,
            replace: true,
            events: [{ type: "key", keycode: 65 }],
            save: false
          }
        },
        {
          method: "POST",
          url: "/input/action/set",
          body: {
            name: "move_right",
            deadzone: 0.2,
            replace: true,
            events: [{ type: "key", keycode: 68 }],
            save: false
          }
        },
        {
          method: "POST",
          url: "/input/action/set",
          body: {
            name: "jump",
            deadzone: 0.2,
            replace: true,
            events: [{ type: "key", keycode: 32 }],
            save: true
          }
        }
      ]);
      assert.equal(received[5].method, "POST");
      assert.equal(received[5].url, "/script/create");
      assert.equal(received[5].body.path, "res://scripts/player_controller.gd");
      assert.equal(received[5].body.overwrite, true);
      assert.match(received[5].body.content, /extends CharacterBody3D/);
      assert.match(received[5].body.content, /class_name ArenaPlayerController/);
      assert.match(received[5].body.content, /@export var move_speed: float = 9/);
      assert.match(received[5].body.content, /@export var jump_velocity: float = 5.5/);
      assert.match(received[5].body.content, /@export var gravity: float = 18/);
      assert.match(received[5].body.content, /Input\.is_action_pressed\("move_forward"\)/);
      assert.deepEqual(received[6], {
        method: "GET",
        url: "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer_controller.gd",
        body: {}
      });
      assert.deepEqual(received[7], {
        method: "POST",
        url: "/script/attach",
        body: {
          nodePath: "ArenaPrototype/PlayerBody",
          scriptPath: "res://scripts/player_controller.gd",
          createIfMissing: false,
          saveScene: true
        }
      });
    } finally {
      await server.close();
    }
  });
});
