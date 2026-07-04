// Shared step executor behind apply_scene_recipe (steps from a JSON file) and
// batch_scene_operations (steps inline in the tool args). One tool call runs a
// list of tool steps; per-step successes stay OUT of the result on purpose —
// only a compact summary (and failures) return to the caller's context window
// (docs/godot-mcp/token-efficiency-roadmap.md, Tier 2).

// Tools a step list must not run: process lifecycle (spawns/kills editors),
// exports, and the batch tools themselves (recursion).
export const RECIPE_TOOL_DENYLIST = new Set([
  "apply_scene_recipe",
  "batch_scene_operations",
  "create_project",
  "open_project",
  "close_project",
  "import_project",
  "forget_project",
  "export_project"
]);

const ERROR_TEXT_LIMIT = 300;

export function connectionArgs(args) {
  const connection = {};
  for (const key of ["host", "port", "expectedProjectRoot"]) {
    if (args[key] !== undefined && args[key] !== "") {
      connection[key] = args[key];
    }
  }
  return connection;
}

export async function executeSteps({ callTool, steps, stopOnError, connection }) {
  const failed = [];
  let executed = 0;
  let succeeded = 0;

  for (const [index, step] of steps.entries()) {
    const failure = validateStep(step, index);
    if (failure) {
      failed.push(failure);
      if (stopOnError) {
        break;
      }
      continue;
    }

    executed += 1;
    const outcome = await runStep(callTool, step, connection);
    if (outcome.ok) {
      succeeded += 1;
      continue;
    }

    failed.push({
      step: index,
      tool: step.tool,
      ...(step.label ? { label: step.label } : {}),
      error: outcome.error
    });
    if (stopOnError) {
      break;
    }
  }

  return {
    ok: failed.length === 0,
    totalSteps: steps.length,
    executed,
    succeeded,
    failed,
    ...(failed.length > 0 && stopOnError
      ? { stoppedAt: failed[failed.length - 1].step }
      : {})
  };
}

function validateStep(step, index) {
  const tool = typeof step?.tool === "string" ? step.tool : "";
  if (!tool) {
    return { step: index, tool: "", error: "step is missing a tool name" };
  }
  if (RECIPE_TOOL_DENYLIST.has(tool)) {
    return { step: index, tool, error: `tool is not allowed inside a recipe: ${tool}` };
  }
  return null;
}

async function runStep(callTool, step, connection) {
  const mergedArgs = { ...connection, ...(step.args ?? {}) };
  let result;
  try {
    result = await callTool(step.tool, mergedArgs);
  } catch (error) {
    return { ok: false, error: truncate(error?.message ?? String(error)) };
  }

  const value = parseToolResult(result);
  if (value && typeof value === "object" && value.ok === false) {
    return { ok: false, error: truncate(String(value.error ?? "step reported ok:false")) };
  }
  return { ok: true };
}

function parseToolResult(result) {
  const text = result?.content?.[0]?.text;
  if (typeof text !== "string") {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function truncate(text) {
  return text.length > ERROR_TEXT_LIMIT ? `${text.slice(0, ERROR_TEXT_LIMIT)}…` : text;
}
