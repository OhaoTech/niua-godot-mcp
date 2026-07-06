import {
  DEFAULT_RUNTIME_POLL_INTERVAL_MSEC,
  DEFAULT_RUNTIME_TIMEOUT_MSEC,
  pollRuntimeResult
} from "./polling.js";

export const RUNTIME_BASE_BRIDGE_METHODS = {
  async installRuntimeProbe(args = {}) {
    return this.request("/runtime/probe/install", {
      method: "POST",
      body: args
    });
  },

  async requestRuntimeState({ maxDepth, pathFilter } = {}) {
    const query = new URLSearchParams();
    if (maxDepth !== undefined) {
      query.set("maxDepth", String(maxDepth));
    }
    if (pathFilter !== undefined && pathFilter !== "") {
      query.set("pathFilter", String(pathFilter));
    }
    const queryString = query.toString();
    return this.request(`/runtime/state${queryString ? `?${queryString}` : ""}`);
  },

  async getRuntimeStateResult({ requestId }) {
    const query = new URLSearchParams({ requestId });
    return this.request(`/runtime/state/result?${query}`);
  },

  // The initial /runtime/state response still carries the store's PREVIOUS
  // snapshot (the probe answers asynchronously), so poll the result endpoint
  // until the snapshot for this requestId lands — never hand a stale tree to
  // the caller as if it were current truth.
  async getRuntimeState({
    maxDepth,
    pathFilter,
    timeoutMsec = DEFAULT_RUNTIME_TIMEOUT_MSEC,
    pollIntervalMsec = DEFAULT_RUNTIME_POLL_INTERVAL_MSEC
  } = {}) {
    const initialResult = await this.requestRuntimeState({ maxDepth, pathFilter });
    return pollRuntimeResult(
      initialResult,
      (requestId) => this.getRuntimeStateResult({ requestId }),
      { timeoutMsec, pollIntervalMsec }
    );
  },

  async getRuntimeEvents({ limit, kinds = [], sinceMsec } = {}) {
    const query = new URLSearchParams();
    if (limit !== undefined) {
      query.set("limit", String(limit));
    }
    const normalizedKinds = Array.isArray(kinds) ? kinds : [kinds];
    const filteredKinds = normalizedKinds
      .map((kind) => String(kind ?? "").trim())
      .filter(Boolean);
    if (filteredKinds.length > 0) {
      query.set("kinds", filteredKinds.join(","));
    }
    if (sinceMsec !== undefined) {
      query.set("sinceMsec", String(sinceMsec));
    }
    const queryString = query.toString();
    return this.request(`/runtime/events${queryString ? `?${queryString}` : ""}`);
  }
};
