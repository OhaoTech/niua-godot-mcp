import { normalizeNonNegativeInteger } from "../../../shared/numbers.js";
import { isPlainObject } from "../../../shared/normalize.js";

export async function assignCreatedMaterial(client, {
  materialPath,
  assignToNode
}) {
  if (!isPlainObject(assignToNode)) {
    throw new Error("assignToNode must be an object");
  }

  const nodePath = String(assignToNode.nodePath ?? "").trim();
  if (!nodePath) {
    throw new Error("assignToNode.nodePath is required");
  }

  const request = {
    nodePath,
    materialPath
  };
  if (assignToNode.surfaceIndex !== undefined) {
    request.surfaceIndex = normalizeNonNegativeInteger(assignToNode.surfaceIndex, "assignToNode.surfaceIndex");
  }

  return client.assignMaterial(request);
}
