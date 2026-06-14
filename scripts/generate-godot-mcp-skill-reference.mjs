#!/usr/bin/env node
// Generate per-subsystem reference docs for the niua-godot-forge skill.
// One file per manifest domain, sourced from the same tool catalog as
// docs/godot-mcp/tools.md so the skill's reference never drifts.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GODOT_MCP_TOOLS } from "../src/godot-mcp/tools/index.js";
import { MIGRATED_MANIFEST_DOMAINS } from "../src/godot-mcp/manifest/domains.js";
import { V1_TOOL_NAMES } from "../src/godot-mcp/server/tool-profiles.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(repoRoot, "skills/niua-godot-forge/reference");
const v1Names = new Set(V1_TOOL_NAMES);
const toolsByName = new Map(GODOT_MCP_TOOLS.map((tool) => [tool.name, tool]));

function schemaType(schema = {}) {
  if (Array.isArray(schema.type)) {
    return schema.type.join("|");
  }
  if (schema.enum) {
    return `enum(${schema.enum.join("|")})`;
  }
  return schema.type ?? "any";
}

function renderArguments(tool) {
  const properties = tool.inputSchema?.properties ?? {};
  const required = new Set(tool.inputSchema?.required ?? []);
  const entries = Object.entries(properties);
  if (entries.length === 0) {
    return "none";
  }
  return entries
    .map(([name, schema]) => `${name}${required.has(name) ? "*" : ""}:${schemaType(schema)}`)
    .join(", ");
}

function escapeCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replace(/\s+/g, " ")
    .trim();
}

function renderTool(tool) {
  const profile = v1Names.has(tool.name) ? "v1, full" : "full";
  return `| \`${tool.name}\` | ${profile} | ${escapeCell(tool.description)} | ${escapeCell(renderArguments(tool))} |`;
}

function domainTools(domain) {
  const manifest = domain.manifest ?? {};
  const list = Array.isArray(manifest) ? manifest : (manifest.tools ?? []);
  return list
    .map((entry) => toolsByName.get(entry.name))
    .filter(Boolean);
}

await mkdir(outputDir, { recursive: true });

const indexRows = [];
let written = 0;

for (const domain of MIGRATED_MANIFEST_DOMAINS) {
  const tools = domainTools(domain);
  if (tools.length === 0) {
    continue;
  }
  const v1Count = tools.filter((tool) => v1Names.has(tool.name)).length;
  const lines = [
    `# ${domain.name} tools`,
    "",
    "Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.",
    "",
    `- Tools: ${tools.length} (${v1Count} in v1, ${tools.length - v1Count} full-only)`,
    "- Argument names with `*` are required.",
    "",
    "| Tool | Profiles | Description | Arguments |",
    "| --- | --- | --- | --- |",
    ...tools.map(renderTool),
    ""
  ];
  const outputPath = path.join(outputDir, `${domain.name}.md`);
  await writeFile(outputPath, `${lines.join("\n").replace(/\n+$/, "")}\n`, "utf8");
  indexRows.push(`| \`${domain.name}\` | ${tools.length} | ${v1Count} | reference/${domain.name}.md |`);
  written += 1;
}

const indexLines = [
  "# Subsystem reference index",
  "",
  "Generated. One file per Godot MCP subsystem domain. Read a file on demand for that subsystem's full tool surface.",
  "",
  "| Subsystem | Tools | In v1 | File |",
  "| --- | --- | --- | --- |",
  ...indexRows,
  ""
];
await writeFile(path.join(outputDir, "INDEX.md"), `${indexLines.join("\n").replace(/\n+$/, "")}\n`, "utf8");

process.stdout.write(`Wrote ${written} subsystem reference docs + INDEX.md to ${path.relative(repoRoot, outputDir)}\n`);
