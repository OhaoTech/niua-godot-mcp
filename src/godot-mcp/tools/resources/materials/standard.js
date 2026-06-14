import { colorToGodotColor, normalizeColorComponent } from "../../../shared/colors.js";
import { normalizeFiniteNumber } from "../../../shared/numbers.js";
import { isPlainObject } from "../../../shared/normalize.js";
import {
  STANDARD_MATERIAL_3D_CULL_MODE,
  STANDARD_MATERIAL_3D_SHADING_MODE,
  STANDARD_MATERIAL_3D_TRANSPARENCY,
  normalizeMaterialEnum
} from "./enums.js";

export function buildStandardMaterial3DProperties(payload) {
  const properties = {};
  const resourceName = String(payload.name ?? "").trim();
  if (resourceName) {
    properties.resource_name = resourceName;
  }

  const rawAlbedoColor = payload.albedoColor ?? payload.baseColor;
  if (rawAlbedoColor !== undefined || payload.alpha !== undefined) {
    const color = rawAlbedoColor === undefined
      ? { type: "Color", r: 1, g: 1, b: 1, a: 1 }
      : colorToGodotColor(rawAlbedoColor, "albedoColor");
    if (payload.alpha !== undefined) {
      color.a = normalizeColorComponent(payload.alpha, "alpha");
    }
    properties.albedo_color = color;
    if (color.a < 1 && payload.transparency === undefined) {
      properties.transparency = STANDARD_MATERIAL_3D_TRANSPARENCY.get("alpha");
    }
  }

  applyOptionalNumberProperty(properties, "metallic", payload.metallic);
  applyOptionalNumberProperty(properties, "roughness", payload.roughness);

  if (payload.emissionColor !== undefined) {
    properties.emission = colorToGodotColor(payload.emissionColor, "emissionColor");
    if (payload.emissionEnabled === undefined) {
      properties.emission_enabled = true;
    }
  }
  if (payload.emissionEnabled !== undefined) {
    properties.emission_enabled = Boolean(payload.emissionEnabled);
  }
  applyOptionalNumberProperty(properties, "emission_energy_multiplier", payload.emissionEnergyMultiplier);

  const transparency = normalizeMaterialEnum(
    payload.transparency,
    STANDARD_MATERIAL_3D_TRANSPARENCY,
    "transparency"
  );
  if (transparency !== undefined) {
    properties.transparency = transparency;
  }

  const cullMode = normalizeMaterialEnum(payload.cullMode, STANDARD_MATERIAL_3D_CULL_MODE, "cullMode");
  if (cullMode !== undefined) {
    properties.cull_mode = cullMode;
  }

  const shadingMode = normalizeMaterialEnum(
    payload.shadingMode,
    STANDARD_MATERIAL_3D_SHADING_MODE,
    "shadingMode"
  );
  if (shadingMode !== undefined) {
    properties.shading_mode = shadingMode;
  }

  if (payload.properties !== undefined) {
    if (!isPlainObject(payload.properties)) {
      throw new Error("properties must be an object");
    }
    Object.assign(properties, payload.properties);
  }

  return properties;
}

function applyOptionalNumberProperty(properties, propertyName, value) {
  if (value !== undefined) {
    properties[propertyName] = normalizeFiniteNumber(value, propertyName);
  }
}
