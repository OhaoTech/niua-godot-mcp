import { persistScreenshotResult } from "../shared/screenshot-io.js";

export async function captureEditorScreenshot({ client, payload = {} }) {
  const { savePath } = payload;
  const result = await client.captureEditorScreenshot();
  return persistScreenshotResult(result, savePath);
}

export async function captureViewportScreenshot({ client, payload = {} }) {
  const { savePath, ...request } = payload;
  const result = await client.captureViewportScreenshot(request);
  return persistScreenshotResult(result, savePath);
}
