import {
  FILESYSTEM_PATH_SCHEMA,
  IMPORT_ASSETS_SCHEMA,
  IMPORT_EVENTS_SCHEMA,
  IMPORT_PROJECT_ASSETS_SCHEMA,
  REIMPORT_ASSETS_SCHEMA,
  SET_IMPORT_OPTIONS_SCHEMA
} from "./schemas.js";

export const IMPORT_TOOL_MANIFEST = [
  {
    name: "import_project_assets",
    description: "Run a local Godot CLI import pass for an allowlisted project when the visible editor Import dock cannot safely import new source assets.",
    profile: "full",
    category: "import",
    implementation: "local",
    inputSchema: IMPORT_PROJECT_ASSETS_SCHEMA,
    local: {
      handler: "importProjectAssets"
    },
    conformance: {
      happy: "import project assets through the local Godot CLI",
      error: "reject missing or non-allowlisted project roots"
    },
    docs: {
      summary: "Runs Godot --headless --import --quit for an allowlisted project."
    }
  },
  {
    name: "list_imported_assets",
    description: "List assets with Godot .import metadata under a res:// folder.",
    profile: "full",
    category: "import",
    inputSchema: IMPORT_ASSETS_SCHEMA,
    bridge: {
      clientMethod: "listImportedAssets",
      endpoint: "/import/assets",
      method: "GET",
      request: "query",
      query: {
        fields: {
          path: { default: "res://" },
          recursive: { default: true, type: "boolean" }
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/import/assets",
      handler: "_list_imported_assets",
      arg: "query"
    },
    conformance: {
      happy: "list imported assets under a folder",
      error: "reject paths outside res://"
    },
    docs: {
      summary: "Lists assets with Godot .import metadata."
    }
  },
  {
    name: "get_import_metadata",
    description: "Read Godot .import sidecar metadata for an imported asset.",
    profile: "full",
    category: "import",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "getImportMetadata",
      endpoint: "/import/metadata",
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
      endpoint: "/import/metadata",
      handler: "_get_import_metadata",
      arg: "query"
    },
    conformance: {
      happy: "read .import metadata for an asset",
      error: "reject missing asset path"
    },
    docs: {
      summary: "Reads a Godot .import sidecar for an imported asset."
    }
  },
  {
    name: "get_import_diagnostics",
    description: "Diagnose Godot import sidecar health, generated target files, dependencies, and stale source metadata for an asset.",
    profile: "full",
    category: "import",
    inputSchema: FILESYSTEM_PATH_SCHEMA,
    bridge: {
      clientMethod: "getImportDiagnostics",
      endpoint: "/import/diagnostics",
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
      endpoint: "/import/diagnostics",
      handler: "_get_import_diagnostics",
      arg: "query"
    },
    conformance: {
      happy: "diagnose an imported asset",
      error: "reject missing asset path"
    },
    docs: {
      summary: "Diagnoses import sidecar health and generated files for an asset."
    }
  },
  {
    name: "set_import_options",
    description: "Update Godot import-dock options in an asset .import sidecar and optionally reimport the asset.",
    profile: "full",
    category: "import",
    inputSchema: SET_IMPORT_OPTIONS_SCHEMA,
    bridge: {
      clientMethod: "setImportOptions",
      endpoint: "/import/options/set",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/import/options/set",
      handler: "_set_import_options",
      arg: "body",
      methodError: "import option update requires POST"
    },
    conformance: {
      happy: "update import options for an asset",
      error: "reject empty import option maps"
    },
    docs: {
      summary: "Updates import-dock options in an asset .import sidecar."
    }
  },
  {
    name: "reimport_assets",
    description: "Ask the visible Godot editor to reimport one or more project assets.",
    profile: "full",
    category: "import",
    inputSchema: REIMPORT_ASSETS_SCHEMA,
    bridge: {
      clientMethod: "reimportAssets",
      endpoint: "/import/reimport",
      method: "POST",
      request: "body",
      timeout: {
        field: "timeoutMs",
        defaultMs: 120000,
        operationName: "reimport_assets",
        partialProgress: {
          requestedPaths: {
            field: "paths",
            transform: "arrayLength",
            fallback: 0
          }
        }
      }
    },
    godotRoute: {
      side: "write",
      endpoint: "/import/reimport",
      handler: "_reimport_assets",
      arg: "body",
      methodError: "asset reimport requires POST"
    },
    conformance: {
      happy: "reimport one or more assets",
      error: "report timeout progress context for long reimports"
    },
    docs: {
      summary: "Requests asset reimport through the visible Godot editor."
    }
  },
  {
    name: "get_import_events",
    description: "Read recent Godot Import dock and EditorFileSystem import/reimport events.",
    profile: "full",
    category: "import",
    inputSchema: IMPORT_EVENTS_SCHEMA,
    bridge: {
      clientMethod: "getImportEvents",
      endpoint: "/import/events",
      method: "GET",
      request: "query",
      query: {
        fields: {
          limit: {},
          kinds: { array: "csv", trim: true },
          sinceMsec: {}
        }
      }
    },
    godotRoute: {
      side: "read",
      endpoint: "/import/events",
      handler: "_import_events_response",
      arg: "query"
    },
    conformance: {
      happy: "read filtered import events",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Reads recent Import dock and EditorFileSystem import/reimport events."
    }
  }
];
