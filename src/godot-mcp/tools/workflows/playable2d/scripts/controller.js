import { normalizePlainObject } from "../../../../shared/normalize.js";

import { gdNumber, gdString } from "./gdscript.js";

export function normalizeCharacterControllerActionNames(actionNames = {}) {
  const raw = normalizePlainObject(actionNames, "actionNames", {});
  const normalized = {
    moveLeft: String(raw.moveLeft ?? "move_left").trim(),
    moveRight: String(raw.moveRight ?? "move_right").trim(),
    jump: String(raw.jump ?? "jump").trim()
  };
  for (const [key, value] of Object.entries(normalized)) {
    if (!value) {
      throw new Error(`actionNames.${key} must not be empty`);
    }
  }
  return normalized;
}

export function characterControllerInputSpecs(actionNames) {
  return [
    { key: "moveLeft", name: actionNames.moveLeft, keycode: 65 },
    { key: "moveRight", name: actionNames.moveRight, keycode: 68 },
    { key: "jump", name: actionNames.jump, keycode: 32 }
  ];
}

export function buildCharacterController2DScript({
  className,
  moveSpeed,
  jumpVelocity,
  gravity,
  actionNames
}) {
  const lines = [
    "extends CharacterBody2D",
    className ? `class_name ${className}` : "",
    "",
    `@export var move_speed: float = ${gdNumber(moveSpeed)}`,
    `@export var jump_velocity: float = ${gdNumber(jumpVelocity)}`,
    `@export var gravity: float = ${gdNumber(gravity)}`,
    "",
    "func _physics_process(delta: float) -> void:",
    "\tvar horizontal := 0.0",
    `\tif Input.is_action_pressed(${gdString(actionNames.moveRight)}):`,
    "\t\thorizontal += 1.0",
    `\tif Input.is_action_pressed(${gdString(actionNames.moveLeft)}):`,
    "\t\thorizontal -= 1.0",
    "",
    "\tvelocity.x = horizontal * move_speed",
    "",
    "\tif is_on_floor():",
    `\t\tif Input.is_action_just_pressed(${gdString(actionNames.jump)}):`,
    "\t\t\tvelocity.y = jump_velocity",
    "\telse:",
    "\t\tvelocity.y += gravity * delta",
    "",
    "\tmove_and_slide()",
    ""
  ];
  return lines.filter((line, index) => index !== 1 || line).join("\n");
}
