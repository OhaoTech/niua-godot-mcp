import {
  BAKE_NAVIGATION_MESH_3D_SCHEMA,
  CREATE_NAVIGATION_AGENT_3D_SCHEMA,
  CREATE_NAVIGATION_REGION_3D_SCHEMA,
  CREATE_NAVIGATION_TARGET_FOLLOW_SCRIPT_SCHEMA
} from "./schemas.js";

export const NAVIGATION_TOOL_MANIFEST = [
  {
    name: "create_navigation_region_3d",
    stability: "experimental",
    description: "Create a NavigationRegion3D with a NavigationMesh resource and practical agent/bake settings.",
    profile: "full",
    tier: "standard",
    category: "navigation",
    inputSchema: CREATE_NAVIGATION_REGION_3D_SCHEMA,
    bridge: {
      clientMethod: "createNavigationRegion3D",
      endpoint: "/navigation/region/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/navigation/region/create",
      handler: "_create_navigation_region_3d",
      arg: "body",
      methodError: "navigation region creation requires POST"
    },
    conformance: {
      happy: "create a NavigationRegion3D with NavigationMesh settings",
      error: "reject invalid parent node paths"
    },
    docs: {
      summary: "Creates a NavigationRegion3D with a NavigationMesh resource."
    }
  },
  {
    name: "bake_navigation_mesh_3d",
    stability: "experimental",
    description: "Bake the NavigationMesh for a NavigationRegion3D from scene geometry.",
    profile: "full",
    tier: "standard",
    category: "navigation",
    inputSchema: BAKE_NAVIGATION_MESH_3D_SCHEMA,
    bridge: {
      clientMethod: "bakeNavigationMesh3D",
      endpoint: "/navigation/mesh/bake",
      method: "POST",
      request: "body",
      timeout: {
        field: "timeoutMs",
        defaultMs: 120000,
        operationName: "bake_navigation_mesh_3d",
        partialProgress: {
          regionPath: "",
          onThread: false
        }
      }
    },
    godotRoute: {
      side: "write",
      endpoint: "/navigation/mesh/bake",
      handler: "_bake_navigation_mesh_3d",
      arg: "body",
      methodError: "navigation mesh bake requires POST"
    },
    conformance: {
      happy: "bake a NavigationMesh for a NavigationRegion3D",
      error: "report timeout progress context for long bakes"
    },
    docs: {
      summary: "Bakes a NavigationMesh and exposes long-operation timeout metadata."
    }
  },
  {
    name: "create_navigation_agent_3d",
    stability: "experimental",
    description: "Create a NavigationAgent3D under an actor node with practical path-following settings.",
    profile: "full",
    tier: "standard",
    category: "navigation",
    inputSchema: CREATE_NAVIGATION_AGENT_3D_SCHEMA,
    bridge: {
      clientMethod: "createNavigationAgent3D",
      endpoint: "/navigation/agent/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/navigation/agent/create",
      handler: "_create_navigation_agent_3d",
      arg: "body",
      methodError: "navigation agent creation requires POST"
    },
    conformance: {
      happy: "create a NavigationAgent3D under an actor",
      error: "reject missing parent node paths"
    },
    docs: {
      summary: "Creates a NavigationAgent3D under an actor node."
    }
  },
  {
    name: "create_navigation_target_follow_script",
    stability: "experimental",
    description: "Generate and attach a CharacterBody3D script template that follows a target through a NavigationAgent3D.",
    profile: "full",
    tier: "standard",
    category: "navigation",
    inputSchema: CREATE_NAVIGATION_TARGET_FOLLOW_SCRIPT_SCHEMA,
    bridge: {
      clientMethod: "createNavigationTargetFollowScript",
      endpoint: "/navigation/script/target-follow/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/navigation/script/target-follow/create",
      handler: "_create_navigation_target_follow_script",
      arg: "body",
      methodError: "navigation target-follow script creation requires POST"
    },
    conformance: {
      happy: "generate and attach a NavigationAgent target-follow script",
      error: "reject script paths outside res://"
    },
    docs: {
      summary: "Generates a CharacterBody3D target-follow script using NavigationAgent3D."
    }
  }
];
