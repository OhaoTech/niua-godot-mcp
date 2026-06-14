import { validateToolManifest } from "./validation.js";

export function bridgeMethodsFromManifest(manifest) {
  validateToolManifest(manifest);
  const methods = {};
  for (const entry of manifest) {
    if (manifestImplementation(entry) !== "bridge" || entry.bridge.generate === false) {
      continue;
    }
    methods[entry.bridge.clientMethod] = function manifestBridgeMethod(args = {}) {
      const options = {
        method: entry.bridge.method
      };
      if (entry.bridge.request === "body") {
        options.body = buildBridgeBody(entry, args);
      }
      const endpoint = entry.bridge.request === "query"
        ? buildQueryEndpoint(entry, args)
        : entry.bridge.endpoint;
      if (entry.bridge.timeout) {
        applyBridgeTimeout(options, entry, args, options.body ?? {});
      }
      return this.request(endpoint, options);
    };
  }
  return methods;
}

function manifestImplementation(entry) {
  return entry.implementation ?? "bridge";
}

function buildQueryEndpoint(entry, args) {
  const queryString = buildQueryString(entry.bridge.query, args);
  return queryString ? `${entry.bridge.endpoint}?${queryString}` : entry.bridge.endpoint;
}

function buildQueryString(query, args = {}) {
  const params = new URLSearchParams();
  const fields = query?.fields ?? Object.fromEntries(
    Object.keys(args ?? {}).map((key) => [key, {}])
  );

  for (const [name, spec] of Object.entries(fields)) {
    const value = queryValueForSpec(name, spec, args);
    if (value === undefined || value === null) {
      continue;
    }
    appendQueryValue(params, name, value, spec);
  }

  return params.toString();
}

function queryValueForSpec(name, spec = {}, args = {}) {
  const source = spec.field ?? name;
  const value = args?.[source];
  if (value !== undefined) {
    return value;
  }
  return Object.hasOwn(spec, "default") ? spec.default : undefined;
}

function appendQueryValue(params, name, value, spec = {}) {
  if (spec.omitEmpty && value === "") {
    return;
  }

  if (spec.array === "csv") {
    const values = (Array.isArray(value) ? value : [value])
      .map((item) => spec.trim ? String(item ?? "").trim() : String(item ?? ""))
      .filter(Boolean);
    if (values.length > 0) {
      params.set(name, values.join(","));
    }
    return;
  }

  if (spec.type === "boolean") {
    params.set(name, String(Boolean(value)));
    return;
  }

  params.set(name, String(value));
}

function buildBridgeBody(entry, args) {
  if (!entry.bridge.timeout) {
    return args;
  }

  const { [entry.bridge.timeout.field]: _timeout, ...body } = args ?? {};
  return body;
}

function applyBridgeTimeout(options, entry, args, body) {
  const timeout = entry.bridge.timeout;
  options.timeoutMs = args?.[timeout.field] ?? timeout.defaultMs;
  options.operationName = timeout.operationName;
  if (timeout.partialProgress) {
    options.partialProgress = buildPartialProgress(timeout.partialProgress, body);
  }
}

function buildPartialProgress(fields, body) {
  const progress = {};
  for (const [key, fallback] of Object.entries(fields)) {
    progress[key] = partialProgressValue(key, fallback, body);
  }
  return progress;
}

function partialProgressValue(key, spec, body) {
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    return body[key] ?? spec;
  }

  const source = spec.field ?? key;
  const value = body[source];
  if (spec.transform === "arrayLength") {
    return Array.isArray(value) ? value.length : spec.fallback;
  }
  return value ?? spec.fallback;
}
