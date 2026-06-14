import {
  CONNECTION_PROPERTIES
} from "../../shared/bridge-schema.js";

export const RUNTIME_EVENTS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    limit: {
      type: "integer",
      description: "Maximum runtime/debugger events to return. Defaults to 100 and is capped by the editor bridge."
    },
    kinds: {
      type: "array",
      items: { type: "string" },
      description: "Optional event kind filter, for example ['session_started', 'runtime_state']."
    },
    sinceMsec: {
      type: "number",
      description: "Only return events with timeMsec greater than this value. Defaults to -1, meaning no lower bound."
    }
  },
  additionalProperties: false
};

export const RUNTIME_NODE_PROPERTIES_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Runtime node path, for example /root/Player. Defaults to /root."
    },
    timeoutMsec: {
      type: "number",
      description: "How long the MCP client should poll for the debugger response. Defaults to 3000."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between runtime property polling requests. Defaults to 100."
    }
  },
  additionalProperties: false
};

export const SET_RUNTIME_NODE_PROPERTY_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Runtime node path, for example /root/Player."
    },
    property: {
      type: "string",
      description: "Runtime node property name to set, for example visible or name."
    },
    value: {
      description: "JSON value to set. Typed values may use { type: 'Vector3', x, y, z }, { type: 'Color', r, g, b, a }, or { type: 'NodePath', path }."
    },
    timeoutMsec: {
      type: "number",
      description: "How long the MCP client should poll for the debugger response. Defaults to 3000."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between runtime property polling requests. Defaults to 100."
    }
  },
  required: ["nodePath", "property", "value"],
  additionalProperties: false
};

export const RUNTIME_SCREENSHOT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    timeoutMsec: {
      type: "number",
      description: "How long the MCP client should poll for the runtime screenshot response. Defaults to 3000."
    },
    pollIntervalMsec: {
      type: "number",
      description: "Delay between runtime screenshot polling requests. Defaults to 100."
    }
  },
  additionalProperties: false
};
