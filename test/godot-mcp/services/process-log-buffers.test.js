import test from "node:test";
import assert from "node:assert/strict";

import {
  appendProcessOutput,
  clearProjectProcessLogs,
  serializeProjectProcessLogs
} from "../../../src/godot-mcp/services/process-logs.js";

function processEntry() {
  return {
    projectId: "p1",
    projectRoot: "/tmp/project",
    projectFile: "/tmp/project/project.godot",
    pid: 123,
    status: "running",
    startedAt: "2026-01-01T00:00:00.000Z",
    exitedAt: null,
    exitCode: null,
    signal: null,
    bridge: {},
    stdout: [],
    stderr: []
  };
}

test("appendProcessOutput tracks monotonic totals across the 100-line cap", () => {
  const entry = processEntry();
  for (let i = 0; i < 130; i += 1) {
    appendProcessOutput(entry, "stderr", Buffer.from(`line ${i}\n`));
  }

  assert.equal(entry.stderr.length, 100);
  assert.equal(entry.stderrTotalLines, 130);

  const serialized = serializeProjectProcessLogs(entry, 10);
  assert.equal(serialized.stderr.length, 10);
  assert.equal(serialized.stderrTotalLines, 130);
  assert.equal(serialized.stdoutTotalLines, 0);
});

test("clearProjectProcessLogs empties buffers but keeps totals for diffing", () => {
  const entry = processEntry();
  appendProcessOutput(entry, "stdout", Buffer.from("a\nb\n"));
  appendProcessOutput(entry, "stderr", Buffer.from("boom\n"));

  clearProjectProcessLogs(entry);
  assert.equal(entry.stdout.length, 0);
  assert.equal(entry.stderr.length, 0);
  assert.equal(entry.stdoutTotalLines, 2);
  assert.equal(entry.stderrTotalLines, 1);

  appendProcessOutput(entry, "stderr", Buffer.from("fresh\n"));
  const serialized = serializeProjectProcessLogs(entry, 100);
  assert.deepEqual(serialized.stderr, ["fresh"]);
  assert.equal(serialized.stderrTotalLines, 2);
});
