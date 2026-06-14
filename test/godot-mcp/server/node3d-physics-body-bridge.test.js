import test from "node:test";
import assert from "node:assert/strict";

import {
  createMcpProcess,
  withBridgeServer
} from "../helpers/server-harness.js";

test("Godot MCP server creates curated RigidBody3D nodes with collision children", async () => {
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
    if (req.url === "/scene/node/create" && req.method === "POST" && body.type === "RigidBody3D") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Level/CrateBody",
          type: "RigidBody3D",
          parentPath: "Level"
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
    if (req.url === "/scene/node/create" && req.method === "POST" && body.type === "CollisionShape3D") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Level/CrateBody/CrateCollision",
          type: "CollisionShape3D",
          parentPath: "Level/CrateBody"
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
        name: "create_rigid_body_3d",
        arguments: {
          name: "CrateBody",
          parentPath: "Level",
          position: [0, 2, 0],
          rotationDegrees: [0, 20, 0],
          mass: 12,
          gravityScale: 1.4,
          linearDamp: 0.2,
          angularDamp: 0.1,
          contactMonitor: true,
          maxContactsReported: 8,
          freeze: false,
          lockRotation: false,
          collisionShapeKind: "box",
          collisionShapePath: "res://physics/crate_box.tres",
          collisionName: "CrateCollision",
          collisionSize: [2, 1, 3],
          collisionDisabled: false,
          overwriteCollisionShape: true,
          collisionNodeProperties: {
            one_way_collision: false
          },
          properties: {
            linear_velocity: { type: "Vector3", x: 0, y: 0, z: 1 }
          }
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.type, "RigidBody3D");
      assert.equal(payload.data.body.nodePath, "Level/CrateBody");
      assert.equal(payload.data.collisionShapeKind, "box");
      assert.equal(payload.data.collisionShapeClassName, "BoxShape3D");
      assert.equal(payload.data.collision.nodePath, "Level/CrateBody/CrateCollision");
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "RigidBody3D",
            name: "CrateBody",
            parentPath: "Level",
            properties: {
              position: { type: "Vector3", x: 0, y: 2, z: 0 },
              rotation_degrees: { type: "Vector3", x: 0, y: 20, z: 0 },
              mass: 12,
              gravity_scale: 1.4,
              linear_damp: 0.2,
              angular_damp: 0.1,
              contact_monitor: true,
              max_contacts_reported: 8,
              freeze: false,
              lock_rotation: false,
              linear_velocity: { type: "Vector3", x: 0, y: 0, z: 1 }
            }
          }
        },
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://physics/crate_box.tres",
            className: "BoxShape3D",
            properties: {
              size: { type: "Vector3", x: 2, y: 1, z: 3 }
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
            name: "CrateCollision",
            parentPath: "Level/CrateBody",
            properties: {
              shape: {
                type: "Resource",
                path: "res://physics/crate_box.tres"
              },
              disabled: false,
              one_way_collision: false
            }
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server creates curated Area3D trigger volumes with collision children", async () => {
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
    if (req.url === "/scene/node/create" && req.method === "POST" && body.type === "Area3D") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Level/PickupZone",
          type: "Area3D",
          parentPath: "Level"
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
    if (req.url === "/scene/node/create" && req.method === "POST" && body.type === "CollisionShape3D") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Level/PickupZone/PickupTriggerCollision",
          type: "CollisionShape3D",
          parentPath: "Level/PickupZone"
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
        name: "create_area_3d",
        arguments: {
          name: "PickupZone",
          parentPath: "Level",
          position: [0, 1, 0],
          monitoring: true,
          monitorable: false,
          priority: 2,
          collisionLayer: 4,
          collisionMask: 1,
          collisionShapeKind: "sphere",
          collisionShapePath: "res://physics/pickup_sphere.tres",
          collisionName: "PickupTriggerCollision",
          collisionRadius: 1.25,
          overwriteCollisionShape: true,
          collisionNodeProperties: {
            disabled: false
          },
          properties: {
            input_ray_pickable: false
          }
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.type, "Area3D");
      assert.equal(payload.data.area.nodePath, "Level/PickupZone");
      assert.equal(payload.data.collisionShapeKind, "sphere");
      assert.equal(payload.data.collisionShapeClassName, "SphereShape3D");
      assert.equal(payload.data.collision.nodePath, "Level/PickupZone/PickupTriggerCollision");
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "Area3D",
            name: "PickupZone",
            parentPath: "Level",
            properties: {
              position: { type: "Vector3", x: 0, y: 1, z: 0 },
              monitoring: true,
              monitorable: false,
              priority: 2,
              collision_layer: 4,
              collision_mask: 1,
              input_ray_pickable: false
            }
          }
        },
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://physics/pickup_sphere.tres",
            className: "SphereShape3D",
            properties: {
              radius: 1.25
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
            name: "PickupTriggerCollision",
            parentPath: "Level/PickupZone",
            properties: {
              shape: {
                type: "Resource",
                path: "res://physics/pickup_sphere.tres"
              },
              disabled: false
            }
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server creates curated CharacterBody3D nodes with collision children", async () => {
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
    if (req.url === "/scene/node/create" && req.method === "POST" && body.type === "CharacterBody3D") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "PlayerBody",
          type: "CharacterBody3D",
          parentPath: ""
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
    if (req.url === "/scene/node/create" && req.method === "POST" && body.type === "CollisionShape3D") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "PlayerBody/PlayerCollision",
          type: "CollisionShape3D",
          parentPath: "PlayerBody"
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
        name: "create_character_body_3d",
        arguments: {
          name: "PlayerBody",
          parentPath: "",
          position: [0, 1, 0],
          velocity: [0, 0, 0],
          upDirection: [0, 1, 0],
          motionMode: "grounded",
          floorStopOnSlope: true,
          floorBlockOnWall: true,
          floorMaxAngle: 0.7853981633974483,
          floorSnapLength: 0.4,
          slideOnCeiling: true,
          collisionLayer: 1,
          collisionMask: 3,
          collisionShapeKind: "capsule",
          collisionShapePath: "res://physics/player_capsule.tres",
          collisionName: "PlayerCollision",
          collisionRadius: 0.45,
          collisionHeight: 1.8,
          overwriteCollisionShape: true
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.type, "CharacterBody3D");
      assert.equal(payload.data.character.nodePath, "PlayerBody");
      assert.equal(payload.data.collisionShapeKind, "capsule");
      assert.equal(payload.data.collisionShapeClassName, "CapsuleShape3D");
      assert.equal(payload.data.collision.nodePath, "PlayerBody/PlayerCollision");
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "CharacterBody3D",
            name: "PlayerBody",
            parentPath: "",
            properties: {
              position: { type: "Vector3", x: 0, y: 1, z: 0 },
              velocity: { type: "Vector3", x: 0, y: 0, z: 0 },
              up_direction: { type: "Vector3", x: 0, y: 1, z: 0 },
              motion_mode: 0,
              floor_stop_on_slope: true,
              floor_block_on_wall: true,
              floor_max_angle: 0.7853981633974483,
              floor_snap_length: 0.4,
              slide_on_ceiling: true,
              collision_layer: 1,
              collision_mask: 3
            }
          }
        },
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://physics/player_capsule.tres",
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
            name: "PlayerCollision",
            parentPath: "PlayerBody",
            properties: {
              shape: {
                type: "Resource",
                path: "res://physics/player_capsule.tres"
              }
            }
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});

