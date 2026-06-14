export function normalizeKindKey(value) {
  return String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function formatAllowedKinds(kinds) {
  return Array.from(kinds.keys()).join(", ");
}
