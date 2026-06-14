import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  projectRegistryPath,
  readProjectRegistry,
  rememberGodotProject
} from "../../../src/godot-mcp/services/project-registry.js";

async function readProjectRegistrySource(file) {
  return readFile(new URL(`../../../src/godot-mcp/services/${file}`, import.meta.url), "utf8");
}

async function withTempProject(run) {
  const workspace = await mkdtemp(path.join(tmpdir(), "niua-godot-registry-"));
  const previousAllowedRoots = process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS;
  const previousRegistry = process.env.GODOT_MCP_PROJECT_REGISTRY;
  process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS = workspace;
  process.env.GODOT_MCP_PROJECT_REGISTRY = path.join(workspace, "registry.json");

  try {
    const projectRoot = path.join(workspace, "game");
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), `config_version=5

[application]
config/name="Registry Test"
`, "utf8");

    return await run({ workspace, projectRoot });
  } finally {
    if (previousAllowedRoots === undefined) {
      delete process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS;
    } else {
      process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS = previousAllowedRoots;
    }
    if (previousRegistry === undefined) {
      delete process.env.GODOT_MCP_PROJECT_REGISTRY;
    } else {
      process.env.GODOT_MCP_PROJECT_REGISTRY = previousRegistry;
    }
    await rm(workspace, { recursive: true, force: true });
  }
}

test("project registry persists remembered Godot projects", async () => {
  await withTempProject(async ({ projectRoot }) => {
    const record = await rememberGodotProject({
      projectRoot,
      source: "test",
      lastOpenedAt: "2026-06-10T00:00:00.000Z"
    });
    const registry = await readProjectRegistry();
    const registryText = await readFile(projectRegistryPath(), "utf8");

    assert.equal(record.name, "Registry Test");
    assert.equal(registry.projects.length, 1);
    assert.equal(registry.projects[0].projectRoot, projectRoot);
    assert.match(registryText, /"source": "test"/);
  });
});

test("project registry facade delegates path storage metadata and record domains", async () => {
  const facade = await readProjectRegistrySource("project-registry.js");
  const paths = await readProjectRegistrySource("project-registry/paths.js");
  const storage = await readProjectRegistrySource("project-registry/storage.js");
  const metadata = await readProjectRegistrySource("project-registry/metadata.js");
  const records = await readProjectRegistrySource("project-registry/records.js");

  assert.match(facade, /from "\.\/project-registry\/paths\.js"/);
  assert.match(facade, /from "\.\/project-registry\/storage\.js"/);
  assert.match(facade, /from "\.\/project-registry\/metadata\.js"/);
  assert.match(facade, /from "\.\/project-registry\/records\.js"/);
  assert.doesNotMatch(facade, /mkdir/);
  assert.doesNotMatch(facade, /stat/);
  assert.doesNotMatch(facade, /JSON\.parse/);
  assert.doesNotMatch(facade, /config\/name/);
  assert.doesNotMatch(facade, /firstSeenAt/);

  assert.match(paths, /export function allowedProjectRoots/);
  assert.match(paths, /export function assertAllowedProjectRoot/);
  assert.match(paths, /export async function pathExists/);
  assert.match(paths, /GODOT_MCP_ALLOWED_PROJECT_ROOTS/);
  assert.match(paths, /path\.relative/);
  assert.match(paths, /stat/);

  assert.match(storage, /export function projectRegistryPath/);
  assert.match(storage, /export async function readProjectRegistry/);
  assert.match(storage, /export async function writeProjectRegistry/);
  assert.match(storage, /GODOT_MCP_PROJECT_REGISTRY/);
  assert.match(storage, /mkdir/);
  assert.match(storage, /writeFile/);
  assert.match(storage, /JSON\.parse/);

  assert.match(metadata, /export async function projectMetadata/);
  assert.match(metadata, /export function parseProjectName/);
  assert.match(metadata, /project\.godot/);
  assert.match(metadata, /config\\\/name/);
  assert.match(metadata, /JSON\.parse\(match\[1\]\)/);

  assert.match(records, /export async function rememberGodotProject/);
  assert.match(records, /export function knownProjectByRoot/);
  assert.match(records, /from "\.\/paths\.js"/);
  assert.match(records, /from "\.\/storage\.js"/);
  assert.match(records, /from "\.\/metadata\.js"/);
  assert.match(records, /firstSeenAt/);
  assert.match(records, /lastOpenedAt/);
  assert.match(records, /lastCreatedAt/);
});
