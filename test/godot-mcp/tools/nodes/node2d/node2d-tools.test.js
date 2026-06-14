import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import { NODE2D_TOOL_DEFINITIONS } from "../../../../../src/godot-mcp/tools/nodes/node2d/index.js";
import { NODE2D_TOOL_MANIFEST } from "../../../../../src/godot-mcp/tools/nodes/node2d/manifest.js";

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
  return NODE2D_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readNode2DSource(file) {
  return readFile(new URL(`../../../../../src/godot-mcp/tools/nodes/node2d/${file}`, import.meta.url), "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

test("NODE2D_TOOL_DEFINITIONS exposes curated 2D node descriptors", () => {
  assert.deepEqual(
    NODE2D_TOOL_DEFINITIONS.map(({ name }) => name),
    NODE2D_TOOL_MANIFEST.map(({ name }) => name)
  );

  for (const tool of NODE2D_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("Node2D tool index delegates generated descriptors to focused tools module", async () => {
  const index = await readNode2DSource("index.js");
  const tools = await readNode2DSource("tools.js");

  assert.match(index, /from "\.\/tools\.js"/);
  assert.match(index, /export \{ NODE2D_TOOL_DEFINITIONS \} from "\.\/tools\.js"/);
  assert.doesNotMatch(index, /toolResult/);
  assert.doesNotMatch(index, /NODE2D_TOOL_DEFINITIONS = \[/);

  assert.match(tools, /toolDefinitionsFromManifest\(NODE2D_TOOL_MANIFEST/);
  assert.doesNotMatch(tools, /import \{ toolResult \}/);
  assert.doesNotMatch(tools, /export const NODE2D_TOOL_DEFINITIONS = \[/);
  assert.match(tools, /createSprite2D/);
  assert.match(tools, /createAnimatedSprite2D/);
  assert.match(tools, /createTileMapLayer/);
  assert.match(tools, /setTileMapLayerCells/);
  assert.match(tools, /paintTileMapLayerTerrain/);
  assert.match(tools, /createArea2D/);
});

test("Node2D builders delegate property and kind logic to focused modules", async () => {
  const builders = await readNode2DSource("builders.js");
  const visual = await readNode2DSource("builders/visual.js");
  const collision = await readNode2DSource("builders/collision.js");
  const physics = await readNode2DSource("builders/physics.js");
  const area = await readNode2DSource("builders/area.js");
  const properties = await readNode2DSource("properties.js");
  const kinds = await readNode2DSource("kinds.js");
  const builderSources = [builders, visual, collision, physics, area].join("\n");

  assert.match(builderSources, /properties\.js/);
  assert.match(collision, /from "\.\.\/kinds\.js"/);
  assert.doesNotMatch(builderSources, /function buildCamera2DProperties/);
  assert.doesNotMatch(builderSources, /function buildCollisionShape2DResourceProperties/);
  assert.doesNotMatch(builderSources, /function buildPhysicsBody2DProperties/);
  assert.doesNotMatch(builderSources, /function normalizeCollisionShape2DKind/);

  assert.match(properties, /from "\.\/properties\/shared\.js"/);
  assert.match(properties, /from "\.\/properties\/collision-shapes\.js"/);
  assert.match(properties, /from "\.\/properties\/visual\.js"/);
  assert.match(properties, /from "\.\/properties\/physics-bodies\.js"/);
  assert.doesNotMatch(properties, /export function buildNode2DProperties/);
  assert.doesNotMatch(properties, /export function buildArea2DProperties/);

  assert.match(kinds, /export function normalizeCollisionShape2DKind/);
});

test("Node2D properties facade delegates shared visual collision and physics domains", async () => {
  const facade = await readNode2DSource("properties.js");
  const shared = await readNode2DSource("properties/shared.js");
  const visual = await readNode2DSource("properties/visual.js");
  const collisionShapes = await readNode2DSource("properties/collision-shapes.js");
  const physicsBodies = await readNode2DSource("properties/physics-bodies.js");

  assert.match(facade, /from "\.\/properties\/shared\.js"/);
  assert.match(facade, /from "\.\/properties\/visual\.js"/);
  assert.match(facade, /from "\.\/properties\/collision-shapes\.js"/);
  assert.match(facade, /from "\.\/properties\/physics-bodies\.js"/);
  assert.doesNotMatch(facade, /normalizeFiniteNumber/);
  assert.doesNotMatch(facade, /vector2ToGodotVector/);
  assert.doesNotMatch(facade, /function buildNode2DProperties/);
  assert.doesNotMatch(facade, /function buildCamera2DProperties/);
  assert.doesNotMatch(facade, /function buildCollisionShape2DResourceProperties/);
  assert.doesNotMatch(facade, /function buildPhysicsBody2DProperties/);

  assert.match(shared, /export function resourceRef/);
  assert.match(shared, /export function trimOptionalString/);
  assert.match(shared, /export function mergeAdvancedProperties/);
  assert.match(shared, /export function buildNode2DProperties/);
  assert.match(shared, /export function buildNodeCreateRequest/);
  assert.match(shared, /vector2ToGodotVector/);

  assert.match(visual, /export function buildCamera2DProperties/);
  assert.match(visual, /export function buildAnimatedSprite2DProperties/);
  assert.match(visual, /resourceRef/);

  assert.match(collisionShapes, /export function buildCollisionShape2DResourceProperties/);
  assert.match(collisionShapes, /export function buildCollisionShape2DNodeProperties/);
  assert.match(collisionShapes, /mergeAdvancedProperties/);

  assert.match(physicsBodies, /export function buildPhysicsBody2DProperties/);
  assert.match(physicsBodies, /export function buildArea2DProperties/);
  assert.match(physicsBodies, /normalizeNonNegativeInteger/);
});

test("Node2D builders delegate visual collision physics and area workflows to focused modules", async () => {
  const builders = await readNode2DSource("builders.js");
  const shared = await readNode2DSource("builders/shared.js");
  const visual = await readNode2DSource("builders/visual.js");
  const collision = await readNode2DSource("builders/collision.js");
  const physics = await readNode2DSource("builders/physics.js");
  const area = await readNode2DSource("builders/area.js");

  assert.match(builders, /from "\.\/builders\/shared\.js"/);
  assert.match(builders, /from "\.\/builders\/visual\.js"/);
  assert.match(builders, /from "\.\/builders\/collision\.js"/);
  assert.match(builders, /from "\.\/builders\/physics\.js"/);
  assert.match(builders, /from "\.\/builders\/area\.js"/);
  assert.doesNotMatch(builders, /async function createSprite2DWithClient/);
  assert.doesNotMatch(builders, /export async function createCollisionShape2D/);
  assert.doesNotMatch(builders, /export async function createStaticBody2D/);
  assert.doesNotMatch(builders, /export async function createArea2D/);

  assert.match(shared, /export function slugifyResourceName/);
  assert.match(shared, /export function resolveCreatedNodePath/);
  assert.match(visual, /createSprite2DWithClient/);
  assert.match(visual, /createSprite2D/);
  assert.match(visual, /createAnimatedSprite2D/);
  assert.match(visual, /createCamera2D/);
  assert.match(collision, /export async function createCollisionShape2DWithClient/);
  assert.match(collision, /export async function createCollisionShape2D/);
  assert.match(physics, /from "\.\/physics\/body-workflows\.js"/);
  assert.match(physics, /createStaticBody2D/);
  assert.match(physics, /createCharacterBody2D/);
  assert.match(area, /export async function createArea2D/);
});

test("Node2D physics facade delegates body workflows collision and visual child modules", async () => {
  const facade = await readNode2DSource("builders/physics.js");
  const bodyWorkflows = await readNode2DSource("builders/physics/body-workflows.js");
  const owner = await readNode2DSource("builders/physics/body-workflows/owner.js");
  const bodyResults = await readNode2DSource("builders/physics/body-workflows/results.js");
  const staticBody = await readNode2DSource("builders/physics/body-workflows/static-body.js");
  const characterBody = await readNode2DSource("builders/physics/body-workflows/character-body.js");
  const collisionChild = await readNode2DSource("builders/physics/collision-child.js");
  const visualChild = await readNode2DSource("builders/physics/visual-child.js");

  assert.match(facade, /from "\.\/physics\/body-workflows\.js"/);
  assert.match(facade, /from "\.\/physics\/body-workflows\/owner\.js"/);
  assert.doesNotMatch(facade, /splitBridgeArgs/);
  assert.doesNotMatch(facade, /createCollisionShape2DWithClient/);
  assert.doesNotMatch(facade, /createSprite2DWithClient/);
  assert.doesNotMatch(facade, /resolveCreatedNodePath/);

  assert.match(bodyWorkflows, /from "\.\/body-workflows\/static-body\.js"/);
  assert.match(bodyWorkflows, /from "\.\/body-workflows\/character-body\.js"/);

  assert.match(owner, /export async function createPhysicsBody2DWithClient/);
  assert.match(owner, /from "\.\/results\.js"/);
  assert.match(owner, /buildPhysicsBody2DProperties/);
  assert.match(owner, /buildNodeCreateRequest/);
  assert.match(owner, /createOptionalCollisionShape2DChild/);
  assert.match(owner, /createOptionalVisual2DChild/);
  assert.match(owner, /createdBody/);
  assert.doesNotMatch(owner, /function buildBodyWithoutCollisionResult/);
  assert.doesNotMatch(owner, /collisionShapeKind: null/);
  assert.doesNotMatch(owner, /visualResult\?\.data\?\.node/);

  assert.match(bodyResults, /export function physicsBody2DBodyFailure/);
  assert.match(bodyResults, /export function physicsBody2DCollisionFailure/);
  assert.match(bodyResults, /export function physicsBody2DNoCollisionSuccess/);
  assert.match(bodyResults, /export function physicsBody2DVisualFailure/);
  assert.match(bodyResults, /export function physicsBody2DSuccess/);
  assert.match(bodyResults, /collisionShapeKind: null/);
  assert.match(bodyResults, /visualResult\?\.data\?\.node/);
  assert.match(bodyResults, /collisionShapeClassName/);

  assert.match(staticBody, /export async function createStaticBody2D/);
  assert.match(staticBody, /splitBridgeArgs/);
  assert.match(staticBody, /createPhysicsBody2DWithClient/);
  assert.match(staticBody, /StaticBody2D/);

  assert.match(characterBody, /export async function createCharacterBody2D/);
  assert.match(characterBody, /splitBridgeArgs/);
  assert.match(characterBody, /createPhysicsBody2DWithClient/);
  assert.match(characterBody, /CharacterBody2D/);

  assert.match(collisionChild, /export async function createOptionalCollisionShape2DChild/);
  assert.match(collisionChild, /createCollisionShape2DWithClient/);
  assert.match(collisionChild, /resolveCreatedNodePath/);
  assert.match(collisionChild, /collisionShapePath/);

  assert.match(visualChild, /export async function createOptionalVisual2DChild/);
  assert.match(visualChild, /createSprite2DWithClient/);
  assert.match(visualChild, /createVisual/);
});

test("Node2D Area2D builder delegates child creation and result payload modules", async () => {
  const area = await readNode2DSource("builders/area.js");
  const children = await readNode2DSource("builders/area/children.js");
  const results = await readNode2DSource("builders/area/results.js");

  assert.match(area, /from "\.\/area\/children\.js"/);
  assert.match(area, /from "\.\/area\/results\.js"/);
  assert.match(area, /export async function createArea2D/);
  assert.doesNotMatch(area, /createCollisionShape2DWithClient/);
  assert.doesNotMatch(area, /createSprite2DWithClient/);
  assert.doesNotMatch(area, /collisionShapeKind: collisionResult\.data\.shapeKind/);

  assert.match(children, /export async function createOptionalArea2DCollisionChild/);
  assert.match(children, /export async function createOptionalArea2DVisualChild/);
  assert.match(children, /createCollisionShape2DWithClient/);
  assert.match(children, /createSprite2DWithClient/);
  assert.match(children, /resolveCreatedNodePath/);

  assert.match(results, /export function buildArea2DCreateFailure/);
  assert.match(results, /export function buildArea2DWithoutCollisionResult/);
  assert.match(results, /export function buildArea2DCollisionFailure/);
  assert.match(results, /export function buildArea2DVisualFailure/);
  assert.match(results, /export function buildArea2DSuccess/);
  assert.match(results, /collisionShapeKind: collisionResult\.data\.shapeKind/);
});

test("Node2D visual builder facade delegates path sprite animation and camera domains", async () => {
  const facade = await readNode2DSource("builders/visual.js");
  const paths = await readNode2DSource("builders/visual/paths.js");
  const sprite = await readNode2DSource("builders/visual/sprite.js");
  const animatedSprite = await readNode2DSource("builders/visual/animated-sprite.js");
  const camera = await readNode2DSource("builders/visual/camera.js");

  assert.match(facade, /from "\.\/visual\/paths\.js"/);
  assert.match(facade, /from "\.\/visual\/sprite\.js"/);
  assert.match(facade, /from "\.\/visual\/animated-sprite\.js"/);
  assert.match(facade, /from "\.\/visual\/camera\.js"/);
  assert.doesNotMatch(facade, /splitBridgeArgs/);
  assert.doesNotMatch(facade, /client\.createResource/);
  assert.doesNotMatch(facade, /normalizeSpriteFrameAnimations/);

  assert.match(paths, /export function defaultPlaceholderTexturePath/);
  assert.match(paths, /export function defaultSpriteFramesPath/);
  assert.match(paths, /slugifyResourceName/);

  assert.match(sprite, /export async function createSprite2DWithClient/);
  assert.match(sprite, /export async function createSprite2D/);
  assert.match(sprite, /vector2ToGodotVector/);
  assert.match(sprite, /client\.createResource/);
  assert.match(sprite, /client\.createNode/);

  assert.match(animatedSprite, /export async function createAnimatedSprite2D/);
  assert.match(animatedSprite, /normalizeSpriteFrameAnimations/);
  assert.match(animatedSprite, /client\.createSpriteFrames/);
  assert.match(animatedSprite, /client\.createNode/);

  assert.match(camera, /export async function createCamera2D/);
  assert.match(camera, /buildCamera2DProperties/);
  assert.match(camera, /client\.createNode/);
});

test("Node2D TileMapLayer tools delegate create cells terrain property and TileSet domains", async () => {
  const facade = await readNode2DSource("tile-map.js");
  const createLayer = await readNode2DSource("tile-map/create-layer.js");
  const cells = await readNode2DSource("tile-map/cells.js");
  const terrain = await readNode2DSource("tile-map/terrain.js");
  const properties = await readNode2DSource("tile-map/properties.js");
  const tileSet = await readNode2DSource("tile-map/tile-set.js");

  assert.match(facade, /from "\.\/tile-map\/create-layer\.js"/);
  assert.match(facade, /from "\.\/tile-map\/cells\.js"/);
  assert.match(facade, /from "\.\/tile-map\/terrain\.js"/);
  assert.doesNotMatch(facade, /splitBridgeArgs/);
  assert.doesNotMatch(facade, /buildTileSetRequest/);
  assert.doesNotMatch(facade, /function buildTileMapLayerProperties/);

  assert.match(createLayer, /export async function createTileMapLayer/);
  assert.match(createLayer, /buildGeneratedTileSetRequest/);
  assert.match(createLayer, /buildTileMapLayerProperties/);
  assert.match(createLayer, /normalizeTileMapCells/);
  assert.match(createLayer, /client\.createTileSet/);
  assert.match(createLayer, /client\.setTileMapLayerCells/);

  assert.match(cells, /export function normalizeTileMapCells/);
  assert.match(cells, /export function buildTileMapLayerCellsRequest/);
  assert.match(cells, /export async function setTileMapLayerCells/);
  assert.match(cells, /allowEmpty/);
  assert.match(cells, /alternativeTile/);

  assert.match(terrain, /export function buildTileMapLayerTerrainPaintRequest/);
  assert.match(terrain, /export async function paintTileMapLayerTerrain/);
  assert.match(terrain, /mode !== "connect" && mode !== "path"/);
  assert.match(terrain, /ignoreEmptyTerrains/);

  assert.match(properties, /export function buildTileMapLayerProperties/);
  assert.match(properties, /rendering_quadrant_size/);
  assert.match(properties, /collision_enabled/);
  assert.match(properties, /resourceRef/);

  assert.match(tileSet, /export function normalizeResPath/);
  assert.match(tileSet, /export function defaultTileSetPath/);
  assert.match(tileSet, /export function buildGeneratedTileSetRequest/);
  assert.match(tileSet, /must start with res:\/\//);
  assert.match(tileSet, /slugifyResourceName/);
});

test("Node2D schemas delegate visual tile-map and physics catalogs to focused modules", async () => {
  const schemas = await readNode2DSource("schemas.js");
  const visual = await readNode2DSource("schemas/visual.js");
  const tileMap = await readNode2DSource("schemas/tile-map.js");
  const physics = await readNode2DSource("schemas/physics.js");
  const shared = await readNode2DSource("schemas/shared.js");
  const sharedBase = await readNode2DSource("schemas/shared/base.js");
  const sharedPhysicsBody = await readNode2DSource("schemas/shared/physics-body.js");
  const sharedTileMapCells = await readNode2DSource("schemas/shared/tile-map-cells.js");

  assert.match(schemas, /from "\.\/schemas\/visual\.js"/);
  assert.match(schemas, /from "\.\/schemas\/tile-map\.js"/);
  assert.match(schemas, /from "\.\/schemas\/physics\.js"/);
  assert.doesNotMatch(schemas, /const NODE2D_TRANSFORM_PROPERTIES/);
  assert.doesNotMatch(schemas, /const PHYSICS_BODY_PROPERTIES/);
  assert.doesNotMatch(schemas, /export const CREATE_SPRITE_2D_SCHEMA/);
  assert.doesNotMatch(schemas, /export const CREATE_TILE_MAP_LAYER_SCHEMA/);
  assert.doesNotMatch(schemas, /export const CREATE_AREA_2D_SCHEMA/);

  assert.match(visual, /from "\.\/visual\/sprite\.js"/);
  assert.match(visual, /from "\.\/visual\/animated-sprite\.js"/);
  assert.match(visual, /from "\.\/visual\/camera\.js"/);
  assert.doesNotMatch(visual, /export const CREATE_SPRITE_2D_SCHEMA/);
  assert.doesNotMatch(visual, /export const CREATE_ANIMATED_SPRITE_2D_SCHEMA/);
  assert.doesNotMatch(visual, /export const CREATE_CAMERA_2D_SCHEMA/);

  assert.match(tileMap, /export const CREATE_TILE_MAP_LAYER_SCHEMA/);
  assert.match(tileMap, /export const SET_TILE_MAP_LAYER_CELLS_SCHEMA/);
  assert.match(tileMap, /export const PAINT_TILE_MAP_LAYER_TERRAIN_SCHEMA/);

  assert.match(physics, /export const CREATE_COLLISION_SHAPE_2D_SCHEMA/);
  assert.match(physics, /export const CREATE_STATIC_BODY_2D_SCHEMA/);
  assert.match(physics, /export const CREATE_CHARACTER_BODY_2D_SCHEMA/);
  assert.match(physics, /export const CREATE_AREA_2D_SCHEMA/);

  assert.match(shared, /from "\.\/shared\/base\.js"/);
  assert.match(shared, /from "\.\/shared\/physics-body\.js"/);
  assert.match(shared, /from "\.\/shared\/tile-map-cells\.js"/);
  assert.doesNotMatch(shared, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(shared, /collisionShapeKind/);
  assert.doesNotMatch(shared, /TileMapLayer cell set\/erase operations/);

  assert.match(sharedBase, /export const BASE_NODE2D_PROPERTIES/);
  assert.match(sharedBase, /export const NODE2D_TRANSFORM_PROPERTIES/);
  assert.match(sharedBase, /export function nodeNameProperty/);
  assert.match(sharedBase, /export const ADVANCED_NODE_PROPERTIES/);
  assert.match(sharedBase, /CONNECTION_PROPERTIES/);

  assert.match(sharedPhysicsBody, /export const PHYSICS_BODY_PROPERTIES/);
  assert.match(sharedPhysicsBody, /collisionShapeKind/);
  assert.match(sharedPhysicsBody, /createVisual/);
  assert.match(sharedPhysicsBody, /visualPlaceholderTexturePath/);

  assert.match(sharedTileMapCells, /export const TILE_MAP_CELLS_SCHEMA/);
  assert.match(sharedTileMapCells, /TileMapLayer cell set\/erase operations/);
  assert.match(sharedTileMapCells, /alternativeTile/);
});

test("Node2D visual schemas delegate sprite animated sprite and camera domains", async () => {
  const facade = await readNode2DSource("schemas/visual.js");
  const sprite = await readNode2DSource("schemas/visual/sprite.js");
  const animatedSprite = await readNode2DSource("schemas/visual/animated-sprite.js");
  const camera = await readNode2DSource("schemas/visual/camera.js");

  assert.match(facade, /from "\.\/visual\/sprite\.js"/);
  assert.match(facade, /from "\.\/visual\/animated-sprite\.js"/);
  assert.match(facade, /from "\.\/visual\/camera\.js"/);
  assert.doesNotMatch(facade, /BASE_NODE2D_PROPERTIES/);
  assert.doesNotMatch(facade, /CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA/);

  assert.match(sprite, /export const CREATE_SPRITE_2D_SCHEMA/);
  assert.match(sprite, /BASE_NODE2D_PROPERTIES/);
  assert.match(sprite, /nodeNameProperty/);
  assert.match(sprite, /PlaceholderTexture2D/);
  assert.doesNotMatch(sprite, /CREATE_ANIMATED_SPRITE_2D_SCHEMA/);

  assert.match(animatedSprite, /export const CREATE_ANIMATED_SPRITE_2D_SCHEMA/);
  assert.match(animatedSprite, /CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA/);
  assert.match(animatedSprite, /spriteFramesPath/);
  assert.match(animatedSprite, /openSpriteFrames/);
  assert.doesNotMatch(animatedSprite, /CREATE_CAMERA_2D_SCHEMA/);

  assert.match(camera, /export const CREATE_CAMERA_2D_SCHEMA/);
  assert.match(camera, /zoom/);
  assert.match(camera, /limitLeft/);
  assert.match(camera, /limitBottom/);
  assert.doesNotMatch(camera, /CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA/);
});

test("create_sprite_2d creates a placeholder texture and referencing Sprite2D", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    received.push({ url: req.url, body: await readJsonBody(req) });
    res.setHeader("content-type", "application/json");
    if (req.url === "/resource/create") {
      res.end(JSON.stringify({ ok: true, data: { path: "res://generated/player_placeholder_texture.tres" } }));
      return;
    }
    res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/PlayerVisual" } }));
  }, async (port) => {
    const result = await toolByName("create_sprite_2d").handler({
      port,
      name: "PlayerVisual",
      parentPath: "Root",
      position: [4, 8],
      scale: [1.5, 1.5],
      size: [64, 96],
      placeholderTexturePath: "res://generated/player_placeholder_texture.tres",
      overwriteTexture: true
    });

    assert.deepEqual(received, [
      {
        url: "/resource/create",
        body: {
          path: "res://generated/player_placeholder_texture.tres",
          className: "PlaceholderTexture2D",
          properties: {
            size: { type: "Vector2", x: 64, y: 96 }
          },
          open: false,
          overwrite: true
        }
      },
      {
        url: "/scene/node/create",
        body: {
          type: "Sprite2D",
          name: "PlayerVisual",
          parentPath: "Root",
          properties: {
            position: { type: "Vector2", x: 4, y: 8 },
            scale: { type: "Vector2", x: 1.5, y: 1.5 },
            texture: { type: "Resource", path: "res://generated/player_placeholder_texture.tres" }
          }
        }
      }
    ]);
    assert.deepEqual(parseToolText(result).data.node, { nodePath: "Root/PlayerVisual" });
  });
});

test("create_animated_sprite_2d creates SpriteFrames and referencing AnimatedSprite2D", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ url: req.url, body });
    res.setHeader("content-type", "application/json");
    if (req.url === "/resource/sprite-frames/create") {
      res.end(JSON.stringify({ ok: true, data: { path: body.path, type: "SpriteFrames" } }));
      return;
    }
    if (req.url === "/scene/node/create" && body.type === "AnimatedSprite2D") {
      res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/PlayerAnimated" } }));
      return;
    }
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("create_animated_sprite_2d").handler({
      port,
      name: "PlayerAnimated",
      parentPath: "Root",
      position: [12, -8],
      spriteFramesResourcePath: "res://animations/player_frames.tres",
      resourceName: "Player Frames",
      animations: [
        {
          name: "idle",
          speedFps: 8,
          loop: true,
          frames: [
            { texturePath: "res://sprites/player_idle_0.png" },
            { texturePath: "res://sprites/player_idle_1.png", duration: 1.5 }
          ]
        }
      ],
      animation: "idle",
      autoplay: "idle",
      speedScale: 1.25,
      playing: true,
      centered: false,
      offset: [4, 2],
      flipH: true,
      overwriteSpriteFrames: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.node.nodePath, "Root/PlayerAnimated");
    assert.equal(payload.data.spriteFramesPath, "res://animations/player_frames.tres");
    assert.deepEqual(received, [
      {
        url: "/resource/sprite-frames/create",
        body: {
          path: "res://animations/player_frames.tres",
          resourceName: "Player Frames",
          animations: [
            {
              name: "idle",
              speedFps: 8,
              loop: true,
              frames: [
                { texturePath: "res://sprites/player_idle_0.png", duration: 1 },
                { texturePath: "res://sprites/player_idle_1.png", duration: 1.5 }
              ]
            }
          ],
          open: false,
          overwrite: true
        }
      },
      {
        url: "/scene/node/create",
        body: {
          type: "AnimatedSprite2D",
          name: "PlayerAnimated",
          parentPath: "Root",
          properties: {
            position: { type: "Vector2", x: 12, y: -8 },
            sprite_frames: { type: "Resource", path: "res://animations/player_frames.tres" },
            animation: "idle",
            autoplay: "idle",
            speed_scale: 1.25,
            playing: true,
            centered: false,
            offset: { type: "Vector2", x: 4, y: 2 },
            flip_h: true
          }
        }
      }
    ]);
  });
});

test("create_tile_map_layer creates TileSet, TileMapLayer, and initial cells", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ url: req.url, body });
    res.setHeader("content-type", "application/json");
    if (req.url === "/resource/tile-set/create") {
      res.end(JSON.stringify({ ok: true, data: { path: body.path, type: "TileSet" } }));
      return;
    }
    if (req.url === "/scene/node/create" && body.type === "TileMapLayer") {
      res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/GroundLayer" } }));
      return;
    }
    if (req.url === "/scene/tile-map-layer/cells/set") {
      res.end(JSON.stringify({ ok: true, data: { nodePath: body.nodePath, setCount: body.cells.length } }));
      return;
    }
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("create_tile_map_layer").handler({
      port,
      name: "GroundLayer",
      parentPath: "Root",
      position: [0, 16],
      tileSetResourcePath: "res://tilesets/arena.tres",
      resourceName: "Arena Tiles",
      tileSize: [32, 32],
      sources: [
        {
          sourceId: 0,
          texturePath: "res://tiles/arena.png",
          textureRegionSize: [32, 32],
          grid: {
            columns: 2,
            rows: 1
          }
        }
      ],
      enabled: true,
      renderingQuadrantSize: 32,
      collisionEnabled: true,
      navigationEnabled: false,
      cells: [
        {
          coords: [0, 0],
          sourceId: 0,
          atlasCoords: [1, 0]
        }
      ]
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.node.nodePath, "Root/GroundLayer");
    assert.equal(payload.data.tileSetPath, "res://tilesets/arena.tres");
    assert.deepEqual(received, [
      {
        url: "/resource/tile-set/create",
        body: {
          path: "res://tilesets/arena.tres",
          tileSize: { x: 32, y: 32 },
          sources: [
            {
              sourceId: 0,
              texturePath: "res://tiles/arena.png",
              textureRegionSize: { x: 32, y: 32 },
              tiles: [
                { atlasCoords: { x: 0, y: 0 }, size: { x: 1, y: 1 } },
                { atlasCoords: { x: 1, y: 0 }, size: { x: 1, y: 1 } }
              ]
            }
          ],
          open: false,
          overwrite: false,
          resourceName: "Arena Tiles"
        }
      },
      {
        url: "/scene/node/create",
        body: {
          type: "TileMapLayer",
          name: "GroundLayer",
          parentPath: "Root",
          properties: {
            position: { type: "Vector2", x: 0, y: 16 },
            tile_set: { type: "Resource", path: "res://tilesets/arena.tres" },
            enabled: true,
            rendering_quadrant_size: 32,
            collision_enabled: true,
            navigation_enabled: false
          }
        }
      },
      {
        url: "/scene/tile-map-layer/cells/set",
        body: {
          nodePath: "Root/GroundLayer",
          clear: false,
          cells: [
            {
              coords: { x: 0, y: 0 },
              sourceId: 0,
              atlasCoords: { x: 1, y: 0 },
              alternativeTile: 0
            }
          ]
        }
      }
    ]);
  });
});

