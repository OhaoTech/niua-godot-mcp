import { splitBridgeArgs } from "../../../server/context.js";

const HDR_OUTPUT_SETTING = "display/window/hdr/request_hdr_output";
const HDR_2D_SETTING = "rendering/viewport/hdr_2d";

export async function configureHdrOutput(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const save = payload.save !== false;
  const settings = [];

  if (payload.requestHdrOutput !== undefined) {
    settings.push({
      name: HDR_OUTPUT_SETTING,
      value: Boolean(payload.requestHdrOutput)
    });
  }
  if (payload.hdr2d !== undefined) {
    settings.push({
      name: HDR_2D_SETTING,
      value: Boolean(payload.hdr2d)
    });
  }
  if (settings.length === 0) {
    return {
      ok: false,
      error: "provide requestHdrOutput and/or hdr2d",
      errorCode: "bad_request"
    };
  }

  const applied = [];
  for (let index = 0; index < settings.length; index += 1) {
    const setting = settings[index];
    const result = await client.setProjectSetting({
      name: setting.name,
      value: setting.value,
      save: save && index === settings.length - 1
    });
    if (!result.ok) {
      return result;
    }
    applied.push({
      name: setting.name,
      value: setting.value,
      ...(result.data && typeof result.data === "object" ? result.data : {})
    });
  }

  return {
    ok: true,
    data: {
      settings: applied,
      saved: save
    }
  };
}
