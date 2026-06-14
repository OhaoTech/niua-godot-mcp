export function slugifyResourceName(value) {
  const slug = String(value ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "blockout_2d";
}

export function lastNodeName(nodePath, fallback) {
  return String(nodePath)
    .split("/")
    .filter(Boolean)
    .pop() || fallback;
}

export function toPascalIdentifier(value, fallback) {
  const pascal = String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
  return pascal || fallback;
}
