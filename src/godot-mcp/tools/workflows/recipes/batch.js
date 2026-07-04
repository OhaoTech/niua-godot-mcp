import { connectionArgs, executeSteps } from "./executor.js";

// Inline sibling of apply_scene_recipe: same executor, same denylist, same
// compact summary, but the steps ride in the tool args instead of a file.
// Capped low on purpose — big batches belong in a recipe file so their JSON
// never enters the caller's context window twice.
export const BATCH_MAX_STEPS = 50;

export function createBatchSceneOperations({ callTool } = {}) {
  if (typeof callTool !== "function") {
    throw new Error("createBatchSceneOperations requires a callTool function");
  }

  return async function batchSceneOperations(args = {}) {
    const steps = args.steps;
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new Error("batch_scene_operations requires a non-empty steps array");
    }
    if (steps.length > BATCH_MAX_STEPS) {
      throw new Error(
        `batch has ${steps.length} steps; the inline cap is ${BATCH_MAX_STEPS} — write bigger batches to a recipe file and run apply_scene_recipe`
      );
    }

    const stopOnError = args.stopOnError !== false;
    return executeSteps({
      callTool,
      steps,
      stopOnError,
      connection: connectionArgs(args)
    });
  };
}
