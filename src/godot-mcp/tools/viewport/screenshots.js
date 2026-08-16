import { omitInlineScreenshotPayload } from "../shared/payload-diet.js";
import { persistScreenshotResult } from "../shared/screenshot-io.js";

export async function captureEditorScreenshot({ client, payload = {} }) {
  const { savePath, includePayload } = payload;
  const result = await client.captureEditorScreenshot();
  if (savePath) {
    return persistScreenshotResult(result, savePath);
  }
  if (includePayload) {
    return result;
  }
  return omitInlineScreenshotPayload(result);
}

export async function captureViewportScreenshot({ client, payload = {} }) {
  const { savePath, includePayload, ...request } = payload;
  const result = await client.captureViewportScreenshot(request);
  if (savePath) {
    return persistScreenshotResult(result, savePath);
  }
  if (includePayload) {
    return result;
  }
  return omitInlineScreenshotPayload(result);
}
