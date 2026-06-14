import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_TOOL_PROFILE,
  resolveToolProfile
} from "../server/tool-profiles.js";

export const DEFAULT_SERVER_NAME = "niua-godot";
export const DEFAULT_STARTUP_TIMEOUT_SEC = 120;
export const SUPPORTED_CLIENTS = Object.freeze(["claude", "codex", "generic"]);

const setupDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(setupDir, "../../..");
const defaultServerPath = path.join(repoRoot, "src/godot-mcp/server.js");

export function parseSetupArgs(argv = process.argv.slice(2), env = process.env) {
  const options = {
    client: undefined,
    projectRoot: undefined,
    configPath: undefined,
    serverName: DEFAULT_SERVER_NAME,
    profile: DEFAULT_TOOL_PROFILE,
    godotBin: env.GODOT_BIN || "godot",
    nodeCommand: process.execPath,
    serverPath: defaultServerPath,
    startupTimeoutSec: DEFAULT_STARTUP_TIMEOUT_SEC,
    write: false,
    smoke: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--client":
        options.client = requireValue(argv, index, arg);
        index += 1;
        break;
      case "--project-root":
        options.projectRoot = requireValue(argv, index, arg);
        index += 1;
        break;
      case "--config-path":
        options.configPath = requireValue(argv, index, arg);
        index += 1;
        break;
      case "--server-name":
        options.serverName = requireValue(argv, index, arg);
        index += 1;
        break;
      case "--profile":
        options.profile = requireValue(argv, index, arg);
        index += 1;
        break;
      case "--godot-bin":
        options.godotBin = requireValue(argv, index, arg);
        index += 1;
        break;
      case "--node-command":
        options.nodeCommand = requireValue(argv, index, arg);
        index += 1;
        break;
      case "--server-path":
        options.serverPath = requireValue(argv, index, arg);
        index += 1;
        break;
      case "--startup-timeout-sec":
        options.startupTimeoutSec = Number(requireValue(argv, index, arg));
        index += 1;
        break;
      case "--write":
        options.write = true;
        break;
      case "--dry-run":
        options.write = false;
        break;
      case "--no-smoke":
        options.smoke = false;
        break;
      case "--smoke":
        options.smoke = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`Unknown setup option: ${arg}`);
    }
  }

  if (!options.client) {
    options.client = "generic";
  }

  return options;
}

export function buildSetupPlan(options = {}, env = process.env) {
  const client = normalizeClient(options.client || "generic");
  const projectRoot = options.projectRoot ? path.resolve(options.projectRoot) : "";
  if (!projectRoot) {
    throw new Error("Missing required setup option: --project-root");
  }

  const profile = resolveToolProfile(options.profile || DEFAULT_TOOL_PROFILE);
  const nodeCommand = resolveCommand(options.nodeCommand || process.execPath);
  const serverPath = path.resolve(options.serverPath || defaultServerPath);
  const serverName = options.serverName || DEFAULT_SERVER_NAME;
  const configPath = options.configPath
    ? path.resolve(options.configPath)
    : clientConfigPath(client, env);

  return {
    client,
    serverName,
    configPath,
    write: Boolean(options.write),
    smoke: options.smoke !== false,
    startupTimeoutSec: normalizeStartupTimeout(options.startupTimeoutSec),
    serverConfig: mcpServerConfig({
      nodeCommand,
      serverPath,
      projectRoot,
      profile,
      godotBin: options.godotBin || env.GODOT_BIN || "godot"
    })
  };
}

export function mcpServerConfig({
  nodeCommand = process.execPath,
  serverPath = defaultServerPath,
  projectRoot,
  profile = DEFAULT_TOOL_PROFILE,
  godotBin = "godot"
} = {}) {
  if (!projectRoot) {
    throw new Error("projectRoot is required");
  }
  return {
    command: resolveCommand(nodeCommand),
    args: [path.resolve(serverPath)],
    env: {
      NIUA_MCP_PROFILE: resolveToolProfile(profile),
      GODOT_BIN: godotBin,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: path.resolve(projectRoot)
    }
  };
}

export function clientConfigPath(client, env = process.env) {
  const normalized = normalizeClient(client);
  const home = env.HOME || os.homedir();
  if (normalized === "codex") {
    return path.join(home, ".codex/config.toml");
  }
  if (normalized === "claude") {
    if (process.platform === "darwin") {
      return path.join(home, "Library/Application Support/Claude/claude_desktop_config.json");
    }
    if (process.platform === "win32") {
      return path.join(env.APPDATA || path.join(home, "AppData/Roaming"), "Claude/claude_desktop_config.json");
    }
    return path.join(env.XDG_CONFIG_HOME || path.join(home, ".config"), "Claude/claude_desktop_config.json");
  }
  return "";
}

function normalizeClient(client) {
  const normalized = String(client || "").trim().toLowerCase();
  if (!SUPPORTED_CLIENTS.includes(normalized)) {
    throw new Error(
      `Unsupported MCP client: ${client}. Expected one of: ${SUPPORTED_CLIENTS.join(", ")}.`
    );
  }
  return normalized;
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function normalizeStartupTimeout(value) {
  const number = Number(value ?? DEFAULT_STARTUP_TIMEOUT_SEC);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`Invalid --startup-timeout-sec: ${value}`);
  }
  return number;
}

function resolveCommand(command) {
  const value = String(command || "").trim();
  if (!value) {
    throw new Error("Executable command cannot be empty");
  }
  if (path.isAbsolute(value) || value.includes("/") || value.includes("\\")) {
    return path.resolve(value);
  }
  return value;
}
