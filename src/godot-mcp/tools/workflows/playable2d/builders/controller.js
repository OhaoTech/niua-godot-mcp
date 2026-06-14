import { splitBridgeArgs } from "../../../../server/context.js";
import { buildCharacterController2DContext } from "./controller/context.js";
import { configureCharacterController2DInputMap } from "./controller/input-map.js";
import {
  attachCharacterController2DScript,
  validateCharacterController2DScript,
  writeCharacterController2DScriptResource
} from "./controller/script-lifecycle.js";
import { characterController2DSuccessData } from "./controller/result.js";

export async function create2DCharacterController(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const context = buildCharacterController2DContext(payload);

  const inputFailure = await configureCharacterController2DInputMap(client, context);
  if (inputFailure) {
    return inputFailure;
  }

  const scriptState = await writeCharacterController2DScriptResource(client, context);
  if (!scriptState.ok) {
    return scriptState.failure;
  }

  const validationState = await validateCharacterController2DScript(client, context, scriptState);
  if (!validationState.ok) {
    return validationState.failure;
  }

  const attachedState = await attachCharacterController2DScript(client, context, scriptState);
  if (!attachedState.ok) {
    return attachedState.failure;
  }

  return {
    ok: true,
    data: characterController2DSuccessData(context, {
      content: scriptState.content,
      validation: validationState.validation,
      writtenScript: scriptState.writtenScript,
      attachedScript: attachedState.attachedScript
    })
  };
}
