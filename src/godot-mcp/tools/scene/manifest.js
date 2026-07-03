import { BRIDGE_INPUT_SCHEMA, CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";
import {
  CLOSE_SCENE_SCHEMA,
  CREATE_SCENE_SCHEMA,
  EDITOR_UNDO_REDO_SCHEMA,
  SCENE_PATH_SCHEMA,
  SCENE_TAB_PATH_SCHEMA
} from "./tabs/schemas.js";

const SET_SELECTION_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePaths: {
      type: "array",
      description: "Scene-tree node paths under the edited scene root. Empty array clears selection.",
      items: {
        type: "string"
      }
    }
  },
  required: ["nodePaths"],
  additionalProperties: false
};

const SCENE_TREE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    maxDepth: {
      type: "number",
      description: "Maximum tree depth to return. 0 or omitted means the full tree; truncated nodes report childrenTruncated."
    },
    pathFilter: {
      type: "string",
      description: "Only return the subtree rooted at this node path under the scene root."
    }
  },
  additionalProperties: false
};

const FOCUS_NODE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    nodePath: {
      type: "string",
      description: "Scene-tree node path under the edited scene root."
    }
  },
  required: ["nodePath"],
  additionalProperties: false
};

export const SCENE_STATE_TOOL_NAMES = [
  "get_editor_state",
  "get_project_info",
  "get_scene_tree",
  "get_open_scene_tabs",
  "get_selection",
  "set_selection",
  "focus_node"
];

export const SCENE_TAB_TOOL_NAMES = [
  "open_scene",
  "create_scene",
  "save_scene_as",
  "switch_scene_tab",
  "close_scene",
  "mark_scene_unsaved",
  "undo_editor_action",
  "redo_editor_action"
];

export const SCENE_SAVE_TOOL_NAMES = [
  "save_current_scene"
];

