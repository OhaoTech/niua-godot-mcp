import {
  advancedNodeProperties,
  BASE_NODE3D_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_CAMERA_3D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE3D_PROPERTIES,
    ...nodeNameProperty("Optional camera node name."),
    current: {
      type: "boolean",
      description: "Whether this Camera3D should be the current scene camera."
    },
    fov: {
      type: "number",
      description: "Camera3D field of view in degrees for perspective projection."
    },
    size: {
      type: "number",
      description: "Camera3D orthogonal size."
    },
    near: {
      type: "number",
      description: "Camera3D near clipping distance."
    },
    far: {
      type: "number",
      description: "Camera3D far clipping distance."
    },
    projection: {
      description: "Projection mode: perspective, orthogonal, frustum, or the Godot enum integer."
    },
    ...advancedNodeProperties("Advanced Godot Camera3D properties merged after curated fields.")
  },
  additionalProperties: false
};
