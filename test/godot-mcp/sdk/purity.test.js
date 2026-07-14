import assert from "node:assert/strict";
import { test } from "node:test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sdkDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../src/godot-mcp/sdk");

test("no sdk file imports from skills/ or game-builder", async () => {
  const files = (await readdir(sdkDir)).filter((f) => f.endsWith(".js"));
  for (const f of files) {
    const src = await readFile(path.join(sdkDir, f), "utf8");
    assert.doesNotMatch(src, /from\s+["'][^"']*(skills|game-builder)[^"']*["']/, `${f} imports policy layer`);
  }
});
