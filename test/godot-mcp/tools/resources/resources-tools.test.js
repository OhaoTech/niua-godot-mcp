import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import {
  MATERIAL_ASSIGNMENT_TOOL_DEFINITIONS,
  RESOURCE_TOOL_DEFINITIONS
} from "../../../../src/godot-mcp/tools/resources/index.js";
import {
  MATERIAL_ASSIGNMENT_TOOL_MANIFEST,
  RESOURCE_BRIDGE_TOOL_MANIFEST,
  RESOURCE_PRIMARY_TOOL_MANIFEST,
  RESOURCE_TOOL_MANIFEST
} from "../../../../src/godot-mcp/tools/resources/manifest.js";

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

function resourceToolByName(name) {
  return RESOURCE_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function assignmentToolByName(name) {
  return MATERIAL_ASSIGNMENT_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readResourceSource(file) {
  return readFile(new URL(`../../../../src/godot-mcp/tools/resources/${file}`, import.meta.url), "utf8");
}

async function readBridgeClientSource(file) {
  return readFile(new URL(`../../../../src/godot-mcp/bridge-client/${file}`, import.meta.url), "utf8");
}

test("resource tool groups expose resource descriptors", () => {
  assert.deepEqual(
    RESOURCE_TOOL_DEFINITIONS.map((tool) => tool.name),
    RESOURCE_PRIMARY_TOOL_MANIFEST.map((entry) => entry.name)
  );
  assert.deepEqual(
    MATERIAL_ASSIGNMENT_TOOL_DEFINITIONS.map((tool) => tool.name),
    MATERIAL_ASSIGNMENT_TOOL_MANIFEST.map((entry) => entry.name)
  );
  assert.deepEqual(RESOURCE_TOOL_MANIFEST.map((entry) => entry.name), [
    ...RESOURCE_PRIMARY_TOOL_MANIFEST.map((entry) => entry.name),
    ...MATERIAL_ASSIGNMENT_TOOL_MANIFEST.map((entry) => entry.name)
  ]);
});

test("resource tools and bridge client are generated from the manifest", async () => {
  const index = await readResourceSource("index.js");
  const manifest = await readResourceSource("manifest.js");
  const bridge = await readBridgeClientSource("resources.js");

  assert.match(index, /toolDefinitionsFromManifest\(RESOURCE_PRIMARY_TOOL_MANIFEST/);
  assert.match(index, /toolDefinitionsFromManifest\(MATERIAL_ASSIGNMENT_TOOL_MANIFEST/);
  assert.match(index, /adapterHandlers/);
  assert.match(index, /createSpriteFrames:/);
  assert.match(index, /createTileSet:/);
  assert.match(index, /createMaterial:/);
  assert.match(index, /createShaderMaterial:/);
  assert.doesNotMatch(index, /RESOURCE_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /MATERIAL_ASSIGNMENT_TOOL_DEFINITIONS = \[/);

  assert.match(bridge, /bridgeMethodsFromManifest\(RESOURCE_BRIDGE_TOOL_MANIFEST\)/);
  assert.doesNotMatch(bridge, /async openResource/);
  assert.doesNotMatch(bridge, /async createResource/);
  assert.doesNotMatch(bridge, /async createShaderMaterial/);

  assert.match(manifest, /adapter: \{\s*handler: "createSpriteFrames"/);
  assert.match(manifest, /adapter: \{\s*handler: "createTileSet"/);
  assert.match(manifest, /adapter: \{\s*handler: "createMaterial"/);
  assert.match(manifest, /adapter: \{\s*handler: "createShaderMaterial"/);
  assert.deepEqual(RESOURCE_BRIDGE_TOOL_MANIFEST.map((entry) => entry.bridge.clientMethod), [
    "openResource",
    "focusResource",
    "createResource",
    "saveResource",
    "createSpriteFrames",
    "createTileSet",
    "createShaderMaterial"
  ]);
});

test("resource schemas delegate filesystem sprite tile and material catalogs to focused modules", async () => {
  const schemas = await readResourceSource("schemas.js");
  const shared = await readResourceSource("schemas/shared.js");
  const filesystem = await readResourceSource("schemas/filesystem.js");
  const spriteFrames = await readResourceSource("schemas/sprite-frames.js");
  const tileSets = await readResourceSource("schemas/tile-sets.js");
  const materials = await readResourceSource("schemas/materials.js");

  assert.match(schemas, /from "\.\/schemas\/filesystem\.js"/);
  assert.match(schemas, /from "\.\/schemas\/sprite-frames\.js"/);
  assert.match(schemas, /from "\.\/schemas\/tile-sets\.js"/);
  assert.match(schemas, /from "\.\/schemas\/materials\.js"/);
  assert.doesNotMatch(schemas, /export const CREATE_RESOURCE_SCHEMA/);
  assert.doesNotMatch(schemas, /export const CREATE_SPRITE_FRAMES_SCHEMA/);
  assert.doesNotMatch(schemas, /export const CREATE_TILE_SET_SCHEMA/);
  assert.doesNotMatch(schemas, /export const CREATE_MATERIAL_SCHEMA/);

  assert.match(shared, /export const VECTOR2_SCHEMA/);
  assert.match(shared, /export const VECTOR2I_SCHEMA/);

  assert.match(filesystem, /export const FILESYSTEM_PATH_SCHEMA/);
  assert.match(filesystem, /export const CREATE_RESOURCE_SCHEMA/);
  assert.match(filesystem, /export const SAVE_RESOURCE_SCHEMA/);

  assert.match(spriteFrames, /from "\.\/sprite-frames\/animations\.js"/);
  assert.match(spriteFrames, /from "\.\/sprite-frames\/create\.js"/);
  assert.doesNotMatch(spriteFrames, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(spriteFrames, /VECTOR2_SCHEMA/);

  assert.match(tileSets, /from "\.\/tile-sets\/create\.js"/);
  assert.doesNotMatch(tileSets, /CREATE_TILE_SET_SOURCE_SCHEMA/);

  assert.match(materials, /from "\.\/materials\/create\.js"/);
  assert.match(materials, /from "\.\/materials\/shader\.js"/);
  assert.match(materials, /from "\.\/materials\/assignment\.js"/);
  assert.match(materials, /CREATE_MATERIAL_SCHEMA/);
  assert.match(materials, /CREATE_SHADER_MATERIAL_SCHEMA/);
  assert.match(materials, /ASSIGN_MATERIAL_SCHEMA/);
});

test("Material resource schemas delegate create shader and assignment modules", async () => {
  const facade = await readResourceSource("schemas/materials.js");
  const create = await readResourceSource("schemas/materials/create.js");
  const shader = await readResourceSource("schemas/materials/shader.js");
  const assignment = await readResourceSource("schemas/materials/assignment.js");

  assert.match(facade, /from "\.\/materials\/create\.js"/);
  assert.match(facade, /from "\.\/materials\/shader\.js"/);
  assert.match(facade, /from "\.\/materials\/assignment\.js"/);
  assert.doesNotMatch(facade, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(facade, /MATERIAL_ASSIGNMENT_TARGET_SCHEMA/);
  assert.doesNotMatch(facade, /albedoColor/);
  assert.doesNotMatch(facade, /shaderPath/);
  assert.doesNotMatch(facade, /surfaceIndex/);

  assert.match(create, /export const CREATE_MATERIAL_SCHEMA/);
  assert.match(create, /MATERIAL_ASSIGNMENT_TARGET_SCHEMA/);
  assert.match(create, /albedoColor/);
  assert.match(create, /metallic/);
  assert.match(create, /roughness/);
  assert.match(create, /emissionEnergyMultiplier/);
  assert.match(create, /Advanced Godot material properties/);

  assert.match(shader, /export const CREATE_SHADER_MATERIAL_SCHEMA/);
  assert.match(shader, /MATERIAL_ASSIGNMENT_TARGET_SCHEMA/);
  assert.match(shader, /shaderPath/);
  assert.match(shader, /resourceName/);
  assert.match(shader, /overwriteShader/);
  assert.match(shader, /code/);
  assert.match(shader, /required: \["path", "shaderPath", "code"\]/);

  assert.match(assignment, /export const ASSIGN_MATERIAL_SCHEMA/);
  assert.match(assignment, /CONNECTION_PROPERTIES/);
  assert.match(assignment, /nodePath/);
  assert.match(assignment, /materialPath/);
  assert.match(assignment, /surfaceIndex/);
  assert.match(assignment, /required: \["nodePath", "materialPath"\]/);
});

test("TileSet resource schemas delegate create source collision terrain and physics modules", async () => {
  const facade = await readResourceSource("schemas/tile-sets.js");
  const create = await readResourceSource("schemas/tile-sets/create.js");
  const sources = await readResourceSource("schemas/tile-sets/sources.js");
  const collision = await readResourceSource("schemas/tile-sets/collision.js");
  const terrain = await readResourceSource("schemas/tile-sets/terrain.js");
  const physics = await readResourceSource("schemas/tile-sets/physics.js");

  assert.match(facade, /from "\.\/tile-sets\/create\.js"/);
  assert.doesNotMatch(facade, /CREATE_TILE_SET_SOURCE_SCHEMA/);
  assert.doesNotMatch(facade, /CONNECTION_PROPERTIES/);

  assert.match(create, /export const CREATE_TILE_SET_SCHEMA/);
  assert.match(create, /CREATE_TILE_SET_SOURCE_SCHEMA/);
  assert.match(create, /CREATE_TILE_SET_PHYSICS_LAYER_SCHEMA/);
  assert.match(create, /CREATE_TILE_SET_TERRAIN_SET_SCHEMA/);
  assert.match(create, /CONNECTION_PROPERTIES/);

  assert.match(sources, /export const CREATE_TILE_SET_SOURCE_SCHEMA/);
  assert.match(sources, /CREATE_TILE_SET_COLLISION_POLYGON_SCHEMA/);
  assert.match(sources, /CREATE_TILE_SET_TILE_TERRAIN_SCHEMA/);
  assert.match(sources, /textureRegionSize/);
  assert.match(sources, /grid/);

  assert.match(collision, /export const CREATE_TILE_SET_COLLISION_POLYGON_SCHEMA/);
  assert.match(collision, /oneWayMargin/);

  assert.match(terrain, /export const CREATE_TILE_SET_TILE_TERRAIN_SCHEMA/);
  assert.match(terrain, /export const CREATE_TILE_SET_TERRAIN_SET_SCHEMA/);
  assert.match(terrain, /peeringBits/);

  assert.match(physics, /export const CREATE_TILE_SET_PHYSICS_LAYER_SCHEMA/);
  assert.match(physics, /physicsMaterialPath/);
});

test("SpriteFrames resource schemas delegate frame sheet animation and create modules", async () => {
  const facade = await readResourceSource("schemas/sprite-frames.js");
  const frames = await readResourceSource("schemas/sprite-frames/frames.js");
  const sheets = await readResourceSource("schemas/sprite-frames/sheets.js");
  const animations = await readResourceSource("schemas/sprite-frames/animations.js");
  const create = await readResourceSource("schemas/sprite-frames/create.js");

  assert.match(facade, /from "\.\/sprite-frames\/animations\.js"/);
  assert.match(facade, /from "\.\/sprite-frames\/create\.js"/);
  assert.doesNotMatch(facade, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(facade, /VECTOR2_SCHEMA/);
  assert.doesNotMatch(facade, /CREATE_SPRITE_FRAME_REGION_SCHEMA/);
  assert.doesNotMatch(facade, /CREATE_SPRITE_SHEET_SCHEMA/);

  assert.match(frames, /export const CREATE_SPRITE_FRAME_REGION_SCHEMA/);
  assert.match(frames, /VECTOR2_SCHEMA/);
  assert.match(frames, /Top-left atlas region position/);

  assert.match(sheets, /export const CREATE_SPRITE_SHEET_SCHEMA/);
  assert.match(sheets, /VECTOR2_SCHEMA/);
  assert.match(sheets, /texturePath/);
  assert.match(sheets, /frameCount/);

  assert.match(animations, /export const CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA/);
  assert.match(animations, /CREATE_SPRITE_FRAME_REGION_SCHEMA/);
  assert.match(animations, /CREATE_SPRITE_SHEET_SCHEMA/);
  assert.match(animations, /speedFps/);
  assert.match(animations, /filterClip/);

  assert.match(create, /export const CREATE_SPRITE_FRAMES_SCHEMA/);
  assert.match(create, /CONNECTION_PROPERTIES/);
  assert.match(create, /CREATE_SPRITE_FRAMES_ANIMATIONS_SCHEMA/);
  assert.match(create, /required: \["path", "animations"\]/);
});

test("TileSet resource builder delegates source terrain physics and shared normalization", async () => {
  const tileSets = await readResourceSource("tile-sets.js");
  const shared = await readResourceSource("tile-sets/shared.js");
  const sources = await readResourceSource("tile-sets/sources.js");
  const terrain = await readResourceSource("tile-sets/terrain.js");
  const physics = await readResourceSource("tile-sets/physics.js");

  assert.match(tileSets, /from "\.\/tile-sets\/shared\.js"/);
  assert.match(tileSets, /from "\.\/tile-sets\/sources\.js"/);
  assert.match(tileSets, /from "\.\/tile-sets\/terrain\.js"/);
  assert.match(tileSets, /from "\.\/tile-sets\/physics\.js"/);
  assert.doesNotMatch(tileSets, /const TERRAIN_MODES/);
  assert.doesNotMatch(tileSets, /const CELL_NEIGHBORS/);
  assert.doesNotMatch(tileSets, /function normalizeTileEntry/);
  assert.doesNotMatch(tileSets, /function normalizePhysicsLayer/);
  assert.doesNotMatch(tileSets, /function validateTileTerrains/);

  assert.match(shared, /export function normalizeResPath/);
  assert.match(shared, /export function normalizePositiveVector2i/);
  assert.match(shared, /export function normalizeObject/);
  assert.match(sources, /export function normalizeTileSetSources/);
  assert.match(sources, /export function sourcesHaveCollisionPolygons/);
  assert.match(terrain, /normalizeTileTerrain/);
  assert.match(terrain, /normalizeTerrainSets/);
  assert.match(terrain, /validateTileTerrains/);
  assert.match(physics, /export function normalizePhysicsLayers/);
  assert.match(physics, /export function validateCollisionPolygonLayers/);
});

test("TileSet source builder delegates source tile grid and collision domains", async () => {
  const facade = await readResourceSource("tile-sets/sources.js");
  const source = await readResourceSource("tile-sets/sources/source.js");
  const tiles = await readResourceSource("tile-sets/sources/tiles.js");
  const grid = await readResourceSource("tile-sets/sources/grid.js");
  const collision = await readResourceSource("tile-sets/sources/collision.js");

  assert.match(facade, /from "\.\/sources\/source\.js"/);
  assert.match(facade, /export function normalizeTileSetSources/);
  assert.match(facade, /export function sourcesHaveCollisionPolygons/);
  assert.doesNotMatch(facade, /vector2iToGodotVector/);
  assert.doesNotMatch(facade, /vector2ToGodotVector/);
  assert.doesNotMatch(facade, /function normalizeTileEntry/);
  assert.doesNotMatch(facade, /function normalizeCollisionPolygon/);
  assert.doesNotMatch(facade, /for \(let y = 0; y < rows/);

  assert.match(source, /export function normalizeTileSource/);
  assert.match(source, /export function sourceHasCollisionPolygons/);
  assert.match(source, /normalizeTiles/);
  assert.match(source, /tileHasCollisionPolygons/);

  assert.match(tiles, /export function normalizeTileEntry/);
  assert.match(tiles, /export function normalizeTiles/);
  assert.match(tiles, /normalizeCollisionPolygons/);
  assert.match(tiles, /normalizeGridTiles/);
  assert.match(tiles, /normalizeTileTerrain/);

  assert.match(grid, /export function normalizeGridTiles/);
  assert.match(grid, /columns/);
  assert.match(grid, /rows/);
  assert.match(grid, /origin/);

  assert.match(collision, /export function normalizeCollisionPolygon/);
  assert.match(collision, /export function normalizeCollisionPolygons/);
  assert.match(collision, /export function tileHasCollisionPolygons/);
  assert.match(collision, /oneWayMargin/);
  assert.match(collision, /vector2ToGodotVector/);
});

test("TileSet terrain builder delegates mode peering tile set and validation domains", async () => {
  const facade = await readResourceSource("tile-sets/terrain.js");
  const modes = await readResourceSource("tile-sets/terrain/modes.js");
  const peering = await readResourceSource("tile-sets/terrain/peering.js");
  const tile = await readResourceSource("tile-sets/terrain/tile.js");
  const sets = await readResourceSource("tile-sets/terrain/sets.js");
  const validation = await readResourceSource("tile-sets/terrain/validation.js");

  assert.match(facade, /from "\.\/terrain\/tile\.js"/);
  assert.match(facade, /from "\.\/terrain\/sets\.js"/);
  assert.match(facade, /from "\.\/terrain\/validation\.js"/);
  assert.doesNotMatch(facade, /const TERRAIN_MODES/);
  assert.doesNotMatch(facade, /const CELL_NEIGHBORS/);
  assert.doesNotMatch(facade, /colorToGodotColor/);

  assert.match(modes, /export const TERRAIN_MODES/);
  assert.match(modes, /export function normalizeTerrainMode/);
  assert.match(modes, /corners-and-sides/);

  assert.match(peering, /export const CELL_NEIGHBORS/);
  assert.match(peering, /export function normalizeCellNeighbor/);
  assert.match(peering, /export function normalizeTerrainPeeringBits/);
  assert.match(peering, /normalizeTerrainValue/);

  assert.match(tile, /export function normalizeTileTerrain/);
  assert.match(tile, /normalizeTerrainPeeringBits/);

  assert.match(sets, /export function normalizeTerrainSets/);
  assert.match(sets, /export function normalizeTerrainDefinition/);
  assert.match(sets, /colorToGodotColor/);
  assert.match(sets, /normalizeTerrainMode/);

  assert.match(validation, /export function validateTileTerrains/);
  assert.match(validation, /must reference an existing terrainSets entry/);
});

test("SpriteFrames resource builder delegates shared frame sheet animation and create domains", async () => {
  const facade = await readResourceSource("sprite-frames.js");
  const shared = await readResourceSource("sprite-frames/shared.js");
  const frames = await readResourceSource("sprite-frames/frames.js");
  const sheets = await readResourceSource("sprite-frames/sheets.js");
  const animations = await readResourceSource("sprite-frames/animations.js");
  const create = await readResourceSource("sprite-frames/create.js");

  assert.match(facade, /from "\.\/sprite-frames\/animations\.js"/);
  assert.match(facade, /from "\.\/sprite-frames\/create\.js"/);
  assert.doesNotMatch(facade, /splitBridgeArgs/);
  assert.doesNotMatch(facade, /function normalizeFrame/);
  assert.doesNotMatch(facade, /function expandSheetFrames/);

  assert.match(shared, /export function normalizeAnimationName/);
  assert.match(shared, /export function normalizeTexturePath/);
  assert.match(shared, /export function normalizeOptionalPositiveInteger/);
  assert.match(shared, /export function normalizePositiveVector2/);
  assert.match(shared, /isPlainObject/);

  assert.match(frames, /export function normalizeFrameRegion/);
  assert.match(frames, /export function normalizeFrame/);
  assert.match(frames, /filterClip/);

  assert.match(sheets, /export function normalizeSheet/);
  assert.match(sheets, /export function expandSheetFrames/);
  assert.match(sheets, /frameCount cannot exceed columns \* rows/);

  assert.match(animations, /export function normalizeSpriteFrameAnimations/);
  assert.match(animations, /duplicate animation name/);
  assert.match(animations, /must define either frames or sheet/);

  assert.match(create, /export async function createSpriteFrames/);
  assert.match(create, /normalizeSpriteFrameAnimations/);
  assert.match(create, /client\.createSpriteFrames/);
});

test("Material resource builder delegates create standard enum and assignment domains", async () => {
  const facade = await readResourceSource("materials.js");
  const create = await readResourceSource("materials/create.js");
  const standard = await readResourceSource("materials/standard.js");
  const enums = await readResourceSource("materials/enums.js");
  const assignment = await readResourceSource("materials/assignment.js");

  assert.match(facade, /from "\.\/materials\/create\.js"/);
  assert.doesNotMatch(facade, /splitBridgeArgs/);
  assert.doesNotMatch(facade, /buildStandardMaterial3DProperties/);
  assert.doesNotMatch(facade, /assignCreatedMaterial/);

  assert.match(create, /export async function createMaterial/);
  assert.match(create, /splitBridgeArgs/);
  assert.match(create, /buildStandardMaterial3DProperties/);
  assert.match(create, /assignCreatedMaterial/);
  assert.match(create, /client\.createResource/);

  assert.match(standard, /export function buildStandardMaterial3DProperties/);
  assert.match(standard, /function applyOptionalNumberProperty/);
  assert.match(standard, /colorToGodotColor/);
  assert.match(standard, /normalizeMaterialEnum/);
  assert.match(standard, /properties must be an object/);

  assert.match(enums, /export const STANDARD_MATERIAL_3D_TRANSPARENCY/);
  assert.match(enums, /export const STANDARD_MATERIAL_3D_CULL_MODE/);
  assert.match(enums, /export const STANDARD_MATERIAL_3D_SHADING_MODE/);
  assert.match(enums, /export function normalizeMaterialEnum/);

  assert.match(assignment, /export async function assignCreatedMaterial/);
  assert.match(assignment, /normalizeNonNegativeInteger/);
  assert.match(assignment, /assignToNode\.nodePath is required/);
  assert.match(assignment, /client\.assignMaterial/);
});

test("ShaderMaterial resource builder delegates create request parameter and assignment domains", async () => {
  const facade = await readResourceSource("shader-materials.js");
  const create = await readResourceSource("shader-materials/create.js");
  const request = await readResourceSource("shader-materials/request.js");
  const parameters = await readResourceSource("shader-materials/parameters.js");
  const assignment = await readResourceSource("shader-materials/assignment.js");
  const materialAssignment = await readResourceSource("materials/assignment.js");

  assert.match(facade, /from "\.\/shader-materials\/create\.js"/);
  assert.match(facade, /from "\.\/shader-materials\/request\.js"/);
  assert.doesNotMatch(facade, /splitBridgeArgs/);
  assert.doesNotMatch(facade, /colorToGodotColor/);
  assert.doesNotMatch(facade, /normalizeShaderParameters/);
  assert.doesNotMatch(facade, /assignCreatedShaderMaterial/);

  assert.match(create, /export async function createShaderMaterial/);
  assert.match(create, /splitBridgeArgs/);
  assert.match(create, /buildShaderMaterialRequest/);
  assert.match(create, /assignCreatedShaderMaterial/);
  assert.match(create, /client\.createShaderMaterial/);

  assert.match(request, /export function buildShaderMaterialRequest/);
  assert.match(request, /path is required/);
  assert.match(request, /shaderPath is required/);
  assert.match(request, /code is required/);
  assert.match(request, /resourceName/);
  assert.match(request, /overwriteShader/);
  assert.match(request, /normalizeShaderParameters/);

  assert.match(parameters, /export function normalizeShaderParameters/);
  assert.match(parameters, /export function normalizeShaderParameterValue/);
  assert.match(parameters, /colorToGodotColor/);
  assert.match(parameters, /type: "Resource"/);
  assert.match(parameters, /res:\/\//);
  assert.match(parameters, /shader parameter names must not include slash/);

  assert.match(assignment, /assignCreatedMaterial as assignCreatedShaderMaterial/);
  assert.match(assignment, /from "\.\.\/materials\/assignment\.js"/);
  assert.doesNotMatch(assignment, /normalizeNonNegativeInteger/);
  assert.match(materialAssignment, /export async function assignCreatedMaterial/);
  assert.match(materialAssignment, /normalizeNonNegativeInteger/);
  assert.match(materialAssignment, /assignToNode\.nodePath is required/);
  assert.match(materialAssignment, /client\.assignMaterial/);
});

test("create_resource handler forwards payload through the bridge", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const properties = { resource_name: "Neon" };
    const result = await resourceToolByName("create_resource").handler({
      port,
      path: "res://materials/neon.tres",
      className: "StandardMaterial3D",
      properties,
      open: true,
      overwrite: false
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/resource/create");
    assert.deepEqual(receivedBody, {
      path: "res://materials/neon.tres",
      className: "StandardMaterial3D",
      properties,
      open: true,
      overwrite: false
    });
  });
});

test("create_sprite_frames forwards normalized animations through the bridge", async () => {
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
        path: receivedBody.path,
        type: "SpriteFrames",
        animations: receivedBody.animations.map((animation) => ({
          name: animation.name,
          frameCount: animation.frames.length
        }))
      }
    }));
  }, async (port) => {
    const result = await resourceToolByName("create_sprite_frames").handler({
      port,
      path: "res://animations/player_frames.tres",
      resourceName: "Player Frames",
      animations: [
        {
          name: "idle",
          speedFps: 6,
          frames: [
            { texturePath: "res://sprites/player_idle_0.png" },
            {
              texturePath: "res://sprites/player_sheet.png",
              region: {
                position: ["32", 0],
                size: [32, "32"]
              },
              filterClip: true,
              duration: 1.25
            }
          ]
        },
        {
          name: "run",
          speedFps: 12,
          loop: false,
          sheet: {
            texturePath: "res://sprites/player_sheet.png",
            frameSize: [16, 16],
            columns: 2,
            rows: "2",
            origin: [4, 8],
            separation: [1, 2],
            frameCount: "3",
            duration: "0.5"
          }
        }
      ],
      open: false,
      overwrite: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.path, "res://animations/player_frames.tres");
    assert.deepEqual(receivedBody, {
      path: "res://animations/player_frames.tres",
      resourceName: "Player Frames",
      animations: [
        {
          name: "idle",
          speedFps: 6,
          loop: true,
          frames: [
            { texturePath: "res://sprites/player_idle_0.png", duration: 1 },
            {
              texturePath: "res://sprites/player_sheet.png",
              region: {
                position: { type: "Vector2", x: 32, y: 0 },
                size: { type: "Vector2", x: 32, y: 32 }
              },
              filterClip: true,
              duration: 1.25
            }
          ]
        },
        {
          name: "run",
          speedFps: 12,
          loop: false,
          frames: [
            {
              texturePath: "res://sprites/player_sheet.png",
              region: {
                position: { type: "Vector2", x: 4, y: 8 },
                size: { type: "Vector2", x: 16, y: 16 }
              },
              duration: 0.5
            },
            {
              texturePath: "res://sprites/player_sheet.png",
              region: {
                position: { type: "Vector2", x: 21, y: 8 },
                size: { type: "Vector2", x: 16, y: 16 }
              },
              duration: 0.5
            },
            {
              texturePath: "res://sprites/player_sheet.png",
              region: {
                position: { type: "Vector2", x: 4, y: 26 },
                size: { type: "Vector2", x: 16, y: 16 }
              },
              duration: 0.5
            }
          ]
        }
      ],
      open: false,
      overwrite: true
    });
  });
});

test("create_sprite_frames forwards auto-grid sprite sheets through the bridge", async () => {
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
        path: receivedBody.path,
        type: "SpriteFrames",
        animations: receivedBody.animations.map((animation) => ({
          name: animation.name,
          sheet: animation.sheet
        }))
      }
    }));
  }, async (port) => {
    const result = await resourceToolByName("create_sprite_frames").handler({
      port,
      path: "res://animations/auto_grid_frames.tres",
      animations: [
        {
          name: "dash",
          sheet: {
            texturePath: "res://sprites/dash_sheet.png",
            frameSize: [32, 32],
            frameCount: 5,
            origin: [4, 8],
            separation: [1, 2],
            duration: 0.25,
            filterClip: true
          }
        },
        {
          name: "rise",
          sheet: {
            texturePath: "res://sprites/rise_sheet.png",
            frameSize: [16, 16],
            columns: 3
          }
        }
      ],
      open: false,
      overwrite: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.path, "res://animations/auto_grid_frames.tres");
    assert.deepEqual(receivedBody, {
      path: "res://animations/auto_grid_frames.tres",
      animations: [
        {
          name: "dash",
          speedFps: 5,
          loop: true,
          sheet: {
            texturePath: "res://sprites/dash_sheet.png",
            frameSize: { type: "Vector2", x: 32, y: 32 },
            frameCount: 5,
            origin: { type: "Vector2", x: 4, y: 8 },
            separation: { type: "Vector2", x: 1, y: 2 },
            duration: 0.25,
            filterClip: true
          }
        },
        {
          name: "rise",
          speedFps: 5,
          loop: true,
          sheet: {
            texturePath: "res://sprites/rise_sheet.png",
            frameSize: { type: "Vector2", x: 16, y: 16 },
            columns: 3,
            origin: { type: "Vector2", x: 0, y: 0 },
            separation: { type: "Vector2", x: 0, y: 0 },
            duration: 1
          }
        }
      ],
      open: false,
      overwrite: true
    });
  });
});

test("create_tile_set forwards normalized atlas sources through the bridge", async () => {
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
        path: receivedBody.path,
        type: "TileSet",
        sourceCount: receivedBody.sources.length
      }
    }));
  }, async (port) => {
    const result = await resourceToolByName("create_tile_set").handler({
      port,
      path: "res://tilesets/arena.tres",
      resourceName: "Arena Tiles",
      tileSize: [32, "32"],
      physicsLayers: [
        {
          collisionLayer: "1",
          collisionMask: 3,
          collisionPriority: "1.5"
        }
      ],
      terrainSets: [
        {
          mode: "sides",
          terrains: [
            { name: "Grass", color: "#55cc66" },
            { name: "Dirt", color: [0.5, 0.25, 0.125, 1] }
          ]
        }
      ],
      sources: [
        {
          sourceId: 0,
          texturePath: "res://tiles/arena.png",
          textureRegionSize: [32, 32],
          useTexturePadding: false,
          tiles: [
            {
              atlasCoords: [2, 0],
              collisionPolygons: [
                {
                  layer: "0",
                  points: [
                    [0, 0],
                    ["32", 0],
                    { x: 32, y: "32" },
                    { x: 0, y: 32 }
                  ],
                  oneWay: true,
                  oneWayMargin: "2.5"
                }
              ],
              terrain: {
                terrainSet: 0,
                terrain: 0,
                peeringBits: {
                  rightSide: 0,
                  bottomSide: 0,
                  leftSide: 0,
                  topSide: 0,
                  topRightSide: -1
                }
              }
            }
          ],
          grid: {
            columns: 2,
            rows: "1",
            origin: [0, 0]
          }
        }
      ],
      open: false,
      overwrite: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.path, "res://tilesets/arena.tres");
    assert.deepEqual(receivedBody, {
      path: "res://tilesets/arena.tres",
      resourceName: "Arena Tiles",
      tileSize: { x: 32, y: 32 },
      physicsLayers: [
        {
          collisionLayer: 1,
          collisionMask: 3,
          collisionPriority: 1.5
        }
      ],
      terrainSets: [
        {
          mode: 2,
          terrains: [
            {
              name: "Grass",
              color: {
                type: "Color",
                r: 85 / 255,
                g: 204 / 255,
                b: 102 / 255,
                a: 1
              }
            },
            {
              name: "Dirt",
              color: {
                type: "Color",
                r: 0.5,
                g: 0.25,
                b: 0.125,
                a: 1
              }
            }
          ]
        }
      ],
      sources: [
        {
          sourceId: 0,
          texturePath: "res://tiles/arena.png",
          textureRegionSize: { x: 32, y: 32 },
          useTexturePadding: false,
          tiles: [
            {
              atlasCoords: { x: 2, y: 0 },
              size: { x: 1, y: 1 },
              collisionPolygons: [
                {
                  layer: 0,
                  points: [
                    { type: "Vector2", x: 0, y: 0 },
                    { type: "Vector2", x: 32, y: 0 },
                    { type: "Vector2", x: 32, y: 32 },
                    { type: "Vector2", x: 0, y: 32 }
                  ],
                  oneWay: true,
                  oneWayMargin: 2.5
                }
              ],
              terrain: {
                terrainSet: 0,
                terrain: 0,
                peeringBits: [
                  { neighbor: 0, terrain: 0 },
                  { neighbor: 4, terrain: 0 },
                  { neighbor: 8, terrain: 0 },
                  { neighbor: 12, terrain: 0 },
                  { neighbor: 14, terrain: -1 }
                ]
              }
            },
            { atlasCoords: { x: 0, y: 0 }, size: { x: 1, y: 1 } },
            { atlasCoords: { x: 1, y: 0 }, size: { x: 1, y: 1 } }
          ]
        }
      ],
      open: false,
      overwrite: true
    });
  });
});

