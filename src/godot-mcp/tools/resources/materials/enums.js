export const STANDARD_MATERIAL_3D_TRANSPARENCY = new Map([
  ["disabled", 0],
  ["off", 0],
  ["none", 0],
  ["alpha", 1],
  ["alpha_scissor", 2],
  ["scissor", 2],
  ["alpha_hash", 3],
  ["hash", 3],
  ["alpha_depth_pre_pass", 4],
  ["depth_pre_pass", 4]
]);

export const STANDARD_MATERIAL_3D_CULL_MODE = new Map([
  ["back", 0],
  ["front", 1],
  ["disabled", 2],
  ["off", 2],
  ["none", 2]
]);

export const STANDARD_MATERIAL_3D_SHADING_MODE = new Map([
  ["per_pixel", 0],
  ["pixel", 0],
  ["per_vertex", 1],
  ["vertex", 1],
  ["unshaded", 2]
]);

export function normalizeMaterialEnum(value, values, fieldName) {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`${fieldName} must be a non-negative integer or known enum name`);
    }
    return value;
  }

  const key = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!values.has(key)) {
    throw new Error(`${fieldName} must be one of: ${Array.from(values.keys()).join(", ")}`);
  }
  return values.get(key);
}
