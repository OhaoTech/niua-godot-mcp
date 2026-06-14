import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  createFakeGodotExporter,
  createMcpProcess,
  waitForFileText
} from "../helpers/server-harness.js";

test("Godot MCP server exports projects through the local Godot CLI", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-export-"));
  const projectRoot = path.join(allowedRoot, "export-demo");
  const outputPath = path.join(allowedRoot, "exports/export-demo.x86_64");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Export Demo\"",
      ""
    ].join("\n"));
    await writeFile(path.join(projectRoot, "export_presets.cfg"), [
      "[preset.0]",
      "name=\"Linux\"",
      "platform=\"Linux\"",
      "export_path=\"build/export-demo.x86_64\"",
      ""
    ].join("\n"));

    const { fakeGodot, logPath } = await createFakeGodotExporter(allowedRoot);
    const server = createMcpProcess({
      GODOT_BIN: fakeGodot,
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json"),
      NIUA_FAKE_GODOT_EXPORT_LOG: logPath,
      NIUA_FAKE_GODOT_EXPORT_PROGRESS: "1"
    });

    try {
      const response = await server.request("tools/call", {
        name: "export_project",
        arguments: {
          projectRoot,
          preset: "Linux",
          outputPath,
          mode: "release",
          timeoutMs: 2000
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.projectRoot, projectRoot);
      assert.equal(payload.data.preset, "Linux");
      assert.equal(payload.data.mode, "release");
      assert.equal(payload.data.outputPath, outputPath);
      assert.equal(payload.data.outputExists, true);
      assert.match(payload.data.stdout, /EXPORT 10%/);
      assert.match(payload.data.stdout, /EXPORT 100%/);
      assert.deepEqual(payload.data.outputEvents.map((event) => ({
        stream: event.stream,
        text: event.text
      })), [
        { stream: "stdout", text: "EXPORT 10%" },
        { stream: "stdout", text: "EXPORT 100%" }
      ]);
      assert.match(payload.data.outputEvents[0].timestamp, /^\d{4}-\d{2}-\d{2}T/);
      assert.equal(existsSync(outputPath), true);

      const logText = await waitForFileText(logPath);
      const fakeExport = JSON.parse(logText.trim().split("\n").at(-1));
      assert.deepEqual(fakeExport.argv, [
        "--headless",
        "--path",
        projectRoot,
        "--export-release",
        "Linux",
        outputPath
      ]);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server rejects project exports outside allowed roots", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-export-"));
  const outsideRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-outside-"));
  const projectRoot = path.join(allowedRoot, "export-demo");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      "",
      "[application]",
      "config/name=\"Export Demo\"",
      ""
    ].join("\n"));
    await writeFile(path.join(projectRoot, "export_presets.cfg"), [
      "[preset.0]",
      "name=\"Linux\"",
      "platform=\"Linux\"",
      ""
    ].join("\n"));

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const response = await server.request("tools/call", {
        name: "export_project",
        arguments: {
          projectRoot,
          preset: "Linux",
          outputPath: path.join(outsideRoot, "export-demo.x86_64")
        }
      });

      assert.equal(response.error.code, -32000);
      assert.match(response.error.message, /outside allowed project roots/);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
    await rm(outsideRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server diagnoses installed export templates", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-template-project-"));
  const templatesRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-templates-"));
  const projectRoot = path.join(allowedRoot, "export-demo");
  const templateVersionRoot = path.join(templatesRoot, "4.6.2.test");

  try {
    await mkdir(projectRoot, { recursive: true });
    await mkdir(templateVersionRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), [
      "; Engine configuration file.",
      "config_version=5",
      ""
    ].join("\n"));
    await writeFile(path.join(projectRoot, "export_presets.cfg"), [
      "[preset.0]",
      "name=\"Linux\"",
      "platform=\"Linux\"",
      ""
    ].join("\n"));
    await writeFile(path.join(templateVersionRoot, "linux_release.x86_64"), "release");
    await writeFile(path.join(templateVersionRoot, "linux_debug.x86_64"), "debug");

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_EXPORT_TEMPLATES_DIR: templatesRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const response = await server.request("tools/call", {
        name: "diagnose_export_templates",
        arguments: {
          projectRoot
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.installed, true);
      assert.equal(payload.data.templatesRoot, templatesRoot);
      assert.equal(payload.data.selected.versionKey, "4.6.2.test");
      assert.equal(payload.data.selected.fileCount, 2);
      assert.equal(payload.data.project.projectRoot, projectRoot);
      assert.equal(payload.data.project.projectFileExists, true);
      assert.equal(payload.data.project.exportPresetsFileExists, true);
      assert.deepEqual(payload.data.selected.files.sort(), [
        "linux_debug.x86_64",
        "linux_release.x86_64"
      ]);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
    await rm(templatesRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server reports missing export templates", async () => {
  const templatesRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-missing-templates-"));

  try {
    const server = createMcpProcess({
      GODOT_MCP_EXPORT_TEMPLATES_DIR: templatesRoot
    });

    try {
      const response = await server.request("tools/call", {
        name: "diagnose_export_templates",
        arguments: {}
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.installed, false);
      assert.equal(payload.data.templatesRoot, templatesRoot);
      assert.equal(payload.data.selected, null);
      assert.match(payload.data.guidance.join("\n"), /Manage Export Templates/);
      assert.ok(payload.data.candidates.some((candidate) => candidate.versionKey === "4.6.2.test"));
    } finally {
      await server.close();
    }
  } finally {
    await rm(templatesRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server validates a Linux export preset", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-validate-export-"));
  const templatesRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-validate-templates-"));
  const projectRoot = path.join(allowedRoot, "export-demo");
  const templateVersionRoot = path.join(templatesRoot, "4.6.2.test");

  try {
    await mkdir(projectRoot, { recursive: true });
    await mkdir(templateVersionRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), "config_version=5\n");
    await writeFile(path.join(projectRoot, "export_presets.cfg"), [
      "[preset.0]",
      "name=\"Linux\"",
      "platform=\"Linux\"",
      "export_path=\"build/export-demo.x86_64\"",
      "",
      "[preset.0.options]",
      "binary_format/embed_pck=false",
      ""
    ].join("\n"));
    await writeFile(path.join(templateVersionRoot, "linux_release.x86_64"), "release");
    await writeFile(path.join(templateVersionRoot, "linux_debug.x86_64"), "debug");

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_EXPORT_TEMPLATES_DIR: templatesRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const response = await server.request("tools/call", {
        name: "validate_export_preset",
        arguments: {
          projectRoot,
          preset: "Linux"
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.valid, true);
      assert.equal(payload.data.results.length, 1);
      assert.equal(payload.data.results[0].preset.name, "Linux");
      assert.deepEqual(payload.data.results[0].errors, []);
      assert.equal(payload.data.templateDiagnostics.installed, true);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
    await rm(templatesRoot, { recursive: true, force: true });
  }
});

test("Godot MCP server reports platform-specific export preset errors", async () => {
  const allowedRoot = await mkdtemp(path.join(tmpdir(), "niua-godot-invalid-export-"));
  const projectRoot = path.join(allowedRoot, "export-demo");

  try {
    await mkdir(projectRoot, { recursive: true });
    await writeFile(path.join(projectRoot, "project.godot"), "config_version=5\n");
    await writeFile(path.join(projectRoot, "export_presets.cfg"), [
      "[preset.0]",
      "name=\"Web\"",
      "platform=\"Web\"",
      "export_path=\"build/export-demo.x86_64\"",
      ""
    ].join("\n"));

    const server = createMcpProcess({
      GODOT_MCP_ALLOWED_PROJECT_ROOTS: allowedRoot,
      GODOT_MCP_PROJECT_REGISTRY: path.join(allowedRoot, "registry.json")
    });

    try {
      const response = await server.request("tools/call", {
        name: "validate_export_preset",
        arguments: {
          projectRoot,
          preset: "Web"
        }
      });
      const payload = JSON.parse(response.result.content[0].text);

      assert.equal(payload.ok, true);
      assert.equal(payload.data.valid, false);
      assert.match(payload.data.results[0].errors.join("\n"), /Web export paths should end with \.html/);
    } finally {
      await server.close();
    }
  } finally {
    await rm(allowedRoot, { recursive: true, force: true });
  }
});
