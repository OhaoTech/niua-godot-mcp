import {
  initialLaunchBridgeState,
  pollLaunchBridgeHealth,
  resolveLaunchBridgeOptions
} from "./launch/bridge.js";
import { installProjectAddonForLaunch } from "./launch/addon.js";
import {
  createOpenProjectProcessEntry,
  serializeOpenProjectProcessEntry,
  waitForOpenProjectProcessSpawn
} from "./launch/process-entry.js";
import {
  reusableProjectResponse,
  resolveLaunchProject
} from "./launch/project.js";
import { rememberOpenedGodotProject } from "./launch/registry.js";

export async function openGodotProject(args = {}) {
  const {
    projectRoot,
    projectFile
  } = await resolveLaunchProject(args);
  const reused = reusableProjectResponse(args, projectRoot);
  if (reused) {
    return reused;
  }

  const addon = await installProjectAddonForLaunch(args, projectRoot);
  const bridgeOptions = await resolveLaunchBridgeOptions(args);
  const entry = createOpenProjectProcessEntry({
    args,
    projectRoot,
    projectFile,
    addon,
    bridgePort: bridgeOptions.bridgePort,
    bridgeToken: bridgeOptions.bridgeToken,
    bridgeState: initialLaunchBridgeState(bridgeOptions)
  });
  await waitForOpenProjectProcessSpawn(entry);

  if (bridgeOptions.waitForBridge) {
    entry.bridge = {
      ...entry.bridge,
      ...await pollLaunchBridgeHealth(bridgeOptions)
    };
  }
  const registryRecord = await rememberOpenedGodotProject(projectRoot);

  return {
    ok: true,
    data: {
      ...serializeOpenProjectProcessEntry(entry),
      registryRecord
    }
  };
}
