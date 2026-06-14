export function triggerZoneWithoutScriptData({
  name,
  areaPath,
  resourceDirectory,
  area,
  steps
}) {
  return {
    type: "2DTriggerZone",
    name,
    areaPath,
    resourceDirectory,
    area,
    scriptPath: null,
    className: null,
    eventName: null,
    content: null,
    validation: null,
    writtenScript: null,
    attachedScript: null,
    steps
  };
}

export function triggerZoneSuccessData({
  name,
  areaPath,
  resourceDirectory,
  area,
  script,
  steps
}) {
  return {
    type: "2DTriggerZone",
    name,
    areaPath,
    resourceDirectory,
    area,
    scriptPath: script.scriptPath,
    className: script.className,
    eventName: script.eventName,
    content: script.content,
    validation: script.validation,
    writtenScript: script.writtenScript,
    attachedScript: script.attachedScript,
    steps
  };
}
