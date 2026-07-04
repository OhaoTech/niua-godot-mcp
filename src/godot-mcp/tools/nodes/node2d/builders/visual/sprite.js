import { splitBridgeArgs } from "../../../../../server/context.js";
import { vector2ToGodotVector } from "../../../../../shared/vectors.js";
import {
  buildNode2DProperties,
  buildNodeCreateRequest,
  resourceRef,
  trimOptionalString
} from "../../properties.js";
import { defaultPlaceholderTexturePath } from "./paths.js";

export async function createSprite2DWithClient(client, payload = {}) {
  let texturePath = trimOptionalString(payload.texturePath);
  let createdTexture = null;

  if (!texturePath && payload.createPlaceholderTexture !== false) {
    texturePath = trimOptionalString(payload.placeholderTexturePath)
      || defaultPlaceholderTexturePath(payload.name ?? "sprite_2d");
    const textureProperties = {
      size: vector2ToGodotVector(payload.size ?? [64, 64], "size")
    };
    createdTexture = await client.createResource({
      path: texturePath,
      className: "PlaceholderTexture2D",
      properties: textureProperties,
      open: Boolean(payload.openTexture ?? false),
      overwrite: Boolean(payload.overwriteTexture ?? false)
    });
    if (!createdTexture.ok) {
      return {
        ok: false,
        error: createdTexture.error,
        data: {
          type: "Sprite2D",
          texturePath,
          textureProperties
        }
      };
    }
  }

  const extra = {};
  if (texturePath) {
    extra.texture = resourceRef(texturePath);
  }
  const properties = buildNode2DProperties(payload, { extra });
  const createdNode = await client.createNode(buildNodeCreateRequest("Sprite2D", payload, properties));
  if (!createdNode.ok) {
    return {
      ok: false,
      error: createdNode.error,
      data: {
        type: "Sprite2D",
        texturePath: texturePath || null,
        properties,
        texture: createdTexture?.data ?? null
      }
    };
  }

  return {
    ok: true,
    data: {
      type: "Sprite2D",
      texturePath: texturePath || null,
      properties,
      texture: createdTexture?.data ?? null,
      node: createdNode.data
    }
  };
}

export async function createSprite2D(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  return createSprite2DWithClient(client, payload);
}
