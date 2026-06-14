import { isPlainObject } from "../../../../shared/normalize.js";
import { normalizeFiniteNumber } from "../../../../shared/numbers.js";
import {
  applyCommonMouseFields,
  normalizeBoolean,
  normalizePositiveInteger
} from "../fields.js";
import { cloneVector2, normalizePosition } from "../vectors.js";

export const DEFAULT_MOUSE_BUTTON = 1;

export function buttonMaskForButtonIndex(buttonIndex) {
  switch (buttonIndex) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 4;
    default:
      return 0;
  }
}

export function normalizeMouseButton(event, fieldName, {
  position,
  pressed,
  buttonMask
} = {}) {
  if (!isPlainObject(event)) {
    throw new Error(`${fieldName} must be an object`);
  }

  const resolvedPosition = position ?? normalizePosition(event.position, `${fieldName}.position`);
  const buttonIndex = normalizePositiveInteger(event.buttonIndex, `${fieldName}.buttonIndex`, DEFAULT_MOUSE_BUTTON);
  const resolvedPressed = pressed ?? normalizeBoolean(event.pressed, `${fieldName}.pressed`);
  const output = {
    type: "mouse_button",
    position: cloneVector2(resolvedPosition),
    globalPosition: event.globalPosition === undefined
      ? cloneVector2(resolvedPosition)
      : normalizePosition(event.globalPosition, `${fieldName}.globalPosition`),
    buttonIndex,
    buttonMask: buttonMask ?? Number(event.buttonMask ?? (resolvedPressed ? buttonMaskForButtonIndex(buttonIndex) : 0)),
    pressed: resolvedPressed,
    doubleClick: normalizeBoolean(event.doubleClick, `${fieldName}.doubleClick`, false),
    factor: normalizeFiniteNumber(event.factor ?? 1, `${fieldName}.factor`)
  };

  applyCommonMouseFields(output, event, fieldName);
  output.buttonMask = buttonMask ?? Number(output.buttonMask);
  return output;
}
