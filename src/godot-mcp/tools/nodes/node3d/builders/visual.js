import { splitBridgeArgs } from "../../../../server/context.js";
import { normalizeLight3DKind } from "../kinds.js";
import {
  buildCamera3DProperties,
  buildLight3DProperties
} from "../properties.js";

export async function createLight3D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const lightKind = normalizeLight3DKind(payload.kind ?? "omni");
  const properties = buildLight3DProperties(payload, lightKind);
  const request = {
    type: lightKind.type,
    properties
  };

  const name = String(payload.name ?? "").trim();
  if (name) {
    request.name = name;
  }
  if (payload.parentPath !== undefined) {
    request.parentPath = String(payload.parentPath);
  }

  const created = await client.createNode(request);
  if (!created.ok) {
    return {
      ok: false,
      error: created.error,
      data: {
        kind: lightKind.kind,
        type: lightKind.type,
        properties,
        created
      }
    };
  }

  return {
    ok: true,
    data: {
      kind: lightKind.kind,
      type: lightKind.type,
      properties,
      node: created.data,
      created
    }
  };
}

export async function createCamera3D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const properties = buildCamera3DProperties(payload);
  const request = {
    type: "Camera3D",
    properties
  };

  const name = String(payload.name ?? "").trim();
  if (name) {
    request.name = name;
  }
  if (payload.parentPath !== undefined) {
    request.parentPath = String(payload.parentPath);
  }

  const created = await client.createNode(request);
  if (!created.ok) {
    return {
      ok: false,
      error: created.error,
      data: {
        type: "Camera3D",
        properties,
        created
      }
    };
  }

  return {
    ok: true,
    data: {
      type: "Camera3D",
      properties,
      node: created.data,
      created
    }
  };
}
