import { BRIDGE_INPUT_SCHEMA } from "../shared/bridge-schema.js";
import {
  ATTACH_SCRIPT_SCHEMA,
  CREATE_SCRIPT_SCHEMA,
  FILESYSTEM_PATH_SCHEMA,
  GOTO_SCRIPT_LINE_SCHEMA,
  PROJECT_SCRIPT_DIAGNOSTICS_SCHEMA,
  REPLACE_IN_SCRIPTS_SCHEMA,
  SCRIPT_DIAGNOSTICS_SCHEMA,
  WRITE_TEXT_FILE_SCHEMA
} from "./schemas.js";

export const SCRIPT_TOOL_MANIFEST = [
  {
    name: "read_script",
    description: "Read a GDScript file from the Godot project.",
    profile: "full",
    category: "scripts",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "readScript",
      endpoint: "/script/read",
      method: "GET",
      request: "query",
      query: {
        fields: {
          path: {}
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/script/read",
      handler: "_read_script",
      arg: "query"
    },
    conformance: {
      happy: "read a GDScript file",
      error: "reject missing or non-script paths"
    },
    docs: {
      summary: "Reads a GDScript file from the Godot project."
    }
  },
  {
    name: "write_script",
    description: "Write a GDScript file under res:// and refresh the Godot editor filesystem.",
    profile: "full",
    category: "scripts",
    inputSchema: WRITE_TEXT_FILE_SCHEMA,
    bridge: {
      clientMethod: "writeScript",
      endpoint: "/script/write",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/script/write",
      handler: "_write_script",
      arg: "body",
      methodError: "script write requires POST"
    },
    conformance: {
      happy: "write a GDScript file",
      error: "reject paths outside res://"
    },
    docs: {
      summary: "Writes a GDScript file under res:// and refreshes the editor filesystem."
    }
  },
  {
    name: "open_script",
    description: "Open a GDScript file in the visible Godot editor.",
    profile: "full",
    category: "scripts",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "openScript",
      endpoint: "/script/open",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/script/open",
      handler: "_open_script",
      arg: "body",
      methodError: "script open requires POST"
    },
    conformance: {
      happy: "open a GDScript file in the editor",
      error: "reject missing or non-script paths"
    },
    docs: {
      summary: "Opens a GDScript file in the visible Godot editor."
    }
  },
  {
    name: "validate_script",
    description: "Validate that a GDScript file can be loaded by Godot.",
    profile: "full",
    category: "scripts",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "validateScript",
      endpoint: "/script/validate",
      method: "GET",
      request: "query",
      query: {
        fields: {
          path: {}
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/script/validate",
      handler: "_validate_script",
      arg: "query"
    },
    conformance: {
      happy: "validate a GDScript file through Godot",
      error: "return parser/load errors for invalid scripts"
    },
    docs: {
      summary: "Validates that a GDScript file can be loaded by Godot."
    }
  },
  {
    name: "diagnose_script",
    description: "Run Godot's GDScript parser for a res:// script and return structured diagnostics.",
    profile: "full",
    category: "scripts",
    implementation: "local",
    inputSchema: SCRIPT_DIAGNOSTICS_SCHEMA,
    local: {
      handler: "diagnoseGodotScript"
    },
    conformance: {
      happy: "run the local Godot parser against one script",
      error: "return structured parser errors for invalid scripts"
    },
    docs: {
      summary: "Runs Godot's GDScript parser for one res:// script."
    }
  },
  {
    name: "diagnose_project_scripts",
    description: "Run Godot's GDScript parser across explicit or discovered project scripts and return aggregate diagnostics.",
    profile: "full",
    category: "scripts",
    implementation: "local",
    inputSchema: PROJECT_SCRIPT_DIAGNOSTICS_SCHEMA,
    local: {
      handler: "diagnoseGodotProjectScripts"
    },
    conformance: {
      happy: "run the local Godot parser across project scripts",
      error: "report aggregate parser failures and invalid script paths"
    },
    docs: {
      summary: "Runs Godot's GDScript parser across explicit or discovered project scripts."
    }
  },
  {
    name: "get_script_symbols",
    description: "Read Godot script symbol metadata including methods, properties, signals, and constants.",
    profile: "full",
    category: "scripts",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "getScriptSymbols",
      endpoint: "/script/symbols",
      method: "GET",
      request: "query",
      query: {
        fields: {
          path: {}
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/script/symbols",
      handler: "_script_symbols",
      arg: "query"
    },
    conformance: {
      happy: "read GDScript symbol metadata",
      error: "reject missing or non-script paths"
    },
    docs: {
      summary: "Reads Godot script symbol metadata."
    }
  },
  {
    name: "get_script_editor_state",
    description: "Read visible Godot Script Editor state including current script, open scripts, and breakpoints.",
    profile: "full",
    category: "scripts",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      clientMethod: "getScriptEditorState",
      endpoint: "/script/editor/state",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/script/editor/state",
      handler: "_script_editor_state",
      arg: "none"
    },
    conformance: {
      happy: "read visible Script Editor state",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads visible Script Editor state."
    }
  },
  {
    name: "get_script_cursor_state",
    description: "Read active Godot Script Editor caret, selection, and visible-line metadata.",
    profile: "full",
    category: "scripts",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      clientMethod: "getScriptCursorState",
      endpoint: "/script/cursor/state",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/script/cursor/state",
      handler: "_script_cursor_state",
      arg: "none"
    },
    conformance: {
      happy: "read active Script Editor cursor state",
      error: "return unavailable cursor details when no script is focused"
    },
    docs: {
      summary: "Reads active Script Editor caret, selection, and visible-line metadata."
    }
  },
  {
    name: "goto_script_line",
    description: "Open a script in the visible Godot Script Editor and focus a 1-based line number.",
    profile: "full",
    category: "scripts",
    inputSchema: GOTO_SCRIPT_LINE_SCHEMA,
    bridge: {
      clientMethod: "gotoScriptLine",
      endpoint: "/script/goto-line",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/script/goto-line",
      handler: "_goto_script_line",
      arg: "body",
      methodError: "script goto line requires POST"
    },
    conformance: {
      happy: "open a script and focus a line",
      error: "reject invalid paths or line numbers"
    },
    docs: {
      summary: "Opens a script and focuses a 1-based line number."
    }
  },
  {
    name: "replace_in_scripts",
    description: "Preview or apply a capped literal replacement across GDScript files in the Godot project.",
    profile: "full",
    category: "scripts",
    inputSchema: REPLACE_IN_SCRIPTS_SCHEMA,
    bridge: {
      clientMethod: "replaceInScripts",
      endpoint: "/script/refactor/replace",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/script/refactor/replace",
      handler: "_replace_in_scripts",
      arg: "body",
      methodError: "script replace requires POST"
    },
    conformance: {
      happy: "preview or apply literal replacement across scripts",
      error: "reject empty search terms or excessive replacements"
    },
    docs: {
      summary: "Previews or applies capped literal replacement across GDScript files."
    }
  },
  {
    name: "create_script",
    description: "Create a GDScript file using supplied content or a generated template with optional class_name.",
    profile: "full",
    category: "scripts",
    inputSchema: CREATE_SCRIPT_SCHEMA,
    bridge: {
      clientMethod: "createScript",
      endpoint: "/script/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/script/create",
      handler: "_create_script",
      arg: "body",
      methodError: "script creation requires POST"
    },
    conformance: {
      happy: "create a GDScript file",
      error: "reject invalid paths or existing files without overwrite"
    },
    docs: {
      summary: "Creates a GDScript file using supplied content or a generated template."
    }
  },
  {
    name: "attach_script",
    description: "Attach a GDScript file to a node in the current edited Godot scene.",
    profile: "full",
    category: "scripts",
    inputSchema: ATTACH_SCRIPT_SCHEMA,
    bridge: {
      clientMethod: "attachScript",
      endpoint: "/script/attach",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/script/attach",
      handler: "_attach_script",
      arg: "body",
      methodError: "script attachment requires POST"
    },
    conformance: {
      happy: "attach a script to a scene node",
      error: "reject invalid node or script paths"
    },
    docs: {
      summary: "Attaches a GDScript file to a node in the current edited scene."
    }
  }
];
