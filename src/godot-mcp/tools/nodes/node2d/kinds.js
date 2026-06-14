export function normalizeCollisionShape2DKind(value) {
  const kind = String(value ?? "rectangle").trim().toLowerCase();
  if (kind === "rectangle" || kind === "rect" || kind === "box") {
    return { kind: "rectangle", className: "RectangleShape2D" };
  }
  if (kind === "circle" || kind === "disc" || kind === "disk") {
    return { kind: "circle", className: "CircleShape2D" };
  }
  if (kind === "capsule") {
    return { kind: "capsule", className: "CapsuleShape2D" };
  }
  throw new Error("shapeKind must be rectangle, circle, or capsule");
}
