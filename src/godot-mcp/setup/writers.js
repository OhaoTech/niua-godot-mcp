import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeClientConfig(plan) {
  const existingText = await readExistingConfig(plan.configPath, plan.client);
  const renderedConfig = renderClientConfig(
    plan.client,
    existingText,
    plan.serverName,
    plan.serverConfig,
    {
      startupTimeoutSec: plan.startupTimeoutSec
    }
  );

  if (!plan.write) {
    return {
      written: false,
      configPath: plan.configPath,
      backupPath: "",
      renderedConfig
    };
  }

  await mkdir(path.dirname(plan.configPath), { recursive: true });
  const backupPath = existingText === "" ? "" : `${plan.configPath}.bak-${timestamp()}`;
  if (backupPath) {
    await rename(plan.configPath, backupPath);
  }
  await writeFile(plan.configPath, renderedConfig);

  return {
    written: true,
    configPath: plan.configPath,
    backupPath,
    renderedConfig
  };
}

export function renderClientConfig(client, existingText, serverName, serverConfig, options = {}) {
  if (client === "claude" || client === "generic") {
    return renderClaudeConfig(existingText, serverName, serverConfig);
  }
  if (client === "codex") {
    return renderCodexConfig(existingText, serverName, serverConfig, options);
  }
  throw new Error(`Unsupported MCP client writer: ${client}`);
}

export function renderClaudeConfig(existingText, serverName, serverConfig) {
  const config = parseJsonConfig(existingText);
  config.mcpServers = {
    ...(isPlainObject(config.mcpServers) ? config.mcpServers : {}),
    [serverName]: serverConfig
  };
  return `${JSON.stringify(config, null, 2)}\n`;
}

export function renderCodexConfig(existingText, serverName, serverConfig, options = {}) {
  const preserved = stripCodexServer(existingText, serverName).trimEnd();
  const block = [
    `[mcp_servers.${serverName}]`,
    `command = ${tomlString(serverConfig.command)}`,
    `args = [${serverConfig.args.map(tomlString).join(", ")}]`,
    ...(options.startupTimeoutSec ? [`startup_timeout_sec = ${Number(options.startupTimeoutSec)}`] : []),
    "",
    `[mcp_servers.${serverName}.env]`,
    ...Object.entries(serverConfig.env).map(([key, value]) => `${key} = ${tomlString(value)}`)
  ].join("\n");

  if (!preserved) {
    return `${block}\n`;
  }
  return `${preserved}\n\n${block}\n`;
}

function stripCodexServer(text, serverName) {
  const lines = String(text || "").split(/\r?\n/);
  const kept = [];
  let skipping = false;

  for (const line of lines) {
    const header = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (header) {
      const section = header[1].trim();
      skipping = section === `mcp_servers.${serverName}` ||
        section.startsWith(`mcp_servers.${serverName}.`);
    }
    if (!skipping) {
      kept.push(line);
    }
  }

  return kept.join("\n");
}

async function readExistingConfig(configPath, client) {
  if (!configPath) {
    if (client === "generic") {
      return "";
    }
    throw new Error(`No config path resolved for ${client}`);
  }
  try {
    return await readFile(configPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

function parseJsonConfig(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return {};
  }
  const parsed = JSON.parse(trimmed);
  if (!isPlainObject(parsed)) {
    throw new Error("MCP client JSON config must contain an object at the top level");
  }
  return parsed;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function tomlString(value) {
  return JSON.stringify(String(value));
}

function timestamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
