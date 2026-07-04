import { splitBridgeArgs } from "../../../../server/context.js";
import { normalizeCollisionShape3DKind } from "../kinds.js";
import {
  buildCollisionShape3DNodeProperties,
  buildCollisionShape3DResourceProperties
} from "../properties.js";

export async function createCollisionShape3D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const shapePath = String(payload.shapePath ?? "").trim();
  if (!shapePath) {
    throw new Error("shapePath is required");
  }

  const shapeKind = normalizeCollisionShape3DKind(payload.shapeKind ?? "box");
  const shapeProperties = buildCollisionShape3DResourceProperties(payload, shapeKind);
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

  const nodeProperties = buildCollisionShape3DNodeProperties(payload, shapePath);
  const request = {
    type: "CollisionShape3D",
    properties: nodeProperties
  };
  const name = String(payload.name ?? "").trim();
  if (name) {
    request.name = name;
  }
  if (payload.parentPath !== undefined) {
    request.parentPath = String(payload.parentPath);
  }

  const createdNode = await client.createNode(request);
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
