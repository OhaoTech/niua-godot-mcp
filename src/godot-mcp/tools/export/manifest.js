import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";
import {
  DIAGNOSE_EXPORT_TEMPLATES_SCHEMA,
  EXPORT_PROJECT_SCHEMA,
  UPSERT_EXPORT_PRESET_SCHEMA,
  VALIDATE_EXPORT_PRESET_SCHEMA
} from "./schemas.js";

const LIST_EXPORT_PRESETS_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES
  },
  additionalProperties: false
};

export const EXPORT_PRESET_TOOL_MANIFEST = [
  {
    name: "list_export_presets",
    stability: "experimental",
    description: "List Godot export presets configured in export_presets.cfg.",
    profile: "full",
    tier: "standard",
    category: "export",
    inputSchema: LIST_EXPORT_PRESETS_SCHEMA,
    bridge: {
      clientMethod: "listExportPresets",
      endpoint: "/export/presets",
      method: "GET",
      request: "none"
    },
    godotRoute: {
      side: "read",
      endpoint: "/export/presets",
      handler: "_export_presets",
      arg: "none"
    },
    conformance: {
      happy: "list configured export presets",
      error: "report bridge recovery guidance when the editor bridge is down"
    },
    docs: {
      summary: "Lists Godot export presets configured in export_presets.cfg."
    }
  },
  {
    name: "upsert_export_preset",
    stability: "experimental",
    description: "Create or update a Godot export preset through the visible editor bridge.",
    profile: "full",
    tier: "standard",
    category: "export",
    inputSchema: UPSERT_EXPORT_PRESET_SCHEMA,
    bridge: {
      clientMethod: "upsertExportPreset",
      endpoint: "/export/preset/upsert",
      method: "POST",
      request: "body"
    },
    godotRoute: {
      side: "write",
      endpoint: "/export/preset/upsert",
      handler: "_upsert_export_preset",
      arg: "body",
      methodError: "export preset upsert requires POST"
    },
    conformance: {
      happy: "create or update an export preset",
      error: "reject missing export preset name or platform"
    },
    docs: {
      summary: "Creates or updates a Godot export preset through the editor bridge."
    }
  }
];

export const EXPORT_LOCAL_TOOL_MANIFEST = [
  {
    name: "diagnose_export_templates",
    stability: "experimental",
    description: "Diagnose whether local Godot export templates are installed for the MCP Godot version.",
    profile: "full",
    tier: "standard",
    category: "export",
    implementation: "local",
    inputSchema: DIAGNOSE_EXPORT_TEMPLATES_SCHEMA,
    local: {
      handler: "diagnoseExportTemplates"
    },
    conformance: {
      happy: "report whether local export templates are installed",
      error: "surface Godot version or template lookup failures"
    },
    docs: {
      summary: "Diagnoses whether local Godot export templates are installed for the MCP Godot version."
    }
  },
  {
    name: "validate_export_preset",
    stability: "experimental",
    description: "Validate Godot export preset configuration before running a local export.",
    profile: "full",
    tier: "standard",
    category: "export",
    implementation: "local",
    inputSchema: VALIDATE_EXPORT_PRESET_SCHEMA,
    local: {
      handler: "validateExportPreset"
    },
    conformance: {
      happy: "validate a configured export preset and report warnings",
      error: "reject missing project roots, presets, or invalid export settings"
    },
    docs: {
      summary: "Validates Godot export preset configuration before running a local export."
    }
  },
  {
    name: "export_project",
    stability: "experimental",
    description: "Export an allowlisted Godot project through the local Godot CLI.",
    profile: "full",
    tier: "standard",
    category: "export",
    implementation: "local",
    inputSchema: EXPORT_PROJECT_SCHEMA,
    local: {
      handler: "exportGodotProject"
    },
    conformance: {
      happy: "export an allowlisted Godot project through the local CLI",
      error: "surface preset validation, template, or Godot process failures"
    },
    docs: {
      summary: "Exports an allowlisted Godot project through the local Godot CLI."
    }
  }
];

export const EXPORT_TOOL_MANIFEST = [
  ...EXPORT_PRESET_TOOL_MANIFEST,
  ...EXPORT_LOCAL_TOOL_MANIFEST
];
