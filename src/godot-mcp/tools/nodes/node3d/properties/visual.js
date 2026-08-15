import { colorToGodotColor } from "../../../../shared/colors.js";
import { normalizeFiniteNumber } from "../../../../shared/numbers.js";
import { vector2ToGodotVector } from "../../../../shared/vectors.js";
import { normalizeCamera3DProjection } from "../kinds.js";
import {
  applyNode3DTransformProperties,
  applyOptionalNumberProperty,
  mergeCustomProperties
} from "./shared.js";

export function buildCamera3DProperties(payload) {
  const properties = {};

  applyNode3DTransformProperties(properties, payload);
  if (payload.current !== undefined) {
    properties.current = Boolean(payload.current);
  }

  applyOptionalNumberProperty(properties, "fov", payload.fov);
  applyOptionalNumberProperty(properties, "size", payload.size);
  applyOptionalNumberProperty(properties, "near", payload.near);
  applyOptionalNumberProperty(properties, "far", payload.far);

  const projection = normalizeCamera3DProjection(payload.projection);
  if (projection !== undefined) {
    properties.projection = projection;
  }
  mergeCustomProperties(properties, payload.properties, "properties");

  return properties;
}

export function buildLight3DProperties(payload, lightKind) {
  const properties = {};

  applyNode3DTransformProperties(properties, payload);
  if (payload.color !== undefined) {
    properties.light_color = colorToGodotColor(payload.color, "color");
  }

  applyOptionalNumberProperty(properties, "light_energy", payload.energy);
  if (payload.shadowEnabled !== undefined) {
    properties.shadow_enabled = Boolean(payload.shadowEnabled);
  }

  if (payload.range !== undefined) {
    if (!lightKind.rangeProperty) {
      throw new Error("range is only supported for omni and spot lights");
    }
    properties[lightKind.rangeProperty] = normalizeFiniteNumber(payload.range, "range");
  }
  if (payload.angleDegrees !== undefined) {
    if (!lightKind.angleProperty) {
      throw new Error("angleDegrees is only supported for spot lights");
    }
    properties[lightKind.angleProperty] = normalizeFiniteNumber(payload.angleDegrees, "angleDegrees");
  }
  if (payload.areaSize !== undefined) {
    if (lightKind.kind !== "area") {
      throw new Error("areaSize is only supported for area lights");
    }
    properties.area_size = vector2ToGodotVector(payload.areaSize, "areaSize");
  }
  if (payload.areaRange !== undefined) {
    if (lightKind.kind !== "area") {
      throw new Error("areaRange is only supported for area lights");
    }
    properties.area_range = normalizeFiniteNumber(payload.areaRange, "areaRange");
  }
  if (payload.areaAttenuation !== undefined) {
    if (lightKind.kind !== "area") {
      throw new Error("areaAttenuation is only supported for area lights");
    }
    properties.area_attenuation = normalizeFiniteNumber(payload.areaAttenuation, "areaAttenuation");
  }
  if (payload.areaNormalizeEnergy !== undefined) {
    if (lightKind.kind !== "area") {
      throw new Error("areaNormalizeEnergy is only supported for area lights");
    }
    properties.area_normalize_energy = Boolean(payload.areaNormalizeEnergy);
  }
  if (payload.areaTexturePath !== undefined) {
    if (lightKind.kind !== "area") {
      throw new Error("areaTexturePath is only supported for area lights");
    }
    properties.area_texture = String(payload.areaTexturePath);
  }
  mergeCustomProperties(properties, payload.properties, "properties");

  return properties;
}
