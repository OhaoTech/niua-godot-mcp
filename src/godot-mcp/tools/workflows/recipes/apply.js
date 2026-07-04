import { readFile } from "node:fs/promises";
import path from "node:path";

import { connectionArgs, executeSteps } from "./executor.js";

const DEFAULT_MAX_STEPS = 500;

// One tool call executes a whole recipe of tool steps; the step loop, denylist,
// and compact summary live in executor.js and are shared with the inline
// sibling batch_scene_operations.
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

    const { ok, ...summary } = await executeSteps({
      callTool,
      steps: recipe.steps,
      stopOnError,
      connection: connectionArgs(args)
    });

    return {
      ok,
      recipePath,
      ...(recipe.name ? { recipe: recipe.name } : {}),
      ...summary
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