test("create_tile_set adds a default physics layer when collision polygons are provided", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { path: receivedBody.path } }));
  }, async (port) => {
    await resourceToolByName("create_tile_set").handler({
      port,
      path: "res://tilesets/solid.tres",
      sources: [
        {
          texturePath: "res://tiles/solid.png",
          tiles: [
            {
              atlasCoords: [0, 0],
              collisionPolygons: [
                {
                  points: [[0, 0], [16, 0], [16, 16]]
                }
              ]
            }
          ]
        }
      ]
    });

    assert.deepEqual(receivedBody.physicsLayers, [
      {
        collisionLayer: 1,
        collisionMask: 1,
        collisionPriority: 1
      }
    ]);
  });
});

test("create_material builds StandardMaterial3D properties and assigns it", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    received.push({ url: req.url, body });

    res.setHeader("content-type", "application/json");
    if (req.url === "/resource/create") {
      res.end(JSON.stringify({ ok: true, data: { path: body.path, created: true } }));
      return;
    }
    if (req.url === "/node/material/assign") {
      res.end(JSON.stringify({ ok: true, data: { assigned: true, materialPath: body.materialPath } }));
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "unexpected endpoint" }));
  }, async (port) => {
    const result = await resourceToolByName("create_material").handler({
      port,
      path: "res://materials/neon_hull.tres",
      name: "Neon Hull",
      albedoColor: "#00ffffcc",
      metallic: 0.7,
      roughness: 0.2,
      emissionColor: "#00ffff",
      emissionEnergyMultiplier: 2,
      cullMode: "disabled",
      assignToNode: {
        nodePath: "Ship/Hull",
        surfaceIndex: 1
      }
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.path, "res://materials/neon_hull.tres");
    assert.equal(payload.data.assigned, true);
    assert.deepEqual(received[0], {
      url: "/resource/create",
      body: {
        path: "res://materials/neon_hull.tres",
        className: "StandardMaterial3D",
        properties: {
          resource_name: "Neon Hull",
          albedo_color: { type: "Color", r: 0, g: 1, b: 1, a: 0.8 },
          transparency: 1,
          metallic: 0.7,
          roughness: 0.2,
          emission: { type: "Color", r: 0, g: 1, b: 1, a: 1 },
          emission_enabled: true,
          emission_energy_multiplier: 2,
          cull_mode: 2
        },
        open: true,
        overwrite: false
      }
    });
    assert.deepEqual(received[1], {
      url: "/node/material/assign",
      body: {
        nodePath: "Ship/Hull",
        materialPath: "res://materials/neon_hull.tres",
        surfaceIndex: 1
      }
    });
  });
});

