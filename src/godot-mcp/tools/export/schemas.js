import { CONNECTION_PROPERTIES } from "../shared/bridge-schema.js";

export const UPSERT_EXPORT_PRESET_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    index: {
      type: "number",
      description: "Optional preset index to update. When omitted, matches by name/platform or appends."
    },
    name: {
      type: "string",
      description: "Export preset name."
    },
    platform: {
      type: "string",
      description: "Godot export platform, for example Linux, Windows Desktop, Web, macOS, Android, or iOS."
    },
    exportPath: {
      type: "string",
      description: "Default export path stored in export_presets.cfg."
    },
    runnable: {
      type: "boolean",
      description: "Whether the preset is runnable from the editor. Defaults to true."
    },
    exportFilter: {
      type: "string",
      description: "Godot export_filter value. Defaults to all_resources."
    },
    includeFilter: {
      type: "string",
      description: "Godot include_filter value. Defaults to empty."
    },
    excludeFilter: {
      type: "string",
      description: "Godot exclude_filter value. Defaults to empty."
    },
    customFeatures: {
      type: "string",
      description: "Comma-separated custom export features. Defaults to empty."
    },
    dedicatedServer: {
      type: "boolean",
      description: "Godot dedicated_server flag. Defaults to false."
    },
    options: {
      type: "object",
      description: "Additional preset option keys written under preset.N.options."
    }
  },
  required: ["name", "platform"],
  additionalProperties: false
};

export const EXPORT_PROJECT_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Allowlisted Godot project root to export."
    },
    preset: {
      type: "string",
      description: "Export preset name from export_presets.cfg."
    },
    outputPath: {
      type: "string",
      description: "Allowlisted output artifact path."
    },
    mode: {
      type: "string",
      description: "Export mode: release or debug. Defaults to release."
    },
    timeoutMs: {
      type: "number",
      description: "Export process timeout in milliseconds. Defaults to 120000."
    }
  },
  required: ["projectRoot", "preset", "outputPath"],
  additionalProperties: false
};

export const DIAGNOSE_EXPORT_TEMPLATES_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Optional allowlisted Godot project root. When provided, diagnostics include project.godot and export_presets.cfg readiness."
    }
  },
  additionalProperties: false
};

export const VALIDATE_EXPORT_PRESET_SCHEMA = {
  type: "object",
  properties: {
    projectRoot: {
      type: "string",
      description: "Allowlisted Godot project root containing export_presets.cfg."
    },
    preset: {
      type: "string",
      description: "Optional export preset name to validate. When omitted, all presets are validated."
    }
  },
  required: ["projectRoot"],
  additionalProperties: false
};
