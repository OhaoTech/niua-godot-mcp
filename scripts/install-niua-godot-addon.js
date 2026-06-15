#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { cp, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PLUGIN_PATH = "res://addons/niua_mcp/plugin.cfg";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptDir, "..");

function parsePackedStringArray(line) {
  const match = /enabled=PackedStringArray\((.*)\)/.exec(line);
  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function formatPackedStringArray(entries) {
  return `enabled=PackedStringArray(${entries.map((entry) => JSON.stringify(entry)).join(", ")})`;
}

export function enableEditorPlugin(projectText, pluginPath = PLUGIN_PATH) {
  const lines = projectText.split(/\r?\n/);
  let sectionStart = lines.findIndex((line) => line.trim() === "[editor_plugins]");

  if (sectionStart === -1) {
    if (lines.at(-1) !== "") {
      lines.push("");
    }
    lines.push("[editor_plugins]", formatPackedStringArray([pluginPath]));
    return `${lines.join("\n")}\n`;
  }

  const sectionEnd = lines.findIndex((line, index) => (
    index > sectionStart
    && line.trim().startsWith("[")
    && line.trim().endsWith("]")
  ));
  const end = sectionEnd === -1 ? lines.length : sectionEnd;
  const enabledIndex = lines.findIndex((line, index) => (
    index > sectionStart
    && index < end
    && line.trim().startsWith("enabled=PackedStringArray(")
  ));

  if (enabledIndex === -1) {
    lines.splice(sectionStart + 1, 0, formatPackedStringArray([pluginPath]));
    return `${lines.join("\n").replace(/\n+$/, "")}\n`;
  }

  const entries = parsePackedStringArray(lines[enabledIndex]);
  if (!entries.includes(pluginPath)) {
    entries.push(pluginPath);
  }
  lines[enabledIndex] = formatPackedStringArray(entries);
  return `${lines.join("\n").replace(/\n+$/, "")}\n`;
}

export async function installAddon({ projectRoot, repoRoot = defaultRepoRoot } = {}) {
  if (!projectRoot) {
    throw new Error("projectRoot is required");
  }

  const resolvedProjectRoot = path.resolve(projectRoot);
  const projectFile = path.join(resolvedProjectRoot, "project.godot");
  const sourceAddon = path.join(path.resolve(repoRoot), "godot/addons/niua_mcp");
  const targetAddon = path.join(resolvedProjectRoot, "addons/niua_mcp");

  await stat(projectFile);
  await stat(sourceAddon);
  await cp(sourceAddon, targetAddon, {
    recursive: true,
    force: true
  });

  const projectText = await readFile(projectFile, "utf8");
  await writeFile(projectFile, enableEditorPlugin(projectText));

  return {
    projectRoot: resolvedProjectRoot,
    addonPath: targetAddon,
    pluginPath: PLUGIN_PATH
  };
}

async function main() {
  const projectRoot = process.argv[2];
  if (!projectRoot) {
    process.stderr.write("Usage: install-niua-godot-addon <project-root>\n");
    process.exitCode = 1;
    return;
  }

  const result = await installAddon({ projectRoot });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function isDirectRun() {
  if (!process.argv[1]) {
    return false;
  }
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  }
}

if (isDirectRun()) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
