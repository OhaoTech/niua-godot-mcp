import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";
import { VIEWPORT_TARGET_PROPERTIES } from "./shared.js";

export const VIEWPORT_SCREENSHOT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    viewport: VIEWPORT_TARGET_PROPERTIES.viewport.capture,
    index: VIEWPORT_TARGET_PROPERTIES.index
  },
  additionalProperties: false
};
