import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { sendViewportInput } from "./input.js";
import { VIEWPORT_TOOL_MANIFEST } from "./manifest.js";
import {
  captureEditorScreenshot,
  captureViewportScreenshot
} from "./screenshots.js";

export const VIEWPORT_TOOL_DEFINITIONS = toolDefinitionsFromManifest(VIEWPORT_TOOL_MANIFEST, {
  adapterHandlers: {
    captureEditorScreenshot,
    captureViewportScreenshot,
    sendViewportInput
  }
});
