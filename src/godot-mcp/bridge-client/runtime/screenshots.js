import {
  DEFAULT_RUNTIME_POLL_INTERVAL_MSEC,
  DEFAULT_RUNTIME_TIMEOUT_MSEC,
  pollRuntimeResult
} from "./polling.js";

export const RUNTIME_SCREENSHOT_BRIDGE_METHODS = {
  async requestRuntimeScreenshot(args = {}) {
    return this.request("/runtime/screenshot", {
      method: "POST",
      body: args
    });
  },

  async getRuntimeScreenshotResult({ requestId }) {
    const query = new URLSearchParams({ requestId });
    return this.request(`/runtime/screenshot/result?${query}`);
  },

  async captureRuntimeScreenshot({
    timeoutMsec = DEFAULT_RUNTIME_TIMEOUT_MSEC,
    pollIntervalMsec = DEFAULT_RUNTIME_POLL_INTERVAL_MSEC
  } = {}) {
    const initialResult = await this.requestRuntimeScreenshot({});
    return pollRuntimeResult(
      initialResult,
      (requestId) => this.getRuntimeScreenshotResult({ requestId }),
      { timeoutMsec, pollIntervalMsec }
    );
  }
};
