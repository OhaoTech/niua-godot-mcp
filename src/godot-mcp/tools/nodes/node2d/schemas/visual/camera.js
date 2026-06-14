import {
  ADVANCED_NODE_PROPERTIES,
  BASE_NODE2D_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_CAMERA_2D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE2D_PROPERTIES,
    ...nodeNameProperty("Optional Camera2D node name."),
    zoom: {
      description: "Camera2D zoom as [x,y] or { x, y }."
    },
    enabled: {
      type: "boolean",
      description: "Whether this Camera2D starts enabled."
    },
    limitLeft: {
      type: "number",
      description: "Camera2D limit_left value."
    },
    limitTop: {
      type: "number",
      description: "Camera2D limit_top value."
    },
    limitRight: {
      type: "number",
      description: "Camera2D limit_right value."
    },
    limitBottom: {
      type: "number",
      description: "Camera2D limit_bottom value."
    },
    ...ADVANCED_NODE_PROPERTIES
  },
  additionalProperties: false
};
