import { PROJECT_DISCOVERY_TOOL_DEFINITIONS } from "./tools/discovery.js";
import { PROJECT_LIFECYCLE_TOOL_DEFINITIONS } from "./tools/lifecycle.js";
import { PROJECT_LOG_TOOL_DEFINITIONS } from "./tools/logs.js";

export { discoverEditorBridges } from "../../services/bridge-discovery.js";
export { discoverGodotProjects, listScenes } from "./discovery.js";
export { getGodotOutputLogs } from "./logs.js";
export { diagnoseGodotProjectSetup } from "./diagnostics.js";
export {
  closeGodotProject,
  createGodotProject,
  forgetGodotProject,
  importGodotProject,
  installProjectAddon,
  listKnownGodotProjects,
  listOpenGodotProjects,
  openGodotProject
} from "./lifecycle.js";
export { PROJECT_DISCOVERY_TOOL_DEFINITIONS } from "./tools/discovery.js";
export { PROJECT_LIFECYCLE_TOOL_DEFINITIONS } from "./tools/lifecycle.js";
export { PROJECT_LOG_TOOL_DEFINITIONS } from "./tools/logs.js";

export const PROJECT_MANAGEMENT_TOOL_DEFINITIONS =
  PROJECT_LIFECYCLE_TOOL_DEFINITIONS.concat(
    PROJECT_DISCOVERY_TOOL_DEFINITIONS,
    PROJECT_LOG_TOOL_DEFINITIONS
  );
