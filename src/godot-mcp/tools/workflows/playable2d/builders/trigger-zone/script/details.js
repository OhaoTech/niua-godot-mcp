export function triggerZoneScriptOperationDetails({
  steps,
  name,
  areaPath,
  resourceDirectory,
  area,
  scriptContext
}) {
  const {
    scriptPath,
    className,
    eventName,
    content
  } = scriptContext;

  return {
    steps,
    name,
    areaPath,
    resourceDirectory,
    area,
    scriptPath,
    className,
    eventName,
    content
  };
}
