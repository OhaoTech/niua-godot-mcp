import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";
import { SAVE_PATH_PROPERTY } from "../../shared/screenshot-io.js";
import { VIEWPORT_TARGET_PROPERTIES } from "./shared.js";

export const VIEWPORT_SCREENSHOT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    ...SAVE_PATH_PROPERTY,
    viewport: VIEWPORT_TARGET_PROPERTIES.viewport.capture,
    index: VIEWPORT_TARGET_PROPERTIES.index
  },
  additionalProperties: false
};

export const EDITOR_SCREENSHOT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    ...SAVE_PATH_PROPERTY
  },
  additionalProperties: false
};
