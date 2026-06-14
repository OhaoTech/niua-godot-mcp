import { ANIMATION_TOOL_MANIFEST } from "../tools/animation/manifest.js";
import { AUDIO_TOOL_MANIFEST } from "../tools/audio/manifest.js";
import {
  DEBUGGER_CONTROL_TOOL_MANIFEST,
  DEBUGGER_RUNTIME_TOOL_MANIFEST
} from "../tools/debugger/manifest.js";
import { EXPORT_TOOL_MANIFEST } from "../tools/export/manifest.js";
import { FILESYSTEM_TOOL_MANIFEST } from "../tools/filesystem/manifest.js";
import { IMPORT_TOOL_MANIFEST } from "../tools/import/manifest.js";
import { INSPECTOR_TOOL_MANIFEST } from "../tools/inspector/manifest.js";
import { LOCALIZATION_TOOL_MANIFEST } from "../tools/localization/manifest.js";
import { MULTIPLAYER_TOOL_MANIFEST } from "../tools/multiplayer/manifest.js";
import { NAVIGATION_TOOL_MANIFEST } from "../tools/navigation/manifest.js";
import { COMMON_NODE_TOOL_MANIFEST } from "../tools/nodes/common/manifest.js";
import { NODE2D_TOOL_MANIFEST } from "../tools/nodes/node2d/manifest.js";
import { NODE3D_TOOL_MANIFEST } from "../tools/nodes/node3d/manifest.js";
import { PARTICLES_TOOL_MANIFEST } from "../tools/particles/manifest.js";
import { PLAYABLE2D_WORKFLOW_TOOL_MANIFEST } from "../tools/workflows/playable2d/manifest.js";
import { PLAYABLE3D_WORKFLOW_TOOL_MANIFEST } from "../tools/workflows/playable3d/manifest.js";
import { PROJECT_MANAGEMENT_TOOL_MANIFEST } from "../tools/project/manifest.js";
import { PROJECT_SETTINGS_TOOL_MANIFEST } from "../tools/project/settings/manifest.js";
import { RUN_TOOL_MANIFEST } from "../tools/run/manifest.js";
import { RESOURCE_TOOL_MANIFEST } from "../tools/resources/manifest.js";
import { RUNTIME_TOOL_MANIFEST } from "../tools/runtime/manifest.js";
import { SCENE_TOOL_MANIFEST } from "../tools/scene/manifest.js";
import { SCRIPT_TOOL_MANIFEST } from "../tools/scripts/manifest.js";
import { UI_TOOL_MANIFEST } from "../tools/ui/manifest.js";
import { VIEWPORT_TOOL_MANIFEST } from "../tools/viewport/manifest.js";

export const MIGRATED_MANIFEST_DOMAINS = [
  {
    name: "animation",
    manifest: ANIMATION_TOOL_MANIFEST
  },
  {
    name: "audio",
    manifest: AUDIO_TOOL_MANIFEST
  },
  {
    name: "debugger-control",
    manifest: DEBUGGER_CONTROL_TOOL_MANIFEST
  },
  {
    name: "debugger-runtime",
    manifest: DEBUGGER_RUNTIME_TOOL_MANIFEST
  },
  {
    name: "export",
    manifest: EXPORT_TOOL_MANIFEST
  },
  {
    name: "filesystem",
    manifest: FILESYSTEM_TOOL_MANIFEST
  },
  {
    name: "import",
    manifest: IMPORT_TOOL_MANIFEST
  },
  {
    name: "inspector",
    manifest: INSPECTOR_TOOL_MANIFEST
  },
  {
    name: "localization",
    manifest: LOCALIZATION_TOOL_MANIFEST
  },
  {
    name: "multiplayer",
    manifest: MULTIPLAYER_TOOL_MANIFEST
  },
  {
    name: "navigation",
    manifest: NAVIGATION_TOOL_MANIFEST
  },
  {
    name: "nodes-common",
    manifest: COMMON_NODE_TOOL_MANIFEST
  },
  {
    name: "nodes-2d",
    manifest: NODE2D_TOOL_MANIFEST
  },
  {
    name: "nodes-3d",
    manifest: NODE3D_TOOL_MANIFEST
  },
  {
    name: "particles",
    manifest: PARTICLES_TOOL_MANIFEST
  },
  {
    name: "playable2d-workflows",
    manifest: PLAYABLE2D_WORKFLOW_TOOL_MANIFEST
  },
  {
    name: "playable3d-workflows",
    manifest: PLAYABLE3D_WORKFLOW_TOOL_MANIFEST
  },
  {
    name: "project-management",
    manifest: PROJECT_MANAGEMENT_TOOL_MANIFEST
  },
  {
    name: "project-settings",
    manifest: PROJECT_SETTINGS_TOOL_MANIFEST
  },
  {
    name: "run",
    manifest: RUN_TOOL_MANIFEST
  },
  {
    name: "resources",
    manifest: RESOURCE_TOOL_MANIFEST
  },
  {
    name: "runtime",
    manifest: RUNTIME_TOOL_MANIFEST
  },
  {
    name: "scene",
    manifest: SCENE_TOOL_MANIFEST
  },
  {
    name: "scripts",
    manifest: SCRIPT_TOOL_MANIFEST
  },
  {
    name: "ui",
    manifest: UI_TOOL_MANIFEST
  },
  {
    name: "viewport",
    manifest: VIEWPORT_TOOL_MANIFEST
  }
];

export const MIGRATED_TOOL_MANIFESTS = MIGRATED_MANIFEST_DOMAINS
  .flatMap((domain) => domain.manifest);
