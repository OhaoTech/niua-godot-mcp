import { slugifyResourceName } from "../shared.js";

export function defaultPlaceholderTexturePath(name) {
  return `res://niua/generated/sprites/${slugifyResourceName(name)}_placeholder_texture.tres`;
}

export function defaultSpriteFramesPath(name) {
  return `res://niua/generated/animations/${slugifyResourceName(name)}_sprite_frames.tres`;
}
