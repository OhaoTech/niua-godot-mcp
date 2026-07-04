import { splitBridgeArgs } from "../../../../../server/context.js";
import {
  buildCamera2DProperties,
  buildNodeCreateRequest
} from "../../properties.js";

export async function createCamera2D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const properties = buildCamera2DProperties(payload);
  const createdNode = await client.createNode(buildNodeCreateRequest("Camera2D", payload, properties));
  if (!createdNode.ok) {
    return {
      ok: false,
      error: createdNode.error,
      data: {
        type: "Camera2D",
        properties
      }
    };
  }

  return {
    ok: true,
    data: {
      type: "Camera2D",
      properties,
      node: createdNode.data
    }
  };
}
