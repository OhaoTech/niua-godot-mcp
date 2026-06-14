import { splitBridgeArgs } from "../../../../server/context.js";
import { buildCharacterController3DContext } from "./controller/context.js";
import { configureCharacterController3DInputMap } from "./controller/input-map.js";
import {
  attachCharacterController3DScript,
  createCharacterController3DScriptResource,
  validateCharacterController3DScript
} from "./controller/script-lifecycle.js";
import { characterController3DSuccessData } from "./controller/result.js";

export async function create3DCharacterController(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const context = buildCharacterController3DContext(payload);

  const inputFailure = await configureCharacterController3DInputMap(client, context);
  if (inputFailure) {
    return inputFailure;
  }

  const scriptState = await createCharacterController3DScriptResource(client, context);
  if (!scriptState.ok) {
    return scriptState.failure;
  }

  const validationState = await validateCharacterController3DScript(client, context, scriptState);
  if (!validationState.ok) {
    return validationState.failure;
  }

  const attachedState = await attachCharacterController3DScript(client, context, scriptState);
  if (!attachedState.ok) {
    return attachedState.failure;
  }

  return {
    ok: true,
    data: characterController3DSuccessData(context, {
      content: scriptState.content,
      validation: validationState.validation,
      createdScript: scriptState.createdScript,
      attachedScript: attachedState.attachedScript
    })
  };
}
