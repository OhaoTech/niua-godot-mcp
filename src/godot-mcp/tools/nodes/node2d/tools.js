import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import {
  createArea2D,
  createAnimatedSprite2D,
  createCamera2D,
  createCharacterBody2D,
  createCollisionShape2D,
  createSprite2D,
  createStaticBody2D
} from "./builders.js";
import {
  createTileMapLayer,
  paintTileMapLayerTerrain,
  setTileMapLayerCells
} from "./tile-map.js";
import { NODE2D_TOOL_MANIFEST } from "./manifest.js";

export const NODE2D_TOOL_DEFINITIONS = toolDefinitionsFromManifest(NODE2D_TOOL_MANIFEST, {
  localHandlers: {
    createSprite2D,
    createAnimatedSprite2D,
    createTileMapLayer,
    setTileMapLayerCells,
    paintTileMapLayerTerrain,
    createCamera2D,
    createCollisionShape2D,
    createStaticBody2D,
    createCharacterBody2D,
    createArea2D
  }
});
