import {
  CREATE_ANIMATED_SPRITE_2D_SCHEMA,
  CREATE_AREA_2D_SCHEMA,
  CREATE_CAMERA_2D_SCHEMA,
  CREATE_CHARACTER_BODY_2D_SCHEMA,
  CREATE_COLLISION_SHAPE_2D_SCHEMA,
  CREATE_SPRITE_2D_SCHEMA,
  CREATE_STATIC_BODY_2D_SCHEMA,
  CREATE_TILE_MAP_LAYER_SCHEMA,
  PAINT_TILE_MAP_LAYER_TERRAIN_SCHEMA,
  SET_TILE_MAP_LAYER_CELLS_SCHEMA
} from "./schemas.js";

export const NODE2D_TOOL_MANIFEST = [
  {
    name: "create_sprite_2d",
    description: "Create a Sprite2D with an imported texture or generated PlaceholderTexture2D for visible 2D blockouts.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: CREATE_SPRITE_2D_SCHEMA,
    local: {
      handler: "createSprite2D"
    },
    conformance: {
      happy: "create a visible Sprite2D from an existing or generated texture",
      error: "reject invalid texture resources, node parents, or generated texture paths"
    },
    docs: {
      summary: "Creates a Sprite2D with an imported texture or generated PlaceholderTexture2D."
    }
  },
  {
    name: "create_animated_sprite_2d",
    description: "Create an AnimatedSprite2D with an existing SpriteFrames resource or a newly generated SpriteFrames asset.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: CREATE_ANIMATED_SPRITE_2D_SCHEMA,
    local: {
      handler: "createAnimatedSprite2D"
    },
    conformance: {
      happy: "create an AnimatedSprite2D with an existing or generated SpriteFrames resource",
      error: "reject invalid frame resources, animation definitions, or node parents"
    },
    docs: {
      summary: "Creates an AnimatedSprite2D with an existing or generated SpriteFrames asset."
    }
  },
  {
    name: "create_tile_map_layer",
    description: "Create a TileMapLayer with an existing or generated TileSet and optional initial cell painting.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: CREATE_TILE_MAP_LAYER_SCHEMA,
    local: {
      handler: "createTileMapLayer"
    },
    conformance: {
      happy: "create a TileMapLayer with a TileSet and optional initial cells",
      error: "reject invalid TileSet definitions, cells, or node parents"
    },
    docs: {
      summary: "Creates a TileMapLayer with an existing or generated TileSet."
    }
  },
  {
    name: "set_tile_map_layer_cells",
    description: "Set or erase cells on an existing TileMapLayer using TileSet source ids and atlas coordinates.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: SET_TILE_MAP_LAYER_CELLS_SCHEMA,
    local: {
      handler: "setTileMapLayerCells"
    },
    conformance: {
      happy: "set or erase cells on an existing TileMapLayer",
      error: "reject missing node paths or invalid cell coordinates"
    },
    docs: {
      summary: "Sets or erases cells on an existing TileMapLayer."
    }
  },
  {
    name: "paint_tile_map_layer_terrain",
    description: "Paint terrain-aware cells on an existing TileMapLayer using Godot's terrain connect or path solver.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: PAINT_TILE_MAP_LAYER_TERRAIN_SCHEMA,
    local: {
      handler: "paintTileMapLayerTerrain"
    },
    conformance: {
      happy: "paint terrain-aware TileMapLayer cells with connect or path mode",
      error: "reject invalid terrain ids, modes, node paths, or coordinate lists"
    },
    docs: {
      summary: "Paints terrain-aware cells on an existing TileMapLayer."
    }
  },
  {
    name: "create_camera_2d",
    description: "Create a Camera2D with practical position, zoom, enabled state, and limit fields.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: CREATE_CAMERA_2D_SCHEMA,
    local: {
      handler: "createCamera2D"
    },
    conformance: {
      happy: "create a Camera2D with practical camera properties",
      error: "reject invalid parent paths or camera property values"
    },
    docs: {
      summary: "Creates a Camera2D with practical position, zoom, enabled state, and limits."
    }
  },
  {
    name: "create_collision_shape_2d",
    description: "Create a Shape2D resource and CollisionShape2D node for 2D physics workflows.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: CREATE_COLLISION_SHAPE_2D_SCHEMA,
    local: {
      handler: "createCollisionShape2D"
    },
    conformance: {
      happy: "create a Shape2D resource and a CollisionShape2D node",
      error: "reject invalid shape kinds, resource paths, or node parents"
    },
    docs: {
      summary: "Creates a Shape2D resource and CollisionShape2D node."
    }
  },
  {
    name: "create_static_body_2d",
    description: "Create a StaticBody2D with collision and an optional visible Sprite2D child.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: CREATE_STATIC_BODY_2D_SCHEMA,
    local: {
      handler: "createStaticBody2D"
    },
    conformance: {
      happy: "create a StaticBody2D with collision and optional visual child",
      error: "reject invalid collision definitions, visual resources, or node parents"
    },
    docs: {
      summary: "Creates a StaticBody2D with collision and an optional visible Sprite2D child."
    }
  },
  {
    name: "create_character_body_2d",
    description: "Create a CharacterBody2D with collision and an optional visible Sprite2D child.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: CREATE_CHARACTER_BODY_2D_SCHEMA,
    local: {
      handler: "createCharacterBody2D"
    },
    conformance: {
      happy: "create a CharacterBody2D with collision and optional visual child",
      error: "reject invalid collision definitions, visual resources, or node parents"
    },
    docs: {
      summary: "Creates a CharacterBody2D with collision and an optional visible Sprite2D child."
    }
  },
  {
    name: "create_area_2d",
    description: "Create an Area2D trigger or sensor and optionally create a Shape2D resource, CollisionShape2D child, and visible Sprite2D helper.",
    profile: "full",
    tier: "standard",
    category: "nodes-2d",
    implementation: "local",
    inputSchema: CREATE_AREA_2D_SCHEMA,
    local: {
      handler: "createArea2D"
    },
    conformance: {
      happy: "create an Area2D with optional collision and visual helper",
      error: "reject invalid shape definitions, monitor settings, visual resources, or node parents"
    },
    docs: {
      summary: "Creates an Area2D trigger or sensor with optional collision and visible helper."
    }
  }
];
