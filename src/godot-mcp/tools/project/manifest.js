import {
  CLOSE_PROJECT_SCHEMA,
  CREATE_PROJECT_SCHEMA,
  DIAGNOSE_PROJECT_SETUP_SCHEMA,
  DISCOVER_EDITOR_BRIDGES_SCHEMA,
  DISCOVER_PROJECTS_SCHEMA,
  FORGET_PROJECT_SCHEMA,
  GET_OPEN_PROJECTS_SCHEMA,
  IMPORT_PROJECT_SCHEMA,
  INSTALL_PROJECT_ADDON_SCHEMA,
  LIST_KNOWN_PROJECTS_SCHEMA,
  LIST_SCENES_SCHEMA,
  OPEN_PROJECT_SCHEMA,
  OUTPUT_LOGS_SCHEMA
} from "./schemas.js";

export const PROJECT_LIFECYCLE_TOOL_MANIFEST = [
  {
    name: "create_project",
    description: "Create a local Godot project under an allowed root and optionally install the NIUA editor bridge addon.",
    profile: "v1",
    category: "project-management",
    implementation: "local",
    inputSchema: CREATE_PROJECT_SCHEMA,
    local: {
      handler: "createGodotProject"
    },
    conformance: {
      happy: "create a project.godot scaffold under an allowed root",
      error: "reject project roots outside the configured allowlist"
    },
    docs: {
      summary: "Creates a local Godot project under an allowed root and can install the NIUA editor bridge addon."
    }
  },
  {
    name: "open_project",
    description: "Launch a local Godot editor process for an allowlisted project and track its lifecycle.",
    profile: "v1",
    category: "project-management",
    implementation: "local",
    inputSchema: OPEN_PROJECT_SCHEMA,
    local: {
      handler: "openGodotProject"
    },
    conformance: {
      happy: "launch or reuse a tracked Godot editor process for an allowlisted project",
      error: "surface Godot executable, project, addon, or bridge startup failures"
    },
    docs: {
      summary: "Launches a local Godot editor process for an allowlisted project and tracks its lifecycle."
    }
  },
  {
    name: "get_open_projects",
    description: "List Godot editor processes launched by this MCP server.",
    profile: "full",
    category: "project-management",
    implementation: "local",
    inputSchema: GET_OPEN_PROJECTS_SCHEMA,
    local: {
      handler: "listOpenGodotProjects"
    },
    conformance: {
      happy: "list tracked Godot editor processes",
      error: "return an empty process list when no editors are tracked"
    },
    docs: {
      summary: "Lists Godot editor processes launched by this MCP server."
    }
  },
  {
    name: "close_project",
    description: "Terminate a Godot editor process launched by open_project.",
    profile: "v1",
    category: "project-management",
    implementation: "local",
    inputSchema: CLOSE_PROJECT_SCHEMA,
    local: {
      handler: "closeGodotProject"
    },
    conformance: {
      happy: "terminate a tracked Godot editor process",
      error: "reject unknown project ids or roots"
    },
    docs: {
      summary: "Terminates a Godot editor process launched by open_project."
    }
  },
  {
    name: "import_project",
    description: "Add an existing allowlisted Godot project to the local NIUA project registry without opening it.",
    profile: "full",
    category: "project-management",
    implementation: "local",
    inputSchema: IMPORT_PROJECT_SCHEMA,
    local: {
      handler: "importGodotProject"
    },
    conformance: {
      happy: "remember an existing allowlisted Godot project",
      error: "reject missing project.godot files or disallowed roots"
    },
    docs: {
      summary: "Adds an existing allowlisted Godot project to the local NIUA project registry without opening it."
    }
  },
  {
    name: "install_project_addon",
    description: "Install or repair the local NIUA Godot editor bridge addon for an existing allowlisted project.",
    profile: "full",
    category: "project-management",
    implementation: "local",
    inputSchema: INSTALL_PROJECT_ADDON_SCHEMA,
    local: {
      handler: "installProjectAddon"
    },
    conformance: {
      happy: "install or repair the NIUA editor bridge addon",
      error: "reject disallowed project roots or addon installation failures"
    },
    docs: {
      summary: "Installs or repairs the NIUA Godot editor bridge addon for an allowlisted project."
    }
  },
  {
    name: "list_known_projects",
    description: "List Godot projects persisted in the local NIUA project registry.",
    profile: "full",
    category: "project-management",
    implementation: "local",
    inputSchema: LIST_KNOWN_PROJECTS_SCHEMA,
    local: {
      handler: "listKnownGodotProjects"
    },
    conformance: {
      happy: "list projects persisted in the local registry",
      error: "return an empty list when the registry does not exist"
    },
    docs: {
      summary: "Lists Godot projects persisted in the local NIUA project registry."
    }
  },
  {
    name: "forget_project",
    description: "Remove an allowlisted Godot project from the local NIUA project registry.",
    profile: "full",
    category: "project-management",
    implementation: "local",
    inputSchema: FORGET_PROJECT_SCHEMA,
    local: {
      handler: "forgetGodotProject"
    },
    conformance: {
      happy: "remove an allowlisted project from the local registry",
      error: "reject unknown or disallowed project roots"
    },
    docs: {
      summary: "Removes an allowlisted Godot project from the local NIUA project registry."
    }
  },
  {
    name: "diagnose_project_setup",
    description: "Inspect whether an allowlisted Godot project has the NIUA MCP addon installed and enabled.",
    profile: "v1",
    category: "project-management",
    implementation: "local",
    inputSchema: DIAGNOSE_PROJECT_SETUP_SCHEMA,
    local: {
      handler: "diagnoseGodotProjectSetup"
    },
    conformance: {
      happy: "report addon file and plugin enablement readiness",
      error: "return recovery actions for missing or disabled bridge files"
    },
    docs: {
      summary: "Inspects whether an allowlisted Godot project has the NIUA MCP addon installed and enabled."
    }
  }
];

