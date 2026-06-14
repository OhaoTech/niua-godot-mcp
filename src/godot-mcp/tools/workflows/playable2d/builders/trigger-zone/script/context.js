import {
  buildTriggerZone2DScript,
  defaultTriggerClassName,
  defaultTriggerScriptPath,
  normalizeGDScriptClassName,
  normalizeGodotScriptPath,
  slugifyResourceName
} from "../../../scripts.js";

export function buildTriggerZoneScriptContext(payload, {
  name,
  areaPath
}) {
  const scriptPath = normalizeGodotScriptPath(
    payload.scriptPath ?? defaultTriggerScriptPath(areaPath),
    "scriptPath"
  );
  const className = normalizeGDScriptClassName(
    payload.className,
    defaultTriggerClassName(areaPath)
  );
  const eventName = String(payload.eventName ?? slugifyResourceName(name)).trim() || "trigger_zone";
  const validateAfterCreate = payload.validateAfterCreate !== false;
  const saveScene = Boolean(payload.saveScene ?? true);
  const content = buildTriggerZone2DScript({
    className,
    eventName,
    watchBodies: payload.watchBodies !== false,
    watchAreas: Boolean(payload.watchAreas ?? false),
    printEvents: payload.printEvents !== false
  });

  return {
    scriptPath,
    className,
    eventName,
    validateAfterCreate,
    saveScene,
    content
  };
}
