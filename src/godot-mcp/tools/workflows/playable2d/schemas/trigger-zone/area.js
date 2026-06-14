export const TRIGGER_ZONE_AREA_PROPERTIES = {
  name: {
    type: "string",
    description: "Name for the generated Area2D trigger. Defaults to TriggerZone."
  },
  parentPath: {
    type: "string",
    description: "Path under the edited scene root where the Area2D should be created."
  },
  resourceDirectory: {
    type: "string",
    description: "res:// directory for generated trigger Shape2D and optional placeholder texture resources."
  },
  overwriteResources: {
    type: "boolean",
    description: "Overwrite generated trigger resources. Defaults to false."
  },
  position: {
    description: "Area2D position as [x,y] or { x, y }."
  },
  rotationDegrees: {
    type: "number",
    description: "Area2D rotation_degrees value."
  },
  scale: {
    description: "Area2D scale as [x,y] or { x, y }."
  },
  monitoring: {
    type: "boolean",
    description: "Whether Area2D monitoring is enabled. Defaults to true."
  },
  monitorable: {
    type: "boolean",
    description: "Whether other areas can monitor this Area2D. Defaults to true."
  },
  priority: {
    type: "number",
    description: "Area2D priority."
  },
  collisionLayer: {
    type: "number",
    description: "Area2D collision_layer integer."
  },
  collisionMask: {
    type: "number",
    description: "Area2D collision_mask integer."
  },
  properties: {
    type: "object",
    description: "Advanced Godot Area2D properties merged after curated fields.",
    additionalProperties: true
  }
};
