export {
  allowedProjectRoots,
  assertAllowedProjectRoot,
  pathExists
} from "./project-registry/paths.js";
export {
  projectRegistryPath,
  readProjectRegistry,
  writeProjectRegistry
} from "./project-registry/storage.js";
export {
  parseProjectName,
  projectMetadata
} from "./project-registry/metadata.js";
export {
  knownProjectByRoot,
  rememberGodotProject
} from "./project-registry/records.js";
