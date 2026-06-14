import { createServer as createNetServer } from "node:net";

export async function resolveBridgePort(args = {}) {
  const host = String(args.bridgeHost ?? process.env.GODOT_MCP_HOST ?? "127.0.0.1");
  if (args.bridgePort !== undefined && args.bridgePort !== null) {
    const port = normalizePort(args.bridgePort, null);
    if (port === null) {
      throw new Error(`invalid bridgePort: ${args.bridgePort}`);
    }

    if (!await isPortAvailable(port, host)) {
      throw new Error(`bridge port ${port} is already in use on ${host}`);
    }

    return {
      port,
      requestedPort: port,
      source: "argument",
      negotiated: false
    };
  }

  const envPort = normalizePort(process.env.GODOT_MCP_PORT, null);
  const preferredPort = envPort ?? 9174;
  if (await isPortAvailable(preferredPort, host)) {
    return {
      port: preferredPort,
      requestedPort: preferredPort,
      source: envPort === null ? "default" : "environment",
      negotiated: false
    };
  }

  const port = await allocateFreePort(host);
  return {
    port,
    requestedPort: preferredPort,
    source: "allocated",
    negotiated: true
  };
}

export function normalizePort(value, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0 || number > 65535) {
    return fallback;
  }

  return number;
}

export async function isPortAvailable(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const server = createNetServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

export async function allocateFreePort(host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const server = createNetServer();
    server.once("error", reject);
    server.listen(0, host, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}
