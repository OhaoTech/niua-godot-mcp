import { toolDefinitionsFromManifest } from "../../../manifest/index.js";
import { createRunPlaytestEvidence } from "./evidence.js";
import { PLAYTEST_WORKFLOW_TOOL_MANIFEST } from "./manifest.js";

async function callCatalogTool(name, args) {
  const { callTool } = await import("../../../server/tool-catalog.js");
  return callTool(name, args);
}

const runPlaytestEvidence = createRunPlaytestEvidence({ callTool: callCatalogTool });

export const PLAYTEST_WORKFLOW_TOOL_DEFINITIONS = toolDefinitionsFromManifest(PLAYTEST_WORKFLOW_TOOL_MANIFEST, {
  localHandlers: {
    runPlaytestEvidence
  }
});

export { createRunPlaytestEvidence, PLAYTEST_WORKFLOW_TOOL_MANIFEST };
