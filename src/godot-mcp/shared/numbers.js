export function normalizeFiniteNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${fieldName} must be a finite number`);
  }
  return number;
}

export function normalizePositiveFiniteNumber(value, fieldName) {
  const number = normalizeFiniteNumber(value, fieldName);
  if (number <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return number;
}

export function normalizeNonNegativeInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${fieldName} must be a non-negative integer`);
  }
  return number;
}

export function normalizePositiveInteger(value, fallback) {
  const number = Number(value ?? fallback);
  if (!Number.isFinite(number) || number <= 0) {
    return fallback;
  }

  return Math.trunc(number);
}

export function normalizeBoundedInteger(value, {
  fallback,
  min,
  max
}) {
  const number = Number(value ?? fallback);
  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.trunc(number)));
}

