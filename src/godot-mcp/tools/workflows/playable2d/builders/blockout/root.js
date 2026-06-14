import { normalizeOptionalName, normalizePlainObject } from "../../../../../shared/normalize.js";
import { resolveCreatedNodePath } from "../../../../nodes/node2d/index.js";

export function buildBlockout2DRootRequest(payload = {}, rootName = normalizeBlockout2DRootName(payload)) {
  const rootProperties = normalizePlainObject(payload.rootProperties, "rootProperties", {});
  const rootRequest = {
    type: "Node2D",
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

export async function createBlockout2DRoot(client, payload = {}) {
  const rootName = normalizeBlockout2DRootName(payload);
  const rootRequest = buildBlockout2DRootRequest(payload, rootName);
  const createdRoot = await client.createNode(rootRequest);
  return {
    rootName,
    rootRequest,
    createdRoot
  };
}

export function resolveBlockout2DRootPath(createdRoot, rootName, parentPath) {
  return resolveCreatedNodePath(createdRoot, rootName, parentPath);
}

function normalizeBlockout2DRootName(payload) {
  return normalizeOptionalName(payload.rootName, "PlayableBlockout2D");
}
