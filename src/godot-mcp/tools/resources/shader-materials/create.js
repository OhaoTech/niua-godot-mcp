import { splitBridgeArgs } from "../../../server/context.js";
import { assignCreatedShaderMaterial } from "./assignment.js";
import { buildShaderMaterialRequest } from "./request.js";

export async function createShaderMaterial(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const request = buildShaderMaterialRequest(payload);
  const created = await client.createShaderMaterial(request);

  if (!created.ok) {
    return {
      ok: false,
      error: created.error,
      data: {
        path: request.path,
        shaderPath: request.shaderPath,
        created
      }
    };
  }

  let assignment = null;
  if (payload.assignToNode !== undefined && payload.assignToNode !== null) {
    assignment = await assignCreatedShaderMaterial(client, {
      materialPath: request.path,
      assignToNode: payload.assignToNode
    });
    if (!assignment.ok) {
      return {
        ok: false,
        error: assignment.error,
        data: {
          path: request.path,
          shaderPath: request.shaderPath,
          created,
          assignment
        }
      };
    }
  }

  return {
    ok: true,
    data: {
      path: request.path,
      shaderPath: request.shaderPath,
      parameterNames: Object.keys(request.parameters),
      created,
      assigned: assignment?.ok === true,
      assignment: assignment?.data ?? null
    }
  };
}
