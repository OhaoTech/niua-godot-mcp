import { toolResult } from "../protocol.js";
import { CONNECTION_PROPERTIES } from "../tools/shared/bridge-schema.js";

// The dispatch profile collapses the flat catalog (~173 tools ≈ 56K tokens of
// schemas injected per request on clients without deferred tool loading) into
// ~13 action-routed domain tools (~95% schema-tax cut). Every catalog tool stays
// reachable as an action; per-action schemas are served on demand through the
// "describe" action (search-first, implemented server-side). See
// docs/godot-mcp/token-efficiency-roadmap.md, Tier 3.

const DISPATCH_DOMAINS = Object.freeze({
  godot_project: {
    categories: ["project-management", "project-settings", "runtime"],
    summary: "Godot project lifecycle, discovery, settings, logs, and versions."
  },
  godot_scene: {
    categories: ["scene"],
    summary: "Scenes: create, open, save, tabs, tree reads, and selection."
  },
  godot_node: {
    categories: ["nodes-common", "inspector"],
    summary: "Scene nodes: create, rename, reparent, delete, properties, and inspector reads."
  },
  godot_builder: {
    categories: ["nodes-2d", "nodes-3d"],
    summary: "Curated 2D/3D node builders: meshes, bodies, areas, cameras, lights, sprites, tilemaps."
  },
  godot_script: {
    categories: ["scripts"],
    summary: "GDScript files: write, read, attach, validate, and diagnose."
  },
  godot_filesystem: {
    categories: ["filesystem", "import"],
    summary: "res:// filesystem operations and asset import pipeline."
  },
  godot_resource: {
    categories: ["resources", "particles"],
    summary: "Resources: materials, shaders, .tres assets, and GPU particles."
  },
  godot_run: {
    categories: ["run", "export"],
    summary: "Run scenes, read run status, and export project builds."
  },
  godot_debug: {
    categories: ["debugger", "viewport"],
    summary: "Debugger, runtime probe, runtime input, screenshots, and viewport control."
  },
  godot_animation: {
    categories: ["animation"],
    summary: "AnimationPlayer and AnimationTree authoring and playback."
  },
  godot_systems: {
    categories: ["audio", "localization", "multiplayer", "navigation", "ui"],
    summary: "Audio buses, localization, multiplayer, navigation, and UI controls/themes."
  },
  godot_workflows: {
    categories: ["playable2d-workflow", "playable3d-workflow"],
    summary: "High-level playable blockout and character-controller workflows."
  }
});

// Tools that keep their own top-level schema in the dispatch profile.
const STANDALONE_TOOLS = Object.freeze(new Set(["apply_scene_recipe"]));

export function dispatchToolsFromCatalog(tools) {
  const domainByCategory = new Map();
  for (const [domain, spec] of Object.entries(DISPATCH_DOMAINS)) {
    for (const category of spec.categories) {
      if (domainByCategory.has(category)) {
        throw new Error(`dispatch profile maps category twice: ${category}`);
      }
      domainByCategory.set(category, domain);
    }
  }

  const grouped = new Map();
  const standalone = [];
  for (const tool of tools) {
    if (STANDALONE_TOOLS.has(tool.name)) {
      standalone.push(tool);
      continue;
    }
    const domain = domainByCategory.get(tool.category);
    if (!domain) {
      throw new Error(
        `dispatch profile has no domain for tool "${tool.name}" (category "${tool.category}")`
      );
    }
    if (!grouped.has(domain)) {
      grouped.set(domain, []);
    }
    grouped.get(domain).push(tool);
  }

  const dispatchers = [];
  for (const [domain, spec] of Object.entries(DISPATCH_DOMAINS)) {
    const members = grouped.get(domain) ?? [];
    if (members.length === 0) {
      continue;
    }
    dispatchers.push(buildDispatcher(domain, spec, members));
  }

  return [...dispatchers, ...standalone];
}

function buildDispatcher(domain, spec, members) {
  const byAction = new Map(members.map((tool) => [tool.name, tool]));
  const actions = members.map((tool) => tool.name);

  return {
    name: domain,
    description: `${spec.summary} Run one action per call; call { action: "describe" } to list actions or { action: "describe", name: "<action>" } for that action's full argument schema.`,
    category: "dispatch",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: [...actions, "describe"],
          description: "The action to run, or \"describe\" for schemas."
        },
        name: {
          type: "string",
          description: "With action \"describe\": which action to describe."
        },
        args: {
          type: "object",
          additionalProperties: true,
          description: "Arguments for the action (see describe)."
        },
        host: CONNECTION_PROPERTIES.host,
        port: CONNECTION_PROPERTIES.port,
        expectedProjectRoot: CONNECTION_PROPERTIES.expectedProjectRoot
      },
      required: ["action"],
      additionalProperties: false
    },
    async handler(args = {}) {
      const action = String(args.action ?? "");
      if (action === "describe") {
        return describeDomain(domain, members, byAction, args);
      }

      const target = byAction.get(action);
      if (!target) {
        throw Object.assign(
          new Error(
            `Unknown ${domain} action: "${action}". Valid actions: ${actions.join(", ")}, describe.`
          ),
          { code: -32602 }
        );
      }

      return target.handler(mergedActionArgs(args));
    }
  };
}

function mergedActionArgs(args) {
  const connection = {};
  for (const key of ["host", "port", "expectedProjectRoot"]) {
    if (args[key] !== undefined && args[key] !== "") {
      connection[key] = args[key];
    }
  }
  return { ...connection, ...(args.args ?? {}) };
}

function describeDomain(domain, members, byAction, args) {
  const name = String(args.name ?? "").trim();
  if (!name) {
    return toolResult({
      domain,
      actions: members.map((tool) => ({
        name: tool.name,
        summary: firstSentence(tool.description)
      }))
    });
  }

  const target = byAction.get(name);
  if (!target) {
    throw Object.assign(
      new Error(`Unknown ${domain} action to describe: "${name}".`),
      { code: -32602 }
    );
  }

  return toolResult({
    name: target.name,
    description: target.description,
    inputSchema: target.inputSchema
  });
}

function firstSentence(text) {
  const normalized = String(text ?? "").trim();
  const stop = normalized.indexOf(". ");
  return stop === -1 ? normalized : normalized.slice(0, stop + 1);
}
