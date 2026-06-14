import {
  normalizePort,
  openProjectProcesses
} from "../process-manager.js";

export function bridgeDiscoveryPorts(args = {}) {
  const explicitPorts = Array.isArray(args.ports) ? args.ports : [];
  const envPorts = parseDiscoveryPorts(process.env.GODOT_MCP_DISCOVERY_PORTS);
  const configuredPorts = explicitPorts.length > 0
    ? explicitPorts
    : envPorts;
  const ports = configuredPorts.length > 0
    ? configuredPorts.slice()
    : bridgeDiscoveryRange(args);

  ports.push(process.env.GODOT_MCP_PORT);
  for (const entry of openProjectProcesses.values()) {
    ports.push(entry.bridge?.port);
  }

  return uniquePorts(ports).slice(0, 64);
}

export function bridgeDiscoveryRange(args = {}) {
  const startPort = normalizePort(args.startPort ?? 9174, 9174);
  const endPort = normalizePort(args.endPort ?? 9194, 9194);
  const minPort = Math.min(startPort, endPort);
  const maxPort = Math.max(startPort, endPort);
  const ports = [];

  for (let port = minPort; port <= maxPort && ports.length < 64; port += 1) {
    ports.push(port);
  }

  return ports;
}

export function parseDiscoveryPorts(value) {
  return String(value ?? "")
    .split(/[,\s]+/)
    .map((port) => port.trim())
    .filter(Boolean);
}

export function uniquePorts(ports) {
  const seen = new Set();
  const normalizedPorts = [];

  for (const port of ports) {
    const normalizedPort = normalizePort(port, null);
    if (normalizedPort === null || seen.has(normalizedPort)) {
      continue;
    }

    seen.add(normalizedPort);
    normalizedPorts.push(normalizedPort);
  }

  return normalizedPorts;
}
