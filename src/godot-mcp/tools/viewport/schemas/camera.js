import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";
import { VIEWPORT_TARGET_PROPERTIES } from "./shared.js";

export const VIEWPORT_CAMERA_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    viewport: VIEWPORT_TARGET_PROPERTIES.viewport.mutate,
    index: VIEWPORT_TARGET_PROPERTIES.index,
    position: {
      type: "object",
      description: "Typed Vector2 for 2D or Vector3 for 3D, for example { type: 'Vector3', x: 1, y: 2, z: 3 }.",
      additionalProperties: true
    },
    zoom: {
      type: "object",
      description: "2D Camera2D zoom as typed Vector2, for example { type: 'Vector2', x: 1.5, y: 1.5 }.",
      additionalProperties: true
    },
    rotation: {
      oneOf: [
        { type: "number" },
        { type: "object", additionalProperties: true }
      ],
      description: "2D rotation in radians, or 3D typed Vector3 Euler rotation in radians."
    },
    rotationDegrees: {
      oneOf: [
        { type: "number" },
        { type: "object", additionalProperties: true }
      ],
      description: "2D rotation in degrees, or 3D typed Vector3 Euler rotation in degrees."
    },
    fov: {
      type: "number",
      description: "3D Camera3D vertical field of view in degrees."
    },
    near: {
      type: "number",
      description: "3D Camera3D near clipping plane."
    },
    far: {
      type: "number",
      description: "3D Camera3D far clipping plane."
    }
  },
  additionalProperties: false
};
