#!/usr/bin/env node
// Live 3-run trigger eval. Asks a judge model whether it would load the
// skill from name+description only (progressive-disclosure layer 1).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadSkillTriggerEval } from "./score-triggers.mjs";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_RUNS = 3;
const DEFAULT_THRESHOLD = 0.5;
const DEFAULT_MODEL = process.env.NIUA_SKILL_JUDGE_MODEL || "grok-3-mini";
const XAI_URL = "https://api.x.ai/v1/chat/completions";

const SYSTEM = `You decide whether to load an agent skill. You see only the skill name and description — the same metadata loaded at startup. Reply with YES if you would read the full skill for this user message, or NO if you would not. Reply with those three letters only.`;

export function parseYesNo(text) {
  const token = String(text ?? "").trim().toUpperCase();
  if (token.startsWith("YES")) return true;
  if (token.startsWith("NO")) return false;
  return null;
}

export function summarizeLiveResults(rows, { threshold = DEFAULT_THRESHOLD } = {}) {
  const scored = rows.map((row) => {
    const rate = row.runs === 0 ? 0 : row.triggered / row.runs;
    const want = row.should_trigger === true;
    const pass = want ? rate >= threshold : rate < threshold;
    return { ...row, trigger_rate: rate, pass };
  });
  const of = (split) => {
    const subset = scored.filter((row) => !split || row.split === split);
    const passed = subset.filter((row) => row.pass).length;
    return {
      total: subset.length,
      passed,
      pass_rate: subset.length === 0 ? 0 : passed / subset.length
    };
  };
  return {
    threshold,
    all: of(null),
    train: of("train"),
    validation: of("validation"),
    rows: scored
  };
}

export async function judgeOnce({
  description,
  query,
  model = DEFAULT_MODEL,
  apiKey = process.env.XAI_API_KEY,
  fetchImpl = globalThis.fetch,
  temperature = 0.7
}) {
  if (!apiKey) {
    throw new Error("XAI_API_KEY is required for live trigger evals");
  }
  const response = await fetchImpl(XAI_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: 8,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Skill name: niua-godot\nSkill description:\n${description}\n\nUser message:\n${query}\n\nLoad this skill? YES or NO.`
        }
      ]
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message ?? payload?.error ?? response.statusText;
    throw new Error(`judge HTTP ${response.status}: ${detail}`);
  }
  const text = payload?.choices?.[0]?.message?.content ?? "";
  const verdict = parseYesNo(text);
  if (verdict === null) {
    throw new Error(`judge returned unparseable reply: ${JSON.stringify(text)}`);
  }
  return { verdict, text };
}

export async function runLiveTriggers({
  runs = DEFAULT_RUNS,
  threshold = DEFAULT_THRESHOLD,
  model = DEFAULT_MODEL,
  split = "all",
  apiKey = process.env.XAI_API_KEY,
  fetchImpl = globalThis.fetch,
  sleepMs = 150
} = {}) {
  const { skill, evals } = loadSkillTriggerEval();
  const queries = evals.queries.filter((query) => split === "all" || query.split === split);
  const rows = [];
  for (const query of queries) {
    let triggered = 0;
    const replies = [];
    for (let i = 0; i < runs; i += 1) {
      const { verdict, text } = await judgeOnce({
        description: skill.description,
        query: query.query,
        model,
        apiKey,
        fetchImpl
      });
      replies.push(text);
      if (verdict) triggered += 1;
      if (sleepMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, sleepMs));
      }
    }
    rows.push({
      id: query.id,
      split: query.split,
      should_trigger: query.should_trigger,
      query: query.query,
      triggered,
      runs,
      replies
    });
  }
  return {
    skill: skill.name,
    version: skill.version,
    model,
    generatedAt: new Date().toISOString(),
    ...summarizeLiveResults(rows, { threshold })
  };
}

function parseArgs(argv) {
  const options = { split: "all", runs: DEFAULT_RUNS, threshold: DEFAULT_THRESHOLD, model: DEFAULT_MODEL };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--split") options.split = argv[++i];
    else if (arg === "--runs") options.runs = Number(argv[++i]);
    else if (arg === "--threshold") options.threshold = Number(argv[++i]);
    else if (arg === "--model") options.model = argv[++i];
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = await runLiveTriggers(options);
  const outDir = path.join(skillDir, "evals/results");
  mkdirSync(outDir, { recursive: true });
  const latest = path.join(outDir, "latest.json");
  writeFileSync(latest, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    [
      `model=${report.model} version=${report.version}`,
      `train ${report.train.passed}/${report.train.total} (${(report.train.pass_rate * 100).toFixed(0)}%)`,
      `validation ${report.validation.passed}/${report.validation.total} (${(report.validation.pass_rate * 100).toFixed(0)}%)`,
      `wrote ${latest}`,
      ...report.rows
        .filter((row) => !row.pass)
        .map((row) => `FAIL ${row.id} want=${row.should_trigger} rate=${row.trigger_rate.toFixed(2)} "${row.query}"`)
    ].join("\n") + "\n"
  );
  if (report.validation.pass_rate < options.threshold || report.train.pass_rate < options.threshold) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
