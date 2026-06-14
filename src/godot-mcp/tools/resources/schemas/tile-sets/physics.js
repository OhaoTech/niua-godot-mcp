export const CREATE_TILE_SET_PHYSICS_LAYER_SCHEMA = {
  type: "object",
  properties: {
    collisionLayer: {
      type: "number",
      description: "Physics collision layer bit mask. Defaults to 1."
    },
    collisionMask: {
      type: "number",
      description: "Physics collision mask bit mask. Defaults to 1."
    },
    collisionPriority: {
      type: "number",
      description: "Collision priority. Defaults to 1."
    },
    physicsMaterialPath: {
      type: "string",
      description: "Optional PhysicsMaterial resource path under res://."
    }
  },
  additionalProperties: false
};
