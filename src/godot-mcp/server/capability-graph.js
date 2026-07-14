// The capability graph — the single structure every tool-surface view derives
// from (docs/godot-mcp/capability-graph-architecture.md). Profiles are
// projections of it: core = essential-tier leaves, full = all leaves flat,
// compact = the graph collapsed into action-routed dispatchers. The domain map
// below is the graph's grouping level; dispatch-profile.js (compact) and the
// describe_tools navigator both consume it, so the two views cannot drift.

export const TOOL_PROFILE_ENV_VAR = "NIUA_MCP_PROFILE";
export const EXPERIMENTAL_ENV_VAR = "NIUA_MCP_EXPERIMENTAL";
export const DEFAULT_TOOL_PROFILE = "core";

const EXPERIMENTAL_ON = new Set(["on", "1", "true", "yes"]);

// Experimental tools exist in the catalog (describe_tools lists and labels
// them) but are excluded from every serving profile by default: they pass
// conformance yet no real game build has exercised them, and nobody should
// meet an unproven tool by accident.
export function experimentalEnabled(env = process.env) {
  return EXPERIMENTAL_ON.has(String(env[EXPERIMENTAL_ENV_VAR] ?? "off").toLowerCase());
}

export function servableTools(tools, env = process.env) {
  if (experimentalEnabled(env)) {
    return tools;
  }
  return tools.filter((tool) => tool.stability !== "experimental");
}
export const TOOL_PROFILES = Object.freeze(["core", "full", "compact"]);
export const TOOL_PROFILE_ALIASES = Object.freeze({
  v1: "core",
  dispatch: "compact"
});

export function resolveToolProfile(value = process.env[TOOL_PROFILE_ENV_VAR]) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "") {
    return DEFAULT_TOOL_PROFILE;
  }
  const canonical = TOOL_PROFILE_ALIASES[normalized] ?? normalized;
  if (!TOOL_PROFILES.includes(canonical)) {
    throw new Error(
      `Invalid ${TOOL_PROFILE_ENV_VAR}: "${value}". Expected one of: ${TOOL_PROFILES.join(", ")} (aliases: ${Object.entries(TOOL_PROFILE_ALIASES).map(([from, to]) => `${from} -> ${to}`).join(", ")}).`
    );
  }
  return canonical;
}

// The domain map: every manifest category belongs to exactly one domain.
// This is what the compact profile collapses into dispatchers and what the
// describe_tools root map lists.
export const DISPATCH_DOMAINS = Object.freeze({
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
    categories: ["playable2d-workflow", "playable3d-workflow", "playtest-workflow", "recipe-workflow"],
    summary: "High-level playable blockouts, playtest evidence, and recipe/batch executors."
  }
});

// Tools that keep their own top-level schema in the compact profile instead
// of routing through a domain dispatcher: small schemas, high value, and the
// batch executors / catalog navigator must stay one hop away.
export const STANDALONE_TOOLS = Object.freeze(new Set([
  "apply_scene_recipe",
  "batch_scene_operations",
  "run_playtest_evidence",
  "describe_tools"
]));

// category -> domain reverse mapping, with the duplicate guard that keeps a
// category from landing in two domains.
export const DOMAIN_BY_CATEGORY = Object.freeze((() => {
  const byCategory = {};
  for (const [domain, spec] of Object.entries(DISPATCH_DOMAINS)) {
    for (const category of spec.categories) {
      if (byCategory[category] !== undefined) {
        throw new Error(`capability graph maps category twice: ${category}`);
      }
      byCategory[category] = domain;
    }
  }
  return byCategory;
})());

export function firstSentence(text) {
  const normalized = String(text ?? "").trim();
  const stop = normalized.indexOf(". ");
  return stop === -1 ? normalized : normalized.slice(0, stop + 1);
}
