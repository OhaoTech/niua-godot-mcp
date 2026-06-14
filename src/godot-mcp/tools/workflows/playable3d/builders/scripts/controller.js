import { normalizePlainObject } from "../../../../../shared/normalize.js";

import { gdNumber, gdString } from "./gdscript.js";

export function normalizeCharacterControllerActionNames(actionNames = {}) {
  const raw = normalizePlainObject(actionNames, "actionNames", {});
  const normalized = {
    moveForward: String(raw.moveForward ?? "move_forward").trim(),
    moveBack: String(raw.moveBack ?? "move_back").trim(),
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
    { key: "moveForward", name: actionNames.moveForward, keycode: 87 },
    { key: "moveBack", name: actionNames.moveBack, keycode: 83 },
    { key: "moveLeft", name: actionNames.moveLeft, keycode: 65 },
    { key: "moveRight", name: actionNames.moveRight, keycode: 68 },
    { key: "jump", name: actionNames.jump, keycode: 32 }
  ];
}

export function buildCharacterController3DScript({
  className,
  speed,
  jumpVelocity,
  gravity,
  actionNames
}) {
  const lines = [
    "extends CharacterBody3D",
    className ? `class_name ${className}` : "",
    "",
    `@export var move_speed: float = ${gdNumber(speed)}`,
    `@export var jump_velocity: float = ${gdNumber(jumpVelocity)}`,
    `@export var gravity: float = ${gdNumber(gravity)}`,
    "",
    "func _physics_process(delta: float) -> void:",
    "\tvar input_dir := Vector2.ZERO",
    `\tif Input.is_action_pressed(${gdString(actionNames.moveRight)}):`,
    "\t\tinput_dir.x += 1.0",
    `\tif Input.is_action_pressed(${gdString(actionNames.moveLeft)}):`,
    "\t\tinput_dir.x -= 1.0",
    `\tif Input.is_action_pressed(${gdString(actionNames.moveForward)}):`,
    "\t\tinput_dir.y += 1.0",
    `\tif Input.is_action_pressed(${gdString(actionNames.moveBack)}):`,
    "\t\tinput_dir.y -= 1.0",
    "",
    "\tvar direction := Vector3.ZERO",
    "\tif input_dir.length_squared() > 0.0:",
    "\t\tinput_dir = input_dir.normalized()",
    "\t\tdirection = (global_transform.basis.x * input_dir.x) + (-global_transform.basis.z * input_dir.y)",
    "\t\tdirection.y = 0.0",
    "\t\tdirection = direction.normalized()",
    "",
    "\tif is_on_floor():",
    `\t\tif Input.is_action_just_pressed(${gdString(actionNames.jump)}):`,
    "\t\t\tvelocity.y = jump_velocity",
    "\telse:",
    "\t\tvelocity.y -= gravity * delta",
    "",
    "\tvelocity.x = direction.x * move_speed",
    "\tvelocity.z = direction.z * move_speed",
    "\tmove_and_slide()",
    ""
  ];
  return lines.filter((line, index) => index !== 1 || line).join("\n");
}
