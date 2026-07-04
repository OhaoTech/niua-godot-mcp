export const RUNTIME_BASE_BRIDGE_METHODS = {
  async installRuntimeProbe(args = {}) {
    return this.request("/runtime/probe/install", {
      method: "POST",
      body: args
    });
  },

  async getRuntimeState({ maxDepth, pathFilter } = {}) {
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
