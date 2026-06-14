import { REQUIRED_ADDON_CODES } from "./catalog.js";

export function addonFilesReady(checks) {
  return checks
    .filter((check) => REQUIRED_ADDON_CODES.has(check.code))
    .every((check) => check.ok);
}
