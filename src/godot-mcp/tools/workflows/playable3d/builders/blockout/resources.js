import {
  joinGodotResourcePath,
  normalizeGodotResourceDirectory,
  slugifyResourceName
} from "../shared.js";

export function buildBlockout3DResourceContext(payload, rootName) {
  const resourceDirectory = normalizeGodotResourceDirectory(
    payload.resourceDirectory ?? "res://niua/generated/blockouts"
  );
  const resourceSlug = slugifyResourceName(rootName);
  const overwriteResources = Boolean(payload.overwriteResources ?? false);

  return {
    resourceDirectory,
    resourceSlug,
    overwriteResources,
    groundMeshPath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_ground_mesh.tres`),
    groundShapePath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_ground_shape.tres`),
    playerShapePath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_player_shape.tres`),
    playerMeshPath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_player_mesh.tres`)
  };
}
