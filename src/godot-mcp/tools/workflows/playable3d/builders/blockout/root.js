import { normalizeOptionalName, normalizePlainObject } from "../../../../../shared/normalize.js";
import { resolveCreatedNodePath } from "../../../../nodes/node3d/index.js";

export function buildBlockout3DRootRequest(payload = {}, rootName = normalizeBlockout3DRootName(payload)) {
  const rootProperties = normalizePlainObject(payload.rootProperties, "rootProperties", {});
  const rootRequest = {
    type: "Node3D",
    properties: rootProperties
  };
  if (rootName) {
    rootRequest.name = rootName;
  }
  if (payload.parentPath !== undefined) {
    rootRequest.parentPath = String(payload.parentPath);
  }
  return rootRequest;
}

export async function createBlockout3DRoot(client, payload = {}) {
  const rootName = normalizeBlockout3DRootName(payload);
  const rootRequest = buildBlockout3DRootRequest(payload, rootName);
  const createdRoot = await client.createNode(rootRequest);
  return {
    rootName,
    rootRequest,
    createdRoot
  };
}

export function resolveBlockout3DRootPath(createdRoot, rootName, parentPath) {
  return resolveCreatedNodePath(createdRoot, rootName, parentPath);
}

function normalizeBlockout3DRootName(payload) {
  return normalizeOptionalName(payload.rootName, "PlayableBlockout");
}
