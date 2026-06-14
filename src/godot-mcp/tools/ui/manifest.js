import {
  APPLY_UI_THEME_OVERRIDE_SCHEMA,
  CONNECT_UI_SIGNAL_SCHEMA,
  CREATE_UI_CONTROL_SCHEMA,
  CREATE_UI_THEME_SCHEMA,
  SET_CONTROL_LAYOUT_SCHEMA
} from "./schemas.js";

export const UI_TOOL_MANIFEST = [
  {
    name: "create_ui_control",
    description: "Create a supported Godot Control node such as Label, Button, Panel, TextureRect, or common containers.",
    profile: "full",
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
    description: "Set anchors, offsets, minimum size, and size flags on a Godot Control node.",
    profile: "full",
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
      summary: "Sets anchors, offsets, minimum size, and size flags on a Control node."
    }
  },
  {
    name: "create_ui_theme",
    description: "Create a Godot Theme resource with curated font-size, color, constant, and StyleBoxFlat entries.",
    profile: "full",
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
    description: "Assign a Theme resource or per-node Control theme overrides such as font_size and font_color.",
    profile: "full",
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
