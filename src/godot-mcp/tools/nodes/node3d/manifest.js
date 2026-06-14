import {
  CREATE_AREA_3D_SCHEMA,
  CREATE_CAMERA_3D_SCHEMA,
  CREATE_CHARACTER_BODY_3D_SCHEMA,
  CREATE_COLLISION_SHAPE_3D_SCHEMA,
  CREATE_LIGHT_3D_SCHEMA,
  CREATE_MESH_INSTANCE_3D_SCHEMA,
  CREATE_RIGID_BODY_3D_SCHEMA,
  CREATE_STATIC_BODY_3D_SCHEMA
} from "./schemas.js";

export const NODE3D_TOOL_MANIFEST = [
  {
    name: "create_light_3d",
    description: "Create a DirectionalLight3D, OmniLight3D, or SpotLight3D with practical transform and lighting fields.",
    profile: "v1",
    category: "nodes-3d",
    implementation: "local",
    inputSchema: CREATE_LIGHT_3D_SCHEMA,
    local: {
      handler: "createLight3D"
    },
    conformance: {
      happy: "create a 3D light with transform and lighting fields",
      error: "reject unsupported light kinds, invalid transforms, or missing parents"
    },
    docs: {
      summary: "Creates a DirectionalLight3D, OmniLight3D, or SpotLight3D."
    }
  },
  {
    name: "create_camera_3d",
    description: "Create a Camera3D with practical transform, projection, FOV, and clipping fields.",
    profile: "v1",
    category: "nodes-3d",
    implementation: "local",
    inputSchema: CREATE_CAMERA_3D_SCHEMA,
    local: {
      handler: "createCamera3D"
    },
    conformance: {
      happy: "create a Camera3D with transform and camera properties",
      error: "reject invalid transforms, projection settings, or missing parents"
    },
    docs: {
      summary: "Creates a Camera3D with practical transform, projection, FOV, and clipping fields."
    }
  },
  {
    name: "create_collision_shape_3d",
    description: "Create a Shape3D resource and a CollisionShape3D node that references it for 3D physics workflows.",
    profile: "full",
    category: "nodes-3d",
    implementation: "local",
    inputSchema: CREATE_COLLISION_SHAPE_3D_SCHEMA,
    local: {
      handler: "createCollisionShape3D"
    },
    conformance: {
      happy: "create a Shape3D resource and referencing CollisionShape3D node",
      error: "reject invalid shape kinds, dimensions, resource paths, or missing parents"
    },
    docs: {
      summary: "Creates a Shape3D resource and a CollisionShape3D node that references it."
    }
  },
  {
    name: "create_mesh_instance_3d",
    description: "Create a primitive Mesh resource and a MeshInstance3D node that references it for visible 3D blockouts.",
    profile: "v1",
    category: "nodes-3d",
    implementation: "local",
    inputSchema: CREATE_MESH_INSTANCE_3D_SCHEMA,
    local: {
      handler: "createMeshInstance3D"
    },
    conformance: {
      happy: "create a primitive Mesh resource and referencing MeshInstance3D node",
      error: "reject invalid mesh kinds, dimensions, resource paths, or missing parents"
    },
    docs: {
      summary: "Creates a primitive Mesh resource and a MeshInstance3D node that references it."
    }
  },
  {
    name: "create_rigid_body_3d",
    description: "Create a RigidBody3D and optionally create a Shape3D resource plus CollisionShape3D child in one editor workflow.",
    profile: "full",
    category: "nodes-3d",
    implementation: "local",
    inputSchema: CREATE_RIGID_BODY_3D_SCHEMA,
    local: {
      handler: "createRigidBody3D"
    },
    conformance: {
      happy: "create a RigidBody3D with optional collision child",
      error: "reject invalid body properties, collision definitions, or missing parents"
    },
    docs: {
      summary: "Creates a RigidBody3D with optional Shape3D and CollisionShape3D child."
    }
  },
  {
    name: "create_character_body_3d",
    description: "Create a CharacterBody3D controller body and optionally create a Shape3D resource plus CollisionShape3D child.",
    profile: "v1",
    category: "nodes-3d",
    implementation: "local",
    inputSchema: CREATE_CHARACTER_BODY_3D_SCHEMA,
    local: {
      handler: "createCharacterBody3D"
    },
    conformance: {
      happy: "create a CharacterBody3D with optional collision child",
      error: "reject invalid body properties, collision definitions, or missing parents"
    },
    docs: {
      summary: "Creates a CharacterBody3D controller body with optional collision child."
    }
  },
  {
    name: "create_static_body_3d",
    description: "Create a StaticBody3D world collision body and optionally create a Shape3D resource plus CollisionShape3D child.",
    profile: "v1",
    category: "nodes-3d",
    implementation: "local",
    inputSchema: CREATE_STATIC_BODY_3D_SCHEMA,
    local: {
      handler: "createStaticBody3D"
    },
    conformance: {
      happy: "create a StaticBody3D with optional collision child",
      error: "reject invalid body properties, collision definitions, or missing parents"
    },
    docs: {
      summary: "Creates a StaticBody3D world collision body with optional collision child."
    }
  },
  {
    name: "create_area_3d",
    description: "Create an Area3D trigger/sensor volume and optionally create a Shape3D resource plus CollisionShape3D child.",
    profile: "full",
    category: "nodes-3d",
    implementation: "local",
    inputSchema: CREATE_AREA_3D_SCHEMA,
    local: {
      handler: "createArea3D"
    },
    conformance: {
      happy: "create an Area3D trigger or sensor with optional collision child",
      error: "reject invalid area properties, collision definitions, or missing parents"
    },
    docs: {
      summary: "Creates an Area3D trigger or sensor volume with optional collision child."
    }
  }
];
