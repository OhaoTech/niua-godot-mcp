import { splitBridgeArgs } from "../../../../server/context.js";
import { normalizeCollisionShape2DKind } from "../kinds.js";
import {
  buildCollisionShape2DNodeProperties,
  buildCollisionShape2DResourceProperties,
  buildNodeCreateRequest,
  trimOptionalString
} from "../properties.js";

export async function createCollisionShape2DWithClient(client, payload = {}) {
  const shapePath = trimOptionalString(payload.shapePath);
  if (!shapePath) {
    throw new Error("shapePath is required");
  }

  const shapeKind = normalizeCollisionShape2DKind(payload.shapeKind ?? "rectangle");
  const shapeProperties = buildCollisionShape2DResourceProperties(payload, shapeKind);
  const createdShape = await client.createResource({
    path: shapePath,
    className: shapeKind.className,
    properties: shapeProperties,
    open: Boolean(payload.open ?? false),
    overwrite: Boolean(payload.overwrite ?? false)
  });
  if (!createdShape.ok) {
    return {
      ok: false,
      error: createdShape.error,
      data: {
        shapeKind: shapeKind.kind,
        shapeClassName: shapeKind.className,
        shapePath,
        shapeProperties
      }
    };
  }

  const nodeProperties = buildCollisionShape2DNodeProperties(payload, shapePath);
  const createdNode = await client.createNode(
    buildNodeCreateRequest("CollisionShape2D", payload, nodeProperties)
  );
  if (!createdNode.ok) {
    return {
      ok: false,
      error: createdNode.error,
      data: {
        shapeKind: shapeKind.kind,
        shapeClassName: shapeKind.className,
        shapePath,
        shapeProperties,
        nodeProperties,
        shape: createdShape.data
      }
    };
  }

  return {
    ok: true,
    data: {
      shapeKind: shapeKind.kind,
      shapeClassName: shapeKind.className,
      shapePath,
      shapeProperties,
      nodeProperties,
      shape: createdShape.data,
      node: createdNode.data
    }
  };
}

export async function createCollisionShape2D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  return createCollisionShape2DWithClient(client, payload);
}
