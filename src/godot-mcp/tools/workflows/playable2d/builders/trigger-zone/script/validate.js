import {
  appendBlockoutStep,
  blockoutFailure
} from "../../shared.js";
import { triggerZoneScriptOperationDetails } from "./details.js";

export async function validateTriggerZoneScript(options, scriptState) {
  const {
    client,
    steps,
    scriptContext
  } = options;

  if (!scriptContext.validateAfterCreate) {
    return {
      ok: true,
      validation: null
    };
  }

  const validation = await client.validateScript({ path: scriptContext.scriptPath });
  appendBlockoutStep(steps, "script:validate", validation);
  if (!validation.ok) {
    return {
      ok: false,
      failure: blockoutFailure("script:validate", validation, {
        ...triggerZoneScriptOperationDetails(options),
        writtenScript: scriptState.writtenScript
      })
    };
  }
  if (validation.data?.valid === false) {
    return {
      ok: false,
      failure: blockoutFailure("script:validate", {
        ok: false,
        error: validation.data?.error ?? "generated script did not validate",
        data: validation.data
      }, {
        ...triggerZoneScriptOperationDetails(options),
        writtenScript: scriptState.writtenScript,
        validation: validation.data
      })
    };
  }

  return {
    ok: true,
    validation
  };
}
