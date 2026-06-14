import { randomBytes } from "node:crypto";

import { findOpenProjectByBridge } from "./process-store.js";

const TOKEN_BYTES = 32;

export function generateBridgeToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function environmentBridgeToken() {
  const token = String(process.env.GODOT_MCP_TOKEN ?? process.env.NIUA_MCP_TOKEN ?? "").trim();
  return token || null;
}

export function resolveBridgeToken({
  host,
  port,
  token,
  bridgeToken
} = {}) {
  const explicit = String(token ?? bridgeToken ?? "").trim();
  if (explicit) {
    return explicit;
  }

  const entry = findOpenProjectByBridge({ host, port });
  if (entry?.bridgeToken) {
    return entry.bridgeToken;
  }

  return environmentBridgeToken();
}
