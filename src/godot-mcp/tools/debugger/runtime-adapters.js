import { persistScreenshotResult } from "../shared/screenshot-io.js";

export async function captureRuntimeScreenshot({ client, payload = {} }) {
  const { savePath, ...request } = payload;
  const result = await client.captureRuntimeScreenshot(request);
  return persistScreenshotResult(result, savePath);
}

export async function getRuntimeNodeProperties({ client, payload = {} }) {
  const { properties, ...request } = payload;
  const result = await client.getRuntimeNodeProperties(request);
  return filterRuntimeNodeProperties(result, properties);
}

/**
 * Reduce runtime node property responses to an allowlist of property names.
 * A full property dump is ~100 entries of mostly engine boilerplate; agents
 * usually need two or three script variables. `totalPropertyCount` preserves
 * the unfiltered count so callers can tell filtering happened.
 */
export function filterRuntimeNodeProperties(result, properties) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return result;
  }

  const allow = new Set(properties.map((name) => String(name)));
  const responses = result?.data?.responses;
  if (!Array.isArray(responses)) {
    return result;
  }

  for (const response of responses) {
    if (!response || !Array.isArray(response.properties)) {
      continue;
    }
    const total = Number.isFinite(response.propertyCount)
      ? response.propertyCount
      : response.properties.length;
    response.properties = response.properties.filter(
      (property) => property && allow.has(property.name)
    );
    response.propertyCount = response.properties.length;
    response.totalPropertyCount = total;
  }

  return result;
}
