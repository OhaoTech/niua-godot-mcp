// Tool-surface profiles for the Godot MCP server — each one a computed
// projection of the capability graph (capability-graph.js):
//
// - core (default): leaves where tier === "essential" in the tool manifests.
//   Nothing is deleted — a tool earns promotion into core by being needed
//   during a real run (a docs/godot-mcp/slice-0-findings.md entry is the
//   admission ticket; the manifest tier flips to "essential" with it).
// - full: every tool, flat. Costs the most schema tokens per request on
//   clients without deferred tool loading.
// - compact: the full surface behind ~13 action-routed domain tools with
//   the smallest schema footprint (see dispatch-profile.js).
//
// The historical names "v1" (-> core) and "dispatch" (-> compact) are
// accepted as permanent aliases so existing configs keep working.

import { GODOT_MCP_TOOLS } from "../tools/index.js";
import { dispatchToolsFromCatalog } from "./dispatch-profile.js";

// Profile names and resolution live with the graph; re-exported here so
// existing importers (setup, doctor, tool-catalog, external tooling) keep
// their historical import path.
export {
  DEFAULT_TOOL_PROFILE,
  TOOL_PROFILE_ALIASES,
  TOOL_PROFILE_ENV_VAR,
  TOOL_PROFILES,
  resolveToolProfile
} from "./capability-graph.js";

// DERIVED, not hand-maintained: the core projection is computed from the
// assembled catalog at module load — exactly the tools whose manifest entry
// carries tier: "essential". If two views could drift, the structure would be
// wrong (capability-graph ADR, principle 1).
export const CORE_TOOL_NAMES = Object.freeze([
  ...new Set(
    GODOT_MCP_TOOLS
      .filter((tool) => tool.tier === "essential")
      .map((tool) => tool.name)
  )
]);

if (CORE_TOOL_NAMES.length === 0) {
  throw new Error(
    "core tool profile derived an empty set: no manifest entry carries tier: \"essential\""
  );
}

// Back-compat export: external tooling (docs generators, the lab conformance
// harness) imported the core list under its historical name.
export const V1_TOOL_NAMES = CORE_TOOL_NAMES;

export function selectProfileTools(tools, profile) {
  if (profile === "full") {
    return tools;
  }

  if (profile === "compact") {
    return dispatchToolsFromCatalog(tools);
  }

  const available = new Set(tools.map((tool) => tool.name));
  const missing = CORE_TOOL_NAMES.filter((name) => !available.has(name));
  if (missing.length > 0) {
    throw new Error(
      `core tool profile references unknown tools (renamed or removed?): ${missing.join(", ")}`
    );
  }

  const allowed = new Set(CORE_TOOL_NAMES);
  return tools.filter((tool) => allowed.has(tool.name));
}
