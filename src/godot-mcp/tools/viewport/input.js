import { normalizeNonNegativeInteger } from "../../shared/numbers.js";
import { normalizeEvents } from "./input/events.js";
import { normalizeBoolean, normalizeViewportName } from "./input/fields.js";

export function normalizeViewportInputPayload(payload = {}) {
  return {
    viewport: normalizeViewportName(payload.viewport),
    index: normalizeNonNegativeInteger(payload.index ?? 0, "index"),
    local: normalizeBoolean(payload.local, "local", true),
    notifyMouseEntered: normalizeBoolean(payload.notifyMouseEntered, "notifyMouseEntered", true),
    updateMouseCursorState: normalizeBoolean(payload.updateMouseCursorState, "updateMouseCursorState", true),
    events: normalizeEvents(payload.events)
  };
}

export async function sendViewportInput({ client, payload }) {
  return client.sendViewportInput(normalizeViewportInputPayload(payload));
}
