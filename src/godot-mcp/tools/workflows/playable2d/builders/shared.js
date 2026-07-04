import { vector2ToGodotVector } from "../../../../shared/vectors.js";

export const DEFAULT_RESOURCE_DIRECTORY = "res://niua/generated/blockouts_2d";
export const DEFAULT_TRIGGER_RESOURCE_DIRECTORY = "res://niua/generated/triggers_2d";

export function normalizeGodotResourceDirectory(value) {
  const directory = String(value ?? "").trim();
  if (!directory.startsWith("res://")) {
    throw new Error("resourceDirectory must start with res://");
  }
  if (directory === "res://") {
    return directory;
  }
  return directory.replace(/\/+$/, "");
}

export function joinGodotResourcePath(directory, filename) {
  return directory === "res://" ? `res://${filename}` : `${directory}/${filename}`;
}

export function vector2ToComponents(value, fieldName) {
  const vector = vector2ToGodotVector(value, fieldName);
  return [vector.x, vector.y];
}

export function appendBlockoutStep(steps, name, result) {
  steps.push({
    name,
    ok: result.ok === true
  });
}

export function blockoutFailure(failedStep, result, data) {
  return {
    ok: false,
    error: result.error ?? `failed while creating ${failedStep}`,
    data: {
      ...data,
      failedStep,
      failedData: result.data ?? null
    }
  };
}
