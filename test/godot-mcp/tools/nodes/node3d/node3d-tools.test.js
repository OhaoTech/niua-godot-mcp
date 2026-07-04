import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

import { NODE3D_TOOL_DEFINITIONS } from "../../../../../src/godot-mcp/tools/nodes/node3d/index.js";
import { NODE3D_TOOL_MANIFEST } from "../../../../../src/godot-mcp/tools/nodes/node3d/manifest.js";

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
  return NODE3D_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

async function readNode3DSource(file) {
  return readFile(new URL(`../../../../../src/godot-mcp/tools/nodes/node3d/${file}`, import.meta.url), "utf8");
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

test("NODE3D_TOOL_DEFINITIONS exposes curated 3D node descriptors", () => {
  assert.deepEqual(
    NODE3D_TOOL_DEFINITIONS.map(({ name }) => name),
    NODE3D_TOOL_MANIFEST.map(({ name }) => name)
  );

  for (const tool of NODE3D_TOOL_DEFINITIONS) {
    assert.equal(typeof tool.description, "string");
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(typeof tool.handler, "function");
  }
});

test("Node3D tool index delegates generated descriptors to focused tools module", async () => {
  const index = await readNode3DSource("index.js");
  const tools = await readNode3DSource("tools.js");

  assert.match(index, /from "\.\/tools\.js"/);
  assert.match(index, /export \{ NODE3D_TOOL_DEFINITIONS \} from "\.\/tools\.js"/);
  assert.doesNotMatch(index, /toolResult/);
  assert.doesNotMatch(index, /NODE3D_TOOL_DEFINITIONS = \[/);

  assert.match(tools, /toolDefinitionsFromManifest\(NODE3D_TOOL_MANIFEST/);
  assert.doesNotMatch(tools, /import \{ toolResult \}/);
  assert.doesNotMatch(tools, /export const NODE3D_TOOL_DEFINITIONS = \[/);
  assert.match(tools, /createLight3D/);
  assert.match(tools, /createCamera3D/);
  assert.match(tools, /createMeshInstance3D/);
  assert.match(tools, /createRigidBody3D/);
  assert.match(tools, /createArea3D/);
});

test("Node3D builders delegate property and kind logic to focused modules", async () => {
  const builders = await readNode3DSource("builders.js");
  const visualBuilder = await readNode3DSource("builders/visual.js");
  const meshBuilder = await readNode3DSource("builders/mesh-instance.js");
  const properties = await readNode3DSource("properties.js");
  const kinds = await readNode3DSource("kinds.js");
  const workflowBuilders = `${visualBuilder}\n${meshBuilder}`;

  assert.match(builders, /from "\.\/builders\/visual\.js"/);
  assert.match(builders, /from "\.\/builders\/mesh-instance\.js"/);
  assert.match(workflowBuilders, /from "\.\.\/properties\.js"/);
  assert.match(workflowBuilders, /from "\.\.\/kinds\.js"/);
  assert.doesNotMatch(builders, /function buildLight3DProperties/);
  assert.doesNotMatch(builders, /function buildMesh3DResourceProperties/);
  assert.doesNotMatch(builders, /function normalizeMesh3DKind/);
  assert.doesNotMatch(builders, /const LIGHT_3D_KINDS/);

  assert.match(properties, /from "\.\/properties\/visual\.js"/);
  assert.match(properties, /from "\.\/properties\/meshes\.js"/);
  assert.match(properties, /from "\.\/properties\/physics-bodies\.js"/);
  assert.match(properties, /from "\.\/properties\/collision-shapes\.js"/);

  assert.match(kinds, /from "\.\/kinds\/light\.js"/);
  assert.match(kinds, /from "\.\/kinds\/meshes\.js"/);
  assert.match(kinds, /normalizeLight3DKind/);
  assert.match(kinds, /normalizeMesh3DKind/);
  assert.doesNotMatch(kinds, /const LIGHT_3D_KINDS/);
  assert.doesNotMatch(kinds, /const MESH_3D_KINDS/);
});

test("Node3D kind facade delegates focused normalizer modules", async () => {
  const facade = await readNode3DSource("kinds.js");
  const shared = await readNode3DSource("kinds/shared.js");
  const light = await readNode3DSource("kinds/light.js");
  const camera = await readNode3DSource("kinds/camera.js");
  const collisionShapes = await readNode3DSource("kinds/collision-shapes.js");
  const meshes = await readNode3DSource("kinds/meshes.js");
  const physicsBodies = await readNode3DSource("kinds/physics-bodies.js");

  assert.match(facade, /from "\.\/kinds\/light\.js"/);
  assert.match(facade, /from "\.\/kinds\/camera\.js"/);
  assert.match(facade, /from "\.\/kinds\/collision-shapes\.js"/);
  assert.match(facade, /from "\.\/kinds\/meshes\.js"/);
  assert.match(facade, /from "\.\/kinds\/physics-bodies\.js"/);
  assert.doesNotMatch(facade, /new Map/);
  assert.doesNotMatch(facade, /replace\(/);

  assert.match(shared, /export function normalizeKindKey/);
  assert.match(shared, /export function formatAllowedKinds/);

  assert.match(light, /export function normalizeLight3DKind/);
  assert.match(light, /const LIGHT_3D_KINDS/);
  assert.match(light, /DirectionalLight3D/);
  assert.match(light, /kind must be one of/);

  assert.match(camera, /export function normalizeCamera3DProjection/);
  assert.match(camera, /const CAMERA_3D_PROJECTIONS/);
  assert.match(camera, /projection must be a non-negative integer/);

  assert.match(collisionShapes, /export function normalizeCollisionShape3DKind/);
  assert.match(collisionShapes, /const COLLISION_SHAPE_3D_KINDS/);
  assert.match(collisionShapes, /shapeKind must be one of/);

  assert.match(meshes, /export function normalizeMesh3DKind/);
  assert.match(meshes, /const MESH_3D_KINDS/);
  assert.match(meshes, /TorusMesh/);

  assert.match(physicsBodies, /export function normalizeCharacterBody3DMotionMode/);
  assert.match(physicsBodies, /const CHARACTER_BODY_3D_MOTION_MODES/);
  assert.match(physicsBodies, /motionMode must be a non-negative integer/);
});

test("Node3D builders facade delegates visual and mesh workflows", async () => {
  const facade = await readNode3DSource("builders.js");
  const visual = await readNode3DSource("builders/visual.js");
  const mesh = await readNode3DSource("builders/mesh-instance.js");

  assert.match(facade, /from "\.\/builders\/visual\.js"/);
  assert.match(facade, /from "\.\/builders\/mesh-instance\.js"/);
  assert.match(facade, /from "\.\/physics\.js"/);
  assert.match(facade, /from "\.\/paths\.js"/);
  assert.doesNotMatch(facade, /export async function createLight3D/);
  assert.doesNotMatch(facade, /export async function createMeshInstance3D/);
  assert.doesNotMatch(facade, /client\.createNode/);
  assert.doesNotMatch(facade, /client\.createResource/);

  assert.match(visual, /export async function createLight3D/);
  assert.match(visual, /export async function createCamera3D/);
  assert.match(visual, /normalizeLight3DKind/);
  assert.match(visual, /buildLight3DProperties/);
  assert.match(visual, /buildCamera3DProperties/);
  assert.match(visual, /client\.createNode/);

  assert.match(mesh, /export async function createMeshInstance3D/);
  assert.match(mesh, /normalizeMesh3DKind/);
  assert.match(mesh, /buildMesh3DResourceProperties/);
  assert.match(mesh, /buildMeshInstance3DNodeProperties/);
  assert.match(mesh, /client\.createResource/);
  assert.match(mesh, /client\.createNode/);
});

test("Node3D properties delegate shared collision mesh physics and visual builders to focused modules", async () => {
  const properties = await readNode3DSource("properties.js");
  const shared = await readNode3DSource("properties/shared.js");
  const collisionShapes = await readNode3DSource("properties/collision-shapes.js");
  const meshes = await readNode3DSource("properties/meshes.js");
  const physicsBodies = await readNode3DSource("properties/physics-bodies.js");
  const physicsRigidBody = await readNode3DSource("properties/physics-bodies/rigid-body.js");
  const physicsCharacterBody = await readNode3DSource("properties/physics-bodies/character-body.js");
  const physicsStaticBody = await readNode3DSource("properties/physics-bodies/static-body.js");
  const physicsArea = await readNode3DSource("properties/physics-bodies/area.js");
  const visual = await readNode3DSource("properties/visual.js");

  assert.match(properties, /from "\.\/properties\/collision-shapes\.js"/);
  assert.match(properties, /from "\.\/properties\/meshes\.js"/);
  assert.match(properties, /from "\.\/properties\/physics-bodies\.js"/);
  assert.match(properties, /from "\.\/properties\/visual\.js"/);
  assert.doesNotMatch(properties, /function applyOptionalNumberProperty/);
  assert.doesNotMatch(properties, /function buildRigidBody3DProperties/);
  assert.doesNotMatch(properties, /function buildLight3DProperties/);

  assert.match(shared, /export function applyNode3DTransformProperties/);
  assert.match(shared, /export function applyOptionalNumberProperty/);
  assert.match(shared, /export function mergeCustomProperties/);
  assert.match(collisionShapes, /export function buildCollisionShape3DResourceProperties/);
  assert.match(collisionShapes, /export function buildCollisionShape3DNodeProperties/);
  assert.match(meshes, /export function buildMesh3DResourceProperties/);
  assert.match(meshes, /export function buildMeshInstance3DNodeProperties/);
  assert.match(physicsBodies, /from "\.\/physics-bodies\/rigid-body\.js"/);
  assert.match(physicsBodies, /from "\.\/physics-bodies\/character-body\.js"/);
  assert.match(physicsBodies, /from "\.\/physics-bodies\/static-body\.js"/);
  assert.match(physicsBodies, /from "\.\/physics-bodies\/area\.js"/);
  assert.doesNotMatch(physicsBodies, /normalizeNonNegativeInteger/);
  assert.doesNotMatch(physicsBodies, /vector3ToGodotVector/);
  assert.doesNotMatch(physicsBodies, /applyOptionalNumberProperty/);
  assert.match(physicsBodies, /buildRigidBody3DProperties/);
  assert.match(physicsBodies, /buildCharacterBody3DProperties/);
  assert.match(physicsBodies, /buildStaticBody3DProperties/);
  assert.match(physicsBodies, /buildArea3DProperties/);
  assert.match(physicsRigidBody, /export function buildRigidBody3DProperties/);
  assert.match(physicsRigidBody, /contact_monitor/);
  assert.match(physicsRigidBody, /max_contacts_reported/);
  assert.doesNotMatch(physicsRigidBody, /buildCharacterBody3DProperties/);
  assert.match(physicsCharacterBody, /export function buildCharacterBody3DProperties/);
  assert.match(physicsCharacterBody, /normalizeCharacterBody3DMotionMode/);
  assert.match(physicsCharacterBody, /floor_stop_on_slope/);
  assert.doesNotMatch(physicsCharacterBody, /buildRigidBody3DProperties/);
  assert.match(physicsStaticBody, /export function buildStaticBody3DProperties/);
  assert.match(physicsStaticBody, /constant_linear_velocity/);
  assert.match(physicsStaticBody, /constant_angular_velocity/);
  assert.doesNotMatch(physicsStaticBody, /buildArea3DProperties/);
  assert.match(physicsArea, /export function buildArea3DProperties/);
  assert.match(physicsArea, /monitoring/);
  assert.match(physicsArea, /monitorable/);
  assert.doesNotMatch(physicsArea, /buildStaticBody3DProperties/);
  assert.match(visual, /export function buildCamera3DProperties/);
  assert.match(visual, /export function buildLight3DProperties/);
});

test("Node3D builders delegate physics workflows to focused modules", async () => {
  const builders = await readNode3DSource("builders.js");
  const physics = await readNode3DSource("physics.js");
  const paths = await readNode3DSource("paths.js");

  assert.match(builders, /from "\.\/physics\.js"/);
  assert.match(builders, /from "\.\/paths\.js"/);
  assert.doesNotMatch(builders, /export async function createCollisionShape3D/);
  assert.doesNotMatch(builders, /export async function createRigidBody3D/);
  assert.doesNotMatch(builders, /export async function createCharacterBody3D/);
  assert.doesNotMatch(builders, /export async function createStaticBody3D/);
  assert.doesNotMatch(builders, /export async function createArea3D/);
  assert.doesNotMatch(builders, /function resolveCreatedNodePath/);

  assert.match(physics, /from "\.\/physics\/collision-shape\.js"/);
  assert.match(physics, /from "\.\/physics\/body-workflows\.js"/);
  assert.match(physics, /createCollisionShape3D/);
  assert.match(physics, /createRigidBody3D/);
  assert.match(physics, /createCharacterBody3D/);
  assert.match(physics, /createStaticBody3D/);
  assert.match(physics, /createArea3D/);
  assert.doesNotMatch(physics, /splitBridgeArgs/);
  assert.doesNotMatch(physics, /client\.createNode/);
  assert.doesNotMatch(physics, /client\.createResource/);

  assert.match(paths, /export function resolveCreatedNodePath/);
});

test("Node3D physics facade delegates collision shape and body workflows", async () => {
  const physics = await readNode3DSource("physics.js");
  const collisionShape = await readNode3DSource("physics/collision-shape.js");
  const bodyWorkflows = await readNode3DSource("physics/body-workflows.js");

  assert.match(physics, /from "\.\/physics\/collision-shape\.js"/);
  assert.match(physics, /from "\.\/physics\/body-workflows\.js"/);
  assert.doesNotMatch(physics, /splitBridgeArgs/);
  assert.doesNotMatch(physics, /buildRigidBody3DProperties/);
  assert.doesNotMatch(physics, /buildCollisionShape3DResourceProperties/);

  assert.match(collisionShape, /export async function createCollisionShape3D/);
  assert.match(collisionShape, /from "\.\.\/\.\.\/\.\.\/\.\.\/server\/context\.js"/);
  assert.match(collisionShape, /normalizeCollisionShape3DKind/);
  assert.match(collisionShape, /buildCollisionShape3DResourceProperties/);
  assert.match(collisionShape, /buildCollisionShape3DNodeProperties/);
  assert.match(collisionShape, /client\.createResource/);
  assert.match(collisionShape, /client\.createNode/);

  assert.match(bodyWorkflows, /from "\.\/body-workflows\/rigid-body\.js"/);
  assert.match(bodyWorkflows, /from "\.\/body-workflows\/character-body\.js"/);
  assert.match(bodyWorkflows, /from "\.\/body-workflows\/static-body\.js"/);
  assert.match(bodyWorkflows, /from "\.\/body-workflows\/area\.js"/);
  assert.match(bodyWorkflows, /createRigidBody3D/);
  assert.match(bodyWorkflows, /createCharacterBody3D/);
  assert.match(bodyWorkflows, /createStaticBody3D/);
  assert.match(bodyWorkflows, /createArea3D/);
  assert.doesNotMatch(bodyWorkflows, /buildRigidBody3DProperties/);
  assert.doesNotMatch(bodyWorkflows, /createOptionalCollisionShape3DChild/);
});

test("Node3D physics workflows delegate optional collision child creation", async () => {
  const owner = await readNode3DSource("physics/body-workflows/owner.js");
  const collisionChild = await readNode3DSource("physics/collision-child.js");
  const collisionContext = await readNode3DSource("physics/collision-child/context.js");
  const collisionRequests = await readNode3DSource("physics/collision-child/requests.js");
  const collisionResults = await readNode3DSource("physics/collision-child/results.js");

  assert.match(owner, /from "\.\.\/collision-child\.js"/);
  assert.doesNotMatch(owner, /from "\.\.\/\.\.\/paths\.js"/);
  assert.match(owner, /createOptionalCollisionShape3DChild/);

  assert.match(collisionChild, /export async function createOptionalCollisionShape3DChild/);
  assert.match(collisionChild, /from "\.\/collision-child\/context\.js"/);
  assert.match(collisionChild, /from "\.\/collision-child\/requests\.js"/);
  assert.match(collisionChild, /from "\.\/collision-child\/results\.js"/);
  assert.doesNotMatch(collisionChild, /from "\.\.\/paths\.js"/);
  assert.doesNotMatch(collisionChild, /from "\.\.\/kinds\.js"/);
  assert.doesNotMatch(collisionChild, /from "\.\.\/properties\.js"/);

  assert.match(collisionContext, /export function buildCollisionChild3DContext/);
  assert.match(collisionContext, /normalizeCollisionShape3DKind/);
  assert.match(collisionContext, /buildCollisionShape3DResourceProperties/);
  assert.match(collisionContext, /buildCollisionShape3DNodeProperties/);
  assert.match(collisionContext, /collisionShapePath/);

  assert.match(collisionRequests, /export function buildCollisionChild3DResourceRequest/);
  assert.match(collisionRequests, /export function buildCollisionChild3DNodeRequest/);
  assert.match(collisionRequests, /resolveCreatedNodePath/);
  assert.doesNotMatch(collisionRequests, /client\.createResource/);

  assert.match(collisionResults, /export function collisionChild3DNoCollisionResult/);
  assert.match(collisionResults, /export function collisionChild3DShapeFailure/);
  assert.match(collisionResults, /export function collisionChild3DNodeFailure/);
  assert.match(collisionResults, /export function collisionChild3DSuccess/);
});

test("Node3D body workflow facade delegates shared owner and body domains", async () => {
  const facade = await readNode3DSource("physics/body-workflows.js");
  const owner = await readNode3DSource("physics/body-workflows/owner.js");
  const rigidBody = await readNode3DSource("physics/body-workflows/rigid-body.js");
  const characterBody = await readNode3DSource("physics/body-workflows/character-body.js");
  const staticBody = await readNode3DSource("physics/body-workflows/static-body.js");
  const area = await readNode3DSource("physics/body-workflows/area.js");
  const bodyModules = `${rigidBody}\n${characterBody}\n${staticBody}\n${area}`;

  assert.match(facade, /from "\.\/body-workflows\/rigid-body\.js"/);
  assert.match(facade, /from "\.\/body-workflows\/character-body\.js"/);
  assert.match(facade, /from "\.\/body-workflows\/static-body\.js"/);
  assert.match(facade, /from "\.\/body-workflows\/area\.js"/);
  assert.doesNotMatch(facade, /splitBridgeArgs/);
  assert.doesNotMatch(facade, /client\.createNode/);
  assert.doesNotMatch(facade, /buildRigidBody3DProperties/);
  assert.doesNotMatch(facade, /buildCharacterBody3DProperties/);
  assert.doesNotMatch(facade, /buildStaticBody3DProperties/);
  assert.doesNotMatch(facade, /buildArea3DProperties/);

  assert.match(owner, /export async function createPhysicsOwner3D/);
  assert.match(owner, /splitBridgeArgs/);
  assert.match(owner, /createOptionalCollisionShape3DChild/);
  assert.match(owner, /client\.createNode/);
  assert.match(owner, /ownerResult: createdOwner/);
  assert.doesNotMatch(owner, /createdOwnerKey/);

  assert.match(bodyModules, /createPhysicsOwner3D/);
  assert.match(rigidBody, /export async function createRigidBody3D/);
  assert.match(rigidBody, /buildRigidBody3DProperties/);
  assert.match(rigidBody, /type: "RigidBody3D"/);
  assert.match(rigidBody, /ownerDataKey: "body"/);
  assert.doesNotMatch(rigidBody, /createdOwnerKey/);

  assert.match(characterBody, /export async function createCharacterBody3D/);
  assert.match(characterBody, /buildCharacterBody3DProperties/);
  assert.match(characterBody, /type: "CharacterBody3D"/);
  assert.match(characterBody, /ownerDataKey: "character"/);
  assert.doesNotMatch(characterBody, /createdOwnerKey/);

  assert.match(staticBody, /export async function createStaticBody3D/);
  assert.match(staticBody, /buildStaticBody3DProperties/);
  assert.match(staticBody, /type: "StaticBody3D"/);
  assert.match(staticBody, /ownerDataKey: "body"/);
  assert.doesNotMatch(staticBody, /createdOwnerKey/);

  assert.match(area, /export async function createArea3D/);
  assert.match(area, /buildArea3DProperties/);
  assert.match(area, /type: "Area3D"/);
  assert.match(area, /ownerDataKey: "area"/);
  assert.doesNotMatch(area, /createdOwnerKey/);
});

test("Node3D schemas delegate visual and physics catalogs to focused modules", async () => {
  const schemas = await readNode3DSource("schemas.js");
  const visual = await readNode3DSource("schemas/visual.js");
  const physics = await readNode3DSource("schemas/physics.js");
  const shared = await readNode3DSource("schemas/shared.js");

  assert.match(schemas, /from "\.\/schemas\/visual\.js"/);
  assert.match(schemas, /from "\.\/schemas\/physics\.js"/);
  assert.doesNotMatch(schemas, /export const CREATE_LIGHT_3D_SCHEMA/);
  assert.doesNotMatch(schemas, /export const CREATE_RIGID_BODY_3D_SCHEMA/);
  assert.doesNotMatch(schemas, /CONNECTION_PROPERTIES/);

  assert.match(visual, /from "\.\/visual\/light\.js"/);
  assert.match(visual, /from "\.\/visual\/camera\.js"/);
  assert.match(visual, /from "\.\/visual\/mesh-instance\.js"/);
  assert.match(visual, /CREATE_LIGHT_3D_SCHEMA/);
  assert.match(visual, /CREATE_CAMERA_3D_SCHEMA/);
  assert.match(visual, /CREATE_MESH_INSTANCE_3D_SCHEMA/);

  assert.match(physics, /CREATE_COLLISION_SHAPE_3D_SCHEMA/);
  assert.match(physics, /CREATE_RIGID_BODY_3D_SCHEMA/);
  assert.match(physics, /CREATE_CHARACTER_BODY_3D_SCHEMA/);
  assert.match(physics, /CREATE_STATIC_BODY_3D_SCHEMA/);
  assert.match(physics, /CREATE_AREA_3D_SCHEMA/);
  assert.match(physics, /from "\.\/physics\/collision-shape\.js"/);

  assert.match(shared, /export const BASE_NODE3D_PROPERTIES/);
  assert.match(shared, /export const COLLISION_SHAPE_CHILD_PROPERTIES/);
  assert.match(shared, /CONNECTION_PROPERTIES/);
});

test("Node3D visual schemas delegate light camera and mesh instance domains", async () => {
  const facade = await readNode3DSource("schemas/visual.js");
  const light = await readNode3DSource("schemas/visual/light.js");
  const camera = await readNode3DSource("schemas/visual/camera.js");
  const meshInstance = await readNode3DSource("schemas/visual/mesh-instance.js");

  assert.match(facade, /from "\.\/visual\/light\.js"/);
  assert.match(facade, /from "\.\/visual\/camera\.js"/);
  assert.match(facade, /from "\.\/visual\/mesh-instance\.js"/);
  assert.doesNotMatch(facade, /advancedNodeProperties/);
  assert.doesNotMatch(facade, /BASE_NODE3D_PROPERTIES/);
  assert.doesNotMatch(facade, /angleDegrees/);
  assert.doesNotMatch(facade, /projection/);
  assert.doesNotMatch(facade, /meshKind/);

  assert.match(light, /export const CREATE_LIGHT_3D_SCHEMA/);
  assert.match(light, /from "\.\.\/shared\.js"/);
  assert.match(light, /advancedNodeProperties/);
  assert.match(light, /kind/);
  assert.match(light, /energy/);
  assert.match(light, /range/);
  assert.match(light, /angleDegrees/);
  assert.match(light, /shadowEnabled/);

  assert.match(camera, /export const CREATE_CAMERA_3D_SCHEMA/);
  assert.match(camera, /from "\.\.\/shared\.js"/);
  assert.match(camera, /advancedNodeProperties/);
  assert.match(camera, /current/);
  assert.match(camera, /fov/);
  assert.match(camera, /near/);
  assert.match(camera, /far/);
  assert.match(camera, /projection/);

  assert.match(meshInstance, /export const CREATE_MESH_INSTANCE_3D_SCHEMA/);
  assert.match(meshInstance, /from "\.\.\/shared\.js"/);
  assert.match(meshInstance, /meshKind/);
  assert.match(meshInstance, /meshPath/);
  assert.match(meshInstance, /materialPath/);
  assert.match(meshInstance, /meshProperties/);
  assert.match(meshInstance, /nodeProperties/);
  assert.match(meshInstance, /required: \["meshPath"\]/);
});

test("Node3D physics schemas delegate collision shape body and area catalogs", async () => {
  const facade = await readNode3DSource("schemas/physics.js");
  const collisionShape = await readNode3DSource("schemas/physics/collision-shape.js");
  const rigidBody = await readNode3DSource("schemas/physics/rigid-body.js");
  const characterBody = await readNode3DSource("schemas/physics/character-body.js");
  const staticBody = await readNode3DSource("schemas/physics/static-body.js");
  const area = await readNode3DSource("schemas/physics/area.js");

  assert.match(facade, /from "\.\/physics\/collision-shape\.js"/);
  assert.match(facade, /from "\.\/physics\/rigid-body\.js"/);
  assert.match(facade, /from "\.\/physics\/character-body\.js"/);
  assert.match(facade, /from "\.\/physics\/static-body\.js"/);
  assert.match(facade, /from "\.\/physics\/area\.js"/);
  assert.doesNotMatch(facade, /BASE_NODE3D_PROPERTIES/);
  assert.doesNotMatch(facade, /COLLISION_SHAPE_CHILD_PROPERTIES/);
  assert.doesNotMatch(facade, /advancedNodeProperties/);

  assert.match(collisionShape, /export const CREATE_COLLISION_SHAPE_3D_SCHEMA/);
  assert.match(collisionShape, /shapeKind/);
  assert.match(collisionShape, /shapeProperties/);
  assert.match(collisionShape, /from "\.\.\/shared\.js"/);

  assert.match(rigidBody, /export const CREATE_RIGID_BODY_3D_SCHEMA/);
  assert.match(rigidBody, /mass/);
  assert.match(rigidBody, /continuousCd/);
  assert.match(rigidBody, /COLLISION_SHAPE_CHILD_PROPERTIES/);

  assert.match(characterBody, /export const CREATE_CHARACTER_BODY_3D_SCHEMA/);
  assert.match(characterBody, /motionMode/);
  assert.match(characterBody, /floorSnapLength/);
  assert.match(characterBody, /COLLISION_OBJECT_3D_PROPERTIES/);

  assert.match(staticBody, /export const CREATE_STATIC_BODY_3D_SCHEMA/);
  assert.match(staticBody, /constantLinearVelocity/);
  assert.match(staticBody, /constantAngularVelocity/);

  assert.match(area, /export const CREATE_AREA_3D_SCHEMA/);
  assert.match(area, /monitoring/);
  assert.match(area, /monitorable/);
  assert.match(area, /priority/);
});

test("create_light_3d builds light properties and creates a node", async () => {
  let received = null;

  await withJsonBridge(async (req, res) => {
    received = { url: req.url, body: await readJsonBody(req) };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/KeyLight" } }));
  }, async (port) => {
    const result = await toolByName("create_light_3d").handler({
      port,
      kind: "spot",
      name: "KeyLight",
      parentPath: "Root",
      position: [1, 2, 3],
      rotationDegrees: [-45, 0, 0],
      color: "#00ffff",
      energy: 2,
      range: 12,
      angleDegrees: 30,
      shadowEnabled: true
    });

    assert.deepEqual(received, {
      url: "/scene/node/create",
      body: {
        type: "SpotLight3D",
        name: "KeyLight",
        parentPath: "Root",
        properties: {
          position: { type: "Vector3", x: 1, y: 2, z: 3 },
          rotation_degrees: { type: "Vector3", x: -45, y: 0, z: 0 },
          light_color: { type: "Color", r: 0, g: 1, b: 1, a: 1 },
          light_energy: 2,
          shadow_enabled: true,
          spot_range: 12,
          spot_angle: 30
        }
      }
    });
    assert.deepEqual(parseToolText(result).data.node, { nodePath: "Root/KeyLight" });
  });
});

test("create_mesh_instance_3d creates a mesh resource and referencing node", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    received.push({ url: req.url, body: await readJsonBody(req) });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("create_mesh_instance_3d").handler({
      port,
      meshKind: "box",
      meshPath: "res://meshes/crate.tres",
      name: "Crate",
      parentPath: "Root",
      size: [2, 3, 4],
      materialPath: "res://materials/crate.tres",
      overwrite: true
    });

    assert.deepEqual(received, [
      {
        url: "/resource/create",
        body: {
          path: "res://meshes/crate.tres",
          className: "BoxMesh",
          properties: {
            size: { type: "Vector3", x: 2, y: 3, z: 4 }
          },
          open: false,
          overwrite: true
        }
      },
      {
        url: "/scene/node/create",
        body: {
          type: "MeshInstance3D",
          name: "Crate",
          parentPath: "Root",
          properties: {
            mesh: { type: "Resource", path: "res://meshes/crate.tres" },
            material_override: { type: "Resource", path: "res://materials/crate.tres" }
          }
        }
      }
    ]);
    assert.deepEqual(parseToolText(result).data.node, { endpoint: "/scene/node/create" });
  });
});

test("create_rigid_body_3d creates optional collision resource and child", async () => {
  const received = [];

  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    received.push({ url: req.url, body });
    res.setHeader("content-type", "application/json");
    if (req.url === "/scene/node/create" && body.type === "RigidBody3D") {
      res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/BoxBody" } }));
      return;
    }
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("create_rigid_body_3d").handler({
      port,
      name: "BoxBody",
      parentPath: "Root",
      mass: 3,
      collisionShapeKind: "box",
      collisionShapePath: "res://shapes/box.tres",
      collisionName: "BoxCollision",
      collisionSize: [1, 2, 3]
    });

    assert.deepEqual(received, [
      {
        url: "/scene/node/create",
        body: {
          type: "RigidBody3D",
          name: "BoxBody",
          parentPath: "Root",
          properties: {
            mass: 3
          }
        }
      },
      {
        url: "/resource/create",
        body: {
          path: "res://shapes/box.tres",
          className: "BoxShape3D",
          properties: {
            size: { type: "Vector3", x: 1, y: 2, z: 3 }
          },
          open: false,
          overwrite: false
        }
      },
      {
        url: "/scene/node/create",
        body: {
          type: "CollisionShape3D",
          name: "BoxCollision",
          parentPath: "Root/BoxBody",
          properties: {
            shape: { type: "Resource", path: "res://shapes/box.tres" }
          }
        }
      }
    ]);
    assert.deepEqual(parseToolText(result).data.collision, { endpoint: "/scene/node/create" });
  });
});

