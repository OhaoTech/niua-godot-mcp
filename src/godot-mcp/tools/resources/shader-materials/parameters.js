import { colorToGodotColor } from "../../../shared/colors.js";

export function normalizeShaderParameters(parameters) {
  const normalized = {};
  for (const [rawName, value] of Object.entries(parameters)) {
    const name = String(rawName).trim();
    if (!name) {
      throw new Error("shader parameter names must not be empty");
    }
    if (name.includes("/")) {
      throw new Error(`shader parameter names must not include slash: ${name}`);
    }
    normalized[name] = normalizeShaderParameterValue(value, `parameters.${name}`);
  }
  return normalized;
}

export function normalizeShaderParameterValue(value, fieldName) {
  if (typeof value !== "string") {
    return value;
  }

  const text = value.trim();
  if (text.startsWith("#")) {
    return colorToGodotColor(text, fieldName);
  }
  if (text.startsWith("res://")) {
    return {
      type: "Resource",
      path: text
    };
  }
  return value;
}
