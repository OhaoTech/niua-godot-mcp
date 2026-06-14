import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { diagnoseGodotProjectSetup } from "../diagnostics.js";
import {
  closeGodotProject,
  createGodotProject,
  forgetGodotProject,
  importGodotProject,
  installProjectAddon,
  listKnownGodotProjects,
  listOpenGodotProjects,
  openGodotProject
} from "../lifecycle.js";
import { PROJECT_LIFECYCLE_TOOL_MANIFEST } from "../manifest.js";

export const PROJECT_LIFECYCLE_TOOL_DEFINITIONS = toolDefinitionsFromManifest(PROJECT_LIFECYCLE_TOOL_MANIFEST, {
  localHandlers: {
    createGodotProject,
    openGodotProject,
    listOpenGodotProjects,
    closeGodotProject,
    importGodotProject,
    installProjectAddon,
    listKnownGodotProjects,
    forgetGodotProject,
    diagnoseGodotProjectSetup
  }
});
