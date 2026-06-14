import { trimOptionalString } from "../properties.js";

export function slugifyResourceName(value) {
  const slug = String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "node_2d";
}

export function resolveCreatedNodePath(created, fallbackName, parentPath) {
  const direct = trimOptionalString(created?.data?.nodePath ?? created?.nodePath);
  if (direct) {
    return direct;
  }

  const name = trimOptionalString(fallbackName) || "Node2D";
  const parent = String(parentPath ?? "").replace(/\/+$/, "");
  return parent ? `${parent}/${name}` : name;
}
