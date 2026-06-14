import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { discoverEditorBridges } from "../../../services/bridge-discovery.js";
import { discoverGodotProjects, listScenes } from "../discovery.js";
import { PROJECT_DISCOVERY_TOOL_MANIFEST } from "../manifest.js";

export const PROJECT_DISCOVERY_TOOL_DEFINITIONS = toolDefinitionsFromManifest(PROJECT_DISCOVERY_TOOL_MANIFEST, {
  localHandlers: {
    discoverGodotProjects,
    discoverEditorBridges,
    listScenes
  }
});
