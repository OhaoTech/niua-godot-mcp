import {
  DEFAULT_RUNTIME_POLL_INTERVAL_MSEC,
  DEFAULT_RUNTIME_TIMEOUT_MSEC,
  pollRuntimeResult
} from "./polling.js";

export const RUNTIME_NODE_PROPERTY_BRIDGE_METHODS = {
  async requestRuntimeNodeProperties({
    nodePath = "/root",
    refresh = true,
    requestId,
    properties,
    verbose
  } = {}) {
    const query = new URLSearchParams({
      nodePath,
      refresh: String(Boolean(refresh))
    });
    if (requestId) {
      query.set("requestId", requestId);
    }
    const names = Array.isArray(properties)
      ? properties.map((name) => String(name ?? "").trim()).filter(Boolean)
      : [];
    if (names.length > 0) {
      query.set("properties", names.join(","));
    }
    if (verbose === true) {
      query.set("verbose", "true");
    }
    return this.request(`/runtime/node/properties?${query}`);
  },

  async getRuntimeNodeProperties({
    nodePath = "/root",
    properties,
    verbose,
    timeoutMsec = DEFAULT_RUNTIME_TIMEOUT_MSEC,
    pollIntervalMsec = DEFAULT_RUNTIME_POLL_INTERVAL_MSEC
  } = {}) {
    const initialResult = await this.requestRuntimeNodeProperties({
      nodePath,
      refresh: true,
      properties,
      verbose
    });
    return pollRuntimeResult(
      initialResult,
      (requestId) => this.requestRuntimeNodeProperties({
        nodePath,
        refresh: false,
        requestId
      }),
      { timeoutMsec, pollIntervalMsec }
    );
  },

  async requestSetRuntimeNodeProperty({ nodePath, property, value }) {
    return this.request("/runtime/node/property/set", {
      method: "POST",
      body: {
        nodePath,
        property,
        value
      }
    });
  },

  async getRuntimeNodePropertySetResult({ requestId }) {
    const query = new URLSearchParams({ requestId });
    return this.request(`/runtime/node/property/set/result?${query}`);
  },

  async setRuntimeNodeProperty({
    nodePath,
    property,
    value,
    timeoutMsec = DEFAULT_RUNTIME_TIMEOUT_MSEC,
    pollIntervalMsec = DEFAULT_RUNTIME_POLL_INTERVAL_MSEC
  }) {
    const initialResult = await this.requestSetRuntimeNodeProperty({
      nodePath,
      property,
      value
    });
    return pollRuntimeResult(
      initialResult,
      (requestId) => this.getRuntimeNodePropertySetResult({ requestId }),
      { timeoutMsec, pollIntervalMsec }
    );
  }
};
