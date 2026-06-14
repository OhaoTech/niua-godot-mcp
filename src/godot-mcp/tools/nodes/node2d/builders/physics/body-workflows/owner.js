import {
  buildNodeCreateRequest,
  buildPhysicsBody2DProperties,
  trimOptionalString
} from "../../../properties.js";
import { createOptionalCollisionShape2DChild } from "../collision-child.js";
import { createOptionalVisual2DChild } from "../visual-child.js";
import {
  physicsBody2DBodyFailure,
  physicsBody2DCollisionFailure,
  physicsBody2DNoCollisionSuccess,
  physicsBody2DSuccess,
  physicsBody2DVisualFailure
} from "./results.js";

export async function createPhysicsBody2DWithClient(client, payload = {}, {
  type,
  bodyKey
}) {
  const properties = buildPhysicsBody2DProperties(payload);
  const name = trimOptionalString(payload.name);
  const createdBody = await client.createNode(buildNodeCreateRequest(type, payload, properties));
  if (!createdBody.ok) {
    return physicsBody2DBodyFailure({ type, properties, createdBody });
  }

  const collisionChild = await createOptionalCollisionShape2DChild({
    client,
    payload,
    createdBody,
    bodyName: name || type
  });
  if (!collisionChild.ok) {
    return physicsBody2DCollisionFailure({
      type,
      properties,
      bodyKey,
      createdBody,
      collisionChild
    });
  }

  if (collisionChild.data.collisionResult === null) {
    return physicsBody2DNoCollisionSuccess({
      type,
      properties,
      bodyKey,
      createdBody
    });
  }

  const {
    bodyPath,
    collisionShapePath,
    collisionResult
  } = collisionChild.data;
  const visualResult = await createOptionalVisual2DChild({
    client,
    payload,
    bodyPath
  });
  if (visualResult !== null && !visualResult.ok) {
    return physicsBody2DVisualFailure({
      type,
      properties,
      bodyKey,
      createdBody,
      collisionResult,
      visualResult
    });
  }

  return physicsBody2DSuccess({
    type,
    properties,
    bodyKey,
    createdBody,
    collisionShapePath,
    collisionResult,
    visualResult
  });
}
