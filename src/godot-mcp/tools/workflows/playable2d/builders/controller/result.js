export function characterController2DOperationDetails(context, extra = {}) {
  return {
    steps: context.steps,
    nodePath: context.nodePath,
    scriptPath: context.scriptPath,
    className: context.className,
    inputActions: context.inputActions,
    ...extra
  };
}

export function characterController2DSuccessData(context, {
  content,
  validation,
  writtenScript,
  attachedScript
}) {
  return {
    type: "2DCharacterController",
    nodePath: context.nodePath,
    scriptPath: context.scriptPath,
    className: context.className,
    actionNames: context.actionNames,
    inputActions: context.inputActions,
    content,
    validation: validation?.data ?? null,
    writtenScript: writtenScript.data,
    attachedScript: attachedScript.data,
    steps: context.steps
  };
}
