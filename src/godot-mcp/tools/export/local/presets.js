import { validateExportPreset as validatePreset } from "./presets/validate.js";

export async function validateExportPreset(args = {}) {
  return validatePreset(args);
}
