import {
  BATCH_FILESYSTEM_OPERATIONS_SCHEMA,
  BRIDGE_INPUT_SCHEMA,
  COPY_FILESYSTEM_ENTRY_SCHEMA,
  FILESYSTEM_LIST_SCHEMA,
  FILESYSTEM_PATH_SCHEMA,
  MOVE_FILESYSTEM_ENTRY_SCHEMA,
  WRITE_BINARY_FILE_SCHEMA,
  WRITE_TEXT_FILE_SCHEMA
} from "./schemas.js";

export const FILESYSTEM_TOOL_MANIFEST = [
  {
    name: "get_filesystem_dock_state",
    description: "Read visible Godot FileSystem dock selection, current path/current directory, and scan progress.",
    profile: "full",
    category: "filesystem",
    inputSchema: BRIDGE_INPUT_SCHEMA,
    bridge: {
      clientMethod: "getFilesystemDockState",
      endpoint: "/filesystem/state",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/filesystem/state",
      handler: "_filesystem_state",
      arg: "none"
    },
    conformance: {
      happy: "read FileSystem dock state",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads visible Godot FileSystem dock selection, path, and scan progress."
    }
  },
  {
    name: "list_filesystem",
    description: "List Godot FileSystem dock entries under a res:// path.",
    profile: "full",
    category: "filesystem",
    inputSchema: FILESYSTEM_LIST_SCHEMA,
    bridge: {
      clientMethod: "listFilesystem",
      endpoint: "/filesystem/list",
      method: "GET",
      request: "query",
      query: {
        fields: {
          path: {
            default: "res://"
          },
          recursive: {
            default: false,
            type: "boolean"
          }
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/filesystem/list",
      handler: "_list_filesystem",
      arg: "query"
    },
    conformance: {
      happy: "list FileSystem entries under a res:// path",
      error: "reject paths outside the project filesystem"
    },
    docs: {
      summary: "Lists Godot FileSystem dock entries under a res:// path."
    }
  },
  {
    name: "create_folder",
    description: "Create a folder under the Godot project res:// filesystem.",
    profile: "full",
    category: "filesystem",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "createFolder",
      endpoint: "/filesystem/folder/create",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/filesystem/folder/create",
      handler: "_create_folder",
      arg: "body",
      methodError: "folder creation requires POST"
    },
    conformance: {
      happy: "create a folder under res://",
      error: "reject paths outside the project filesystem"
    },
    docs: {
      summary: "Creates a folder under the Godot project res:// filesystem."
    }
  },
  {
    name: "read_text_file",
    description: "Read a UTF-8 text file from the Godot project res:// filesystem.",
    profile: "full",
    category: "filesystem",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "readTextFile",
      endpoint: "/filesystem/file/read",
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
      endpoint: "/filesystem/file/read",
      handler: "_read_text_file",
      arg: "query"
    },
    conformance: {
      happy: "read a UTF-8 text file under res://",
      error: "reject missing or non-text file paths"
    },
    docs: {
      summary: "Reads a UTF-8 text file from the Godot project filesystem."
    }
  },
  {
    name: "write_text_file",
    description: "Write a UTF-8 text file under the Godot project res:// filesystem.",
    profile: "full",
    category: "filesystem",
    inputSchema: WRITE_TEXT_FILE_SCHEMA,
    bridge: {
      clientMethod: "writeTextFile",
      endpoint: "/filesystem/file/write",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/filesystem/file/write",
      handler: "_write_text_file",
      arg: "body",
      methodError: "file write requires POST"
    },
    conformance: {
      happy: "write a UTF-8 text file under res://",
      error: "reject paths outside the project filesystem"
    },
    docs: {
      summary: "Writes a UTF-8 text file under the project res:// filesystem."
    }
  },
  {
    name: "write_binary_file",
    description: "Write a base64-encoded binary file under the Godot project res:// filesystem.",
    profile: "full",
    category: "filesystem",
    inputSchema: WRITE_BINARY_FILE_SCHEMA,
    bridge: {
      clientMethod: "writeBinaryFile",
      endpoint: "/filesystem/file/write-binary",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/filesystem/file/write-binary",
      handler: "_write_binary_file",
      arg: "body",
      methodError: "binary file write requires POST"
    },
    conformance: {
      happy: "write a binary file under res://",
      error: "reject invalid base64 content"
    },
    docs: {
      summary: "Writes a base64-encoded binary file under the project filesystem."
    }
  },
  {
    name: "move_filesystem_entry",
    description: "Move or rename a file or folder under the Godot project res:// filesystem.",
    profile: "full",
    category: "filesystem",
    inputSchema: MOVE_FILESYSTEM_ENTRY_SCHEMA,
    bridge: {
      clientMethod: "moveFilesystemEntry",
      endpoint: "/filesystem/move",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/filesystem/move",
      handler: "_move_filesystem_entry",
      arg: "body",
      methodError: "filesystem move requires POST"
    },
    conformance: {
      happy: "move or rename a filesystem entry",
      error: "reject missing source or conflicting destination paths"
    },
    docs: {
      summary: "Moves or renames a file or folder under res://."
    }
  },
  {
    name: "copy_filesystem_entry",
    description: "Copy a file or folder under the Godot project res:// filesystem.",
    profile: "full",
    category: "filesystem",
    inputSchema: COPY_FILESYSTEM_ENTRY_SCHEMA,
    bridge: {
      clientMethod: "copyFilesystemEntry",
      endpoint: "/filesystem/copy",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/filesystem/copy",
      handler: "_copy_filesystem_entry",
      arg: "body",
      methodError: "filesystem copy requires POST"
    },
    conformance: {
      happy: "copy a filesystem entry",
      error: "reject missing source or conflicting destination paths"
    },
    docs: {
      summary: "Copies a file or folder under res://."
    }
  },
  {
    name: "batch_filesystem_operations",
    description: "Run ordered copy, move, and delete operations under the Godot project res:// filesystem.",
    profile: "full",
    category: "filesystem",
    inputSchema: BATCH_FILESYSTEM_OPERATIONS_SCHEMA,
    bridge: {
      clientMethod: "batchFilesystemOperations",
      endpoint: "/filesystem/batch",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/filesystem/batch",
      handler: "_batch_filesystem_operations",
      arg: "body",
      methodError: "filesystem batch requires POST"
    },
    conformance: {
      happy: "run ordered filesystem batch operations",
      error: "report per-operation validation failures"
    },
    docs: {
      summary: "Runs ordered copy, move, and delete operations under res://."
    }
  },
  {
    name: "delete_filesystem_entry",
    description: "Delete a file or empty folder under the Godot project res:// filesystem.",
    profile: "full",
    category: "filesystem",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "deleteFilesystemEntry",
      endpoint: "/filesystem/delete",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/filesystem/delete",
      handler: "_delete_filesystem_entry",
      arg: "body",
      methodError: "filesystem delete requires POST"
    },
    conformance: {
      happy: "delete a file or empty folder under res://",
      error: "reject missing or non-empty folder paths"
    },
    docs: {
      summary: "Deletes a file or empty folder under res://."
    }
  }
];
