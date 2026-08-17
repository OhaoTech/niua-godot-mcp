import assert from "node:assert/strict";
import test from "node:test";

import { evaluateSkillTriggers } from "../../../skills/niua-godot/scripts/score-triggers.mjs";

test("niua-godot description covers trigger evals and stays in spec", () => {
  const result = evaluateSkillTriggers();
  assert.deepEqual(result.problems, []);
  assert.equal(result.skill.version, result.pkg.version);
  assert.ok(result.skill.description.length <= 1024);
  assert.ok(result.scored.shouldTrigger >= 10);
  assert.ok(result.scored.shouldNotTrigger >= 10);
});
