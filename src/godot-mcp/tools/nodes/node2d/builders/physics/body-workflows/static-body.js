import { splitBridgeArgs } from "../../../../../../server/context.js";
import { createPhysicsBody2DWithClient } from "./owner.js";

export async function createStaticBody2D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  return createPhysicsBody2DWithClient(client, payload, {
    type: "StaticBody2D",
    bodyKey: "body"
  });
}
