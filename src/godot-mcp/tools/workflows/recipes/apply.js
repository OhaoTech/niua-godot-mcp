import { readFile } from "node:fs/promises";
import path from "node:path";

// Tools a recipe must not run: process lifecycle (spawns/kills editors), exports,
// and the recipe tool itself (recursion).
const RECIPE_TOOL_DENYLIST = new Set([
  "apply_scene_recipe",
  "create_project",
  "open_project",
  "close_project",
  "import_project",
  "forget_project",
  "export_project"
]);

const DEFAULT_MAX_STEPS = 500;
const ERROR_TEXT_LIMIT = 300;

// One tool call executes a whole recipe of tool steps; per-step successes stay OUT
// of the result on purpose — only a compact summary (and failures) return to the
// caller's context window (docs/godot-mcp/token-efficiency-roadmap.md, Tier 2).
export function createApplySceneRecipe({ callTool, readFileImpl = readFile } = {}) {
  if (typeof callTool !== "function") {
    throw new Error("createApplySceneRecipe requires a callTool function");
  }

  return async function applySceneRecipe(args = {}) {
    const recipePath = resolveRecipePath(args);
    const stopOnError = args.stopOnError !== false;
    const maxSteps = Number.isInteger(args.maxSteps) && args.maxSteps > 0
      ? args.maxSteps
      : DEFAULT_MAX_STEPS;

    const recipe = await loadRecipe(readFileImpl, recipePath);
    if (recipe.steps.length > maxSteps) {
      throw new Error(`recipe has ${recipe.steps.length} steps; maxSteps is ${maxSteps}`);
    }

    const connection = connectionArgs(args);
    const failed = [];
    let executed = 0;
    let succeeded = 0;

    for (const [index, step] of recipe.steps.entries()) {
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
      recipePath,
      ...(recipe.name ? { recipe: recipe.name } : {}),
      totalSteps: recipe.steps.length,
      executed,
      succeeded,
      failed,
      ...(failed.length > 0 && stopOnError
        ? { stoppedAt: failed[failed.length - 1].step }
        : {})
    };
  };
}

function resolveRecipePath(args) {
  const raw = String(args.recipePath ?? "").trim();
  if (!raw) {
    throw new Error("recipePath is required");
  }
  if (raw.startsWith("res://")) {
    const projectRoot = String(args.expectedProjectRoot ?? "").trim();
    if (!projectRoot) {
      throw new Error("res:// recipePath requires expectedProjectRoot");
    }
    return path.join(projectRoot, raw.slice("res://".length));
  }
  if (!path.isAbsolute(raw)) {
    throw new Error("recipePath must be absolute or res:// relative to expectedProjectRoot");
  }
  return raw;
}

async function loadRecipe(readFileImpl, recipePath) {
  let text;
  try {
    text = await readFileImpl(recipePath, "utf8");
  } catch (error) {
    throw new Error(`could not read recipe file ${recipePath}: ${error.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`recipe file ${recipePath} is not valid JSON: ${error.message}`);
  }

  const steps = Array.isArray(parsed) ? parsed : parsed?.steps;
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error(`recipe file ${recipePath} must contain a non-empty steps array`);
  }

  return {
    name: typeof parsed?.name === "string" ? parsed.name : "",
    steps
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

function connectionArgs(args) {
  const connection = {};
  for (const key of ["host", "port", "expectedProjectRoot"]) {
    if (args[key] !== undefined && args[key] !== "") {
      connection[key] = args[key];
    }
  }
  return connection;
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
