export const VIEWPORT_TARGET_PROPERTIES = {
  viewport: {
    capture: {
      type: "string",
      description: "Editor viewport to capture: 2d or 3d. Defaults to 3d."
    },
    mutate: {
      type: "string",
      description: "Editor viewport to mutate: 2d or 3d. Defaults to 3d."
    },
    receiveInput: {
      type: "string",
      description: "Editor viewport to receive input: 2d or 3d. Defaults to 3d."
    }
  },
  index: {
    type: "number",
    description: "3D viewport index. Ignored for 2D. Defaults to 0."
  }
};
