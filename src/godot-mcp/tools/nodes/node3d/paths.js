export function resolveCreatedNodePath(createdNode, requestedName, requestedParentPath) {
  const nodePath = String(createdNode?.data?.nodePath ?? "").trim();
  if (nodePath) {
    return nodePath;
  }

  const name = String(requestedName ?? "").trim();
  if (!name) {
    return String(requestedParentPath ?? "").trim();
  }

  const parentPath = String(requestedParentPath ?? "").trim();
  return parentPath ? `${parentPath}/${name}` : name;
}