test("create_character_body_3d returns each fact exactly once with no created* echo wrappers", async () => {
  await withJsonBridge(async (req, res) => {
    const body = await readJsonBody(req);
    res.setHeader("content-type", "application/json");
    if (req.url === "/scene/node/create" && body.type === "CharacterBody3D") {
      res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/Player" } }));
      return;
    }
    if (req.url === "/resource/create") {
      res.end(JSON.stringify({ ok: true, data: { path: "res://shapes/player_capsule.tres" } }));
      return;
    }
    res.end(JSON.stringify({ ok: true, data: { nodePath: "Root/Player/PlayerCollision" } }));
  }, async (port) => {
    const result = await toolByName("create_character_body_3d").handler({
      port,
      name: "Player",
      parentPath: "Root",
      collisionShapeKind: "capsule",
      collisionShapePath: "res://shapes/player_capsule.tres",
      collisionName: "PlayerCollision",
      collisionRadius: 0.5,
      collisionHeight: 1.8
    });
    const payload = parseToolText(result);

    assert.equal(payload.ok, true);
    assert.deepEqual(payload.data.character, { nodePath: "Root/Player" });
    assert.deepEqual(payload.data.shape, { path: "res://shapes/player_capsule.tres" });
    assert.deepEqual(payload.data.collision, { nodePath: "Root/Player/PlayerCollision" });

    const keys = [];
    (function collectKeys(value) {
      if (Array.isArray(value)) {
        value.forEach(collectKeys);
        return;
      }
      if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          keys.push(key);
          collectKeys(child);
        }
      }
    })(payload);
    assert.deepEqual(keys.filter((key) => /^created/.test(key)), []);

    const text = JSON.stringify(payload);
    const countOf = (needle) => text.split(needle).length - 1;
    assert.equal(countOf("\"nodePath\":\"Root/Player\""), 1);
    assert.equal(countOf("\"nodePath\":\"Root/Player/PlayerCollision\""), 1);
    assert.equal(countOf("CharacterBody3D"), 1);
  });
});
