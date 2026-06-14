import { pickBridgeConnectionArgs, splitBridgeArgs } from "../../../../server/context.js";
import { normalizeOptionalName } from "../../../../shared/normalize.js";

import {
  appendBlockoutStep,
  blockoutFailure
} from "./shared.js";
import {
  createTriggerZoneArea,
  resolveTriggerZoneAreaPath
} from "./trigger-zone/area.js";
import { buildTriggerZoneResourceContext } from "./trigger-zone/resources.js";
import {
  triggerZoneSuccessData,
  triggerZoneWithoutScriptData
} from "./trigger-zone/result.js";
import {
  buildTriggerZoneScriptContext,
  writeValidateAndAttachTriggerZoneScript
} from "./trigger-zone/script.js";

export async function create2DTriggerZone(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const connectionArgs = pickBridgeConnectionArgs(args);
  const name = normalizeOptionalName(payload.name, "TriggerZone");
  const resourceContext = buildTriggerZoneResourceContext(payload, name);
  const steps = [];

  const area = await createTriggerZoneArea({
    connectionArgs,
    payload,
    name,
    resourceContext
  });
  appendBlockoutStep(steps, "area", area);
  if (!area.ok) {
    return blockoutFailure("area", area, {
      steps,
      name,
      resourceDirectory: resourceContext.resourceDirectory
    });
  }

  const areaPath = resolveTriggerZoneAreaPath(area, name, payload.parentPath);
  const attachScript = payload.attachScript !== false;
  if (!attachScript) {
    return {
      ok: true,
      data: triggerZoneWithoutScriptData({
        name,
        areaPath,
        resourceDirectory: resourceContext.resourceDirectory,
        area: area.data,
        steps
      })
    };
  }

  const scriptContext = buildTriggerZoneScriptContext(payload, { name, areaPath });
  const scriptWorkflow = await writeValidateAndAttachTriggerZoneScript({
    client,
    payload,
    steps,
    name,
    areaPath,
    resourceDirectory: resourceContext.resourceDirectory,
    area: area.data,
    scriptContext
  });
  if (!scriptWorkflow.ok) {
    return scriptWorkflow;
  }

  return {
    ok: true,
    data: triggerZoneSuccessData({
      name,
      areaPath,
      resourceDirectory: resourceContext.resourceDirectory,
      area: area.data,
      script: scriptWorkflow.data,
      steps
    })
  };
}
