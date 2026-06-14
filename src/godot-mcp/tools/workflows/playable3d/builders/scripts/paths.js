import {
  lastNodeName,
  slugifyResourceName,
  toPascalIdentifier
} from "./names.js";

export function defaultControllerScriptPath(nodePath) {
  const nodeName = lastNodeName(nodePath, "player");
  return `res://scripts/${slugifyResourceName(nodeName)}_controller_3d.gd`;
}

export function normalizeGodotScriptPath(path, fieldName) {
  const normalized = String(path ?? "").trim();
  if (!normalized.startsWith("res://")) {
    throw new Error(`${fieldName} must start with res://`);
  }
  if (!normalized.endsWith(".gd")) {
    throw new Error(`${fieldName} must end with .gd`);
  }
  return normalized;
}

export function defaultControllerClassName(nodePath) {
  const nodeName = lastNodeName(nodePath, "Player");
  return `${toPascalIdentifier(nodeName, "Player")}Controller3D`;
}

export function normalizeGDScriptClassName(value, fallback) {
  const className = String(value ?? fallback ?? "").trim();
  if (!className) {
    return "";
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(className)) {
    throw new Error("className must be a valid GDScript identifier");
  }
  return className;
}
