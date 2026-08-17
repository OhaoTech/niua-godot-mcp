# Trigger evals

`triggers.json` is the should / should-not set for the `SKILL.md` description.

## What CI checks

```bash
npm run skill:triggers
```

Coverage only: every `should_trigger` query has a `signals` phrase that still appears in the description, the description stays ≤1024 characters, and Blender / Unity / Unreal appear only behind the “do not use” fence. This is not a live model run.

## Live 3-run protocol

Needs `XAI_API_KEY`. The judge sees only the skill name + description (layer 1), then answers YES/NO.

```bash
npm run skill:triggers:live
# optional: --split train|validation|all --runs 3 --model grok-3-mini
```

Writes `evals/results/latest.json` (gitignored).

1. Keep the train / validation split as written. Do not retune the description against validation queries.
2. Each query is judged 3 times. Triggered = judge said YES.
3. Pass: `should_trigger` rate ≥ 0.5; `should_not_trigger` rate < 0.5.
4. Pick the description with the best **validation** pass rate. Do not add keywords copied from a single failed query.
