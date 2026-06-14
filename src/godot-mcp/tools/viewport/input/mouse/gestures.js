import { isPlainObject } from "../../../../shared/normalize.js";
import { normalizePositiveInteger } from "../fields.js";
import { normalizePosition } from "../vectors.js";
import {
  DEFAULT_MOUSE_BUTTON,
  buttonMaskForButtonIndex,
  normalizeMouseButton
} from "./buttons.js";
import { normalizeMouseMotion } from "./motion.js";

const MOUSE_CLICK_TYPE = "mouse_click";
const MOUSE_DRAG_TYPE = "mouse_drag";

export function normalizeMouseClick(event, fieldName) {
  if (!isPlainObject(event)) {
    throw new Error(`${fieldName} must be an object`);
  }

  const position = normalizePosition(event.position, `${fieldName}.position`);
  const buttonIndex = normalizePositiveInteger(event.buttonIndex, `${fieldName}.buttonIndex`, DEFAULT_MOUSE_BUTTON);
  const mask = buttonMaskForButtonIndex(buttonIndex);
  const common = {
    ...event,
    type: MOUSE_CLICK_TYPE,
    buttonIndex
  };

  return [
    normalizeMouseButton(common, fieldName, {
      position,
      pressed: true,
      buttonMask: mask
    }),
    normalizeMouseButton(common, fieldName, {
      position,
      pressed: false,
      buttonMask: 0
    })
  ];
}

export function normalizeMouseDrag(event, fieldName) {
  if (!isPlainObject(event)) {
    throw new Error(`${fieldName} must be an object`);
  }

  const from = normalizePosition(event.from, `${fieldName}.from`);
  const to = normalizePosition(event.to, `${fieldName}.to`);
  const buttonIndex = normalizePositiveInteger(event.buttonIndex, `${fieldName}.buttonIndex`, DEFAULT_MOUSE_BUTTON);
  const mask = buttonMaskForButtonIndex(buttonIndex);
  const common = {
    ...event,
    type: MOUSE_DRAG_TYPE,
    buttonIndex
  };
  const relative = {
    type: "Vector2",
    x: to.x - from.x,
    y: to.y - from.y
  };

  return [
    normalizeMouseMotion(common, fieldName, {
      position: from,
      relative: { type: "Vector2", x: 0, y: 0 },
      buttonMask: 0
    }),
    normalizeMouseButton(common, fieldName, {
      position: from,
      pressed: true,
      buttonMask: mask
    }),
    normalizeMouseMotion(common, fieldName, {
      position: to,
      relative,
      buttonMask: mask
    }),
    normalizeMouseButton(common, fieldName, {
      position: to,
      pressed: false,
      buttonMask: 0
    })
  ];
}
