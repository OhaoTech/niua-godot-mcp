import { toolDefinitionsFromManifest } from "../../manifest/index.js";
import { importProjectAssets } from "./local.js";
import { IMPORT_TOOL_MANIFEST } from "./manifest.js";
import { createWaitForImportedAsset } from "./wait-ready.js";

export { importProjectAssets, createWaitForImportedAsset };

async function callCatalogTool(name, args) {
  const { callTool } = await import("../../server/tool-catalog.js");
  return callTool(name, args);
}

const waitForImportedAsset = createWaitForImportedAsset({ callTool: callCatalogTool });

export const IMPORT_TOOL_DEFINITIONS = toolDefinitionsFromManifest(IMPORT_TOOL_MANIFEST, {
  localHandlers: {
    importProjectAssets,
    waitForImportedAsset
  }
});
