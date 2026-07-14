import {
  ASSIGN_MATERIAL_SCHEMA,
  CREATE_MATERIAL_SCHEMA,
  CREATE_RESOURCE_SCHEMA,
  CREATE_SHADER_MATERIAL_SCHEMA,
  CREATE_SPRITE_FRAMES_SCHEMA,
  CREATE_TILE_SET_SCHEMA,
  FILESYSTEM_PATH_SCHEMA,
  SAVE_RESOURCE_SCHEMA
} from "./schemas.js";

export const RESOURCE_TOOL_MANIFEST = [
  {
    name: "open_resource",
    description: "Open a scene/resource/script in the visible Godot editor.",
    profile: "full",
    tier: "standard",
    category: "resources",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      owner: "resources",
      clientMethod: "openResource",
      endpoint: "/resource/open",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/resource/open",
      handler: "_open_resource",
      arg: "body",
      methodError: "resource open requires POST"
    },
    conformance: {
      happy: "open an existing res:// resource in the visible editor",
      error: "reject missing or non-project resource paths"
    },
    docs: {
      summary: "Opens a scene, resource, or script in the visible Godot editor."
    }
  },
  {
    name: "focus_resource",
    description: "Reveal and inspect a resource path in the visible Godot editor when supported by the local editor API.",
    profile: "full",
    tier: "standard",
    category: "resources",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      owner: "resources",
      clientMethod: "focusResource",
      endpoint: "/resource/focus",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/resource/focus",
      handler: "_focus_resource",
      arg: "body",
      methodError: "resource focus requires POST"
    },
    conformance: {
      happy: "select and inspect an existing resource path in the editor",
      error: "return unavailable focus metadata when editor focus APIs are missing"
    },
    docs: {
      summary: "Reveals and inspects a resource path in the visible Godot editor when supported."
    }
  },
  {
    name: "create_resource",
    description: "Create and save a Godot Resource-derived asset under res://, such as a material .tres.",
    profile: "v1",
    tier: "essential",
    category: "resources",
    inputSchema: CREATE_RESOURCE_SCHEMA,
    bridge: {
      owner: "resources",
      clientMethod: "createResource",
      endpoint: "/resource/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/resource/create",
      handler: "_create_resource",
      arg: "body",
      methodError: "resource creation requires POST"
    },
    conformance: {
      happy: "create and save a Resource-derived asset under res://",
      error: "reject unsupported classes or invalid resource output paths"
    },
    docs: {
      summary: "Creates and saves a Godot Resource-derived asset under res://."
    }
  },
  {
    name: "save_resource",
    description: "Load, update, and save an existing Godot Resource asset under res://.",
    profile: "full",
    tier: "standard",
    category: "resources",
    inputSchema: SAVE_RESOURCE_SCHEMA,
    bridge: {
      owner: "resources",
      clientMethod: "saveResource",
      endpoint: "/resource/save",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/resource/save",
      handler: "_save_resource",
      arg: "body",
      methodError: "resource save requires POST"
    },
    conformance: {
      happy: "load, update, and save an existing Resource asset under res://",
      error: "reject missing resources or invalid property payloads"
    },
    docs: {
      summary: "Loads, updates, and saves an existing Godot Resource asset under res://."
    }
  },
  {
    name: "create_sprite_frames",
    description: "Create a SpriteFrames resource from named animations and existing Texture2D frame resources.",
    profile: "full",
    tier: "standard",
    category: "resources",
    inputSchema: CREATE_SPRITE_FRAMES_SCHEMA,
    bridge: {
      owner: "resources",
      clientMethod: "createSpriteFrames",
      endpoint: "/resource/sprite-frames/create",
      method: "POST",
      request: "body"
    },
    adapter: {
      handler: "createSpriteFrames"
    },
    godotRoute: {
      side: "write",
      endpoint: "/resource/sprite-frames/create",
      handler: "_create_sprite_frames_resource",
      arg: "body",
      methodError: "SpriteFrames creation requires POST"
    },
    conformance: {
      happy: "create a SpriteFrames resource from normalized animations",
      error: "reject invalid animation frame or sprite-sheet definitions"
    },
    docs: {
      summary: "Creates a SpriteFrames resource from named animations and Texture2D frames."
    }
  },
  {
    name: "create_tile_set",
    stability: "experimental",
    description: "Create a TileSet resource from existing Texture2D atlases, explicit tile coordinates, and generated atlas grids.",
    profile: "full",
    tier: "standard",
    category: "resources",
    inputSchema: CREATE_TILE_SET_SCHEMA,
    bridge: {
      owner: "resources",
      clientMethod: "createTileSet",
      endpoint: "/resource/tile-set/create",
      method: "POST",
      request: "body"
    },
    adapter: {
      handler: "createTileSet"
    },
    godotRoute: {
      side: "write",
      endpoint: "/resource/tile-set/create",
      handler: "_create_tile_set_resource",
      arg: "body",
      methodError: "TileSet creation requires POST"
    },
    conformance: {
      happy: "create a TileSet resource from normalized atlas sources",
      error: "reject invalid atlas, terrain, or physics-layer definitions"
    },
    docs: {
      summary: "Creates a TileSet resource from Texture2D atlases, tile coordinates, and generated grids."
    }
  },
  {
    name: "create_material",
    description: "Create a StandardMaterial3D asset from practical material fields and optionally assign it to a scene node.",
    profile: "full",
    tier: "standard",
    category: "resources",
    inputSchema: CREATE_MATERIAL_SCHEMA,
    bridge: {
      owner: "resources",
      clientMethod: "createResource",
      endpoint: "/resource/create",
      method: "POST",
      request: "body",
      generate: false
    },
    adapter: {
      handler: "createMaterial"
    },
    godotRoute: {
      side: "write",
      endpoint: "/resource/create",
      handler: "_create_resource",
      arg: "body",
      methodError: "resource creation requires POST"
    },
    conformance: {
      happy: "create a curated StandardMaterial3D resource and optionally assign it to a node",
      error: "reject unsupported material classes or invalid assignment targets"
    },
    docs: {
      summary: "Creates a StandardMaterial3D asset from practical fields and can assign it to a node."
    }
  },
  {
    name: "create_shader_material",
    description: "Create a Shader resource plus ShaderMaterial resource, set shader uniform values, and optionally assign it to a scene node.",
    profile: "full",
    tier: "standard",
    category: "resources",
    inputSchema: CREATE_SHADER_MATERIAL_SCHEMA,
    bridge: {
      owner: "resources",
      clientMethod: "createShaderMaterial",
      endpoint: "/resource/shader-material/create",
      method: "POST",
      request: "body"
    },
    adapter: {
      handler: "createShaderMaterial"
    },
    godotRoute: {
      side: "write",
      endpoint: "/resource/shader-material/create",
      handler: "_create_shader_material_resource",
      arg: "body",
      methodError: "ShaderMaterial creation requires POST"
    },
    conformance: {
      happy: "create Shader and ShaderMaterial resources and optionally assign them to a node",
      error: "reject invalid shader source, parameters, or assignment targets"
    },
    docs: {
      summary: "Creates Shader and ShaderMaterial resources, sets uniforms, and can assign the material to a node."
    }
  },
  {
    name: "assign_material",
    description: "Assign a saved Godot Material resource to a scene node material override or mesh surface.",
    profile: "full",
    tier: "standard",
    category: "resources",
    inputSchema: ASSIGN_MATERIAL_SCHEMA,
    bridge: {
      owner: "nodes",
      clientMethod: "assignMaterial",
      endpoint: "/node/material/assign",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/node/material/assign",
      handler: "_assign_material",
      arg: "body",
      methodError: "material assignment requires POST"
    },
    conformance: {
      happy: "assign a saved Material resource to a node override or mesh surface",
      error: "reject missing nodes, material paths, or invalid surface indexes"
    },
    docs: {
      summary: "Assigns a saved Material resource to a scene node material override or mesh surface."
    }
  }
];

export const RESOURCE_PRIMARY_TOOL_MANIFEST = RESOURCE_TOOL_MANIFEST
  .filter((entry) => entry.name !== "assign_material");

export const MATERIAL_ASSIGNMENT_TOOL_MANIFEST = RESOURCE_TOOL_MANIFEST
  .filter((entry) => entry.name === "assign_material");

export const RESOURCE_BRIDGE_TOOL_MANIFEST = RESOURCE_TOOL_MANIFEST
  .filter((entry) => entry.bridge.owner === "resources" && entry.bridge.generate !== false);
