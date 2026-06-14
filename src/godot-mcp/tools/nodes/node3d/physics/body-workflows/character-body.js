import { buildCharacterBody3DProperties } from "../../properties.js";
import { createPhysicsOwner3D } from "./owner.js";

export async function createCharacterBody3D(args = {}) {
  return createPhysicsOwner3D(args, {
    type: "CharacterBody3D",
    buildProperties: buildCharacterBody3DProperties,
    ownerDataKey: "character",
    createdOwnerKey: "createdCharacter"
  });
}
