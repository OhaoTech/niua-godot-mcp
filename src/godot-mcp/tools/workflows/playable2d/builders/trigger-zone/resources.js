import { slugifyResourceName } from "../../scripts.js";
import {
  DEFAULT_TRIGGER_RESOURCE_DIRECTORY,
  joinGodotResourcePath,
  normalizeGodotResourceDirectory
} from "../shared.js";

export function buildTriggerZoneResourceContext(payload, name) {
  const resourceDirectory = normalizeGodotResourceDirectory(
    payload.resourceDirectory ?? DEFAULT_TRIGGER_RESOURCE_DIRECTORY
  );
  const resourceSlug = slugifyResourceName(name);
  const overwriteResources = Boolean(payload.overwriteResources ?? false);

  return {
    resourceDirectory,
    resourceSlug,
    overwriteResources,
    shapePath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_shape.tres`),
    visualTexturePath: joinGodotResourcePath(resourceDirectory, `${resourceSlug}_texture.tres`)
  };
}
