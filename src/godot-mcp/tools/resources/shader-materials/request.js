import { isPlainObject } from "../../../shared/normalize.js";
import { normalizeShaderParameters } from "./parameters.js";

export function buildShaderMaterialRequest(payload = {}) {
  const materialPath = String(payload.path ?? "").trim();
  if (!materialPath) {
    throw new Error("path is required");
  }

  const shaderPath = String(payload.shaderPath ?? "").trim();
  if (!shaderPath) {
    throw new Error("shaderPath is required");
  }

  const code = String(payload.code ?? "").trim();
  if (!code) {
    throw new Error("code is required");
  }

  const parameters = payload.parameters ?? {};
  if (!isPlainObject(parameters)) {
    throw new Error("parameters must be an object");
  }

  const request = {
    path: materialPath,
    shaderPath,
    code,
    parameters: normalizeShaderParameters(parameters),
    open: Boolean(payload.open ?? true),
    overwrite: Boolean(payload.overwrite ?? false),
    overwriteShader: Boolean(payload.overwriteShader ?? false)
  };

  const resourceName = String(payload.resourceName ?? payload.name ?? "").trim();
  if (resourceName) {
    request.resourceName = resourceName;
  }

  return request;
}
