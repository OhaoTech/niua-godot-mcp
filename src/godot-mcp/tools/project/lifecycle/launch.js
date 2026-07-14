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
import { getRunningProjectByRoot } from "../../../services/process-manager.js";
import { writeBridgeSession } from "../../../services/bridge-session.js";

function persistLocalSession(projectRoot, { host, port, token } = {}) {
  if (!projectRoot || port == null) return null;
  try {
    return writeBridgeSession(projectRoot, {
      host: host ?? "127.0.0.1",
      port,
      token: token ?? null
    });
  } catch {
    return null;
  }
}

export async function openGodotProject(args = {}) {
  const {
    projectRoot,
    projectFile
  } = await resolveLaunchProject(args);
  const reused = reusableProjectResponse(args, projectRoot);
  if (reused) {
    const live = getRunningProjectByRoot(projectRoot);
    const sessionPath = persistLocalSession(projectRoot, {
      host: live?.bridge?.host ?? reused.data?.bridge?.host,
      port: live?.bridge?.port ?? reused.data?.bridge?.port,
      token: live?.bridgeToken ?? null
    });
    return {
      ...reused,
      data: {
        ...reused.data,
        sessionPath: sessionPath ?? undefined
      }
    };
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
  const sessionPath = persistLocalSession(projectRoot, {
    host: bridgeOptions.bridgeHost,
    port: bridgeOptions.bridgePort,
    token: bridgeOptions.bridgeToken
  });

  return {
    ok: true,
    data: {
      ...serializeOpenProjectProcessEntry(entry),
      registryRecord,
      sessionPath: sessionPath ?? undefined
    }
  };
}
