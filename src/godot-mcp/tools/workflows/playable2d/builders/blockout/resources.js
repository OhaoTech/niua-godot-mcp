import { slugifyResourceName } from "../../scripts.js";
import {
  DEFAULT_RESOURCE_DIRECTORY,
  joinGodotResourcePath,
  normalizeGodotResourceDirectory
} from "../shared.js";

export function buildBlockout2DResourceContext(payload, rootName) {
  const resourceDirectory = normalizeGodotResourceDirectory(
    payload.resourceDirectory ?? DEFAULT_RESOURCE_DIRECTORY
  );
  const resourceSlug = slugifyResourceName(rootName);
  const overwriteResources = Boolean(payload.overwriteResources ?? false);

  return {
    resourceDirectory,
    resourceSlug,
    overwriteResources,
    groundShapePath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_ground_shape.tres`),
    groundTexturePath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_ground_texture.tres`),
    playerShapePath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_player_shape.tres`),
    playerTexturePath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_player_texture.tres`)
  };
}
