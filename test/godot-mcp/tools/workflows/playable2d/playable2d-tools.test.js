import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import { PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS } from "../../../../../src/godot-mcp/tools/workflows/playable2d/index.js";
import { PLAYABLE2D_WORKFLOW_TOOL_MANIFEST } from "../../../../../src/godot-mcp/tools/workflows/playable2d/manifest.js";

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
  return PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readPlayable2DSource(file) {
  return readFile(new URL(`../../../../../src/godot-mcp/tools/workflows/playable2d/${file}`, import.meta.url), "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

test("PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS exposes 2D workflow descriptors", () => {
  assert.deepEqual(
    PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS.map(({ name }) => name),
    PLAYABLE2D_WORKFLOW_TOOL_MANIFEST.map(({ name }) => name)
  );

  for (const tool of PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("Playable2D workflow tools are generated from the manifest", async () => {
  const index = await readPlayable2DSource("index.js");
  const manifest = await readPlayable2DSource("manifest.js");

  assert.match(index, /toolDefinitionsFromManifest\(PLAYABLE2D_WORKFLOW_TOOL_MANIFEST/);
  assert.match(index, /create2DPlayableBlockout/);
  assert.match(index, /create2DCharacterController/);
  assert.match(index, /create2DTriggerZone/);
  assert.doesNotMatch(index, /PLAYABLE2D_WORKFLOW_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /toolResult/);

  assert.match(manifest, /export const PLAYABLE2D_WORKFLOW_TOOL_MANIFEST/);
  assert.match(manifest, /local: \{\s*handler: "create2DPlayableBlockout"/);
  assert.match(manifest, /local: \{\s*handler: "create2DTriggerZone"/);
});

test("Playable2D script helpers live in their own module", async () => {
  const builders = [
    await readPlayable2DSource("builders/blockout.js"),
    await readPlayable2DSource("builders/controller.js"),
    await readPlayable2DSource("builders/trigger-zone.js")
  ].join("\n");
  const scriptConsumers = [
    await readPlayable2DSource("builders/controller/context.js"),
    await readPlayable2DSource("builders/controller/input-map.js"),
    await readPlayable2DSource("builders/controller/script-lifecycle.js"),
    await readPlayable2DSource("builders/trigger-zone/script.js"),
    await readPlayable2DSource("builders/trigger-zone/script/context.js")
  ].join("\n");
  const scripts = await readPlayable2DSource("scripts.js");

  assert.doesNotMatch(builders, /function buildCharacterController2DScript/);
  assert.doesNotMatch(builders, /function buildTriggerZone2DScript/);
  assert.doesNotMatch(builders, /function normalizeGodotScriptPath/);
  assert.doesNotMatch(builders, /function normalizeCharacterControllerActionNames/);
  assert.match(scriptConsumers, /from "\.\.\/\.\.\/scripts\.js"/);
  assert.match(scriptConsumers, /buildCharacterController2DScript/);
  assert.match(scriptConsumers, /buildTriggerZone2DScript/);
  assert.match(scriptConsumers, /normalizeGodotScriptPath/);
  assert.match(scriptConsumers, /characterControllerInputSpecs/);
  assert.doesNotMatch(scriptConsumers, /function buildCharacterController2DScript\(/);
  assert.doesNotMatch(scriptConsumers, /function buildTriggerZone2DScript\(/);

  assert.match(scripts, /buildCharacterController2DScript/);
  assert.match(scripts, /buildTriggerZone2DScript/);
  assert.match(scripts, /normalizeGodotScriptPath/);
  assert.match(scripts, /defaultControllerScriptPath/);
  assert.match(scripts, /defaultTriggerScriptPath/);
  assert.match(scripts, /normalizeCharacterControllerActionNames/);
  assert.match(scripts, /characterControllerInputSpecs/);
});

test("Playable2D script helpers delegate naming path controller trigger and literal domains", async () => {
  const facade = await readPlayable2DSource("scripts.js");
  const names = await readPlayable2DSource("scripts/names.js");
  const paths = await readPlayable2DSource("scripts/paths.js");
  const gdscript = await readPlayable2DSource("scripts/gdscript.js");
  const controller = await readPlayable2DSource("scripts/controller.js");
  const triggerZone = await readPlayable2DSource("scripts/trigger-zone.js");

  assert.match(facade, /from "\.\/scripts\/names\.js"/);
  assert.match(facade, /from "\.\/scripts\/paths\.js"/);
  assert.match(facade, /from "\.\/scripts\/controller\.js"/);
  assert.match(facade, /from "\.\/scripts\/trigger-zone\.js"/);
  assert.doesNotMatch(facade, /function buildCharacterController2DScript/);
  assert.doesNotMatch(facade, /function gdNumber/);

  assert.match(names, /export function slugifyResourceName/);
  assert.match(names, /export function lastNodeName/);
  assert.match(names, /export function toPascalIdentifier/);

  assert.match(paths, /export function normalizeGodotScriptPath/);
  assert.match(paths, /export function defaultControllerScriptPath/);
  assert.match(paths, /export function defaultTriggerScriptPath/);
  assert.match(paths, /normalizeGDScriptClassName/);

  assert.match(gdscript, /export function gdNumber/);
  assert.match(gdscript, /export function gdString/);
  assert.match(gdscript, /export function gdBool/);

  assert.match(controller, /export function normalizeCharacterControllerActionNames/);
  assert.match(controller, /export function characterControllerInputSpecs/);
  assert.match(controller, /export function buildCharacterController2DScript/);

  assert.match(triggerZone, /export function buildTriggerZone2DScript/);
  assert.match(triggerZone, /trigger_2d/);
});

test("Playable2D builders delegate blockout controller and trigger workflows to focused modules", async () => {
  const builders = await readPlayable2DSource("builders.js");
  const shared = await readPlayable2DSource("builders/shared.js");
  const blockout = await readPlayable2DSource("builders/blockout.js");
  const controller = await readPlayable2DSource("builders/controller.js");
  const triggerZone = await readPlayable2DSource("builders/trigger-zone.js");

  assert.match(builders, /from "\.\/builders\/blockout\.js"/);
  assert.match(builders, /from "\.\/builders\/controller\.js"/);
  assert.match(builders, /from "\.\/builders\/trigger-zone\.js"/);
  assert.doesNotMatch(builders, /export async function create2DPlayableBlockout/);
  assert.doesNotMatch(builders, /export async function create2DCharacterController/);
  assert.doesNotMatch(builders, /export async function create2DTriggerZone/);

  assert.match(shared, /export const DEFAULT_RESOURCE_DIRECTORY/);
  assert.match(shared, /export const DEFAULT_TRIGGER_RESOURCE_DIRECTORY/);
  assert.match(shared, /export function normalizeGodotResourceDirectory/);
  assert.match(shared, /export function joinGodotResourcePath/);
  assert.match(shared, /export function vector2ToComponents/);
  assert.match(shared, /export function appendBlockoutStep/);
  assert.match(shared, /export function blockoutFailure/);

  assert.match(blockout, /export async function create2DPlayableBlockout/);
  assert.match(blockout, /from "\.\/blockout\/controller\.js"/);
  assert.match(controller, /export async function create2DCharacterController/);
  assert.match(triggerZone, /export async function create2DTriggerZone/);
});

test("Playable2D blockout builder delegates root resource layout actor controller and result domains", async () => {
  const facade = await readPlayable2DSource("builders/blockout.js");
  const root = await readPlayable2DSource("builders/blockout/root.js");
  const resources = await readPlayable2DSource("builders/blockout/resources.js");
  const layout = await readPlayable2DSource("builders/blockout/layout.js");
  const ground = await readPlayable2DSource("builders/blockout/ground.js");
  const player = await readPlayable2DSource("builders/blockout/player.js");
  const camera = await readPlayable2DSource("builders/blockout/camera.js");
  const controller = await readPlayable2DSource("builders/blockout/controller.js");
  const result = await readPlayable2DSource("builders/blockout/result.js");

  assert.match(facade, /from "\.\/blockout\/root\.js"/);
  assert.match(facade, /from "\.\/blockout\/resources\.js"/);
  assert.match(facade, /from "\.\/blockout\/layout\.js"/);
  assert.match(facade, /from "\.\/blockout\/ground\.js"/);
  assert.match(facade, /from "\.\/blockout\/player\.js"/);
  assert.match(facade, /from "\.\/blockout\/camera\.js"/);
  assert.match(facade, /from "\.\/blockout\/controller\.js"/);
  assert.match(facade, /from "\.\/blockout\/result\.js"/);
  assert.doesNotMatch(facade, /joinGodotResourcePath/);
  assert.doesNotMatch(facade, /vector2ToComponents/);
  assert.doesNotMatch(facade, /createStaticBody2D/);
  assert.doesNotMatch(facade, /createCharacterBody2D/);
  assert.doesNotMatch(facade, /create2DCharacterController/);

  assert.match(root, /export function buildBlockout2DRootRequest/);
  assert.match(root, /export async function createBlockout2DRoot/);
  assert.match(root, /export function resolveBlockout2DRootPath/);

  assert.match(resources, /export function buildBlockout2DResourceContext/);
  assert.match(resources, /DEFAULT_RESOURCE_DIRECTORY/);
  assert.match(resources, /joinGodotResourcePath/);
  assert.match(resources, /slugifyResourceName/);

  assert.match(layout, /export function buildBlockout2DLayout/);
  assert.match(layout, /groundSize/);
  assert.match(layout, /playerRadius/);
  assert.match(layout, /cameraZoom/);

  assert.match(ground, /export async function createBlockout2DGround/);
  assert.match(ground, /createStaticBody2D/);
  assert.match(ground, /visualPlaceholderTexturePath/);

  assert.match(player, /export async function createBlockout2DPlayer/);
  assert.match(player, /export function resolveBlockout2DPlayerPath/);
  assert.match(player, /createCharacterBody2D/);

  assert.match(camera, /export async function createBlockout2DCamera/);
  assert.match(camera, /createCamera2D/);

  assert.match(controller, /export async function attachBlockout2DController/);
  assert.match(controller, /create2DCharacterController/);

  assert.match(result, /export function blockout2DSuccessData/);
  assert.match(result, /type: "2DPlayableBlockout"/);
});

test("Playable2D controller builder delegates context input script and result domains", async () => {
  const facade = await readPlayable2DSource("builders/controller.js");
  const context = await readPlayable2DSource("builders/controller/context.js");
  const inputMap = await readPlayable2DSource("builders/controller/input-map.js");
  const scriptLifecycle = await readPlayable2DSource("builders/controller/script-lifecycle.js");
  const result = await readPlayable2DSource("builders/controller/result.js");

  assert.match(facade, /from "\.\/controller\/context\.js"/);
  assert.match(facade, /from "\.\/controller\/input-map\.js"/);
  assert.match(facade, /from "\.\/controller\/script-lifecycle\.js"/);
  assert.match(facade, /from "\.\/controller\/result\.js"/);
  assert.doesNotMatch(facade, /normalizeFiniteNumber/);
  assert.doesNotMatch(facade, /client\.setInputAction/);
  assert.doesNotMatch(facade, /client\.writeScript/);
  assert.doesNotMatch(facade, /client\.validateScript/);
  assert.doesNotMatch(facade, /client\.attachScript/);
  assert.doesNotMatch(facade, /type: "2DCharacterController"/);

  assert.match(context, /export function buildCharacterController2DContext/);
  assert.match(context, /normalizeFiniteNumber/);
  assert.match(context, /normalizePositiveFiniteNumber/);
  assert.match(context, /defaultControllerScriptPath/);
  assert.match(context, /moveSpeed/);
  assert.match(context, /inputActions: \[\]/);

  assert.match(inputMap, /export async function configureCharacterController2DInputMap/);
  assert.match(inputMap, /characterControllerInputSpecs/);
  assert.match(inputMap, /client\.setInputAction/);
  assert.match(inputMap, /blockoutFailure/);

  assert.match(scriptLifecycle, /export function buildCharacterController2DScriptContent/);
  assert.match(scriptLifecycle, /export async function writeCharacterController2DScriptResource/);
  assert.match(scriptLifecycle, /export async function validateCharacterController2DScript/);
  assert.match(scriptLifecycle, /export async function attachCharacterController2DScript/);
  assert.match(scriptLifecycle, /buildCharacterController2DScript/);
  assert.match(scriptLifecycle, /client\.writeScript/);
  assert.match(scriptLifecycle, /client\.validateScript/);
  assert.match(scriptLifecycle, /client\.attachScript/);

  assert.match(result, /export function characterController2DOperationDetails/);
  assert.match(result, /export function characterController2DSuccessData/);
  assert.match(result, /type: "2DCharacterController"/);
  assert.match(result, /writtenScript: writtenScript\.data/);
});

test("Playable2D trigger-zone builder delegates resource area script and result domains", async () => {
  const facade = await readPlayable2DSource("builders/trigger-zone.js");
  const resources = await readPlayable2DSource("builders/trigger-zone/resources.js");
  const area = await readPlayable2DSource("builders/trigger-zone/area.js");
  const script = await readPlayable2DSource("builders/trigger-zone/script.js");
  const result = await readPlayable2DSource("builders/trigger-zone/result.js");

  assert.match(facade, /from "\.\/trigger-zone\/resources\.js"/);
  assert.match(facade, /from "\.\/trigger-zone\/area\.js"/);
  assert.match(facade, /from "\.\/trigger-zone\/script\.js"/);
  assert.match(facade, /from "\.\/trigger-zone\/result\.js"/);
  assert.doesNotMatch(facade, /joinGodotResourcePath/);
  assert.doesNotMatch(facade, /buildTriggerZone2DScript/);
  assert.doesNotMatch(facade, /visualPlaceholderTexturePath/);

  assert.match(resources, /export function buildTriggerZoneResourceContext/);
  assert.match(resources, /DEFAULT_TRIGGER_RESOURCE_DIRECTORY/);
  assert.match(resources, /joinGodotResourcePath/);
  assert.match(resources, /slugifyResourceName/);

  assert.match(area, /export function buildTriggerZoneAreaRequest/);
  assert.match(area, /export async function createTriggerZoneArea/);
  assert.match(area, /export function resolveTriggerZoneAreaPath/);
  assert.match(area, /createArea2D/);
  assert.match(area, /collisionShapeKind/);
  assert.match(area, /visualPlaceholderTexturePath/);

  assert.match(script, /export function buildTriggerZoneScriptContext/);
  assert.match(script, /export async function writeValidateAndAttachTriggerZoneScript/);
  assert.match(script, /from "\.\/script\/context\.js"/);
  assert.match(script, /from "\.\/script\/workflow\.js"/);
  assert.doesNotMatch(script, /buildTriggerZone2DScript/);
  assert.doesNotMatch(script, /client\.writeScript/);
  assert.doesNotMatch(script, /client\.validateScript/);
  assert.doesNotMatch(script, /client\.attachScript/);

  assert.match(result, /export function triggerZoneWithoutScriptData/);
  assert.match(result, /export function triggerZoneSuccessData/);
  assert.match(result, /type: "2DTriggerZone"/);
});

test("Playable2D trigger-zone script lifecycle delegates context write validate attach and details modules", async () => {
  const facade = await readPlayable2DSource("builders/trigger-zone/script.js");
  const context = await readPlayable2DSource("builders/trigger-zone/script/context.js");
  const details = await readPlayable2DSource("builders/trigger-zone/script/details.js");
  const write = await readPlayable2DSource("builders/trigger-zone/script/write.js");
  const validate = await readPlayable2DSource("builders/trigger-zone/script/validate.js");
  const attach = await readPlayable2DSource("builders/trigger-zone/script/attach.js");
  const workflow = await readPlayable2DSource("builders/trigger-zone/script/workflow.js");

  assert.match(facade, /from "\.\/script\/context\.js"/);
  assert.match(facade, /from "\.\/script\/workflow\.js"/);
  assert.doesNotMatch(facade, /buildTriggerZone2DScript/);
  assert.doesNotMatch(facade, /client\.writeScript/);
  assert.doesNotMatch(facade, /client\.validateScript/);
  assert.doesNotMatch(facade, /client\.attachScript/);
  assert.doesNotMatch(facade, /blockoutFailure/);

  assert.match(context, /export function buildTriggerZoneScriptContext/);
  assert.match(context, /defaultTriggerScriptPath/);
  assert.match(context, /defaultTriggerClassName/);
  assert.match(context, /slugifyResourceName/);
  assert.match(context, /eventName/);
  assert.match(context, /buildTriggerZone2DScript/);

  assert.match(details, /export function triggerZoneScriptOperationDetails/);
  assert.match(details, /scriptPath/);
  assert.match(details, /className/);
  assert.match(details, /eventName/);
  assert.match(details, /content/);

  assert.match(write, /export async function writeTriggerZoneScriptResource/);
  assert.match(write, /client\.writeScript/);
  assert.match(write, /script:write/);
  assert.match(write, /blockoutFailure/);

  assert.match(validate, /export async function validateTriggerZoneScript/);
  assert.match(validate, /client\.validateScript/);
  assert.match(validate, /script:validate/);
  assert.match(validate, /generated script did not validate/);
  assert.match(validate, /blockoutFailure/);

  assert.match(attach, /export async function attachTriggerZoneScript/);
  assert.match(attach, /client\.attachScript/);
  assert.match(attach, /script:attach/);
  assert.match(attach, /blockoutFailure/);

  assert.match(workflow, /export async function writeValidateAndAttachTriggerZoneScript/);
  assert.match(workflow, /writeTriggerZoneScriptResource/);
  assert.match(workflow, /validateTriggerZoneScript/);
  assert.match(workflow, /attachTriggerZoneScript/);
});

test("Playable2D schemas delegate workflow contracts to focused modules", async () => {
  const schemas = await readPlayable2DSource("schemas.js");
  const shared = await readPlayable2DSource("schemas/shared.js");
  const blockout = await readPlayable2DSource("schemas/blockout.js");
  const controller = await readPlayable2DSource("schemas/controller.js");
  const triggerZone = await readPlayable2DSource("schemas/trigger-zone.js");

  assert.match(schemas, /from "\.\/schemas\/blockout\.js"/);
  assert.match(schemas, /from "\.\/schemas\/controller\.js"/);
  assert.match(schemas, /from "\.\/schemas\/trigger-zone\.js"/);
  assert.doesNotMatch(schemas, /properties: \{/);
  assert.doesNotMatch(schemas, /actionNames: \{/);

  assert.match(shared, /export const ACTION_NAMES_SCHEMA/);
  assert.match(blockout, /export const CREATE_2D_PLAYABLE_BLOCKOUT_SCHEMA/);
  assert.match(blockout, /ACTION_NAMES_SCHEMA/);
  assert.match(controller, /export const CREATE_2D_CHARACTER_CONTROLLER_SCHEMA/);
  assert.match(controller, /ACTION_NAMES_SCHEMA/);
  assert.match(triggerZone, /CREATE_2D_TRIGGER_ZONE_SCHEMA/);
});

test("Playable2D trigger-zone schema delegates create area collision visual and script modules", async () => {
  const facade = await readPlayable2DSource("schemas/trigger-zone.js");
  const create = await readPlayable2DSource("schemas/trigger-zone/create.js");
  const area = await readPlayable2DSource("schemas/trigger-zone/area.js");
  const collision = await readPlayable2DSource("schemas/trigger-zone/collision.js");
  const visual = await readPlayable2DSource("schemas/trigger-zone/visual.js");
  const script = await readPlayable2DSource("schemas/trigger-zone/script.js");

  assert.match(facade, /from "\.\/trigger-zone\/create\.js"/);
  assert.doesNotMatch(facade, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(facade, /monitoring/);

  assert.match(create, /export const CREATE_2D_TRIGGER_ZONE_SCHEMA/);
  assert.match(create, /CONNECTION_PROPERTIES/);
  assert.match(create, /TRIGGER_ZONE_AREA_PROPERTIES/);
  assert.match(create, /TRIGGER_ZONE_COLLISION_PROPERTIES/);
  assert.match(create, /TRIGGER_ZONE_VISUAL_PROPERTIES/);
  assert.match(create, /TRIGGER_ZONE_SCRIPT_PROPERTIES/);

  assert.match(area, /export const TRIGGER_ZONE_AREA_PROPERTIES/);
  assert.match(area, /monitoring/);
  assert.match(area, /collisionMask/);
  assert.match(area, /properties/);

  assert.match(collision, /export const TRIGGER_ZONE_COLLISION_PROPERTIES/);
  assert.match(collision, /shapeKind/);
  assert.match(collision, /overwriteCollisionShape/);
  assert.match(collision, /collisionShapeProperties/);

  assert.match(visual, /export const TRIGGER_ZONE_VISUAL_PROPERTIES/);
  assert.match(visual, /createVisual/);
  assert.match(visual, /visualPlaceholderTexturePath/);
  assert.match(visual, /visualProperties/);

  assert.match(script, /export const TRIGGER_ZONE_SCRIPT_PROPERTIES/);
  assert.match(script, /attachScript/);
  assert.match(script, /watchBodies/);
  assert.match(script, /validateAfterCreate/);
});

test("create_2d_playable_blockout composes root, ground, player, camera, script, and inputs", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ method: req.method, url: req.url, body });
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

    if (req.url === "/input/action/set" && req.method === "POST") {
      res.end(JSON.stringify({ ok: true, data: { name: body.name, saved: body.save } }));
      return;
    }

    if (req.url === "/script/write" && req.method === "POST") {
      res.end(JSON.stringify({ ok: true, data: { path: body.path, type: "GDScript" } }));
      return;
    }

    if (req.url === "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer_body_controller_2d.gd") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player_body_controller_2d.gd",
          valid: true
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
          attached: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const result = await toolByName("create_2d_playable_blockout").handler({
      port,
      rootName: "SideScrollerPrototype",
      parentPath: "",
      resourceDirectory: "res://generated/blockout2d",
      overwriteResources: true,
      groundSize: [640, 48],
      playerSize: [32, 64],
      playerPosition: [0, -96],
      cameraPosition: [0, -80],
      saveScene: false
    });
    const payload = parseToolText(result);

    assert.equal(payload.ok, true);
    assert.equal(payload.data.rootPath, "SideScrollerPrototype");
    assert.equal(payload.data.player.character.nodePath, "SideScrollerPrototype/PlayerBody");
    assert.equal(payload.data.camera.node.nodePath, "SideScrollerPrototype/PlayerBody/PlayerCamera");
    assert.equal(payload.data.controller.nodePath, "SideScrollerPrototype/PlayerBody");
    assert.deepEqual(received.filter(({ url }) => url === "/input/action/set").map(({ body }) => body.name), [
      "move_left",
      "move_right",
      "jump"
    ]);
    assert.equal(received.some(({ body }) => body.type === "Node2D"), true);
    assert.equal(received.some(({ body }) => body.type === "StaticBody2D"), true);
    assert.equal(received.some(({ body }) => body.type === "CharacterBody2D"), true);
    assert.equal(received.some(({ body }) => body.type === "Camera2D"), true);
  });
});

test("create_2d_character_controller writes input actions, script, validation, and attachment", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ method: req.method, url: req.url, body });
    res.setHeader("content-type", "application/json");

    if (req.url === "/input/action/set" && req.method === "POST") {
      res.end(JSON.stringify({ ok: true, data: { name: body.name, saved: body.save } }));
      return;
    }
    if (req.url === "/script/write" && req.method === "POST") {
      res.end(JSON.stringify({ ok: true, data: { path: body.path, type: "GDScript" } }));
      return;
    }
    if (req.url === "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer_controller_2d.gd" && req.method === "GET") {
      res.end(JSON.stringify({
        ok: true,
        data: {
          path: "res://scripts/player_controller_2d.gd",
          valid: true
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
          attached: true
        }
      }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const result = await toolByName("create_2d_character_controller").handler({
      port,
      nodePath: "SideScrollerPrototype/PlayerBody",
      scriptPath: "res://scripts/player_controller_2d.gd",
      className: "SideScrollerPlayerController",
      moveSpeed: 360,
      jumpVelocity: -540,
      gravity: 1400,
      overwriteScript: true,
      saveScene: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.ok, true);
    assert.equal(payload.data.nodePath, "SideScrollerPrototype/PlayerBody");
    assert.deepEqual(received.slice(0, 3).map(({ body }) => body.name), [
      "move_left",
      "move_right",
      "jump"
    ]);
    assert.equal(received[3].url, "/script/write");
    assert.match(received[3].body.content, /class_name SideScrollerPlayerController/);
    assert.match(received[3].body.content, /@export var move_speed: float = 360/);
    assert.match(received[3].body.content, /velocity.y \+= gravity \* delta/);
    assert.equal(received[4].url, "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer_controller_2d.gd");
    assert.deepEqual(received[5], {
      method: "POST",
      url: "/script/attach",
      body: {
        nodePath: "SideScrollerPrototype/PlayerBody",
        scriptPath: "res://scripts/player_controller_2d.gd",
        createIfMissing: false,
        saveScene: true
      }
    });
  });
});

test("create_2d_trigger_zone creates Area2D, visual helper, script, validation, and attachment", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ method: req.method, url: req.url, body });
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
      res.end(JSON.stringify({ ok: true, data: { path: body.path, type: body.className } }));
      return;
    }
    if (req.url === "/script/write" && req.method === "POST") {
      res.end(JSON.stringify({ ok: true, data: { path: body.path, type: "GDScript" } }));
      return;
    }
    if (req.url === "/script/validate?path=res%3A%2F%2Fscripts%2Fpickup_zone_trigger_2d.gd") {
      res.end(JSON.stringify({
        ok: true,
        data: { path: "res://scripts/pickup_zone_trigger_2d.gd", valid: true }
      }));
      return;
    }
    if (req.url === "/script/attach" && req.method === "POST") {
      res.end(JSON.stringify({ ok: true, data: { nodePath: body.nodePath, scriptPath: body.scriptPath } }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const result = await toolByName("create_2d_trigger_zone").handler({
      port,
      name: "PickupZone",
      parentPath: "Level",
      resourceDirectory: "res://generated/triggers",
      shapeKind: "circle",
      radius: 24,
      createVisual: true,
      visualSize: [48, 48],
      scriptPath: "res://scripts/pickup_zone_trigger_2d.gd",
      className: "PickupZoneTrigger2D",
      eventName: "pickup_zone",
      watchAreas: true,
      overwriteResources: true,
      overwriteScript: true,
      saveScene: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.ok, true);
    assert.equal(payload.data.area.area.nodePath, "Level/PickupZone");
    assert.equal(payload.data.scriptPath, "res://scripts/pickup_zone_trigger_2d.gd");
    assert.match(received.find(({ url }) => url === "/script/write").body.content, /class_name PickupZoneTrigger2D/);
    assert.match(received.find(({ url }) => url === "/script/write").body.content, /body_entered.connect/);
    assert.match(received.find(({ url }) => url === "/script/write").body.content, /area_entered.connect/);
    assert.equal(received.find(({ url }) => url === "/script/attach").body.nodePath, "Level/PickupZone");
  });
});