export const PROJECT_DISCOVERY_TOOL_MANIFEST = [
  {
    name: "discover_projects",
    description: "Scan allowlisted filesystem roots for Godot project.godot files and optionally remember them.",
    profile: "full",
    category: "project-management",
    implementation: "local",
    inputSchema: DISCOVER_PROJECTS_SCHEMA,
    local: {
      handler: "discoverGodotProjects"
    },
    conformance: {
      happy: "scan allowlisted roots for Godot projects",
      error: "reject roots outside the configured allowlist"
    },
    docs: {
      summary: "Scans allowlisted filesystem roots for Godot project.godot files and can remember them."
    }
  },
  {
    name: "discover_editor_bridges",
    description: "Probe local NIUA Godot editor bridge ports and map active bridges to projects.",
    profile: "full",
    category: "project-management",
    implementation: "local",
    inputSchema: DISCOVER_EDITOR_BRIDGES_SCHEMA,
    local: {
      handler: "discoverEditorBridges"
    },
    conformance: {
      happy: "probe configured local bridge ports and report active editors",
      error: "return inactive bridge diagnostics when ports do not respond"
    },
    docs: {
      summary: "Probes local NIUA Godot editor bridge ports and maps active bridges to projects."
    }
  },
  {
    name: "list_scenes",
    description: "List .tscn and .scn scene files under an allowlisted Godot project root.",
    profile: "full",
    category: "project-management",
    implementation: "local",
    inputSchema: LIST_SCENES_SCHEMA,
    local: {
      handler: "listScenes"
    },
    conformance: {
      happy: "list scene files under an allowlisted project root",
      error: "reject missing or disallowed project roots"
    },
    docs: {
      summary: "Lists .tscn and .scn scene files under an allowlisted Godot project root."
    }
  }
];

export const PROJECT_LOG_TOOL_MANIFEST = [
  {
    name: "get_output_logs",
    description: "Read recent Godot bridge logs, runtime log events, and stdout/stderr captured from local Godot editor processes launched by this MCP server.",
    profile: "v1",
    category: "project-management",
    implementation: "local",
    inputSchema: OUTPUT_LOGS_SCHEMA,
    local: {
      handler: "getGodotOutputLogs"
    },
    conformance: {
      happy: "read recent bridge, runtime, and tracked process output logs",
      error: "return empty logs when no matching project process is tracked"
    },
    docs: {
      summary: "Reads recent Godot bridge logs, structured runtime log events, and stdout/stderr from local editor processes launched by this MCP server."
    }
  }
];

export const PROJECT_MANAGEMENT_TOOL_MANIFEST = [
  ...PROJECT_LIFECYCLE_TOOL_MANIFEST,
  ...PROJECT_DISCOVERY_TOOL_MANIFEST,
  ...PROJECT_LOG_TOOL_MANIFEST
];
