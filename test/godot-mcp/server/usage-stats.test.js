import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  USAGE_DIR_ENV_VAR,
  USAGE_STATS_ENV_VAR,
  createUsageRecorder,
  usageStatsEnabled
} from "../../../src/godot-mcp/server/usage-stats.js";

// WS2 rails for usage-derived tiers: the recorder is local-only, counts-only,
// deterministic, and can never break a tool call. The written file's key set
// is CLOSED — any new field is a deliberate contract change here first.

const EXPECTED_FILE_KEYS = [
  "version",
  "startedAt",
  "updatedAt",
  "profile",
  "serverVersion",
  "totalCalls",
  "counts",
  "errors"
];

async function tempUsageEnv() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "niua-usage-"));
  return { [USAGE_DIR_ENV_VAR]: dir };
}

test("opt-out env values disable recording entirely", async () => {
  for (const value of ["off", "0", "false", "no", "OFF"]) {
    assert.equal(usageStatsEnabled({ [USAGE_STATS_ENV_VAR]: value }), false, value);
  }
  for (const value of [undefined, "on", "1", "true"]) {
    assert.equal(usageStatsEnabled({ [USAGE_STATS_ENV_VAR]: value }), true, String(value));
  }

  const env = { ...(await tempUsageEnv()), [USAGE_STATS_ENV_VAR]: "off" };
  const recorder = createUsageRecorder({ env });
  assert.equal(recorder.enabled, false);
  assert.equal(recorder.filePath, null);
  recorder.record("create_node", true);
  await recorder.flush();
  assert.equal(recorder.snapshot(), null);
  assert.deepEqual(await readdir(env[USAGE_DIR_ENV_VAR]), []);
});

test("recorder counts calls and errors, flushes a closed deterministic shape", async () => {
  const env = await tempUsageEnv();
  const recorder = createUsageRecorder({
    env,
    profile: "core",
    serverVersion: "0.1.0",
    pid: 4242
  });
  assert.equal(recorder.enabled, true);

  recorder.record("set_node_property", true);
  recorder.record("create_node", true);
  recorder.record("set_node_property", false);
  await recorder.flush();

  const written = JSON.parse(await readFile(recorder.filePath, "utf8"));
  assert.deepEqual(Object.keys(written), EXPECTED_FILE_KEYS);
  assert.equal(written.version, 1);
  assert.equal(written.profile, "core");
  assert.equal(written.serverVersion, "0.1.0");
  assert.equal(written.totalCalls, 3);
  // Sorted keys: determinism is part of the contract, not a nicety.
  assert.deepEqual(written.counts, { create_node: 1, set_node_property: 2 });
  assert.deepEqual(written.errors, { set_node_property: 1 });
  // Privacy by construction: only tool names appear, never arguments/paths.
  assert.ok(recorder.filePath.includes("usage-"));
  assert.ok(recorder.filePath.endsWith("-4242.json"));
});

test("callTool feeds the recorder through the single dispatch seam", async () => {
  const env = await tempUsageEnv();
  process.env[USAGE_DIR_ENV_VAR] = env[USAGE_DIR_ENV_VAR];
  try {
    const { USAGE_RECORDER, callTool } = await import("../../../src/godot-mcp/server/tool-catalog.js");
    const before = USAGE_RECORDER.snapshot()?.counts?.describe_tools ?? 0;
    await callTool("describe_tools", {});
    const after = USAGE_RECORDER.snapshot()?.counts?.describe_tools ?? 0;
    assert.equal(after, before + 1);

    // Unknown tools stay out of the evidence base.
    const beforeTotal = USAGE_RECORDER.snapshot()?.totalCalls ?? 0;
    await assert.rejects(() => callTool("no_such_tool", {}));
    assert.equal(USAGE_RECORDER.snapshot()?.totalCalls ?? 0, beforeTotal);
  } finally {
    delete process.env[USAGE_DIR_ENV_VAR];
  }
});