test("set_tile_map_layer_cells forwards normalized cell edits", async () => {
  let received = null;

  await withJsonBridge(async (req, res) => {
    received = { url: req.url, body: await readJsonBody(req) };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { nodePath: received.body.nodePath } }));
  }, async (port) => {
    const result = await toolByName("set_tile_map_layer_cells").handler({
      port,
      nodePath: "Root/GroundLayer",
      clear: true,
      cells: [
        {
          coords: [2, 3],
          sourceId: "0",
          atlasCoords: [1, 0],
          alternativeTile: "0"
        },
        {
          coords: { x: 4, y: 3 },
          erase: true
        }
      ]
    });

    assert.deepEqual(received, {
      url: "/scene/tile-map-layer/cells/set",
      body: {
        nodePath: "Root/GroundLayer",
        clear: true,
        cells: [
          {
            coords: { x: 2, y: 3 },
            sourceId: 0,
            atlasCoords: { x: 1, y: 0 },
            alternativeTile: 0
          },
          {
            coords: { x: 4, y: 3 },
            erase: true
          }
        ]
      }
    });
    assert.equal(parseToolText(result).data.nodePath, "Root/GroundLayer");
  });
});

test("paint_tile_map_layer_terrain forwards normalized terrain painting", async () => {
  let received = null;

  await withJsonBridge(async (req, res) => {
    received = { url: req.url, body: await readJsonBody(req) };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: {
        nodePath: received.body.nodePath,
        mode: received.body.mode,
        paintedCount: received.body.coords.length
      }
    }));
  }, async (port) => {
    const result = await toolByName("paint_tile_map_layer_terrain").handler({
      port,
      nodePath: "World/GroundLayer",
      mode: "path",
      terrainSet: "0",
      terrain: "2",
      coords: [[0, 0], { x: "1", y: 0 }, [2, 1]],
      ignoreEmptyTerrains: false
    });

    assert.deepEqual(received, {
      url: "/scene/tile-map-layer/terrain/paint",
      body: {
        nodePath: "World/GroundLayer",
        mode: "path",
        terrainSet: 0,
        terrain: 2,
        coords: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }],
        ignoreEmptyTerrains: false
      }
    });
    assert.equal(parseToolText(result).data.paintedCount, 3);
  });
});

