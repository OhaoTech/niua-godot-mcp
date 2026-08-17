#!/usr/bin/env node
// Copy this skill into the local Claude Code and Codex/agents skill dirs.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dests = [
  path.join(os.homedir(), ".claude", "skills", "niua-godot"),
  path.join(os.homedir(), ".agents", "skills", "niua-godot")
];

for (const dest of dests) {
  mkdirSync(path.dirname(dest), { recursive: true });
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  cpSync(skillDir, dest, { recursive: true });
  process.stdout.write(`installed ${dest}\n`);
}
