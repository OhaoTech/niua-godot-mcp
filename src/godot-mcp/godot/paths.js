import path from "node:path";

export function resolveProjectResDirectoryPath(projectRoot, rawPath) {
  const resPath = rawPath.trim() || "res://";
  if (!resPath.startsWith("res://")) {
    throw new Error(`path must be under res://: ${resPath}`);
  }
  if (resPath.includes("..")) {
    throw new Error(`path traversal is not allowed: ${resPath}`);
  }

  const relativePath = resPath.slice("res://".length);
  const absolutePath = path.resolve(projectRoot, relativePath);
  const relativeToRoot = path.relative(projectRoot, absolutePath);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new Error(`path escapes project root: ${resPath}`);
  }

  return {
    path: resPath.endsWith("/") || resPath === "res://" ? resPath : `${resPath}/`,
    absolutePath
  };
}

export function resolveProjectScriptPath(projectRoot, rawPath) {
  const scriptPath = rawPath.trim();
  if (!scriptPath) {
    throw new Error("path is required");
  }
  if (!scriptPath.startsWith("res://")) {
    throw new Error(`script path must be under res://: ${scriptPath}`);
  }
  if (scriptPath.includes("..")) {
    throw new Error(`path traversal is not allowed: ${scriptPath}`);
  }
  if (!scriptPath.endsWith(".gd")) {
    throw new Error(`script path must end with .gd: ${scriptPath}`);
  }

  const relativeScriptPath = scriptPath.slice("res://".length);
  if (!relativeScriptPath) {
    throw new Error("script path must include a file name");
  }

  const absolutePath = path.resolve(projectRoot, relativeScriptPath);
  const relativeToRoot = path.relative(projectRoot, absolutePath);
  if (relativeToRoot === "" || relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new Error(`script path escapes project root: ${scriptPath}`);
  }

  return {
    path: scriptPath,
    absolutePath
  };
}

export function absoluteProjectPathToResPath(projectRoot, absolutePath) {
  return `res://${path.relative(projectRoot, absolutePath).split(path.sep).join("/")}`;
}
