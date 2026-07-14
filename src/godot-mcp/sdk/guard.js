// src/godot-mcp/sdk/guard.js
import { RECIPE_TOOL_DENYLIST } from "../tools/workflows/recipes/executor.js";

// Tools forbidden in scripted (SDK) contexts — same set the recipe executor denies:
// process lifecycle, exports, and batch recursion. Keeps scripts from spawning/killing
// editors or exporting builds mid-run.
export function assertAllowed(name) {
  if (RECIPE_TOOL_DENYLIST.has(name)) {
    throw new Error(`Tool "${name}" is on the SDK denylist (lifecycle/export/batch); not allowed in a script.`);
  }
}
