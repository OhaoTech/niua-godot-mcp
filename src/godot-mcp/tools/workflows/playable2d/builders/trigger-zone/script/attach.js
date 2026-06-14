import {
  appendBlockoutStep,
  blockoutFailure
} from "../../shared.js";
import { triggerZoneScriptOperationDetails } from "./details.js";

export async function attachTriggerZoneScript(options, scriptState) {
  const {
    client,
    steps,
    areaPath,
    scriptContext
  } = options;
  const attachedScript = await client.attachScript({
    nodePath: areaPath,
    scriptPath: scriptContext.scriptPath,
    createIfMissing: false,
    saveScene: scriptContext.saveScene
  });
  appendBlockoutStep(steps, "script:attach", attachedScript);
  if (!attachedScript.ok) {
    return {
      ok: false,
      failure: blockoutFailure("script:attach", attachedScript, {
        ...triggerZoneScriptOperationDetails(options),
        writtenScript: scriptState.writtenScript
      })
    };
  }

  return {
    ok: true,
    attachedScript
  };
}
