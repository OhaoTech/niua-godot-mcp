import { buildArea3DProperties } from "../../properties.js";
import { createPhysicsOwner3D } from "./owner.js";

export async function createArea3D(args = {}) {
  return createPhysicsOwner3D(args, {
    type: "Area3D",
    buildProperties: buildArea3DProperties,
    ownerDataKey: "area",
    createdOwnerKey: "createdArea"
  });
}
