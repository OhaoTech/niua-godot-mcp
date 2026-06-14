import { GodotBridgeClient } from "../bridge-client.js";
import { resolveBridgeToken } from "../services/bridge-auth.js";

export function createBridgeClient(args = {}) {
  const host = args.host ?? process.env.GODOT_MCP_HOST ?? "127.0.0.1";
  const port = Number(args.port ?? process.env.GODOT_MCP_PORT ?? 9174);
  return new GodotBridgeClient({
    host,
    port,
    token: resolveBridgeToken({
      host,
      port,
      token: args.token,
      bridgeToken: args.bridgeToken
    })
  });
}

export function splitBridgeArgs(args = {}) {
  const { host, port, token, bridgeToken, ...payload } = args;
  return {
    client: createBridgeClient({ host, port, token, bridgeToken }),
    payload
  };
}

export function pickBridgeConnectionArgs(args = {}) {
  const connectionArgs = {};
  if (args.host !== undefined) {
    connectionArgs.host = args.host;
  }
  if (args.port !== undefined) {
    connectionArgs.port = args.port;
  }
  return connectionArgs;
}
