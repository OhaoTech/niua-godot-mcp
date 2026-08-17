#!/usr/bin/env node
// Deterministic trigger-coverage check for skills/niua-godot.
// This is not an LLM eval. It asserts the description still covers every
// should-trigger signal and stays off Blender/Unity/Unreal except as a fence.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(skillDir, "../..");

export function parseSkillMarkdown(markdown) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown);
  if (!match) {
    throw new Error("SKILL.md is missing YAML frontmatter");
  }
  const frontmatter = match[1];
  const name = /^name:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim();
  const version = /^ {2}version:\s*"?([^"\n]+)"?\s*$/m.exec(frontmatter)?.[1]?.trim();
  const description = extractDescription(frontmatter);
  return { name, version, description, body: markdown.slice(match[0].length) };
}

function extractDescription(frontmatter) {
  const folded = /^description:\s*>-?\s*\r?\n((?:[ \t]+.*\r?\n?)*)/m.exec(frontmatter);
  if (folded) {
    return folded[1]
      .split(/\r?\n/)
      .map((line) => line.replace(/^[ \t]+/, "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  const inline = /^description:\s*(.+)$/m.exec(frontmatter);
  return inline ? inline[1].trim() : "";
}

export function scoreTriggers({ description, queries }) {
  const haystack = description.toLowerCase();
  const failures = [];
  for (const query of queries) {
    if (!query.should_trigger) {
      continue;
    }
    const signals = Array.isArray(query.signals) ? query.signals : [];
    const hit = signals.some((signal) => haystack.includes(String(signal).toLowerCase()));
    if (!hit) {
      failures.push({
        id: query.id,
        reason: `should_trigger but none of the signals appear in the description: ${signals.join(", ")}`
      });
    }
  }

  const fenced = haystack.includes("do not use for blender, unity, unreal");
  for (const banned of ["blender", "unity", "unreal"]) {
    if (haystack.includes(banned) && !fenced) {
      failures.push({
        id: "description",
        reason: `description mentions ${banned} without a "do not use" fence`
      });
    }
  }

  return {
    queryCount: queries.length,
    shouldTrigger: queries.filter((query) => query.should_trigger).length,
    shouldNotTrigger: queries.filter((query) => !query.should_trigger).length,
    failures
  };
}

export function loadSkillTriggerEval(root = skillDir) {
  const skill = parseSkillMarkdown(readFileSync(path.join(root, "SKILL.md"), "utf8"));
  const evals = JSON.parse(readFileSync(path.join(root, "evals/triggers.json"), "utf8"));
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  return { skill, evals, pkg };
}

export function evaluateSkillTriggers(root = skillDir) {
  const { skill, evals, pkg } = loadSkillTriggerEval(root);
  const problems = [];
  if (skill.name !== "niua-godot") {
    problems.push(`frontmatter name is ${skill.name}, expected niua-godot`);
  }
  if (skill.version !== pkg.version) {
    problems.push(`skill metadata.version ${skill.version} != package.json ${pkg.version}`);
  }
  if (skill.description.length === 0 || skill.description.length > 1024) {
    problems.push(`description length ${skill.description.length} (must be 1–1024)`);
  }
  const should = evals.queries.filter((query) => query.should_trigger);
  const shouldNot = evals.queries.filter((query) => !query.should_trigger);
  if (should.length < 10 || shouldNot.length < 10) {
    problems.push(`need at least 10 should / 10 should-not queries (have ${should.length}/${shouldNot.length})`);
  }
  const train = evals.queries.filter((query) => query.split === "train");
  const validation = evals.queries.filter((query) => query.split === "validation");
  if (train.length < 8 || validation.length < 6) {
    problems.push(`need a train/validation split (have train=${train.length} validation=${validation.length})`);
  }
  const scored = scoreTriggers({ description: skill.description, queries: evals.queries });
  problems.push(...scored.failures.map((failure) => `${failure.id}: ${failure.reason}`));
  return { skill, evals, pkg, scored, problems };
}

function main() {
  const result = evaluateSkillTriggers();
  if (result.problems.length > 0) {
    process.stderr.write(`${result.problems.join("\n")}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `ok ${result.scored.queryCount} queries, description ${result.skill.description.length} chars, version ${result.skill.version}\n`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
