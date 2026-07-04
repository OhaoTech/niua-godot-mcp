import {
  DEFAULT_RUNTIME_POLL_INTERVAL_MSEC,
  DEFAULT_RUNTIME_TIMEOUT_MSEC,
  pollRuntimeResult
} from "./polling.js";

export const RUNTIME_NODE_METHOD_BRIDGE_METHODS = {
  async requestCallRuntimeNodeMethod({ nodePath, method, args } = {}) {
    const body = { nodePath, method };
    if (args !== undefined) {
      body.args = args;
    }
    return this.request("/runtime/node/method/call", {
      method: "POST",
      body
    });
  },

  async getRuntimeNodeMethodCallResult({ requestId }) {
    const query = new URLSearchParams({ requestId });
    return this.request(`/runtime/node/method/call/result?${query}`);
  },

  async callRuntimeNodeMethod({
    nodePath,
    method,
    args,
    timeoutMsec = DEFAULT_RUNTIME_TIMEOUT_MSEC,
    pollIntervalMsec = DEFAULT_RUNTIME_POLL_INTERVAL_MSEC
  } = {}) {
    const initialResult = await this.requestCallRuntimeNodeMethod({ nodePath, method, args });
    return pollRuntimeResult(
      initialResult,
      (requestId) => this.getRuntimeNodeMethodCallResult({ requestId }),
      { timeoutMsec, pollIntervalMsec }
    );
  }
};
