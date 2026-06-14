import {
  advancedNodeProperties,
  BASE_NODE3D_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_LIGHT_3D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE3D_PROPERTIES,
    kind: {
      type: "string",
      description: "Light kind to create: directional, omni, point, or spot. Defaults to omni."
    },
    ...nodeNameProperty("Optional light node name."),
    color: {
      description: "Light color as #RRGGBB, #RRGGBBAA, or { r, g, b, a } values in 0..1."
    },
    energy: {
      type: "number",
      description: "Light3D light_energy value."
    },
    range: {
      type: "number",
      description: "OmniLight3D omni_range or SpotLight3D spot_range value."
    },
    angleDegrees: {
      type: "number",
      description: "SpotLight3D spot_angle value."
    },
    shadowEnabled: {
      type: "boolean",
      description: "Whether shadows are enabled for the light."
    },
    ...advancedNodeProperties("Advanced Godot light node properties merged after curated fields.")
  },
  additionalProperties: false
};
