import { appendBlockoutStep, blockoutFailure } from "../shared.js";

export function createBlockout3DWorkflowState(initialContext = {}) {
  return {
    steps: [],
    context: { ...initialContext }
  };
}

export function assignBlockout3DWorkflowContext(state, context) {
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined) {
      state.context[key] = value;
    }
  }
  return state;
}

export function captureBlockout3DStep(state, stage, result) {
  appendBlockoutStep(state.steps, stage, result);
  if (result.ok) {
    return null;
  }
  return blockoutFailure(stage, result, {
    steps: state.steps,
    ...state.context
  });
}

export function blockout3DWorkflowSteps(state) {
  return state.steps;
}