test("create_camera_2d builds camera properties and creates a node", async () => {
  let received = null;

  await withJsonBridge(async (req, res) => {
    received = { url: req.url, body: await readJsonBody(req) };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/PlayerCamera" } }));
  }, async (port) => {
    const result = await toolByName("create_camera_2d").handler({
      port,
      name: "PlayerCamera",
      parentPath: "Root",
      position: [0, -120],
      zoom: [1.25, 1.25],
      enabled: true,
      limitLeft: -200,
      limitRight: 200
    });

    assert.deepEqual(received, {
      url: "/scene/node/create",
      body: {
        type: "Camera2D",
        name: "PlayerCamera",
        parentPath: "Root",
        properties: {
          position: { type: "Vector2", x: 0, y: -120 },
          zoom: { type: "Vector2", x: 1.25, y: 1.25 },
          enabled: true,
          limit_left: -200,
          limit_right: 200
        }
      }
    });
    assert.deepEqual(parseToolText(result).data.node, { nodePath: "Root/PlayerCamera" });
  });
});

test("create_collision_shape_2d creates a shape resource and CollisionShape2D", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    received.push({ url: req.url, body: await readJsonBody(req) });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("create_collision_shape_2d").handler({
      port,
      name: "PlayerCollision",
      parentPath: "Root/PlayerBody",
      shapeKind: "capsule",
      shapePath: "res://generated/player_shape.tres",
      radius: 14,
      height: 48,
      disabled: false,
      overwrite: true
    });

    assert.deepEqual(received, [
      {
        url: "/resource/create",
        body: {
          path: "res://generated/player_shape.tres",
          className: "CapsuleShape2D",
          properties: {
            radius: 14,
            height: 48
          },
          open: false,
          overwrite: true
        }
      },
      {
        url: "/scene/node/create",
        body: {
          type: "CollisionShape2D",
          name: "PlayerCollision",
          parentPath: "Root/PlayerBody",
          properties: {
            disabled: false,
            shape: { type: "Resource", path: "res://generated/player_shape.tres" }
          }
        }
      }
    ]);
    assert.deepEqual(parseToolText(result).data.shape, { endpoint: "/resource/create" });
  });
});

