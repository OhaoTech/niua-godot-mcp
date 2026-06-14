import { normalizePositiveInteger } from "../../../../shared/numbers.js";
import {
  environmentBridgeToken,
  generateBridgeToken
} from "../../../../services/bridge-auth.js";
import {
  pollBridgeHealth,
  resolveBridgePort
} from "../../../../services/process-manager.js";

export async function resolveLaunchBridgeOptions(args = {}) {
  const bridgeHost = String(args.bridgeHost ?? process.env.GODOT_MCP_HOST ?? "127.0.0.1");
  const bridgeSelection = await resolveBridgePort({
    ...args,
    bridgeHost
  });
  const bridgeToken = String(args.bridgeToken ?? environmentBridgeToken() ?? generateBridgeToken()).trim();

  return {
    waitForBridge: args.waitForBridge !== false,
    bridgeHost,
    bridgeSelection,
    bridgePort: bridgeSelection.port,
    bridgeToken,
    timeoutMs: normalizePositiveInteger(args.timeoutMs, 10000)
  };
}

export function initialLaunchBridgeState({
  bridgeHost,
  bridgeSelection,
  bridgeToken
}) {
  return {
    host: bridgeHost,
    port: bridgeSelection.port,
    requestedPort: bridgeSelection.requestedPort,
    source: bridgeSelection.source,
    negotiated: bridgeSelection.negotiated,
    tokenConfigured: Boolean(bridgeToken),
    available: false,
    status: null,
    error: null
  };
}

export async function pollLaunchBridgeHealth({
  bridgeHost,
  bridgePort,
  bridgeToken,
  timeoutMs
}) {
  return pollBridgeHealth({
    host: bridgeHost,
    port: bridgePort,
    token: bridgeToken,
    timeoutMs
  });
}
