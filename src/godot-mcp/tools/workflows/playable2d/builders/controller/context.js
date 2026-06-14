import { normalizeFiniteNumber, normalizePositiveFiniteNumber } from "../../../../../shared/numbers.js";
import {
  defaultControllerClassName,
  defaultControllerScriptPath,
  normalizeCharacterControllerActionNames,
  normalizeGDScriptClassName,
  normalizeGodotScriptPath
} from "../../scripts.js";

export function buildCharacterController2DContext(payload) {
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
    moveSpeed: normalizePositiveFiniteNumber(payload.moveSpeed ?? 360, "moveSpeed"),
    jumpVelocity: normalizeFiniteNumber(payload.jumpVelocity ?? -540, "jumpVelocity"),
    gravity: normalizePositiveFiniteNumber(payload.gravity ?? 1400, "gravity"),
    overwriteScript: Boolean(payload.overwriteScript ?? false),
    validateAfterCreate: payload.validateAfterCreate !== false,
    saveScene: Boolean(payload.saveScene ?? true),
    configureInputMap: payload.configureInputMap !== false,
    steps: [],
    inputActions: []
  };
}
