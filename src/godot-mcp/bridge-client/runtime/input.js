import {
  DEFAULT_RUNTIME_POLL_INTERVAL_MSEC,
  DEFAULT_RUNTIME_TIMEOUT_MSEC,
  pollRuntimeResult
} from "./polling.js";

export const RUNTIME_INPUT_BRIDGE_METHODS = {
  async requestSendRuntimeInput({ actions, keys, mouseButtons, holdMs, mouseMotion } = {}) {
    const body = {};
    if (actions !== undefined) {
      body.actions = actions;
    }
    if (keys !== undefined) {
      body.keys = keys;
    }
    if (mouseButtons !== undefined) {
      body.mouseButtons = mouseButtons;
    }
    if (holdMs !== undefined) {
      body.holdMs = holdMs;
    }
    if (mouseMotion !== undefined) {
      body.mouseMotion = mouseMotion;
    }
    return this.request("/runtime/input/send", {
      method: "POST",
      body
    });
  },

  async getRuntimeInputSendResult({ requestId }) {
    const query = new URLSearchParams({ requestId });
    return this.request(`/runtime/input/send/result?${query}`);
  },

  async sendRuntimeInput({
    actions,
    keys,
    mouseButtons,
    holdMs,
    mouseMotion,
    timeoutMsec = DEFAULT_RUNTIME_TIMEOUT_MSEC,
    pollIntervalMsec = DEFAULT_RUNTIME_POLL_INTERVAL_MSEC
  } = {}) {
    const initialResult = await this.requestSendRuntimeInput({ actions, keys, mouseButtons, holdMs, mouseMotion });
    return pollRuntimeResult(
      initialResult,
      (requestId) => this.getRuntimeInputSendResult({ requestId }),
      { timeoutMsec, pollIntervalMsec }
    );
  }
};
