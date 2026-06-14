export const ACTION_NAMES_SCHEMA = {
  type: "object",
  description: "Optional action name overrides used by both the Input Map and generated script.",
  properties: {
    moveForward: { type: "string" },
    moveBack: { type: "string" },
    moveLeft: { type: "string" },
    moveRight: { type: "string" },
    jump: { type: "string" }
  },
  additionalProperties: false
};
