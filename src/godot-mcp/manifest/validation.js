const VALID_PROFILES = new Set(["v1", "full"]);
const VALID_IMPLEMENTATIONS = new Set(["bridge", "local"]);
const VALID_ROUTE_SIDES = new Set(["read", "write"]);
const VALID_ROUTE_ARGS = new Set(["none", "query", "body"]);
const VALID_BRIDGE_REQUESTS = new Set(["none", "query", "body"]);

export function validateToolManifest(manifest) {
  if (!Array.isArray(manifest)) {
    throw new Error("tool manifest must be an array");
  }

  const names = new Set();
  const bridgeMethods = new Set();
  for (const entry of manifest) {
    validateManifestEntry(entry);
    if (names.has(entry.name)) {
      throw new Error(`duplicate manifest tool: ${entry.name}`);
    }
    names.add(entry.name);

    if (manifestImplementation(entry) !== "bridge") {
      continue;
    }

    if (entry.bridge.generate === false) {
      continue;
    }

    if (bridgeMethods.has(entry.bridge.clientMethod)) {
      throw new Error(`duplicate manifest bridge method: ${entry.bridge.clientMethod}`);
    }
    bridgeMethods.add(entry.bridge.clientMethod);
  }

  return manifest;
}

function validateManifestEntry(entry) {
  const label = entry?.name ?? "<unnamed>";
  requireString(entry, "name", label);
  requireString(entry, "description", label);
  if (!entry.inputSchema || entry.inputSchema.type !== "object") {
    throw new Error(`${label} manifest inputSchema must be an object schema`);
  }
  if (!VALID_PROFILES.has(entry.profile)) {
    throw new Error(`${label} manifest profile must be v1 or full`);
  }
  requireString(entry, "category", label);

  const implementation = manifestImplementation(entry);
  if (!VALID_IMPLEMENTATIONS.has(implementation)) {
    throw new Error(`${label} manifest implementation must be bridge or local`);
  }
  if (implementation === "bridge") {
    validateBridgeContract(entry.bridge, label);
    validateAdapterContract(entry.adapter, label);
    validateGodotRouteContract(entry.godotRoute, label);
  } else {
    if (entry.adapter !== undefined) {
      throw new Error(`${label} manifest adapter is only supported for bridge tools`);
    }
    validateLocalContract(entry.local, label);
  }

  if (!entry.conformance?.happy) {
    throw new Error(`${label} manifest conformance.happy is required`);
  }
  if (!entry.conformance?.error) {
    throw new Error(`${label} manifest conformance.error is required`);
  }
  if (!entry.docs?.summary) {
    throw new Error(`${label} manifest docs.summary is required`);
  }
}

function manifestImplementation(entry) {
  return entry.implementation ?? "bridge";
}

function validateBridgeContract(bridge, label) {
  if (!bridge || typeof bridge !== "object") {
    throw new Error(`${label} manifest bridge contract is required`);
  }
  requireString(bridge, "clientMethod", label);
  requireString(bridge, "endpoint", label);
  requireString(bridge, "method", label);
  if (bridge.generate !== undefined && typeof bridge.generate !== "boolean") {
    throw new Error(`${label} manifest bridge.generate must be a boolean`);
  }
  if (!VALID_BRIDGE_REQUESTS.has(bridge.request)) {
    throw new Error(`${label} manifest bridge.request must be none, query, or body`);
  }
  if (bridge.method === "GET" && bridge.request === "body") {
    throw new Error(`${label} manifest GET bridge request cannot use a body`);
  }
  if (bridge.method !== "GET" && bridge.request !== "body") {
    throw new Error(`${label} manifest mutating bridge request must use a body`);
  }
  if (bridge.request === "query") {
    validateBridgeQueryContract(bridge.query, label);
  }
  if (bridge.timeout !== undefined) {
    validateBridgeTimeoutContract(bridge.timeout, label);
  }
}

function validateBridgeQueryContract(query, label) {
  if (!query || typeof query !== "object") {
    throw new Error(`${label} manifest bridge.query must be an object`);
  }
  if (query.fields !== undefined && typeof query.fields !== "object") {
    throw new Error(`${label} manifest bridge.query.fields must be an object`);
  }
}

function validateBridgeTimeoutContract(timeout, label) {
  if (!timeout || typeof timeout !== "object") {
    throw new Error(`${label} manifest bridge.timeout must be an object`);
  }
  requireString(timeout, "field", label);
  if (typeof timeout.defaultMs !== "number") {
    throw new Error(`${label} manifest bridge.timeout.defaultMs must be a number`);
  }
  requireString(timeout, "operationName", label);
  if (timeout.partialProgress !== undefined && typeof timeout.partialProgress !== "object") {
    throw new Error(`${label} manifest bridge.timeout.partialProgress must be an object`);
  }
}

function validateAdapterContract(adapter, label) {
  if (adapter === undefined) {
    return;
  }
  if (!adapter || typeof adapter !== "object") {
    throw new Error(`${label} manifest adapter must be an object`);
  }
  requireString(adapter, "handler", label);
}

function validateLocalContract(local, label) {
  if (!local || typeof local !== "object") {
    throw new Error(`${label} manifest local contract is required`);
  }
  requireString(local, "handler", label);
}

function validateGodotRouteContract(route, label) {
  if (!route || typeof route !== "object") {
    throw new Error(`${label} manifest godotRoute contract is required`);
  }
  if (!VALID_ROUTE_SIDES.has(route.side)) {
    throw new Error(`${label} manifest godotRoute.side must be read or write`);
  }
  requireString(route, "endpoint", label);
  requireString(route, "handler", label);
  if (!VALID_ROUTE_ARGS.has(route.arg)) {
    throw new Error(`${label} manifest godotRoute.arg must be none, query, or body`);
  }
  if (route.side === "write") {
    validateWriteRouteMethodContract(route, label);
  } else if (route.method !== undefined || route.methodError !== undefined) {
    throw new Error(`${label} manifest read godotRoute cannot define method or methodError`);
  }
}

function validateWriteRouteMethodContract(route, label) {
  const hasMethodError = route.methodError !== undefined;
  const hasMethod = route.method !== undefined;
  if (hasMethodError === hasMethod) {
    throw new Error(`${label} manifest write godotRoute must define exactly one of methodError or method`);
  }
  if (hasMethodError) {
    requireString(route, "methodError", label);
    return;
  }
  if (typeof route.method !== "string") {
    throw new Error(`${label} manifest godotRoute.method must be a string`);
  }
}

function requireString(source, key, label) {
  if (typeof source?.[key] !== "string" || source[key].length === 0) {
    throw new Error(`${label} manifest ${key} is required`);
  }
}
