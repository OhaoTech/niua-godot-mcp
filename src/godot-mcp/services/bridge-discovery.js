import { normalizePositiveInteger } from "../shared/numbers.js";
import { resolveBridgeToken } from "./bridge-auth.js";
import { readProjectRegistry } from "./project-registry.js";
import {
  bridgeDiscoveryPorts
} from "./bridge-discovery/ports.js";
import {
  probeEditorBridge
} from "./bridge-discovery/probe.js";
import { buildBridgeDiscoveryData } from "./bridge-discovery/results.js";

export {
  bridgeDiscoveryPorts,
  bridgeDiscoveryRange,
  parseDiscoveryPorts,
  uniquePorts
} from "./bridge-discovery/ports.js";
export {
  fetchJsonFromBridge,
  probeEditorBridge
} from "./bridge-discovery/probe.js";

export async function discoverEditorBridges(args = {}) {
  const host = String(args.host ?? process.env.GODOT_MCP_HOST ?? "127.0.0.1");
  const timeoutMs = normalizePositiveInteger(args.timeoutMs, 500);
  const includeUnavailable = Boolean(args.includeUnavailable ?? false);
  const ports = bridgeDiscoveryPorts(args);
  const registry = await readProjectRegistry();
  const probes = await Promise.all(ports.map((port) => probeEditorBridge({
    host,
    port,
    timeoutMs,
    token: resolveBridgeToken({ host, port })
  })));

  return {
    ok: true,
    data: buildBridgeDiscoveryData({
      host,
      ports,
      probes,
      includeUnavailable,
      registry
    })
  };
}