export const SCENE_TOOL_MANIFEST = [
  {
    name: "get_editor_state",
    description: "Read current visible Godot editor state from the NIUA editor plugin bridge.",
    profile: "full",
    category: "scene",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "getEditorState",
      endpoint: "/editor/state",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/editor/state",
      handler: "_editor_state",
      arg: "none"
    },
    conformance: {
      happy: "read visible editor state",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads current visible Godot editor state from the plugin bridge."
    }
  },
  {
    name: "get_project_info",
    description: "Read the active Godot project root and project metadata from the editor bridge.",
    profile: "full",
    category: "scene",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "getProjectInfo",
      endpoint: "/project/info",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/project/info",
      handler: "_project_info",
      arg: "none"
    },
    conformance: {
      happy: "read active project metadata",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads active Godot project root and metadata."
    }
  },
  {
    name: "get_scene_tree",
    description: "Read the current scene tree from the visible Godot editor.",
    profile: "full",
    category: "scene",
    inputSchema: SCENE_TREE_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "getSceneTree",
      endpoint: "/scene/tree",
      method: "GET",
      request: "query",
      query: {
        fields: {
          maxDepth: {},
          pathFilter: { omitEmpty: true }
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/scene/tree",
      handler: "_scene_tree",
      arg: "query"
    },
    conformance: {
      happy: "read the current scene tree",
      error: "report bridge recovery guidance when no scene is open"
    },
    docs: {
      summary: "Reads the current scene tree from the visible editor."
    }
  },
  {
    name: "get_open_scene_tabs",
    description: "Read ordered open scene tabs and the current visible Godot scene tab.",
    profile: "full",
    category: "scene",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "getOpenSceneTabs",
      endpoint: "/scene/tabs",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/scene/tabs",
      handler: "_open_scene_tabs",
      arg: "none"
    },
    conformance: {
      happy: "read open scene tabs",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads ordered open scene tabs and current tab metadata."
    }
  },
  {
    name: "get_selection",
    description: "Read the current editor selection from the visible Godot editor, including per-node parent, owner, sibling, group, and metadata-key context.",
    profile: "full",
    category: "scene",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "getSelection",
      endpoint: "/selection",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/selection",
      handler: "_selection",
      arg: "none"
    },
    conformance: {
      happy: "read the current editor selection",
      error: "return an empty selection when no nodes are selected"
    },
    docs: {
      summary: "Reads current editor selection and per-node context."
    }
  },
  {
    name: "set_selection",
    description: "Replace the visible Godot editor node selection with one or more scene-tree nodes.",
    profile: "full",
    category: "scene",
    inputSchema: SET_SELECTION_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "setSelection",
      endpoint: "/selection/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/selection/set",
      handler: "_set_selection",
      arg: "body",
      methodError: "selection update requires POST"
    },
    conformance: {
      happy: "replace the editor node selection",
      error: "reject invalid scene-tree node paths"
    },
    docs: {
      summary: "Replaces the visible editor node selection."
    }
  },
  {
    name: "focus_node",
    description: "Select and focus a scene-tree node in the visible Godot editor.",
    profile: "full",
    category: "scene",
    inputSchema: FOCUS_NODE_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "focusNode",
      endpoint: "/selection/focus/node",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/selection/focus/node",
      handler: "_focus_node",
      arg: "body",
      methodError: "node focus requires POST"
    },
    conformance: {
      happy: "select and focus a scene-tree node",
      error: "reject an invalid scene-tree node path"
    },
    docs: {
      summary: "Selects and focuses a scene-tree node in the visible editor."
    }
  },
  {
    name: "open_scene",
    description: "Open an existing scene in the visible Godot editor.",
    profile: "full",
    category: "scene",
    inputSchema: SCENE_PATH_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "openScene",
      endpoint: "/scene/open",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/open",
      handler: "_open_scene",
      arg: "body",
      methodError: "scene open requires POST"
    },
    conformance: {
      happy: "open an existing scene",
      error: "reject a missing or non-scene path"
    },
    docs: {
      summary: "Opens an existing scene in the visible editor."
    }
  },
  {
    name: "create_scene",
    description: "Create a new scene file with a configurable root node and optionally open it in the visible Godot editor.",
    profile: "full",
    category: "scene",
    inputSchema: CREATE_SCENE_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "createScene",
      endpoint: "/scene/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/create",
      handler: "_create_scene",
      arg: "body",
      methodError: "scene creation requires POST"
    },
    conformance: {
      happy: "create a new scene file",
      error: "reject invalid scene paths or existing files without overwrite"
    },
    docs: {
      summary: "Creates a new scene file with a configurable root node."
    }
  },
  {
    name: "save_scene_as",
    description: "Save the current edited scene to a new scene path under res://.",
    profile: "full",
    category: "scene",
    inputSchema: SCENE_PATH_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "saveSceneAs",
      endpoint: "/scene/save-as",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/save-as",
      handler: "_save_scene_as",
      arg: "body",
      methodError: "scene save-as requires POST"
    },
    conformance: {
      happy: "save the current scene to a new path",
      error: "reject invalid scene paths"
    },
    docs: {
      summary: "Saves the current edited scene to a new scene path."
    }
  },
  {
    name: "switch_scene_tab",
    description: "Switch the visible Godot editor to an open scene tab, opening it if needed.",
    profile: "full",
    category: "scene",
    inputSchema: SCENE_TAB_PATH_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "switchSceneTab",
      endpoint: "/scene/switch",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/switch",
      handler: "_switch_scene_tab",
      arg: "body",
      methodError: "scene switch requires POST"
    },
    conformance: {
      happy: "switch to an open scene tab",
      error: "reject invalid scene paths"
    },
    docs: {
      summary: "Switches the visible editor to an open scene tab."
    }
  },
  {
    name: "close_scene",
    description: "Close the current Godot scene tab, optionally switching to and saving a target scene first.",
    profile: "full",
    category: "scene",
    inputSchema: CLOSE_SCENE_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "closeScene",
      endpoint: "/scene/close",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/close",
      handler: "_close_scene_tab",
      arg: "body",
      methodError: "scene close requires POST"
    },
    conformance: {
      happy: "close the current or target scene tab",
      error: "reject invalid target scene paths"
    },
    docs: {
      summary: "Closes the current or target Godot scene tab."
    }
  },
  {
    name: "mark_scene_unsaved",
    description: "Mark the current or target Godot scene tab as unsaved for dirty-state workflows.",
    profile: "full",
    category: "scene",
    inputSchema: SCENE_TAB_PATH_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "markSceneUnsaved",
      endpoint: "/scene/mark-unsaved",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/mark-unsaved",
      handler: "_mark_scene_unsaved",
      arg: "body",
      methodError: "scene mark-unsaved requires POST"
    },
    conformance: {
      happy: "mark a scene tab unsaved",
      error: "reject invalid target scene paths"
    },
    docs: {
      summary: "Marks the current or target scene tab as unsaved."
    }
  },
  {
    name: "undo_editor_action",
    description: "Undo the current Godot editor scene/history action, optionally targeting a historyId from get_open_scene_tabs.",
    profile: "full",
    category: "scene",
    inputSchema: EDITOR_UNDO_REDO_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "undoEditorAction",
      endpoint: "/editor/undo",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/editor/undo",
      handler: "_undo_editor_action",
      arg: "body",
      methodError: "editor undo requires POST"
    },
    conformance: {
      happy: "undo the current editor history action",
      error: "return a no-op result when no undo is available"
    },
    docs: {
      summary: "Undoes the current Godot editor scene/history action."
    }
  },
  {
    name: "redo_editor_action",
    description: "Redo the current Godot editor scene/history action, optionally targeting a historyId from get_open_scene_tabs.",
    profile: "full",
    category: "scene",
    inputSchema: EDITOR_UNDO_REDO_SCHEMA,
    bridge: {
      owner: "editor",
      clientMethod: "redoEditorAction",
      endpoint: "/editor/redo",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/editor/redo",
      handler: "_redo_editor_action",
      arg: "body",
      methodError: "editor redo requires POST"
    },
    conformance: {
      happy: "redo the current editor history action",
      error: "return a no-op result when no redo is available"
    },
    docs: {
      summary: "Redoes the current Godot editor scene/history action."
    }
  },
  {
    name: "save_current_scene",
    description: "Save the current edited Godot scene.",
    profile: "full",
    category: "scene",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      owner: "scene",
      clientMethod: "saveCurrentScene",
      endpoint: "/scene/save",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/scene/save",
      handler: "_save_current_scene",
      arg: "body",
      methodError: "scene save requires POST"
    },
    conformance: {
      happy: "save the current edited scene",
      error: "return an editor error when no scene is open"
    },
    docs: {
      summary: "Saves the current edited Godot scene."
    }
  }
];

export const SCENE_STATE_TOOL_MANIFEST = manifestByNames(SCENE_STATE_TOOL_NAMES);
export const SCENE_TAB_TOOL_MANIFEST = manifestByNames(SCENE_TAB_TOOL_NAMES);
export const SCENE_SAVE_TOOL_MANIFEST = manifestByNames(SCENE_SAVE_TOOL_NAMES);
export const SCENE_BRIDGE_TOOL_MANIFEST = SCENE_TOOL_MANIFEST
  .filter((entry) => entry.bridge.owner === "scene");

function manifestByNames(names) {
  const byName = new Map(SCENE_TOOL_MANIFEST.map((entry) => [entry.name, entry]));
  return names.map((name) => byName.get(name));
}
