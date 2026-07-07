import { toolResult } from "../protocol.js";
import { splitBridgeArgs } from "../server/context.js";
import { validateToolManifest } from "./validation.js";

export function toolDefinitionsFromManifest(manifest, { adapterHandlers = {}, localHandlers = {} } = {}) {
  validateToolManifest(manifest);
  return manifest.map((entry) => ({
    name: entry.name,
    description: entry.description,
    category: entry.category,
    tier: entry.tier,
    stability: entry.stability,
    inputSchema: entry.inputSchema,
    async handler(args = {}) {
      if (manifestImplementation(entry) === "local") {
        return toolResult(await callManifestLocalHandler(localHandlers, entry, args));
      }
      const { client, payload } = splitBridgeArgs(args);
      if (entry.adapter) {
        return toolResult(await callManifestBridgeAdapter(adapterHandlers, entry, {
          args,
          client,
          payload
        }));
      }
      return toolResult(await callManifestBridgeMethod(client, entry, payload));
    }
  }));
}

async function callManifestLocalHandler(localHandlers, entry, args) {
  const handler = localHandlers[entry.local.handler];
  if (typeof handler !== "function") {
    throw new Error(`manifest local handler ${entry.local.handler} is not registered for ${entry.name}`);
  }

  return handler(args);
}

async function callManifestBridgeAdapter(adapterHandlers, entry, context) {
  const handler = adapterHandlers[entry.adapter.handler];
  if (typeof handler !== "function") {
    throw new Error(`manifest adapter handler ${entry.adapter.handler} is not registered for ${entry.name}`);
  }

  return handler({
    ...context,
    entry
  });
}

async function callManifestBridgeMethod(client, entry, payload) {
  const method = client[entry.bridge.clientMethod];
  if (typeof method !== "function") {
    throw new Error(`GodotBridgeClient is missing manifest bridge method ${entry.bridge.clientMethod}`);
  }

  if (entry.bridge.request === "none") {
    return method.call(client);
  }
  return method.call(client, payload);
}

function manifestImplementation(entry) {
  return entry.implementation ?? "bridge";
}
