export function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function normalizeOptionalName(value, fallback) {
  const name = String(value ?? fallback ?? "").trim();
  if (!name) {
    throw new Error("node names must not be empty");
  }
  return name;
}

export function normalizePlainObject(value, fieldName, fallback = undefined) {
  if (value === undefined) {
    return fallback;
  }
  if (!isPlainObject(value)) {
    throw new Error(`${fieldName} must be an object`);
  }
  return value;
}

