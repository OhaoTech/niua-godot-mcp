import {
  APPLY_UI_THEME_OVERRIDE_SCHEMA,
  CONNECT_UI_SIGNAL_SCHEMA,
  CREATE_UI_CONTROL_SCHEMA,
  CREATE_UI_THEME_SCHEMA,
  SET_CONTROL_LAYOUT_SCHEMA,
  SET_CONTROL_OFFSET_TRANSFORM_SCHEMA
} from "./schemas.js";

export const UI_TOOL_MANIFEST = [
  {
    name: "create_ui_control",
    description: "Create a supported Godot Control node such as Label, Button, Panel, TextureRect, or common containers.",
    profile: "full",
    tier: "standard",
    category: "ui",
    inputSchema: CREATE_UI_CONTROL_SCHEMA,
    bridge: {
      clientMethod: "createUiControl",
      endpoint: "/ui/control/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/ui/control/create",
      handler: "_create_ui_control",
      arg: "body",
      methodError: "UI control creation requires POST"
    },
    conformance: {
      happy: "create a supported Control node",
      error: "reject unsupported Control node types"
    },
    docs: {
      summary: "Creates a supported Godot Control node."
    }
  },
  {
    name: "set_control_layout",
    description: "Set anchors, offsets, minimum size, size flags, and Godot 4.7 Control offset transforms on a Godot Control node.",
    profile: "full",
    tier: "standard",
    category: "ui",
    inputSchema: SET_CONTROL_LAYOUT_SCHEMA,
    bridge: {
      clientMethod: "setControlLayout",
      endpoint: "/ui/control/layout",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/ui/control/layout",
      handler: "_set_control_layout",
      arg: "body",
      methodError: "UI control layout requires POST"
    },
    conformance: {
      happy: "set Control layout fields",
      error: "reject missing Control node paths"
    },
    docs: {
      summary: "Sets anchors, offsets, minimum size, size flags, and 4.7 offset transforms on a Control node."
    }
  },
  {
    name: "set_control_offset_transform",
    description: "Set Godot 4.7 Control offset transforms so a UI node can translate, rotate, or scale without fighting container layout.",
    profile: "full",
    tier: "standard",
    category: "ui",
    inputSchema: SET_CONTROL_OFFSET_TRANSFORM_SCHEMA,
    bridge: {
      clientMethod: "setControlOffsetTransform",
      endpoint: "/ui/control/offset-transform",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/ui/control/offset-transform",
      handler: "_set_control_offset_transform",
      arg: "body",
      methodError: "UI control offset transform requires POST"
    },
    conformance: {
      happy: "set Control offset transform fields",
      error: "reject missing Control node paths or editors older than Godot 4.7"
    },
    docs: {
      summary: "Applies Godot 4.7 Control offset transforms without changing container layout."
    }
  },
  {
    name: "create_ui_theme",
    stability: "experimental",
    description: "Create a Godot Theme resource with curated font-size, color, constant, and StyleBoxFlat entries.",
    profile: "full",
    tier: "standard",
    category: "ui",
    inputSchema: CREATE_UI_THEME_SCHEMA,
    bridge: {
      clientMethod: "createUiTheme",
      endpoint: "/ui/theme/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/ui/theme/create",
      handler: "_create_ui_theme",
      arg: "body",
      methodError: "UI theme creation requires POST"
    },
    conformance: {
      happy: "create a Theme resource",
      error: "reject theme paths outside res://"
    },
    docs: {
      summary: "Creates a Theme resource with curated theme entries."
    }
  },
  {
    name: "apply_ui_theme_override",
    stability: "experimental",
    description: "Assign a Theme resource or per-node Control theme overrides such as font_size and font_color.",
    profile: "full",
    tier: "standard",
    category: "ui",
    inputSchema: APPLY_UI_THEME_OVERRIDE_SCHEMA,
    bridge: {
      clientMethod: "applyUiThemeOverride",
      endpoint: "/ui/theme/override",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/ui/theme/override",
      handler: "_apply_ui_theme_override",
      arg: "body",
      methodError: "UI theme override requires POST"
    },
    conformance: {
      happy: "apply Control theme overrides",
      error: "reject missing Control node paths"
    },
    docs: {
      summary: "Assigns a Theme resource or applies per-node Control theme overrides."
    }
  },
  {
    name: "connect_ui_signal",
    description: "Connect a UI Control signal, for example Button.pressed, to a target script method.",
    profile: "full",
    tier: "standard",
    category: "ui",
    inputSchema: CONNECT_UI_SIGNAL_SCHEMA,
    bridge: {
      clientMethod: "connectUiSignal",
      endpoint: "/ui/signal/connect",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/ui/signal/connect",
      handler: "_connect_ui_signal",
      arg: "body",
      methodError: "UI signal connection requires POST"
    },
    conformance: {
      happy: "connect a Control signal to a target method",
      error: "reject missing source, target, or method names"
    },
    docs: {
      summary: "Connects a Control signal to a target script method."
    }
  }
];
