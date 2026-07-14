import {
  CREATE_NODE_SCHEMA,
  CREATE_NODE_WITH_SCRIPT_SCHEMA,
  DELETE_NODE_SCHEMA,
  DUPLICATE_NODE_SCHEMA,
  RENAME_NODE_SCHEMA,
  REORDER_NODE_SCHEMA,
  REPARENT_NODE_SCHEMA,
  SEARCH_NODE_TYPES_SCHEMA
} from "./schemas.js";

const FIND_NODES_SCHEMA = {
  type: "object",
  properties: {
    nameContains: {
      type: "string",
      description: "Case-insensitive substring match on node name."
    },
    type: {
      type: "string",
      description: "Godot class name filter (is_class), e.g. CharacterBody3D, MeshInstance3D."
    },
    pathPrefix: {
      type: "string",
      description: "Only nodes under this path (e.g. World or Player)."
    },
    sceneFileContains: {
      type: "string",
      description: "Match sceneFilePath substring (e.g. bed_lite.glb)."
    },
    maxResults: {
      type: "number",
      description: "Max matches to return (default 50, max 200)."
    },
    host: { type: "string" },
    port: { type: "number" },
    expectedProjectRoot: { type: "string" }
  },
  additionalProperties: false
};

const INSTANCE_SCENE_SCHEMA = {
  type: "object",
  properties: {
    path: {
      type: "string",
      description: "res:// path to a PackedScene (.tscn/.scn) or imported GLB scene."
    },
    scenePath: {
      type: "string",
      description: "Alias of path."
    },
    name: {
      type: "string",
      description: "Stable node name for the instance (strongly recommended)."
    },
    parentPath: {
      type: "string",
      description: "Parent node path under the scene root. Empty = root."
    },
    properties: {
      type: "object",
      additionalProperties: true,
      description: "Optional property bag (e.g. position as [x,y,z])."
    },
    host: { type: "string" },
    port: { type: "number" },
    expectedProjectRoot: { type: "string" }
  },
  required: ["path"],
  additionalProperties: false
};

