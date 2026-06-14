import {
  BASE_NODE3D_PROPERTIES,
  nodeNameProperty
} from "../shared.js";

export const CREATE_MESH_INSTANCE_3D_SCHEMA = {
  type: "object",
  properties: {
    ...BASE_NODE3D_PROPERTIES,
    meshKind: {
      type: "string",
      description: "Primitive mesh resource kind: box, cube, sphere, capsule, cylinder, plane, quad, or torus. Defaults to box."
    },
    meshPath: {
      type: "string",
      description: "Godot Mesh resource output path under res://, usually ending in .tres."
    },
    ...nodeNameProperty("Optional MeshInstance3D node name."),
    size: {
      description: "Box/Cube size as [x,y,z] or { x, y, z }; Plane/Quad size as [x,y] or { x, y }."
    },
    radius: {
      type: "number",
      description: "Sphere/Capsule radius, or shared Cylinder top/bottom radius."
    },
    height: {
      type: "number",
      description: "Sphere, Capsule, or Cylinder height."
    },
    topRadius: {
      type: "number",
      description: "Cylinder top_radius override."
    },
    bottomRadius: {
      type: "number",
      description: "Cylinder bottom_radius override."
    },
    innerRadius: {
      type: "number",
      description: "Torus inner_radius."
    },
    outerRadius: {
      type: "number",
      description: "Torus outer_radius."
    },
    radialSegments: {
      type: "integer",
      description: "Primitive radial segment count where the mesh type supports it."
    },
    rings: {
      type: "integer",
      description: "Primitive ring count where the mesh type supports it."
    },
    ringSegments: {
      type: "integer",
      description: "Torus ring_segments value."
    },
    materialPath: {
      type: "string",
      description: "Optional res:// Material resource assigned to GeometryInstance3D material_override."
    },
    open: {
      type: "boolean",
      description: "Open the mesh resource in the visible editor after creation. Defaults to false."
    },
    overwrite: {
      type: "boolean",
      description: "Overwrite an existing mesh resource. Defaults to false."
    },
    meshProperties: {
      type: "object",
      description: "Advanced Godot primitive mesh properties merged after curated fields.",
      additionalProperties: true
    },
    nodeProperties: {
      type: "object",
      description: "Advanced Godot MeshInstance3D node properties merged after curated fields.",
      additionalProperties: true
    }
  },
  required: ["meshPath"],
  additionalProperties: false
};