test("create_character_body_2d creates body, collision child, and optional sprite child", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ url: req.url, body });
    res.setHeader("content-type", "application/json");
    if (req.url === "/scene/node/create" && body.type === "CharacterBody2D") {
      res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/PlayerBody" } }));
      return;
    }
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("create_character_body_2d").handler({
      port,
      name: "PlayerBody",
      parentPath: "Root",
      position: [0, -64],
      collisionLayer: 1,
      collisionMask: 1,
      collisionShapeKind: "capsule",
      collisionShapePath: "res://generated/player_shape.tres",
      collisionName: "PlayerCollision",
      collisionRadius: 14,
      collisionHeight: 48,
      createVisual: true,
      visualName: "PlayerVisual",
      visualSize: [32, 64],
      visualPlaceholderTexturePath: "res://generated/player_texture.tres",
      overwriteVisualTexture: true
    });

    assert.equal(received[0].url, "/scene/node/create");
    assert.equal(received[0].body.type, "CharacterBody2D");
    assert.deepEqual(received[1].body, {
      path: "res://generated/player_shape.tres",
      className: "CapsuleShape2D",
      properties: {
        radius: 14,
        height: 48
      },
      open: false,
      overwrite: false
    });
    assert.equal(received[2].body.type, "CollisionShape2D");
    assert.equal(received[2].body.parentPath, "Root/PlayerBody");
    assert.equal(received[3].body.className, "PlaceholderTexture2D");
    assert.equal(received[4].body.type, "Sprite2D");
    assert.equal(received[4].body.parentPath, "Root/PlayerBody");
    assert.equal(parseToolText(result).data.character.nodePath, "Root/PlayerBody");
  });
});

