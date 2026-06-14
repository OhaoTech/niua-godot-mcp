export function characterController3DOperationDetails(context, extra = {}) {
  return {
    steps: context.steps,
    nodePath: context.nodePath,
    scriptPath: context.scriptPath,
    className: context.className,
    inputActions: context.inputActions,
    ...extra
  };
}

export function characterController3DSuccessData(context, {
  content,
  validation,
  createdScript,
  attachedScript
}) {
  return {
    type: "3DCharacterController",
    nodePath: context.nodePath,
    scriptPath: context.scriptPath,
    className: context.className,
    actionNames: context.actionNames,
    inputActions: context.inputActions,
    content,
    validation: validation?.data ?? null,
    createdScript: createdScript.data,
    attachedScript: attachedScript.data,
    steps: context.steps
  };
}
