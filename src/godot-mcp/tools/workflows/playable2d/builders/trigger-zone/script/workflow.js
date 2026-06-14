import { attachTriggerZoneScript } from "./attach.js";
import { validateTriggerZoneScript } from "./validate.js";
import { writeTriggerZoneScriptResource } from "./write.js";

export async function writeValidateAndAttachTriggerZoneScript(options) {
  const { scriptContext } = options;

  const writeState = await writeTriggerZoneScriptResource(options);
  if (!writeState.ok) {
    return writeState.failure;
  }

  const validationState = await validateTriggerZoneScript(options, writeState);
  if (!validationState.ok) {
    return validationState.failure;
  }

  const attachState = await attachTriggerZoneScript(options, writeState);
  if (!attachState.ok) {
    return attachState.failure;
  }

  return {
    ok: true,
    data: {
      scriptPath: scriptContext.scriptPath,
      className: scriptContext.className,
      eventName: scriptContext.eventName,
      content: scriptContext.content,
      validation: validationState.validation?.data ?? null,
      writtenScript: writeState.writtenScript.data,
      attachedScript: attachState.attachedScript.data
    }
  };
}
