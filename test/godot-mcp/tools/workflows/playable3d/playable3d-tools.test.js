import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import { PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS } from "../../../../../src/godot-mcp/tools/workflows/playable3d/index.js";
import { PLAYABLE3D_WORKFLOW_TOOL_MANIFEST } from "../../../../../src/godot-mcp/tools/workflows/playable3d/manifest.js";

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
  return PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readPlayable3DSource(file) {
  return readFile(new URL(`../../../../../src/godot-mcp/tools/workflows/playable3d/${file}`, import.meta.url), "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

test("PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS exposes 3D workflow descriptors", () => {
  assert.deepEqual(
    PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS.map(({ name }) => name),
    PLAYABLE3D_WORKFLOW_TOOL_MANIFEST.map(({ name }) => name)
  );

  for (const tool of PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("Playable3D workflow tools are generated from the manifest", async () => {
  const index = await readPlayable3DSource("index.js");
  const manifest = await readPlayable3DSource("manifest.js");

  assert.match(index, /toolDefinitionsFromManifest\(PLAYABLE3D_WORKFLOW_TOOL_MANIFEST/);
  assert.match(index, /create3DPlayableBlockout/);
  assert.match(index, /create3DCharacterController/);
  assert.doesNotMatch(index, /PLAYABLE3D_WORKFLOW_TOOL_DEFINITIONS = \[/);
  assert.doesNotMatch(index, /toolResult/);

  assert.match(manifest, /export const PLAYABLE3D_WORKFLOW_TOOL_MANIFEST/);
  assert.match(manifest, /local: \{\s*handler: "create3DPlayableBlockout"/);
  assert.match(manifest, /local: \{\s*handler: "create3DCharacterController"/);
});

test("Playable3D builders delegate shared script blockout and controller workflows to focused modules", async () => {
  const builders = await readPlayable3DSource("builders.js");
  const shared = await readPlayable3DSource("builders/shared.js");
  const scripts = await readPlayable3DSource("builders/scripts.js");
  const scriptNames = await readPlayable3DSource("builders/scripts/names.js");
  const scriptPaths = await readPlayable3DSource("builders/scripts/paths.js");
  const scriptGdscript = await readPlayable3DSource("builders/scripts/gdscript.js");
  const scriptController = await readPlayable3DSource("builders/scripts/controller.js");
  const blockout = await readPlayable3DSource("builders/blockout.js");
  const controller = await readPlayable3DSource("builders/controller.js");

  assert.match(builders, /from "\.\/builders\/blockout\.js"/);
  assert.match(builders, /from "\.\/builders\/controller\.js"/);
  assert.doesNotMatch(builders, /export async function create3DPlayableBlockout/);
  assert.doesNotMatch(builders, /export async function create3DCharacterController/);
  assert.doesNotMatch(builders, /function buildCharacterController3DScript/);

  assert.match(shared, /export function normalizeGodotResourceDirectory/);
  assert.match(shared, /export function slugifyResourceName/);
  assert.match(shared, /export function joinGodotResourcePath/);
  assert.match(shared, /export function appendBlockoutStep/);
  assert.match(shared, /export function blockoutFailure/);

  assert.match(scripts, /from "\.\/scripts\/names\.js"/);
  assert.match(scripts, /from "\.\/scripts\/paths\.js"/);
  assert.match(scripts, /from "\.\/scripts\/gdscript\.js"/);
  assert.match(scripts, /from "\.\/scripts\/controller\.js"/);
  assert.doesNotMatch(scripts, /function defaultControllerScriptPath/);
  assert.doesNotMatch(scripts, /function buildCharacterController3DScript/);

  assert.match(scriptNames, /export function slugifyResourceName/);
  assert.match(scriptNames, /export function lastNodeName/);
  assert.match(scriptNames, /export function toPascalIdentifier/);
  assert.match(scriptPaths, /export function defaultControllerScriptPath/);
  assert.match(scriptPaths, /export function normalizeGodotScriptPath/);
  assert.match(scriptPaths, /export function defaultControllerClassName/);
  assert.match(scriptPaths, /export function normalizeGDScriptClassName/);
  assert.match(scriptGdscript, /export function gdNumber/);
  assert.match(scriptGdscript, /export function gdString/);
  assert.match(scriptController, /export function normalizeCharacterControllerActionNames/);
  assert.match(scriptController, /export function characterControllerInputSpecs/);
  assert.match(scriptController, /export function buildCharacterController3DScript/);

  assert.match(blockout, /export async function create3DPlayableBlockout/);
  assert.match(controller, /export async function create3DCharacterController/);
});

test("Playable3D schemas delegate workflow contracts to focused modules", async () => {
  const schemas = await readPlayable3DSource("schemas.js");
  const blockout = await readPlayable3DSource("schemas/blockout.js");
  const controller = await readPlayable3DSource("schemas/controller.js");
  const shared = await readPlayable3DSource("schemas/shared.js");

  assert.match(schemas, /from "\.\/schemas\/blockout\.js"/);
  assert.match(schemas, /from "\.\/schemas\/controller\.js"/);
  assert.doesNotMatch(schemas, /CONNECTION_PROPERTIES/);
  assert.doesNotMatch(schemas, /rootName/);
  assert.doesNotMatch(schemas, /actionNames/);

  assert.match(blockout, /export const CREATE_3D_PLAYABLE_BLOCKOUT_SCHEMA/);
  assert.match(blockout, /rootName/);
  assert.match(blockout, /groundSize/);
  assert.match(blockout, /cameraFov/);
  assert.match(blockout, /lightEnergy/);

  assert.match(controller, /export const CREATE_3D_CHARACTER_CONTROLLER_SCHEMA/);
  assert.match(controller, /ACTION_NAMES_SCHEMA/);
  assert.match(controller, /nodePath/);
  assert.match(controller, /speed/);
  assert.match(controller, /jumpVelocity/);
  assert.match(controller, /required: \["nodePath"\]/);

  assert.match(shared, /export const ACTION_NAMES_SCHEMA/);
  assert.match(shared, /moveForward/);
  assert.match(shared, /moveBack/);
  assert.match(shared, /moveLeft/);
  assert.match(shared, /moveRight/);
  assert.match(shared, /jump/);
});

test("Playable3D blockout builder delegates root resource layout actor and result domains", async () => {
  const facade = await readPlayable3DSource("builders/blockout.js");
  const workflow = await readPlayable3DSource("builders/blockout/workflow.js");
  const workflowState = await readPlayable3DSource("builders/blockout/workflow-state.js");
  const root = await readPlayable3DSource("builders/blockout/root.js");
  const resources = await readPlayable3DSource("builders/blockout/resources.js");
  const layout = await readPlayable3DSource("builders/blockout/layout.js");
  const ground = await readPlayable3DSource("builders/blockout/ground.js");
  const player = await readPlayable3DSource("builders/blockout/player.js");
  const cameraLight = await readPlayable3DSource("builders/blockout/camera-light.js");
  const result = await readPlayable3DSource("builders/blockout/result.js");

  assert.match(facade, /from "\.\/blockout\/workflow\.js"/);
  assert.match(facade, /export async function create3DPlayableBlockout/);
  assert.doesNotMatch(facade, /from "\.\/blockout\/root\.js"/);
  assert.doesNotMatch(facade, /from "\.\/blockout\/resources\.js"/);
  assert.doesNotMatch(facade, /from "\.\/blockout\/layout\.js"/);
  assert.doesNotMatch(facade, /from "\.\/blockout\/ground\.js"/);
  assert.doesNotMatch(facade, /from "\.\/blockout\/player\.js"/);
  assert.doesNotMatch(facade, /from "\.\/blockout\/camera-light\.js"/);
  assert.doesNotMatch(facade, /from "\.\/blockout\/result\.js"/);
  assert.doesNotMatch(facade, /appendBlockoutStep/);

  assert.match(workflow, /from "\.\/root\.js"/);
  assert.match(workflow, /from "\.\/resources\.js"/);
  assert.match(workflow, /from "\.\/layout\.js"/);
  assert.match(workflow, /from "\.\/ground\.js"/);
  assert.match(workflow, /from "\.\/player\.js"/);
  assert.match(workflow, /from "\.\/camera-light\.js"/);
  assert.match(workflow, /from "\.\/result\.js"/);
  assert.match(workflow, /from "\.\/workflow-state\.js"/);
  assert.match(workflow, /export async function runCreate3DPlayableBlockoutWorkflow/);
  assert.match(workflow, /createBlockout3DWorkflowState/);
  assert.match(workflow, /assignBlockout3DWorkflowContext/);
  assert.match(workflow, /captureBlockout3DStep/);
  assert.match(workflow, /blockout3DWorkflowSteps/);
  assert.doesNotMatch(workflow, /from "\.\.\/shared\.js"/);
  assert.doesNotMatch(workflow, /appendBlockoutStep/);
  assert.doesNotMatch(workflow, /blockoutFailure/);
  assert.doesNotMatch(workflow, /resourceDirectory: resourceContext\.resourceDirectory/);

  assert.match(workflowState, /from "\.\.\/shared\.js"/);
  assert.match(workflowState, /export function createBlockout3DWorkflowState/);
  assert.match(workflowState, /export function assignBlockout3DWorkflowContext/);
  assert.match(workflowState, /export function captureBlockout3DStep/);
  assert.match(workflowState, /export function blockout3DWorkflowSteps/);
  assert.match(workflowState, /appendBlockoutStep/);
  assert.match(workflowState, /blockoutFailure/);

  assert.match(root, /export function buildBlockout3DRootRequest/);
  assert.match(root, /export async function createBlockout3DRoot/);
  assert.match(resources, /export function buildBlockout3DResourceContext/);
  assert.match(layout, /export function buildBlockout3DLayout/);
  assert.match(ground, /export async function createBlockout3DGround/);
  assert.match(player, /export async function createBlockout3DPlayer/);
  assert.match(player, /export function resolveBlockout3DPlayerPath/);
  assert.match(cameraLight, /export async function createBlockout3DCamera/);
  assert.match(cameraLight, /export async function createBlockout3DLight/);
  assert.match(result, /export function blockout3DSuccessData/);
});

test("Playable3D controller builder delegates context input script and result domains", async () => {
  const facade = await readPlayable3DSource("builders/controller.js");
  const context = await readPlayable3DSource("builders/controller/context.js");
  const inputMap = await readPlayable3DSource("builders/controller/input-map.js");
  const scriptLifecycle = await readPlayable3DSource("builders/controller/script-lifecycle.js");
  const result = await readPlayable3DSource("builders/controller/result.js");

  assert.match(facade, /from "\.\/controller\/context\.js"/);
  assert.match(facade, /from "\.\/controller\/input-map\.js"/);
  assert.match(facade, /from "\.\/controller\/script-lifecycle\.js"/);
  assert.match(facade, /from "\.\/controller\/result\.js"/);
  assert.match(facade, /export async function create3DCharacterController/);
  assert.doesNotMatch(facade, /client\.setInputAction/);
  assert.doesNotMatch(facade, /client\.createScript/);
  assert.doesNotMatch(facade, /client\.validateScript/);
  assert.doesNotMatch(facade, /client\.attachScript/);
  assert.doesNotMatch(facade, /normalizePositiveFiniteNumber/);

  assert.match(context, /export function buildCharacterController3DContext/);
  assert.match(context, /normalizePositiveFiniteNumber/);
  assert.match(context, /normalizeGodotScriptPath/);

  assert.match(inputMap, /export async function configureCharacterController3DInputMap/);
  assert.match(inputMap, /client\.setInputAction/);
  assert.match(inputMap, /characterControllerInputSpecs/);

  assert.match(scriptLifecycle, /export function buildCharacterController3DScriptContent/);
  assert.match(scriptLifecycle, /export async function createCharacterController3DScriptResource/);
  assert.match(scriptLifecycle, /export async function validateCharacterController3DScript/);
  assert.match(scriptLifecycle, /export async function attachCharacterController3DScript/);
  assert.match(scriptLifecycle, /client\.createScript/);
  assert.match(scriptLifecycle, /client\.validateScript/);
  assert.match(scriptLifecycle, /client\.attachScript/);

  assert.match(result, /export function characterController3DOperationDetails/);
  assert.match(result, /export function characterController3DSuccessData/);
});

test("create_3d_playable_blockout composes a root, ground, player, camera, and light", async () => {
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

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, error: "not found" }));
  }, async (port) => {
    const result = await toolByName("create_3d_playable_blockout").handler({
      port,
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
    });
    const payload = parseToolText(result);

    assert.equal(payload.ok, true);
    assert.equal(payload.data.rootPath, "ArenaPrototype");
    assert.equal(payload.data.player.character.nodePath, "ArenaPrototype/PlayerBody");
    assert.equal(payload.data.camera.node.nodePath, "ArenaPrototype/PlayerBody/ChaseCamera");
    assert.equal(payload.data.light.node.nodePath, "ArenaPrototype/KeyLight");
    assert.deepEqual(received.map(({ url }) => url), [
      "/scene/node/create",
      "/resource/create",
      "/scene/node/create",
      "/scene/node/create",
      "/resource/create",
      "/scene/node/create",
      "/scene/node/create",
      "/resource/create",
      "/scene/node/create",
      "/resource/create",
      "/scene/node/create",
      "/scene/node/create",
      "/scene/node/create"
    ]);
    assert.equal(received[1].body.path, "res://generated/blockout/arena_prototype_ground_mesh.tres");
    assert.equal(received[7].body.className, "CapsuleShape3D");
    assert.equal(received[11].body.type, "Camera3D");
    assert.equal(received[12].body.type, "DirectionalLight3D");
  });
});

test("create_3d_character_controller writes input actions, script, validation, and attachment", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ method: req.method, url: req.url, body });

    res.setHeader("content-type", "application/json");
    if (req.url === "/input/action/set" && req.method === "POST") {
      res.end(JSON.stringify({ ok: true, data: { name: body.name, saved: body.save } }));
      return;
    }
    if (req.url === "/script/create" && req.method === "POST") {
      res.end(JSON.stringify({ ok: true, data: { path: body.path, type: "GDScript" } }));
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
    const result = await toolByName("create_3d_character_controller").handler({
      port,
      nodePath: "ArenaPrototype/PlayerBody",
      scriptPath: "res://scripts/player_controller.gd",
      className: "ArenaPlayerController",
      speed: 9,
      jumpVelocity: 5.5,
      gravity: 18,
      overwriteScript: true,
      saveScene: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.ok, true);
    assert.equal(payload.data.nodePath, "ArenaPrototype/PlayerBody");
    assert.deepEqual(received.slice(0, 5).map(({ body }) => body.name), [
      "move_forward",
      "move_back",
      "move_left",
      "move_right",
      "jump"
    ]);
    assert.equal(received[5].url, "/script/create");
    assert.match(received[5].body.content, /class_name ArenaPlayerController/);
    assert.match(received[5].body.content, /@export var move_speed: float = 9/);
    assert.equal(received[6].url, "/script/validate?path=res%3A%2F%2Fscripts%2Fplayer_controller.gd");
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
  });
});
