import { buildCharacterController2DScript } from "../../scripts.js";
import {
  appendBlockoutStep,
  blockoutFailure
} from "../shared.js";
import { characterController2DOperationDetails } from "./result.js";

export function buildCharacterController2DScriptContent(context) {
  return buildCharacterController2DScript({
    className: context.className,
    moveSpeed: context.moveSpeed,
    jumpVelocity: context.jumpVelocity,
    gravity: context.gravity,
    actionNames: context.actionNames
  });
}

export async function writeCharacterController2DScriptResource(client, context) {
  const content = buildCharacterController2DScriptContent(context);
  const writtenScript = await client.writeScript({
    path: context.scriptPath,
    content,
    overwrite: context.overwriteScript
  });
  appendBlockoutStep(context.steps, "script:write", writtenScript);
  if (!writtenScript.ok) {
    return {
      ok: false,
      failure: blockoutFailure("script:write", writtenScript, {
        ...characterController2DOperationDetails(context),
        content
      })
    };
  }

  return {
    ok: true,
    content,
    writtenScript
  };
}

export async function validateCharacterController2DScript(client, context, scriptState) {
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
        ...characterController2DOperationDetails(context),
        content: scriptState.content,
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
        ...characterController2DOperationDetails(context),
        content: scriptState.content,
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

export async function attachCharacterController2DScript(client, context, scriptState) {
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
        ...characterController2DOperationDetails(context),
        content: scriptState.content,
        writtenScript: scriptState.writtenScript
      })
    };
  }

  return {
    ok: true,
    attachedScript
  };
}
