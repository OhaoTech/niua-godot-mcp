import { characterControllerInputSpecs } from "../scripts.js";
import {
  appendBlockoutStep,
  blockoutFailure
} from "../shared.js";
import { characterController3DOperationDetails } from "./result.js";

export async function configureCharacterController3DInputMap(client, context) {
  if (!context.configureInputMap) {
    return null;
  }

  const inputSpecs = characterControllerInputSpecs(context.actionNames);
  for (let index = 0; index < inputSpecs.length; index += 1) {
    const spec = inputSpecs[index];
    const actionResult = await client.setInputAction({
      name: spec.name,
      deadzone: 0.2,
      replace: true,
      events: [{ type: "key", keycode: spec.keycode }],
      save: index === inputSpecs.length - 1
    });
    context.inputActions.push({
      key: spec.key,
      name: spec.name,
      keycode: spec.keycode,
      result: actionResult
    });
    appendBlockoutStep(context.steps, `input:${spec.name}`, actionResult);
    if (!actionResult.ok) {
      return blockoutFailure(
        `input:${spec.name}`,
        actionResult,
        characterController3DOperationDetails(context)
      );
    }
  }

  return null;
}
