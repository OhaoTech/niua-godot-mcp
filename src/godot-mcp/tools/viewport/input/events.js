import { isPlainObject } from "../../../shared/normalize.js";
import {
  normalizeMouseButton,
  normalizeMouseClick,
  normalizeMouseDrag,
  normalizeMouseMotion
} from "./mouse.js";

const EVENT_TYPE_ALIASES = new Map([
  ["motion", "mouse_motion"],
  ["mouse_motion", "mouse_motion"],
  ["mousebutton", "mouse_button"],
  ["mouse_button", "mouse_button"],
  ["button", "mouse_button"],
  ["click", "mouse_click"],
  ["mouse_click", "mouse_click"],
  ["drag", "mouse_drag"],
  ["mouse_drag", "mouse_drag"]
]);

function normalizeEventType(rawType, fieldName) {
  const normalized = String(rawType ?? "").trim().toLowerCase();
  const type = EVENT_TYPE_ALIASES.get(normalized);
  if (!type) {
    throw new Error(`${fieldName} must be mouse_motion, mouse_button, mouse_click, or mouse_drag`);
  }
  return type;
}

export function normalizeEvents(events) {
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error("events must be a non-empty array");
  }

  return events.flatMap((event, index) => {
    if (!isPlainObject(event)) {
      throw new Error(`events[${index}] must be an object`);
    }

    const fieldName = `events[${index}]`;
    const type = normalizeEventType(event.type, `${fieldName}.type`);
    switch (type) {
      case "mouse_motion":
        return [normalizeMouseMotion(event, fieldName)];
      case "mouse_button":
        return [normalizeMouseButton(event, fieldName)];
      case "mouse_click":
        return normalizeMouseClick(event, fieldName);
      case "mouse_drag":
        return normalizeMouseDrag(event, fieldName);
      default:
        throw new Error(`${fieldName}.type is unsupported`);
    }
  });
}
