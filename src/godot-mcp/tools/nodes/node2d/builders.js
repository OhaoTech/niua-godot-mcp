export {
  buildNode2DProperties,
  buildNodeCreateRequest,
  resourceRef,
  trimOptionalString
} from "./properties.js";

export {
  normalizeCollisionShape2DKind
} from "./kinds.js";

export {
  resolveCreatedNodePath,
  slugifyResourceName
} from "./builders/shared.js";

export {
  createAnimatedSprite2D,
  createCamera2D,
  createSprite2D,
  createSprite2DWithClient
} from "./builders/visual.js";

export {
  createCollisionShape2D,
  createCollisionShape2DWithClient
} from "./builders/collision.js";

export {
  createCharacterBody2D,
  createStaticBody2D
} from "./builders/physics.js";

export {
  createArea2D
} from "./builders/area.js";
