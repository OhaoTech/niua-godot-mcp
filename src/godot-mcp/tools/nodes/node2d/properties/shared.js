import { normalizeFiniteNumber } from "../../../../shared/numbers.js";
import { normalizePlainObject } from "../../../../shared/normalize.js";
import { vector2ToGodotVector } from "../../../../shared/vectors.js";

export function resourceRef(path) {
  return { type: "Resource", path };
}

export function trimOptionalString(value) {
  return String(value ?? "").trim();
}

export function mergeAdvancedProperties(properties, payload, fieldName) {
  return {
    ...properties,
    ...normalizePlainObject(payload[fieldName], fieldName, {})
  };
}

export function buildNode2DProperties(payload, {
  extra = {},
  advancedField = "properties"
} = {}) {
  const properties = {};
  if (payload.position !== undefined) {
    properties.position = vector2ToGodotVector(payload.position, "position");
  }
  if (payload.rotationDegrees !== undefined) {
    properties.rotation_degrees = normalizeFiniteNumber(payload.rotationDegrees, "rotationDegrees");
  }
  if (payload.scale !== undefined) {
    properties.scale = vector2ToGodotVector(payload.scale, "scale");
  }

  return mergeAdvancedProperties({
    ...properties,
    ...extra
  }, payload, advancedField);
}

export function buildNodeCreateRequest(type, payload, properties) {
  const request = {
    type,
    properties
  };
  const name = trimOptionalString(payload.name);
  if (name) {
    request.name = name;
  }
  if (payload.parentPath !== undefined) {
    request.parentPath = String(payload.parentPath);
  }
  return request;
}
