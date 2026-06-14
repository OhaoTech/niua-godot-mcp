import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

const VECTOR2_SCHEMA = {
  type: "object",
  properties: {
    x: { type: "number" },
    y: { type: "number" }
  },
  required: ["x", "y"],
  additionalProperties: false
};

const RECT_EDGE_SCHEMA = {
  type: "object",
  properties: {
    left: { type: "number" },
    top: { type: "number" },
    right: { type: "number" },
    bottom: { type: "number" }
  },
  additionalProperties: false
};

const STYLEBOX_SCHEMA = {
  type: "object",
  properties: {
    bgColor: {
      description: "JSON-encoded Color, for example { type: 'Color', r, g, b, a }."
    },
    borderColor: {
      description: "JSON-encoded Color, for example { type: 'Color', r, g, b, a }."
    },
    borderWidth: { type: "integer" },
    cornerRadius: { type: "integer" }
  },
  additionalProperties: false
};

const THEME_VALUES_SCHEMA = {
  type: "object",
  properties: {
    fontSizes: {
      type: "object",
      additionalProperties: { type: "integer" },
      description: "Theme font-size items keyed by theme item name, such as { font_size: 48 }."
    },
    colors: {
      type: "object",
      additionalProperties: true,
      description: "Theme colors keyed by item name. Values use JSON-encoded Color objects."
    },
    constants: {
      type: "object",
      additionalProperties: { type: "integer" },
      description: "Theme constants keyed by item name."
    },
    styleboxes: {
      type: "object",
      additionalProperties: STYLEBOX_SCHEMA,
      description: "Theme StyleBoxFlat entries keyed by item name."
    }
  },
  additionalProperties: false
};

const LAYOUT_PROPERTIES = {
  preset: {
    type: "string",
    enum: [
      "full_rect",
      "center",
      "top_left",
      "top_wide",
      "bottom_wide",
      "left_wide",
      "right_wide"
    ],
    description: "Optional Godot Control layout preset."
  },
  keepOffsets: {
    type: "boolean",
    description: "When using preset, preserve offsets. Defaults to false."
  },
  anchors: RECT_EDGE_SCHEMA,
  offsets: RECT_EDGE_SCHEMA,
  customMinimumSize: VECTOR2_SCHEMA,
  horizontalSizeFlags: {
    type: "string",
    enum: ["shrink_begin", "fill", "expand", "expand_fill", "shrink_center", "shrink_end"]
  },
  verticalSizeFlags: {
    type: "string",
    enum: ["shrink_begin", "fill", "expand", "expand_fill", "shrink_center", "shrink_end"]
  }
};

const LAYOUT_SCHEMA = {
  type: "object",
  properties: LAYOUT_PROPERTIES,
  additionalProperties: false
};

export const CREATE_UI_CONTROL_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    type: {
      type: "string",
      enum: [
        "Control",
        "VBoxContainer",
        "HBoxContainer",
        "MarginContainer",
        "CenterContainer",
        "Label",
        "Button",
        "Panel",
        "TextureRect"
      ],
      description: "Supported UI/Control node type to create."
    },
    name: { type: "string" },
    parentPath: {
      type: "string",
      description: "Parent path under the edited scene root. Empty string means the scene root."
    },
    text: {
      type: "string",
      description: "Text for Label or Button nodes."
    },
    tooltip: {
      type: "string",
      description: "Control tooltip text."
    },
    texturePath: {
      type: "string",
      description: "Texture resource path for TextureRect nodes."
    },
    layout: LAYOUT_SCHEMA
  },
  required: ["type"],
  additionalProperties: false
};

export const SET_CONTROL_LAYOUT_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Control node path under the edited scene root."
    },
    ...LAYOUT_PROPERTIES
  },
  required: ["nodePath"],
  additionalProperties: false
};

export const CREATE_UI_THEME_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    path: {
      type: "string",
      description: "Theme resource path under res://."
    },
    overwrite: { type: "boolean" },
    defaultFontSize: {
      type: "integer",
      description: "Theme default font size."
    },
    typeStyles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          typeName: {
            type: "string",
            description: "Godot theme type name, such as Label, Button, or Control."
          },
          ...THEME_VALUES_SCHEMA.properties
        },
        required: ["typeName"],
        additionalProperties: false
      }
    },
    applyToNodePath: {
      type: "string",
      description: "Optional Control node path to receive the created Theme."
    }
  },
  required: ["path"],
  additionalProperties: false
};

export const APPLY_UI_THEME_OVERRIDE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Control node path under the edited scene root."
    },
    themePath: {
      type: "string",
      description: "Optional Theme resource path to assign to the node."
    },
    themeTypeVariation: {
      type: "string",
      description: "Optional Control theme_type_variation value."
    },
    ...THEME_VALUES_SCHEMA.properties
  },
  required: ["nodePath"],
  additionalProperties: false
};

export const CONNECT_UI_SIGNAL_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    sourcePath: {
      type: "string",
      description: "Source Control node path under the edited scene root."
    },
    signalName: {
      type: "string",
      description: "Signal to connect, such as pressed."
    },
    targetPath: {
      type: "string",
      description: "Target node path under the edited scene root."
    },
    methodName: {
      type: "string",
      description: "Target script method name."
    }
  },
  required: ["sourcePath", "signalName", "targetPath", "methodName"],
  additionalProperties: false
};
