import { splitBridgeArgs } from "../../../../../server/context.js";
import { createOptionalCollisionShape3DChild } from "../collision-child.js";

export async function createPhysicsOwner3D(args = {}, {
  type,
  buildProperties,
  ownerDataKey
}) {
  const { client, payload } = splitBridgeArgs(args);
  const properties = buildProperties(payload);
  const request = {
    type,
    properties
  };

  const name = String(payload.name ?? "").trim();
  if (name) {
    request.name = name;
  }
  if (payload.parentPath !== undefined) {
    request.parentPath = String(payload.parentPath);
  }

  const createdOwner = await client.createNode(request);
  if (!createdOwner.ok) {
    return {
      ok: false,
      error: createdOwner.error,
      data: {
        type,
        properties
      }
    };
  }

  return createOptionalCollisionShape3DChild({
    client,
    payload,
    ownerResult: createdOwner,
    ownerDataKey,
    ownerName: name,
    ownerParentPath: payload.parentPath,
    type,
    properties
  });
}
