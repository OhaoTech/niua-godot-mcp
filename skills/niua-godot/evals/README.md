# Trigger evals

`triggers.json` is the should / should-not set for the `SKILL.md` description.

## What CI checks

```bash
npm run skill:triggers
```

Coverage only: every `should_trigger` query has a `signals` phrase that still appears in the description, the description stays ≤1024 characters, and Blender / Unity / Unreal appear only behind the “do not use” fence. This is not a live model run.

## Live 3-run protocol (optional)

When you want trigger *rates*, not just coverage:

1. Keep the train / validation split as written. Do not retune the description against validation queries.
2. For each query, run the agent 3 times with this skill installed and no other Godot-specific skill.
3. A run “triggered” if the agent loaded `skills/niua-godot/SKILL.md` (or invoked the `niua-godot` skill) before acting.
4. Pass: `should_trigger` rate ≥ 0.5; `should_not_trigger` rate < 0.5.
5. Pick the description with the best **validation** pass rate. Do not add keywords copied from a single failed query.

Record results next to the query if you run this (`triggered: 2`, `runs: 3`). The JSON schema already allows extra fields.
