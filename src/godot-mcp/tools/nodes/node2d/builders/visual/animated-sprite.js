import { splitBridgeArgs } from "../../../../../server/context.js";
import { normalizeSpriteFrameAnimations } from "../../../../resources/sprite-frames.js";
import {
  buildAnimatedSprite2DProperties,
  buildNodeCreateRequest,
  trimOptionalString
} from "../../properties.js";
import { defaultSpriteFramesPath } from "./paths.js";

export async function createAnimatedSprite2D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const name = trimOptionalString(payload.name) || "AnimatedSprite2D";
  let spriteFramesPath = trimOptionalString(payload.spriteFramesPath);
  let createdSpriteFrames = null;

  if (!spriteFramesPath) {
    spriteFramesPath = trimOptionalString(payload.spriteFramesResourcePath)
      || defaultSpriteFramesPath(name);
    createdSpriteFrames = await client.createSpriteFrames({
      path: spriteFramesPath,
      resourceName: trimOptionalString(payload.resourceName) || undefined,
      animations: normalizeSpriteFrameAnimations(payload.animations),
      open: Boolean(payload.openSpriteFrames ?? false),
      overwrite: Boolean(payload.overwriteSpriteFrames ?? false)
    });
    if (!createdSpriteFrames.ok) {
      return {
        ok: false,
        error: createdSpriteFrames.error,
        data: {
          type: "AnimatedSprite2D",
          spriteFramesPath
        }
      };
    }
  }

  const properties = buildAnimatedSprite2DProperties(payload, spriteFramesPath);
  const createdNode = await client.createNode(
    buildNodeCreateRequest("AnimatedSprite2D", payload, properties)
  );
  if (!createdNode.ok) {
    return {
      ok: false,
      error: createdNode.error,
      data: {
        type: "AnimatedSprite2D",
        spriteFramesPath,
        properties,
        spriteFrames: createdSpriteFrames?.data ?? null
      }
    };
  }

  return {
    ok: true,
    data: {
      type: "AnimatedSprite2D",
      spriteFramesPath,
      properties,
      spriteFrames: createdSpriteFrames?.data ?? null,
      node: createdNode.data
    }
  };
}
