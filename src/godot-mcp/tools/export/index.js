import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { diagnoseExportTemplates, exportGodotProject, validateExportPreset } from "./local.js";
import {
  EXPORT_LOCAL_TOOL_MANIFEST,
  EXPORT_PRESET_TOOL_MANIFEST
} from "./manifest.js";

export const EXPORT_PRESET_TOOL_DEFINITIONS = toolDefinitionsFromManifest(EXPORT_PRESET_TOOL_MANIFEST);

export { diagnoseExportTemplates, exportGodotProject, validateExportPreset };

export const LOCAL_EXPORT_TOOL_DEFINITIONS = toolDefinitionsFromManifest(EXPORT_LOCAL_TOOL_MANIFEST, {
  localHandlers: {
    diagnoseExportTemplates,
    validateExportPreset,
    exportGodotProject
  }
});

export const EXPORT_TOOL_DEFINITIONS =
  EXPORT_PRESET_TOOL_DEFINITIONS.concat(LOCAL_EXPORT_TOOL_DEFINITIONS);
