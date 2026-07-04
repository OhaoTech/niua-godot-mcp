import { RUNTIME_BASE_BRIDGE_METHODS } from "./runtime/base.js";
import { RUNTIME_INPUT_BRIDGE_METHODS } from "./runtime/input.js";
import { RUNTIME_NODE_METHOD_BRIDGE_METHODS } from "./runtime/node-methods.js";
import { RUNTIME_NODE_PROPERTY_BRIDGE_METHODS } from "./runtime/node-properties.js";
import { RUNTIME_SCREENSHOT_BRIDGE_METHODS } from "./runtime/screenshots.js";

export const RUNTIME_BRIDGE_METHODS = {
  ...RUNTIME_BASE_BRIDGE_METHODS,
  ...RUNTIME_NODE_PROPERTY_BRIDGE_METHODS,
  ...RUNTIME_NODE_METHOD_BRIDGE_METHODS,
  ...RUNTIME_SCREENSHOT_BRIDGE_METHODS,
  ...RUNTIME_INPUT_BRIDGE_METHODS
};
