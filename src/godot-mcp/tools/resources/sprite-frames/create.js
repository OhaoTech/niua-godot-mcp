import { splitBridgeArgs } from "../../../server/context.js";

import { normalizeSpriteFrameAnimations } from "./animations.js";

export async function createSpriteFrames(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const path = String(payload.path ?? "").trim();
  if (!path.startsWith("res://")) {
    throw new Error("path must start with res://");
  }

  const request = {
    path,
    animations: normalizeSpriteFrameAnimations(payload.animations),
    open: Boolean(payload.open ?? true),
    overwrite: Boolean(payload.overwrite ?? false)
  };

  const resourceName = String(payload.resourceName ?? "").trim();
  if (resourceName) {
    request.resourceName = resourceName;
  }

  return client.createSpriteFrames(request);
}
