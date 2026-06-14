import { validateToolManifest } from "./validation.js";

export function godotRoutesFromManifest(manifest) {
  validateToolManifest(manifest);
  const routes = {
    read: [],
    write: []
  };

  for (const entry of manifest) {
    if ((entry.implementation ?? "bridge") !== "bridge") {
      continue;
    }
    const route = {
      endpoint: entry.godotRoute.endpoint,
      handler: entry.godotRoute.handler,
      arg: entry.godotRoute.arg
    };
    if (entry.godotRoute.methodError) {
      route.methodError = entry.godotRoute.methodError;
    }
    if (entry.godotRoute.method !== undefined) {
      route.method = entry.godotRoute.method;
    }
    routes[entry.godotRoute.side].push(route);
  }

  return routes;
}
