import {
  appendBlockoutStep,
  blockoutFailure
} from "../../shared.js";
import { triggerZoneScriptOperationDetails } from "./details.js";

export async function writeTriggerZoneScriptResource(options) {
  const {
    client,
    payload,
    steps,
    scriptContext
  } = options;
  const writtenScript = await client.writeScript({
    path: scriptContext.scriptPath,
    content: scriptContext.content,
    overwrite: Boolean(payload.overwriteScript ?? false)
  });
  appendBlockoutStep(steps, "script:write", writtenScript);
  if (!writtenScript.ok) {
    return {
      ok: false,
      failure: blockoutFailure(
        "script:write",
        writtenScript,
        triggerZoneScriptOperationDetails(options)
      )
    };
  }

  return {
    ok: true,
    writtenScript
  };
}
