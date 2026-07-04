import {
  EDITOR_MAIN_SCREEN_SCHEMA,
  EDITOR_SCREENSHOT_SCHEMA,
  INVOKE_EDITOR_ACTION_SCHEMA,
  VIEWPORT_CAMERA_SCHEMA,
  VIEWPORT_INPUT_SCHEMA,
  VIEWPORT_SCREENSHOT_SCHEMA
} from "./schemas.js";

export const VIEWPORT_TOOL_MANIFEST = [
  {
    name: "capture_editor_screenshot",
    description: "Capture a PNG screenshot of the visible Godot editor. Pass savePath to write the PNG to disk and keep large base64 payloads out of the tool result. Returns available=false when the active renderer cannot expose editor pixels, such as headless mode.",
    profile: "full",
    tier: "standard",
    category: "viewport",
    inputSchema: EDITOR_SCREENSHOT_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "captureEditorScreenshot",
      endpoint: "/editor/screenshot",
      method: "GET",
      request: "none"
    },
    adapter: {
      handler: "captureEditorScreenshot"
    },
    godotRoute: {
      side: "read",
      endpoint: "/editor/screenshot",
      handler: "_capture_editor_screenshot",
      arg: "none"
    },
    conformance: {
      happy: "capture a visible editor screenshot",
      error: "return available=false when editor pixels are unavailable"
    },
    docs: {
      summary: "Captures a PNG screenshot of the visible Godot editor."
    }
  },
  {
    name: "capture_viewport_screenshot",
    description: "Capture a PNG screenshot from the Godot editor 2D or 3D viewport. Pass savePath to write the PNG to disk and keep large base64 payloads out of the tool result. Returns available=false when the active renderer cannot expose viewport pixels, such as headless mode.",
    profile: "full",
    tier: "standard",
    category: "viewport",
    inputSchema: VIEWPORT_SCREENSHOT_SCHEMA,
    bridge: {
      owner: "viewport",
      clientMethod: "captureViewportScreenshot",
      endpoint: "/viewport/screenshot",
      method: "GET",
      request: "query",
      query: {
        fields: {
          viewport: { default: "3d" },
          index: { default: 0 }
        }
      }
    },
    adapter: {
      handler: "captureViewportScreenshot"
    },
    godotRoute: {
      side: "read",
      endpoint: "/viewport/screenshot",
      handler: "_capture_viewport_screenshot",
      arg: "query"
    },
    conformance: {
      happy: "capture a visible 2D or 3D viewport screenshot",
      error: "return available=false when viewport pixels are unavailable"
    },
    docs: {
      summary: "Captures a PNG screenshot from the Godot editor 2D or 3D viewport."
    }
  },
  {
    name: "get_viewport_state",
    description: "Read Godot editor 2D or 3D viewport size and active camera metadata when exposed by the editor.",
    profile: "full",
    tier: "standard",
    category: "viewport",
    inputSchema: VIEWPORT_SCREENSHOT_SCHEMA,
    bridge: {
      owner: "viewport",
      clientMethod: "getViewportState",
      endpoint: "/viewport/state",
      method: "GET",
      request: "query",
      query: {
        fields: {
          viewport: { default: "3d" },
          index: { default: 0 }
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/viewport/state",
      handler: "_viewport_state",
      arg: "query"
    },
    conformance: {
      happy: "read viewport size and active camera metadata",
      error: "return available=false when the requested viewport cannot be resolved"
    },
    docs: {
      summary: "Reads Godot editor 2D or 3D viewport size and active camera metadata."
    }
  },
  {
    name: "set_viewport_camera",
    description: "Move the active Godot editor 2D or 3D viewport camera, then return updated camera metadata.",
    profile: "full",
    tier: "standard",
    category: "viewport",
    inputSchema: VIEWPORT_CAMERA_SCHEMA,
    bridge: {
      owner: "viewport",
      clientMethod: "setViewportCamera",
      endpoint: "/viewport/camera/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/viewport/camera/set",
      handler: "_set_viewport_camera",
      arg: "body",
      methodError: "viewport camera update requires POST"
    },
    conformance: {
      happy: "update the active viewport camera",
      error: "reject invalid camera payloads or unavailable viewports"
    },
    docs: {
      summary: "Moves the active Godot editor 2D or 3D viewport camera."
    }
  },
  {
    name: "send_viewport_input",
    description: "Send mouse pointer events into a Godot editor 2D or 3D viewport using viewport-local coordinates.",
    profile: "full",
    tier: "standard",
    category: "viewport",
    inputSchema: VIEWPORT_INPUT_SCHEMA,
    bridge: {
      owner: "viewport",
      clientMethod: "sendViewportInput",
      endpoint: "/viewport/input/send",
      method: "POST",
      request: "body"
    },
    adapter: {
      handler: "sendViewportInput"
    },
    godotRoute: {
      side: "write",
      endpoint: "/viewport/input/send",
      handler: "_send_viewport_input",
      arg: "body",
      methodError: "viewport input send requires POST"
    },
    conformance: {
      happy: "send normalized pointer input events into the requested viewport",
      error: "reject invalid pointer event payloads"
    },
    docs: {
      summary: "Sends mouse pointer events into a Godot editor 2D or 3D viewport."
    }
  },
  {
    name: "set_editor_main_screen",
    description: "Switch the visible Godot editor main screen, such as 2D, 3D, Script, Game, or AssetLib.",
    profile: "full",
    tier: "standard",
    category: "viewport",
    inputSchema: EDITOR_MAIN_SCREEN_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "setEditorMainScreen",
      endpoint: "/editor/main-screen/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/editor/main-screen/set",
      handler: "_set_editor_main_screen",
      arg: "body",
      methodError: "editor main screen switch requires POST"
    },
    conformance: {
      happy: "switch the visible editor main screen",
      error: "reject unknown editor main screens"
    },
    docs: {
      summary: "Switches the visible Godot editor main screen."
    }
  },
  {
    name: "invoke_editor_action",
    description: "Invoke a conservative allowlisted Godot editor action such as select_file, filesystem_scan, reload_scene_from_path, save_scene, or set_distraction_free_mode.",
    profile: "full",
    tier: "essential",
    category: "viewport",
    inputSchema: INVOKE_EDITOR_ACTION_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "invokeEditorAction",
      endpoint: "/editor/action/invoke",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/editor/action/invoke",
      handler: "_invoke_editor_action",
      arg: "body",
      methodError: "editor action invoke requires POST"
    },
    conformance: {
      happy: "invoke an allowlisted editor action",
      error: "reject disallowed editor actions"
    },
    docs: {
      summary: "Invokes a conservative allowlisted Godot editor action."
    }
  }
];

export const VIEWPORT_BRIDGE_TOOL_MANIFEST = VIEWPORT_TOOL_MANIFEST
  .filter((entry) => entry.bridge.owner === "viewport");