test("create_area_2d creates trigger Area2D with collision and optional sprite child", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ url: req.url, body });
    res.setHeader("content-type", "application/json");
    if (req.url === "/scene/node/create" && body.type === "Area2D") {
      res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/PickupZone" } }));
      return;
    }
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("create_area_2d").handler({
      port,
      name: "PickupZone",
      parentPath: "Root",
      position: [24, -16],
      monitoring: true,
      monitorable: false,
      priority: 3,
      collisionLayer: 2,
      collisionMask: 1,
      collisionShapeKind: "circle",
      collisionShapePath: "res://generated/pickup_zone_shape.tres",
      collisionName: "PickupZoneCollision",
      collisionRadius: 32,
      overwriteCollisionShape: true,
      createVisual: true,
      visualName: "PickupZoneVisual",
      visualSize: [64, 64],
      visualPlaceholderTexturePath: "res://generated/pickup_zone_texture.tres",
      overwriteVisualTexture: true,
      properties: {
        input_pickable: false
      }
    });

    assert.equal(parseToolText(result).data.area.nodePath, "Root/PickupZone");
    assert.deepEqual(received, [
      {
        url: "/scene/node/create",
        body: {
          type: "Area2D",
          name: "PickupZone",
          parentPath: "Root",
          properties: {
            position: { type: "Vector2", x: 24, y: -16 },
            monitoring: true,
            monitorable: false,
            priority: 3,
            collision_layer: 2,
            collision_mask: 1,
            input_pickable: false
          }
        }
      },
      {
        url: "/resource/create",
        body: {
          path: "res://generated/pickup_zone_shape.tres",
          className: "CircleShape2D",
          properties: {
            radius: 32
          },
          open: false,
          overwrite: true
        }
      },
      {
        url: "/scene/node/create",
        body: {
          type: "CollisionShape2D",
          name: "PickupZoneCollision",
          parentPath: "Root/PickupZone",
          properties: {
            shape: { type: "Resource", path: "res://generated/pickup_zone_shape.tres" }
          }
        }
      },
      {
        url: "/resource/create",
        body: {
          path: "res://generated/pickup_zone_texture.tres",
          className: "PlaceholderTexture2D",
          properties: {
            size: { type: "Vector2", x: 64, y: 64 }
          },
          open: false,
          overwrite: true
        }
      },
      {
        url: "/scene/node/create",
        body: {
          type: "Sprite2D",
          name: "PickupZoneVisual",
          parentPath: "Root/PickupZone",
          properties: {
            texture: { type: "Resource", path: "res://generated/pickup_zone_texture.tres" }
          }
        }
      }
    ]);
  });
});
