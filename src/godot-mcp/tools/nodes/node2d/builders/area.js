import { splitBridgeArgs } from "../../../../server/context.js";
import {
  buildArea2DProperties,
  buildNodeCreateRequest,
  trimOptionalString
} from "../properties.js";
import {
  createOptionalArea2DCollisionChild,
  createOptionalArea2DVisualChild
} from "./area/children.js";
import {
  buildArea2DCreateFailure,
  buildArea2DCollisionFailure,
  buildArea2DSuccess,
  buildArea2DVisualFailure,
  buildArea2DWithoutCollisionResult
} from "./area/results.js";

export async function createArea2D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const properties = buildArea2DProperties(payload);
  const areaName = trimOptionalString(payload.name) || "Area2D";
  const createdArea = await client.createNode(buildNodeCreateRequest("Area2D", payload, properties));
  if (!createdArea.ok) {
    return buildArea2DCreateFailure({ properties, createdArea });
  }

  const collisionChild = await createOptionalArea2DCollisionChild({
    client,
    payload,
    createdArea,
    areaName
  });
  if (!collisionChild.ok) {
    return buildArea2DCollisionFailure({
      properties,
      createdArea,
      collisionResult: collisionChild.data.collisionResult
    });
  }

  if (collisionChild.data.collisionResult === null) {
    return buildArea2DWithoutCollisionResult({ properties, createdArea });
  }

  const {
    areaPath,
    collisionShapePath,
    collisionResult
  } = collisionChild.data;
  const visualResult = await createOptionalArea2DVisualChild({
    client,
    payload,
    areaPath
  });
  if (visualResult !== null && !visualResult.ok) {
    return buildArea2DVisualFailure({
      properties,
      createdArea,
      collisionResult,
      visualResult
    });
  }

  return buildArea2DSuccess({
    properties,
    createdArea,
    collisionShapePath,
    collisionResult,
    visualResult
  });
}
