import { isPlainObject } from "../../../../shared/normalize.js";
import {
  applyCommonMouseFields
} from "../fields.js";
import { cloneVector2, normalizePosition } from "../vectors.js";

export function normalizeMouseMotion(event, fieldName, {
  position,
  relative,
  buttonMask
} = {}) {
  if (!isPlainObject(event)) {
    throw new Error(`${fieldName} must be an object`);
  }

  const resolvedPosition = position ?? normalizePosition(event.position, `${fieldName}.position`);
  const output = {
    type: "mouse_motion",
    position: cloneVector2(resolvedPosition),
    globalPosition: event.globalPosition === undefined
      ? cloneVector2(resolvedPosition)
      : normalizePosition(event.globalPosition, `${fieldName}.globalPosition`)
  };

  if (relative !== undefined) {
    output.relative = cloneVector2(relative);
  }

  if (buttonMask !== undefined) {
    output.buttonMask = buttonMask;
  }

  applyCommonMouseFields(output, event, fieldName);
  return output;
}
