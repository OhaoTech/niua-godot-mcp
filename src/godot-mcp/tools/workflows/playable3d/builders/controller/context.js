import { normalizePositiveFiniteNumber } from "../../../../../shared/numbers.js";
import {
  defaultControllerClassName,
  defaultControllerScriptPath,
  normalizeCharacterControllerActionNames,
  normalizeGDScriptClassName,
  normalizeGodotScriptPath
} from "../scripts.js";

export function buildCharacterController3DContext(payload) {
  const nodePath = String(payload.nodePath ?? "").trim();
  if (!nodePath) {
    throw new Error("nodePath is required");
  }

  return {
    nodePath,
    scriptPath: normalizeGodotScriptPath(
      payload.scriptPath ?? defaultControllerScriptPath(nodePath),
      "scriptPath"
    ),
    className: normalizeGDScriptClassName(
      payload.className,
      defaultControllerClassName(nodePath)
    ),
    actionNames: normalizeCharacterControllerActionNames(payload.actionNames),
    speed: normalizePositiveFiniteNumber(payload.speed ?? 7, "speed"),
    jumpVelocity: normalizePositiveFiniteNumber(payload.jumpVelocity ?? 4.5, "jumpVelocity"),
    gravity: normalizePositiveFiniteNumber(payload.gravity ?? 9.8, "gravity"),
    overwriteScript: Boolean(payload.overwriteScript ?? false),
    validateAfterCreate: payload.validateAfterCreate !== false,
    saveScene: Boolean(payload.saveScene ?? true),
    configureInputMap: payload.configureInputMap !== false,
    steps: [],
    inputActions: []
  };
}
