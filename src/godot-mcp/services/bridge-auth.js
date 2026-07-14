import { randomBytes } from "node:crypto";

import { findOpenProjectByBridge } from "./process-store.js";
import { loadBridgeSession } from "./bridge-session.js";

const TOKEN_BYTES = 32;

export function generateBridgeToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function environmentBridgeToken() {
  const token = String(process.env.GODOT_MCP_TOKEN ?? process.env.NIUA_MCP_TOKEN ?? "").trim();
  return token || null;
}

/**
 * Resolve auth for a bridge call without user setup:
 *   1) explicit args
 *   2) in-memory open_project session (same MCP process)
 *   3) project-local session file (SDK / other processes)
 *   4) env (power users / CI)
 * Returns null when no token is configured (localhost open bridge).
 */
export function resolveBridgeToken({
  host,
  port,
  token,
  bridgeToken,
  projectRoot,
  expectedProjectRoot
} = {}) {
  const explicit = String(token ?? bridgeToken ?? "").trim();
  if (explicit) {
    return explicit;
  }

  const entry = findOpenProjectByBridge({ host, port });
  if (entry?.bridgeToken) {
    return entry.bridgeToken;
  }

  const root = String(expectedProjectRoot ?? projectRoot ?? "").trim();
  if (root) {
    const session = loadBridgeSession(root);
    if (session?.token) {
      return session.token;
    }
  }

  return environmentBridgeToken();
}

/**
 * Resolve host/port/token for SDK-style connect — project session first, then env, then defaults.
 */
export function resolveBridgeConnection(opts = {}) {
  const root = String(opts.expectedProjectRoot ?? opts.projectRoot ?? "").trim() || null;
  const session = root ? loadBridgeSession(root) : null;

  const host = String(
    opts.host ?? session?.host ?? process.env.GODOT_MCP_HOST ?? "127.0.0.1"
  ).trim() || "127.0.0.1";
  const port = Number(
    opts.port ?? session?.port ?? process.env.GODOT_MCP_PORT ?? 9174
  );
  const token = resolveBridgeToken({
    host,
    port,
    token: opts.token,
    bridgeToken: opts.bridgeToken,
    expectedProjectRoot: root,
    projectRoot: root
  });

  return {
    host,
    port,
    token: token || undefined,
    expectedProjectRoot: root || undefined,
    sessionPath: root ? (session ? true : false) : false,
    fromSession: Boolean(session)
  };
}
