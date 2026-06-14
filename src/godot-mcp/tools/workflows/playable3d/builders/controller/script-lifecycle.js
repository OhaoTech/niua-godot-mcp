import { buildCharacterController3DScript } from "../scripts.js";
import {
  appendBlockoutStep,
  blockoutFailure
} from "../shared.js";
import { characterController3DOperationDetails } from "./result.js";

export function buildCharacterController3DScriptContent(context) {
  return buildCharacterController3DScript({
    className: context.className,
    speed: context.speed,
    jumpVelocity: context.jumpVelocity,
    gravity: context.gravity,
    actionNames: context.actionNames
  });
}

export async function createCharacterController3DScriptResource(client, context) {
  const content = buildCharacterController3DScriptContent(context);
  const createdScript = await client.createScript({
    path: context.scriptPath,
    content,
    overwrite: context.overwriteScript
  });
  appendBlockoutStep(context.steps, "script:create", createdScript);
  if (!createdScript.ok) {
    return {
      ok: false,
      failure: blockoutFailure("script:create", createdScript, {
        ...characterController3DOperationDetails(context),
        content
      })
    };
  }

  return {
    ok: true,
    content,
    createdScript
  };
}

export async function validateCharacterController3DScript(client, context, scriptState) {
  if (!context.validateAfterCreate) {
    return {
      ok: true,
      validation: null
    };
  }

  const validation = await client.validateScript({ path: context.scriptPath });
  appendBlockoutStep(context.steps, "script:validate", validation);
  if (!validation.ok) {
    return {
      ok: false,
      failure: blockoutFailure("script:validate", validation, {
        ...characterController3DOperationDetails(context),
        content: scriptState.content,
        createdScript: scriptState.createdScript
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
        ...characterController3DOperationDetails(context),
        content: scriptState.content,
        createdScript: scriptState.createdScript,
        validation: validation.data
      })
    };
  }

  return {
    ok: true,
    validation
  };
}

export async function attachCharacterController3DScript(client, context, scriptState) {
  const attachedScript = await client.attachScript({
    nodePath: context.nodePath,
    scriptPath: context.scriptPath,
    createIfMissing: false,
    saveScene: context.saveScene
  });
  appendBlockoutStep(context.steps, "script:attach", attachedScript);
  if (!attachedScript.ok) {
    return {
      ok: false,
      failure: blockoutFailure("script:attach", attachedScript, {
        ...characterController3DOperationDetails(context),
        content: scriptState.content,
        createdScript: scriptState.createdScript
      })
    };
  }

  return {
    ok: true,
    attachedScript
  };
}
