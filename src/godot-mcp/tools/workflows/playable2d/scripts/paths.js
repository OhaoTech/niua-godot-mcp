import {
  lastNodeName,
  slugifyResourceName,
  toPascalIdentifier
} from "./names.js";

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

export function defaultControllerScriptPath(nodePath) {
  const nodeName = String(nodePath)
    .split("/")
    .filter(Boolean)
    .pop() || "player";
  return `res://scripts/${slugifyResourceName(nodeName)}_controller_2d.gd`;
}

export function defaultControllerClassName(nodePath) {
  const nodeName = String(nodePath)
    .split("/")
    .filter(Boolean)
    .pop() || "Player";
  return `${toPascalIdentifier(nodeName, "Player")}Controller2D`;
}

export function defaultTriggerScriptPath(areaPath) {
  const nodeName = lastNodeName(areaPath, "trigger_zone");
  return `res://scripts/${slugifyResourceName(nodeName)}_trigger_2d.gd`;
}

export function defaultTriggerClassName(areaPath) {
  return `${toPascalIdentifier(lastNodeName(areaPath, "TriggerZone"), "TriggerZone")}Trigger2D`;
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
