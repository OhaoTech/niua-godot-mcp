import { splitBridgeArgs } from "../../../../server/context.js";
import { normalizeMesh3DKind } from "../kinds.js";
import {
  buildMesh3DResourceProperties,
  buildMeshInstance3DNodeProperties
} from "../properties.js";

export async function createMeshInstance3D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const meshPath = String(payload.meshPath ?? "").trim();
  if (!meshPath) {
    throw new Error("meshPath is required");
  }

  const meshKind = normalizeMesh3DKind(payload.meshKind ?? "box");
  const meshProperties = buildMesh3DResourceProperties(payload, meshKind);
  const createdMesh = await client.createResource({
    path: meshPath,
    className: meshKind.className,
    properties: meshProperties,
    open: Boolean(payload.open ?? false),
    overwrite: Boolean(payload.overwrite ?? false)
  });
  if (!createdMesh.ok) {
    return {
      ok: false,
      error: createdMesh.error,
      data: {
        meshKind: meshKind.kind,
        meshClassName: meshKind.className,
        meshPath,
        meshProperties,
        createdMesh
      }
    };
  }

  const nodeProperties = buildMeshInstance3DNodeProperties(payload, meshPath);
  const request = {
    type: "MeshInstance3D",
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
        meshKind: meshKind.kind,
        meshClassName: meshKind.className,
        meshPath,
        meshProperties,
        nodeProperties,
        createdMesh,
        createdNode
      }
    };
  }

  return {
    ok: true,
    data: {
      meshKind: meshKind.kind,
      meshClassName: meshKind.className,
      meshPath,
      meshProperties,
      nodeProperties,
      mesh: createdMesh.data,
      node: createdNode.data,
      createdMesh,
      createdNode
    }
  };
}
