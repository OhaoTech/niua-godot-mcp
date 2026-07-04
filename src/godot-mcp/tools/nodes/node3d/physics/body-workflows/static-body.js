import { buildStaticBody3DProperties } from "../../properties.js";
import { createPhysicsOwner3D } from "./owner.js";

export async function createStaticBody3D(args = {}) {
  return createPhysicsOwner3D(args, {
    type: "StaticBody3D",
    buildProperties: buildStaticBody3DProperties,
    ownerDataKey: "body"
  });
}
