import {
  compactRuntimePropertyList,
  dietRuntimeStateResult,
  omitInlineScreenshotPayload,
  persistJsonResult,
  resolveTreeMaxDepth,
  summarizeRuntimeState
} from "../shared/payload-diet.js";
import { persistScreenshotResult } from "../shared/screenshot-io.js";

export async function captureRuntimeScreenshot({ client, payload = {} }) {
  const { savePath, includePayload, ...request } = payload;
  const result = await client.captureRuntimeScreenshot(request);
  if (savePath) {
    return persistScreenshotResult(result, savePath);
  }
  if (includePayload) {
    return result;
  }
  return omitInlineScreenshotPayload(result);
}

export async function getRuntimeState({ client, payload = {} }) {
  const { savePath, maxDepth, ...request } = payload;
  const result = await client.getRuntimeState({
    ...request,
    maxDepth: resolveTreeMaxDepth(maxDepth)
  });
  dietRuntimeStateResult(result);
  return persistJsonResult(result, savePath, summarizeRuntimeState);
}

export async function getRuntimeNodeProperties({ client, payload = {} }) {
  const { properties, verbose, ...request } = payload;
  const result = await client.getRuntimeNodeProperties({
    ...request,
    properties,
    verbose
  });
  return compactRuntimePropertyList(result, { properties, verbose });
}

export function filterRuntimeNodeProperties(result, properties) {
  return compactRuntimePropertyList(result, { properties, verbose: true });
}
