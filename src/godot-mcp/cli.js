#!/usr/bin/env node
import { pathToFileURL } from "node:url";

import { startStdioServer } from "./server/stdio.js";
import { buildSetupPlan, parseSetupArgs } from "./setup/config.js";
import { runMcpStdioSmoke } from "./setup/smoke.js";
import { writeClientConfig } from "./setup/writers.js";

export async function runSetupCli(argv = process.argv.slice(3), {
  stdout = process.stdout,
  stderr = process.stderr,
  env = process.env
} = {}) {
  try {
    const options = parseSetupArgs(argv, env);
    if (options.help) {
      stdout.write(setupUsage());
      return 0;
    }

    const plan = buildSetupPlan(options, env);
    let smoke = null;
    if (plan.smoke) {
      smoke = await runMcpStdioSmoke({
        command: plan.serverConfig.command,
        args: plan.serverConfig.args,
        env: {
          ...env,
          ...plan.serverConfig.env
        }
      });
    }

    const result = await writeClientConfig(plan);
    stdout.write(formatSetupResult(plan, result, smoke));
    return 0;
  } catch (error) {
    stderr.write(`NIUA Godot MCP setup failed: ${error.message}\n`);
    return 1;
  }
}

export function formatSetupResult(plan, result, smoke) {
  const lines = [];
  if (result.written) {
    lines.push(`NIUA Godot MCP setup: wrote ${result.configPath}`);
    if (result.backupPath) {
      lines.push(`Backup: ${result.backupPath}`);
    }
  } else {
    lines.push("NIUA Godot MCP setup: dry-run");
    lines.push(`Config path: ${result.configPath || "(generic output only)"}`);
    lines.push("No files written. Re-run with --write to update the client config.");
  }

  lines.push(`Client: ${plan.client}`);
  lines.push(`Server: ${plan.serverName}`);
  if (smoke) {
    lines.push(`MCP stdio smoke: ok (${smoke.serverInfo.name || "server"}, ${smoke.toolCount} tools)`);
  } else {
    lines.push("MCP stdio smoke: skipped");
  }
  lines.push("");
  lines.push(result.renderedConfig.trimEnd());
  lines.push("");
  lines.push("Restart the MCP client after writing config, then call get_godot_version.");
  lines.push("");
  return lines.join("\n");
}

function setupUsage() {
  return `Usage: niua-godot-mcp setup --client <claude|codex|generic> --project-root <path> [options]

Options:
  --write                  Write the client config. Default is dry-run.
  --config-path <path>      Override the detected client config path.
  --server-name <name>      MCP server name. Default: niua-godot.
  --profile <v1|full>       Tool profile. Default: v1.
  --godot-bin <command>     Godot command/path. Default: GODOT_BIN or godot.
  --node-command <path>     Node command/path. Default: current Node executable.
  --server-path <path>      MCP server JS path. Default: bundled server.js.
  --no-smoke               Skip initialize + tools/list stdio smoke.
`;
}

async function main(argv = process.argv.slice(2)) {
  const command = argv[0];
  if (!command) {
    startStdioServer();
    return;
  }
  if (command === "setup") {
    process.exitCode = await runSetupCli(argv.slice(1));
    return;
  }
  if (command === "--help" || command === "-h" || command === "help") {
    process.stdout.write(`Usage: niua-godot-mcp [setup]\n\nRun without arguments to start the MCP stdio server.\n\n${setupUsage()}`);
    return;
  }
  process.stderr.write(`Unknown niua-godot-mcp command: ${command}\n`);
  process.stderr.write("Run `niua-godot-mcp --help` for usage.\n");
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
