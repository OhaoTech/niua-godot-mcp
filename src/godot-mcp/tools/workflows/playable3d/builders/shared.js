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

export function slugifyResourceName(value) {
  const slug = String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "blockout";
}

export function joinGodotResourcePath(directory, filename) {
  return directory === "res://" ? `res://${filename}` : `${directory}/${filename}`;
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