test("Godot MCP server creates curated StaticBody3D nodes with collision children", async () => {
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
    if (req.url === "/scene/node/create" && req.method === "POST" && body.type === "StaticBody3D") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Level/GroundBody",
          type: "StaticBody3D",
          parentPath: "Level"
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
    if (req.url === "/scene/node/create" && req.method === "POST" && body.type === "CollisionShape3D") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          nodePath: "Level/GroundBody/GroundCollision",
          type: "CollisionShape3D",
          parentPath: "Level/GroundBody"
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
        name: "create_static_body_3d",
        arguments: {
          name: "GroundBody",
          parentPath: "Level",
          position: [0, -0.5, 0],
          collisionLayer: 1,
          collisionMask: 1,
          constantLinearVelocity: [0, 0, 0],
          constantAngularVelocity: [0, 0, 0],
          collisionShapeKind: "box",
          collisionShapePath: "res://physics/ground_box.tres",
          collisionName: "GroundCollision",
          collisionSize: [20, 1, 20],
          overwriteCollisionShape: true,
          properties: {
            input_ray_pickable: true
          }
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.type, "StaticBody3D");
      assert.equal(payload.data.body.nodePath, "Level/GroundBody");
      assert.equal(payload.data.collisionShapeKind, "box");
      assert.equal(payload.data.collisionShapeClassName, "BoxShape3D");
      assert.equal(payload.data.collision.nodePath, "Level/GroundBody/GroundCollision");
      assert.deepEqual(received, [
        {
          method: "POST",
          url: "/scene/node/create",
          body: {
            type: "StaticBody3D",
            name: "GroundBody",
            parentPath: "Level",
            properties: {
              position: { type: "Vector3", x: 0, y: -0.5, z: 0 },
              constant_linear_velocity: { type: "Vector3", x: 0, y: 0, z: 0 },
              constant_angular_velocity: { type: "Vector3", x: 0, y: 0, z: 0 },
              collision_layer: 1,
              collision_mask: 1,
              input_ray_pickable: true
            }
          }
        },
        {
          method: "POST",
          url: "/resource/create",
          body: {
            path: "res://physics/ground_box.tres",
            className: "BoxShape3D",
            properties: {
              size: { type: "Vector3", x: 20, y: 1, z: 20 }
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
            name: "GroundCollision",
            parentPath: "Level/GroundBody",
            properties: {
              shape: {
                type: "Resource",
                path: "res://physics/ground_box.tres"
              }
            }
          }
        }
      ]);
    } finally {
      await server.close();
    }
  });
});