export const COMMON_NODE_TOOL_MANIFEST = [
  {
    name: "find_nodes",
    description:
      "Search the edited scene for nodes by name/type/path/scene file without dumping the full tree. Essential for large scenes.",
    profile: "v1",
    tier: "essential",
    category: "nodes-common",
    inputSchema: FIND_NODES_SCHEMA,
    bridge: {
      clientMethod: "findNodes",
      endpoint: "/scene/nodes/find",
      method: "GET",
      request: "query",
      query: {
        fields: {
          nameContains: { omitEmpty: true },
          type: { omitEmpty: true },
          pathPrefix: { omitEmpty: true },
          sceneFileContains: { omitEmpty: true },
          maxResults: { default: 50 }
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/scene/nodes/find",
      handler: "_find_nodes",
      arg: "query"
    },
    conformance: {
      happy: "return matching nodes with compact path/type metadata",
      error: "not_found when no scene is open"
    },
    docs: {
      summary: "Finds nodes in the edited scene by name, type, path, or scene file."
    }
  },
  {
    name: "instance_scene",
    description:
      "Instance a PackedScene (including imported GLB) under a parent with an optional stable name and properties. Prefer this for props over create_node of MeshInstance3D.",
    profile: "v1",
    tier: "essential",
    category: "nodes-common",
    inputSchema: INSTANCE_SCENE_SCHEMA,
    bridge: {
      clientMethod: "instanceScene",
      endpoint: "/scene/node/instance",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/node/instance",
      handler: "_instance_scene",
      arg: "body",
      methodError: "scene instance requires POST"
    },
    conformance: {
      happy: "instance a packed scene with a stable name",
      error: "not_found when asset missing/unimported, with wait_for_imported_asset recovery"
    },
    docs: {
      summary: "Instances a PackedScene or imported GLB into the edited scene."
    }
  },
  {
    name: "search_node_types",
    description: "Search Godot ClassDB node types for Create Node dialog workflows, including instantiability, enabled-state, and inheritance metadata.",
    profile: "v1",
    tier: "essential",
    category: "nodes-common",
    inputSchema: SEARCH_NODE_TYPES_SCHEMA,
    bridge: {
      clientMethod: "searchNodeTypes",
      endpoint: "/node-types/search",
      method: "GET",
      request: "query",
      query: {
        fields: {
          query: {
            default: ""
          },
          baseType: {
            default: "Node"
          },
          includeAbstract: {
            default: false,
            type: "boolean"
          },
          includeDisabled: {
            default: false,
            type: "boolean"
          },
          limit: {
            default: 50
          }
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/node-types/search",
      handler: "_search_node_types",
      arg: "query"
    },
    conformance: {
      happy: "search ClassDB node types with inheritance and enabled-state metadata",
      error: "return empty matches for unknown queries and reject invalid limits"
    },
    docs: {
      summary: "Searches Godot ClassDB node types for Create Node dialog workflows."
    }
  },
  {
    name: "create_node",
    description: "Create a node in the current edited Godot scene.",
    profile: "v1",
    tier: "essential",
    category: "nodes-common",
    inputSchema: CREATE_NODE_SCHEMA,
    bridge: {
      clientMethod: "createNode",
      endpoint: "/scene/node/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/node/create",
      handler: "_create_node",
      arg: "body",
      methodError: "node creation requires POST"
    },
    conformance: {
      happy: "create a scene node under a requested parent",
      error: "reject invalid node classes, missing scenes, or missing parents"
    },
    docs: {
      summary: "Creates a node in the current edited Godot scene."
    }
  },
  {
    name: "create_node_with_script",
    description: "Create a Godot scene node and create or attach a GDScript in one editor operation.",
    profile: "full",
    tier: "standard",
    category: "nodes-common",
    inputSchema: CREATE_NODE_WITH_SCRIPT_SCHEMA,
    bridge: {
      clientMethod: "createNodeWithScript",
      endpoint: "/scene/node/create-with-script",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/node/create-with-script",
      handler: "_create_node_with_script",
      arg: "body",
      methodError: "node creation with script requires POST"
    },
    conformance: {
      happy: "create a node and attach a generated or existing GDScript in one operation",
      error: "reject invalid node classes, script paths, or script template options"
    },
    docs: {
      summary: "Creates a scene node and creates or attaches a GDScript in one editor operation."
    }
  },
  {
    name: "rename_node",
    description: "Rename a node in the current edited Godot scene.",
    profile: "full",
    tier: "standard",
    category: "nodes-common",
    inputSchema: RENAME_NODE_SCHEMA,
    bridge: {
      clientMethod: "renameNode",
      endpoint: "/scene/node/rename",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/node/rename",
      handler: "_rename_node",
      arg: "body",
      methodError: "node rename requires POST"
    },
    conformance: {
      happy: "rename an existing scene node",
      error: "reject missing nodes, root renames, or invalid names"
    },
    docs: {
      summary: "Renames a node in the current edited Godot scene."
    }
  },
  {
    name: "delete_node",
    description: "Delete a non-root node from the current edited Godot scene.",
    profile: "v1",
    tier: "essential",
    category: "nodes-common",
    inputSchema: DELETE_NODE_SCHEMA,
    bridge: {
      clientMethod: "deleteNode",
      endpoint: "/scene/node/delete",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/node/delete",
      handler: "_delete_node",
      arg: "body",
      methodError: "node delete requires POST"
    },
    conformance: {
      happy: "delete a non-root scene node",
      error: "reject missing nodes or attempts to delete the edited scene root"
    },
    docs: {
      summary: "Deletes a non-root node from the current edited Godot scene."
    }
  },
  {
    name: "duplicate_node",
    description: "Duplicate a node in the current edited Godot scene.",
    profile: "full",
    tier: "standard",
    category: "nodes-common",
    inputSchema: DUPLICATE_NODE_SCHEMA,
    bridge: {
      clientMethod: "duplicateNode",
      endpoint: "/scene/node/duplicate",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/node/duplicate",
      handler: "_duplicate_node",
      arg: "body",
      methodError: "node duplicate requires POST"
    },
    conformance: {
      happy: "duplicate a scene node under the requested parent",
      error: "reject missing source nodes or invalid destination parents"
    },
    docs: {
      summary: "Duplicates a node in the current edited Godot scene."
    }
  },
  {
    name: "reparent_node",
    description: "Move a node under a new parent in the current edited Godot scene.",
    profile: "full",
    tier: "standard",
    category: "nodes-common",
    inputSchema: REPARENT_NODE_SCHEMA,
    bridge: {
      clientMethod: "reparentNode",
      endpoint: "/scene/node/reparent",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/node/reparent",
      handler: "_reparent_node",
      arg: "body",
      methodError: "node reparent requires POST"
    },
    conformance: {
      happy: "move a scene node under a new parent",
      error: "reject missing nodes, invalid parents, or cycles"
    },
    docs: {
      summary: "Moves a node under a new parent in the current edited Godot scene."
    }
  },
  {
    name: "reorder_node",
    description: "Move a node to a target sibling index under its current parent in the current edited Godot scene.",
    profile: "full",
    tier: "standard",
    category: "nodes-common",
    inputSchema: REORDER_NODE_SCHEMA,
    bridge: {
      clientMethod: "reorderNode",
      endpoint: "/scene/node/reorder",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/node/reorder",
      handler: "_reorder_node",
      arg: "body",
      methodError: "node reorder requires POST"
    },
    conformance: {
      happy: "move a scene node to a target sibling index",
      error: "reject missing nodes, root reorders, or out-of-range indexes"
    },
    docs: {
      summary: "Moves a node to a target sibling index under its current parent."
    }
  }
];
