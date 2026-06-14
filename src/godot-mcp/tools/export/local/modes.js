export function normalizeExportMode(value) {
  const mode = String(value ?? "release").trim().toLowerCase();
  if (mode !== "release" && mode !== "debug") {
    throw new Error("mode must be release or debug");
  }

  return mode;
}

export function exportFlag(mode) {
  return mode === "debug" ? "--export-debug" : "--export-release";
}