test("create_shader_material creates ShaderMaterial resources and assigns them", async () => {
  const received = [];
  const code = [
    "shader_type spatial;",
    "uniform vec4 glow_color : source_color = vec4(0.0, 1.0, 1.0, 1.0);",
    "uniform float pulse_speed = 2.0;",
    "void fragment() {",
    "  ALBEDO = glow_color.rgb;",
    "  EMISSION = glow_color.rgb * pulse_speed;",
    "  ALPHA = glow_color.a;",
    "}"
  ].join("\n");

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    received.push({ url: req.url, body });

    res.setHeader("content-type", "application/json");
    if (req.url === "/resource/shader-material/create") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: body.path,
          shaderPath: body.shaderPath,
          parameterNames: Object.keys(body.parameters)
        }
      }));
      return;
    }
    if (req.url === "/node/material/assign") {
      res.end(JSON.stringify({ ok: true, data: { assigned: true, materialPath: body.materialPath } }));
      return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "unexpected endpoint" }));
  }, async (port) => {
    const result = await resourceToolByName("create_shader_material").handler({
      port,
      path: "res://materials/hologram_panel.tres",
      shaderPath: "res://materials/hologram_panel.gdshader",
      resourceName: "Hologram Panel",
      code,
      parameters: {
        glow_color: "#00ffffcc",
        pulse_speed: 3.5,
        mask_texture: "res://textures/holo_mask.png",
        raw_vector: { type: "Vector3", x: 1, y: 2, z: 3 }
      },
      open: true,
      overwrite: true,
      overwriteShader: true,
      assignToNode: {
        nodePath: "Ship/HologramPanel",
        surfaceIndex: 0
      }
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.path, "res://materials/hologram_panel.tres");
    assert.equal(payload.data.shaderPath, "res://materials/hologram_panel.gdshader");
    assert.equal(payload.data.assigned, true);
    assert.deepEqual(received[0], {
      url: "/resource/shader-material/create",
      body: {
        path: "res://materials/hologram_panel.tres",
        shaderPath: "res://materials/hologram_panel.gdshader",
        resourceName: "Hologram Panel",
        code,
        parameters: {
          glow_color: { type: "Color", r: 0, g: 1, b: 1, a: 0.8 },
          pulse_speed: 3.5,
          mask_texture: { type: "Resource", path: "res://textures/holo_mask.png" },
          raw_vector: { type: "Vector3", x: 1, y: 2, z: 3 }
        },
        open: true,
        overwrite: true,
        overwriteShader: true
      }
    });
    assert.deepEqual(received[1], {
      url: "/node/material/assign",
      body: {
        nodePath: "Ship/HologramPanel",
        materialPath: "res://materials/hologram_panel.tres",
        surfaceIndex: 0
      }
    });
  });
});

test("assign_material handler forwards payload through the bridge", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await assignmentToolByName("assign_material").handler({
      port,
      nodePath: "Ship/Hull",
      materialPath: "res://materials/neon.tres",
      surfaceIndex: 2
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/node/material/assign");
    assert.deepEqual(receivedBody, {
      nodePath: "Ship/Hull",
      materialPath: "res://materials/neon.tres",
      surfaceIndex: 2
    });
  });
});
