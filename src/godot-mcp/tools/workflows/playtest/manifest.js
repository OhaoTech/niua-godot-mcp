import { CONNECTION_PROPERTIES } from "../../shared/bridge-schema.js";

const RUN_PLAYTEST_EVIDENCE_SCHEMA = {
  type: "object",
  properties: {
    ...CONNECTION_PROPERTIES,
    scenePath: {
      type: "string",
      description: "Optional res:// scene to run (custom). If omitted, runs the project main scene."
    },
    settleMs: {
      type: "number",
      description: "Wait after run before observing (ms). Default 250."
    },
    maxDepth: {
      type: "number",
      description: "Runtime tree maxDepth. Default 2."
    },
    savePath: {
      type: "string",
      description: "Optional disk path for runtime screenshot PNG (keeps base64 out of context)."
    },
    stopAfter: {
      type: "boolean",
      description: "Stop the running scene after observe. Default true."
    },
    saveBeforeRun: {
      type: "boolean",
      description: "Save edited scene before run. Default true."
    }
  },
  additionalProperties: false
};

export const PLAYTEST_WORKFLOW_TOOL_MANIFEST = [
  {
    name: "run_playtest_evidence",
    description:
      "One call playtest job: ensure main/custom scene, run, install runtime probe, read compact state/events, capture screenshot (or headless available:false), stop, return engine evidence pack. Prefer this over hand-rolling run/probe loops.",
    profile: "v1",
    tier: "essential",
    category: "playtest-workflow",
    implementation: "local",
    inputSchema: RUN_PLAYTEST_EVIDENCE_SCHEMA,
    local: {
      handler: "runPlaytestEvidence"
    },
    conformance: {
      happy: "run a scene and return a compact evidence pack",
      error: "surface no_main_scene / unsaved_scene / bridge-down with recovery"
    },
    docs: {
      summary: "Runs a playtest and returns compact engine evidence (run + observe + screenshot contract)."
    }
  }
];
