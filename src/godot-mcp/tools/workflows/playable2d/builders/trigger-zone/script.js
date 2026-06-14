import { buildTriggerZoneScriptContext as buildContext } from "./script/context.js";
import {
  writeValidateAndAttachTriggerZoneScript as runScriptWorkflow
} from "./script/workflow.js";

export function buildTriggerZoneScriptContext(payload, options) {
  return buildContext(payload, options);
}

export async function writeValidateAndAttachTriggerZoneScript(options) {
  return runScriptWorkflow(options);
}
