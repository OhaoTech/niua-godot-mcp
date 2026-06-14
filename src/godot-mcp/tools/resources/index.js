import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { createMaterial as createMaterialResource } from "./materials.js";
import { createShaderMaterial as createShaderMaterialResource } from "./shader-materials.js";
import { createSpriteFrames as createSpriteFramesResource } from "./sprite-frames.js";
import { createTileSet as createTileSetResource } from "./tile-sets.js";
import {
  MATERIAL_ASSIGNMENT_TOOL_MANIFEST,
  RESOURCE_PRIMARY_TOOL_MANIFEST
} from "./manifest.js";

const resourceAdapterHandlers = {
  createSpriteFrames: ({ args }) => createSpriteFramesResource(args),
  createTileSet: ({ args }) => createTileSetResource(args),
  createMaterial: ({ args }) => createMaterialResource(args),
  createShaderMaterial: ({ args }) => createShaderMaterialResource(args)
};

export const RESOURCE_TOOL_DEFINITIONS = toolDefinitionsFromManifest(RESOURCE_PRIMARY_TOOL_MANIFEST, {
  adapterHandlers: resourceAdapterHandlers
});

export const MATERIAL_ASSIGNMENT_TOOL_DEFINITIONS = toolDefinitionsFromManifest(MATERIAL_ASSIGNMENT_TOOL_MANIFEST);
