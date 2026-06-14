import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  IMPORT_TOOL_DEFINITIONS,
  importProjectAssets
} from "../../../../src/godot-mcp/tools/import/index.js";

async function withJsonBridge(handler, run) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    return await run(port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

function toolByName(name) {
  return IMPORT_TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

function parseToolText(result) {
  assert.equal(result.content?.[0]?.type, "text");
  return JSON.parse(result.content[0].text);
}

test("IMPORT_TOOL_DEFINITIONS exposes import tool descriptors", () => {
  assert.deepEqual(IMPORT_TOOL_DEFINITIONS.map((tool) => tool.name), [
    "import_project_assets",
    "list_imported_assets",
    "get_import_metadata",
    "get_import_diagnostics",
    "set_import_options",
    "reimport_assets",
    "get_import_events"
  ]);
  assert.ok(IMPORT_TOOL_DEFINITIONS.every((tool) => tool.inputSchema?.type === "object"));
});

test("import_project_assets local handler validates project roots before spawning Godot", async () => {
  await assert.rejects(
    () => importProjectAssets({}),
    /projectRoot is required/
  );
});

test("import_project_assets strips bridge environment from headless import runs", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "niua-godot-import-env-"));
  const projectRoot = path.join(workspace, "project");
  const fakeGodot = path.join(workspace, "fake-godot-import.mjs");
  const logPath = path.join(workspace, "fake-godot-import-log.json");
  const previous = {
    allowedRoots: process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS,
    godotBin: process.env.GODOT_BIN,
    niuaPort: process.env.NIUA_MCP_PORT,
    godotPort: process.env.GODOT_MCP_PORT,
    niuaToken: process.env.NIUA_MCP_TOKEN,
    godotToken: process.env.GODOT_MCP_TOKEN,
    fakeLog: process.env.NIUA_FAKE_GODOT_IMPORT_LOG
  };

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      ""
    ].join("\n"));
    await writeFile(fakeGodot, `#!/usr/bin/env node
import { writeFileSync } from "node:fs";

writeFileSync(process.env.NIUA_FAKE_GODOT_IMPORT_LOG, JSON.stringify({
  argv: process.argv.slice(2),
  env: {
    NIUA_MCP_PORT: process.env.NIUA_MCP_PORT || "",
    GODOT_MCP_PORT: process.env.GODOT_MCP_PORT || "",
    NIUA_MCP_TOKEN: process.env.NIUA_MCP_TOKEN || "",
    GODOT_MCP_TOKEN: process.env.GODOT_MCP_TOKEN || ""
  }
}) + "\\n");
`, { mode: 0o755 });

    process.env.GODOT_MCP_ALLOWED_PROJECT_ROOTS = workspace;
    process.env.GODOT_BIN = fakeGodot;
    process.env.NIUA_MCP_PORT = "32001";
    process.env.GODOT_MCP_PORT = "32001";
    process.env.NIUA_MCP_TOKEN = "secret-niua";
    process.env.GODOT_MCP_TOKEN = "secret-godot";
    process.env.NIUA_FAKE_GODOT_IMPORT_LOG = logPath;

    const payload = await importProjectAssets({ projectRoot });
    const log = JSON.parse(await readFile(logPath, "utf8"));

    assert.equal(payload.ok, true);
    assert.deepEqual(log.argv, ["--headless", "--path", projectRoot, "--import", "--quit"]);
    assert.deepEqual(log.env, {
      NIUA_MCP_PORT: "",
      GODOT_MCP_PORT: "",
      NIUA_MCP_TOKEN: "",
      GODOT_MCP_TOKEN: ""
    });
  } finally {
    restoreEnv("GODOT_MCP_ALLOWED_PROJECT_ROOTS", previous.allowedRoots);
    restoreEnv("GODOT_BIN", previous.godotBin);
    restoreEnv("NIUA_MCP_PORT", previous.niuaPort);
    restoreEnv("GODOT_MCP_PORT", previous.godotPort);
    restoreEnv("NIUA_MCP_TOKEN", previous.niuaToken);
    restoreEnv("GODOT_MCP_TOKEN", previous.godotToken);
    restoreEnv("NIUA_FAKE_GODOT_IMPORT_LOG", previous.fakeLog);
    await rm(workspace, { recursive: true, force: true });
  }
});

test("list_imported_assets handler forwards query args through the bridge", async () => {
  let seenUrl = null;

  await withJsonBridge((req, res) => {
    seenUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const result = await toolByName("list_imported_assets").handler({
      port,
      path: "res://assets",
      recursive: false
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/import/assets?path=res%3A%2F%2Fassets&recursive=false");
    assert.equal(payload.data.endpoint, seenUrl);
  });
});

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

test("set_import_options handler forwards payload through the bridge", async () => {
  let receivedBody = null;

  await withJsonBridge(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    receivedBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));

    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, data: { endpoint: req.url } }));
  }, async (port) => {
    const options = {
      "meshes/ensure_tangents": true,
      "nodes/root_type": "Node3D"
    };
    const result = await toolByName("set_import_options").handler({
      port,
      path: "res://assets/ship.glb",
      options,
      reimport: true
    });
    const payload = parseToolText(result);

    assert.equal(payload.data.endpoint, "/import/options/set");
    assert.deepEqual(receivedBody, {
      path: "res://assets/ship.glb",
      options,
      reimport: true
    });
  });
});

test("get_import_events handler forwards filters through the bridge", async () => {
  let seenUrl = null;

  await withJsonBridge((req, res) => {
    seenUrl = req.url;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      data: { events: [{ kind: "resources_reimported" }] }
    }));
  }, async (port) => {
    const result = await toolByName("get_import_events").handler({
      port,
      limit: 5,
      kinds: ["resources_reimported", "sources_changed"],
      sinceMsec: 100
    });
    const payload = parseToolText(result);

    assert.equal(seenUrl, "/import/events?limit=5&kinds=resources_reimported%2Csources_changed&sinceMsec=100");
    assert.equal(payload.data.events[0].kind, "resources_reimported");
  });
});
