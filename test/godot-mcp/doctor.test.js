import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  formatDoctorReport,
  runDoctor
} from "../../src/godot-mcp/doctor.js";

test("doctor reports local prerequisites with a project root", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "niua-doctor-"));
  const projectRoot = path.join(root, "project");
  await mkdir(projectRoot);
  await writeFile(path.join(projectRoot, "project.godot"), "[application]\nconfig/name=\"Doctor Probe\"\n");

  const report = await runDoctor({
    godotBin: process.execPath,
    projectRoot,
    allowedRoots: root,
    profile: "v1"
  });

  assert.equal(report.ok, true);
  assert.equal(report.failed, 0);
  assert.equal(report.checks.find((check) => check.name === "project")?.status, "pass");
  assert.match(formatDoctorReport(report), /NIUA Godot MCP doctor: ok/);
});

test("doctor fails invalid profiles", async () => {
  const report = await runDoctor({
    godotBin: process.execPath,
    profile: "giant"
  });

  assert.equal(report.ok, false);
  const profile = report.checks.find((check) => check.name === "profile");
  assert.equal(profile?.status, "fail");
  assert.match(profile?.summary ?? "", /Invalid NIUA_MCP_PROFILE/);
});
