import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const SAVE_PATH_PROPERTY = {
  savePath: {
    type: "string",
    description: "When set, decode the PNG payload and write it to this filesystem path instead of returning inline base64. The response replaces the base64 data with savedPath + savedBytes, keeping tool output small. Parent directories are created automatically."
  }
};

/**
 * Persist screenshot base64 payloads from a bridge result to disk.
 *
 * Handles both bridge screenshot shapes:
 * - single image: `data.{available,width,height,encoding,data}`
 * - runtime probe: `data.responses[].{available,width,height,encoding,data}`
 *
 * When `savePath` is provided, every available base64 payload is decoded and
 * written to disk (additional runtime responses get a numeric suffix). The
 * base64 `data` field is cleared and replaced with `savedPath`/`savedBytes`
 * so large payloads never flow back through the MCP transport. The list of
 * written files is reported on `data.savedPaths`.
 */
export async function persistScreenshotResult(result, savePath) {
  if (!savePath) {
    return result;
  }

  const data = result?.data;
  if (!data || result.ok === false) {
    return result;
  }

  const resolved = path.resolve(String(savePath));
  const saved = [];

  if (isBase64ImagePayload(data)) {
    saved.push(await writeScreenshotPayload(data, resolved));
  } else if (Array.isArray(data.responses)) {
    let imageIndex = 0;
    for (const response of data.responses) {
      if (!isBase64ImagePayload(response)) {
        continue;
      }
      const target = imageIndex === 0 ? resolved : suffixedPath(resolved, imageIndex + 1);
      saved.push(await writeScreenshotPayload(response, target));
      imageIndex += 1;
    }
  }

  data.savedPaths = saved;
  return result;
}

function isBase64ImagePayload(candidate) {
  return Boolean(
    candidate &&
    candidate.available !== false &&
    typeof candidate.data === "string" &&
    candidate.data.length > 0
  );
}

async function writeScreenshotPayload(payload, target) {
  const buffer = Buffer.from(payload.data, "base64");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  payload.data = "";
  payload.savedPath = target;
  payload.savedBytes = buffer.length;
  return target;
}

function suffixedPath(filePath, ordinal) {
  const extension = path.extname(filePath);
  const base = filePath.slice(0, filePath.length - extension.length);
  return `${base}-${ordinal}${extension}`;
}
