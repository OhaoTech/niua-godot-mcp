import { knownProjectByRoot } from "../project-registry.js";
import { openProjectByRoot } from "../process-manager.js";

export function buildBridgeDiscoveryData({
  host,
  ports,
  probes,
  includeUnavailable,
  registry
}) {
  const bridges = [];
  const failedProbes = [];

  for (const probe of probes) {
    if (!probe.available) {
      if (includeUnavailable) {
        failedProbes.push(probe);
      }
      continue;
    }

    const projectRoot = probe.project?.projectRoot ?? "";
    bridges.push({
      host: probe.host,
      port: probe.port,
      health: probe.health,
      project: probe.project,
      projectError: probe.projectError ?? null,
      knownProject: knownProjectByRoot(registry, projectRoot),
      openProject: openProjectByRoot(projectRoot)
    });
  }

  bridges.sort((left, right) => left.port - right.port);

  return {
    host,
    ports,
    bridges,
    probes: failedProbes
  };
}
