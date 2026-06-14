import { formatAllowedKinds, normalizeKindKey } from "./shared.js";

export function normalizeLight3DKind(value) {
  const key = normalizeKindKey(value);
  if (!LIGHT_3D_KINDS.has(key)) {
    throw new Error(`kind must be one of: ${formatAllowedKinds(LIGHT_3D_KINDS)}`);
  }
  return LIGHT_3D_KINDS.get(key);
}

const LIGHT_3D_KINDS = new Map([
  ["directional", { kind: "directional", type: "DirectionalLight3D" }],
  ["sun", { kind: "directional", type: "DirectionalLight3D" }],
  ["omni", { kind: "omni", type: "OmniLight3D", rangeProperty: "omni_range" }],
  ["point", { kind: "omni", type: "OmniLight3D", rangeProperty: "omni_range" }],
  ["spot", { kind: "spot", type: "SpotLight3D", rangeProperty: "spot_range", angleProperty: "spot_angle" }]
]);
