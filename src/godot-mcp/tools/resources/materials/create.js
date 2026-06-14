import { splitBridgeArgs } from "../../../server/context.js";
import { assignCreatedMaterial } from "./assignment.js";
import { buildStandardMaterial3DProperties } from "./standard.js";

export async function createMaterial(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const materialPath = String(payload.path ?? "").trim();
  if (!materialPath) {
    throw new Error("path is required");
  }

  const className = String(payload.className ?? "StandardMaterial3D").trim() || "StandardMaterial3D";
  if (className !== "StandardMaterial3D") {
    throw new Error("create_material currently supports StandardMaterial3D only");
  }

  const properties = buildStandardMaterial3DProperties(payload);
  const created = await client.createResource({
    path: materialPath,
    className,
    properties,
    open: Boolean(payload.open ?? true),
    overwrite: Boolean(payload.overwrite ?? false)
  });

  if (!created.ok) {
    return {
      ok: false,
      error: created.error,
      data: {
        path: materialPath,
        className,
        properties,
        created
      }
    };
  }

  let assignment = null;
  if (payload.assignToNode !== undefined && payload.assignToNode !== null) {
    assignment = await assignCreatedMaterial(client, {
      materialPath,
      assignToNode: payload.assignToNode
    });
    if (!assignment.ok) {
      return {
        ok: false,
        error: assignment.error,
        data: {
          path: materialPath,
          className,
          properties,
          created,
          assignment
        }
      };
    }
  }

  return {
    ok: true,
    data: {
      path: materialPath,
      className,
      properties,
      created,
      assigned: assignment?.ok === true,
      assignment: assignment?.data ?? null
    }
  };
}
