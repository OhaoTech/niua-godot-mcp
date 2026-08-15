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
      description: "Light kind to create: directional, omni, point, spot, or area (Godot 4.7 AreaLight3D). Defaults to omni."
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
      description: "OmniLight3D omni_range, SpotLight3D spot_range, or AreaLight3D area_range value."
    },
    angleDegrees: {
      type: "number",
      description: "SpotLight3D spot_angle value."
    },
    areaSize: {
      description: "AreaLight3D rectangle extents in meters as [width, height] or { x, y }. Godot 4.7+."
    },
    areaRange: {
      type: "number",
      description: "AreaLight3D area_range in meters. Godot 4.7+."
    },
    areaAttenuation: {
      type: "number",
      description: "AreaLight3D area_attenuation. Use 2.0 for inverse-square. Godot 4.7+."
    },
    areaNormalizeEnergy: {
      type: "boolean",
      description: "AreaLight3D area_normalize_energy. When true, size does not change total energy. Godot 4.7+."
    },
    areaTexturePath: {
      type: "string",
      description: "Optional res:// Texture2D path for AreaLight3D.area_texture. Godot 4.7+."
    },
    shadowEnabled: {
      type: "boolean",
      description: "Whether shadows are enabled for the light."
    },
    ...advancedNodeProperties("Advanced Godot light node properties merged after curated fields.")
  },
  additionalProperties: false
};
