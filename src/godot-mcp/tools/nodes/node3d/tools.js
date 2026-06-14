import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import {
  createArea3D,
  createCamera3D,
  createCharacterBody3D,
  createCollisionShape3D,
  createLight3D,
  createMeshInstance3D,
  createRigidBody3D,
  createStaticBody3D
} from "./builders.js";
import { NODE3D_TOOL_MANIFEST } from "./manifest.js";

export const NODE3D_TOOL_DEFINITIONS = toolDefinitionsFromManifest(NODE3D_TOOL_MANIFEST, {
  localHandlers: {
    createLight3D,
    createCamera3D,
    createCollisionShape3D,
    createMeshInstance3D,
    createRigidBody3D,
    createCharacterBody3D,
    createStaticBody3D,
    createArea3D
  }
});
