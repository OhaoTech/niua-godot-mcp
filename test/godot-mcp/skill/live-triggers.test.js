import assert from "node:assert/strict";
import test from "node:test";

import {
  judgeOnce,
  parseYesNo,
  runLiveTriggers,
  summarizeLiveResults
} from "../../../skills/niua-godot/scripts/run-live-triggers.mjs";

test("parseYesNo accepts only YES/NO prefixes", () => {
  assert.equal(parseYesNo("YES"), true);
  assert.equal(parseYesNo("yes, load it"), true);
  assert.equal(parseYesNo("NO"), false);
  assert.equal(parseYesNo("nope"), false);
  assert.equal(parseYesNo("maybe"), null);
});

test("summarizeLiveResults scores train and validation against the 0.5 threshold", () => {
  const report = summarizeLiveResults([
    { id: "a", split: "train", should_trigger: true, triggered: 3, runs: 3 },
    { id: "b", split: "train", should_trigger: false, triggered: 0, runs: 3 },
    { id: "c", split: "validation", should_trigger: true, triggered: 2, runs: 3 },
    { id: "d", split: "validation", should_trigger: false, triggered: 2, runs: 3 }
  ]);
  assert.equal(report.train.passed, 2);
  assert.equal(report.train.pass_rate, 1);
  assert.equal(report.validation.passed, 1);
  assert.equal(report.rows.find((row) => row.id === "c").pass, true);
  assert.equal(report.rows.find((row) => row.id === "d").pass, false);
});

test("runLiveTriggers records 3 YES/NO verdicts from a mock judge", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: calls % 2 === 0 ? "NO" : "YES" } }]
      })
    };
  };
  const report = await runLiveTriggers({
    runs: 3,
    split: "validation",
    apiKey: "test",
    fetchImpl,
    sleepMs: 0
  });
  assert.equal(report.model, "grok-3-mini");
  assert.ok(report.validation.total >= 6);
  assert.equal(report.rows[0].runs, 3);
  assert.ok(calls >= 18);
});
