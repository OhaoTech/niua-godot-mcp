import { buildRigidBody3DProperties } from "../../properties.js";
import { createPhysicsOwner3D } from "./owner.js";

export async function createRigidBody3D(args = {}) {
  return createPhysicsOwner3D(args, {
    type: "RigidBody3D",
    buildProperties: buildRigidBody3DProperties,
    ownerDataKey: "body",
    createdOwnerKey: "createdBody"
  });
}
