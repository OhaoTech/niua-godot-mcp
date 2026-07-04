import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { readAddonFileExact, repoRoot } from "../helpers/plugin-files.js";

// B6 determinism audit (docs/godot-mcp/quality-delivery-architecture.md):
// identical calls against identical state must produce byte-identical
// responses — stable key order, stable list order, no gratuitous timestamps
// or randomness. These pins hold the sorting fixes in place so a refactor
// cannot quietly reintroduce filesystem- or hash-order-dependent output.
//
// Deliberately NOT pinned (order is meaningful state, not noise):
// - scene-tree children and sibling order (engine child order is the scene),
// - animation track order,
// - registeredTranslations (project-settings order),
// - lifecycle registry timestamps (firstSeenAt/lastSeenAt are state),
// - runtime probe event timeMsec entries (telemetry of a live run).

test("list_filesystem walks each directory in sorted name order", async () => {
  const source = await readAddonFileExact("niua_mcp_filesystem_read_operations.gd");

  // The shared sorted lister exists and actually sorts what DirAccess yields.
  assert.match(source, /static func sorted_directory_listing\(directory: DirAccess\) -> Array:/);
  assert.match(source, /listed\.sort_custom\(func\(left, right\): return str\(left\.get\("name"\)\) < str\(right\.get\("name"\)\)\)/);
  // directory_entries consumes the sorted listing, not raw DirAccess order.
  assert.match(source, /for listed in sorted_directory_listing\(directory\):/);
  assert.doesNotMatch(source, /static func directory_entries[\s\S]*?list_dir_begin[\s\S]*?static func sorted_directory_listing/);
});

test("list_imported_assets walks each directory in sorted name order", async () => {
  const source = await readAddonFileExact("niua_mcp_import_asset_listing.gd");

  assert.match(source, /for listed in NiuaMcpFilesystemReadOperations\.sorted_directory_listing\(directory\):/);
  assert.doesNotMatch(source, /list_dir_begin/);
});

test("replace_in_scripts collects script paths in sorted name order", async () => {
  const source = await readAddonFileExact("niua_mcp_script_replace_paths.gd");

  assert.match(source, /for listed in NiuaMcpFilesystemReadOperations\.sorted_directory_listing\(directory\):/);
  assert.doesNotMatch(source, /list_dir_begin/);
});

test("get_localization_state sorts hash-ordered engine sets", async () => {
  const source = await readAddonFileExact("niua_mcp_localization_registry_operations.gd");

  // loadedLocales and the translations list come from engine hash sets whose
  // raw iteration order can differ run-to-run.
  assert.match(source, /loaded_locales\.sort\(\)/);
  assert.match(source, /translations\.sort_custom\(func\(left, right\): return str\(left\.get\("locale"\)\) < str\(right\.get\("locale"\)\)\)/);
});

test("node snapshots keep groups and metadata keys sorted (reference pattern)", async () => {
  const source = await readAddonFileExact("niua_mcp_node_snapshot.gd");

  assert.match(source, /groups\.sort\(\)/);
  assert.match(source, /keys\.sort\(\)/);
});

test("discover_projects walks directories in sorted name order", async () => {
  const source = await readFile(
    path.join(repoRoot, "src/godot-mcp/tools/project/discovery/project-scanner.js"),
    "utf8"
  );

  assert.match(source, /entries\.sort\(\(left, right\) => left\.name\.localeCompare\(right\.name\)\)/);
});

test("sorted-order guarantees are documented in the tool descriptions", async () => {
  const descriptions = [
    ["src/godot-mcp/tools/filesystem/manifest.js", /list_filesystem[\s\S]{0,200}sorted by name ascending within each directory/],
    ["src/godot-mcp/tools/import/manifest.js", /list_imported_assets[\s\S]{0,200}sorted name order per directory/],
    ["src/godot-mcp/tools/scripts/manifest.js", /replace_in_scripts[\s\S]{0,300}sorted name order per directory/],
    ["src/godot-mcp/tools/localization/manifest.js", /get_localization_state[\s\S]{0,300}sorted by locale/],
    ["src/godot-mcp/tools/project/manifest.js", /discover_projects[\s\S]{0,300}sorted name order/]
  ];

  for (const [file, pattern] of descriptions) {
    const source = await readFile(path.join(repoRoot, file), "utf8");
    assert.match(source, pattern, `${file} must document its order guarantee`);
  }
});

test("addon response paths use no randomness or wall-clock timestamps", async () => {
  // Time.get_ticks_msec is allowed only in probe telemetry, request-id
  // generation, and HTTP deadline loops — never as response decoration.
  // Wall-clock APIs and RNG have no legitimate use in the addon at all.
  const { readdir } = await import("node:fs/promises");
  const addonRoot = path.join(repoRoot, "godot/addons/niua_mcp");
  const files = (await readdir(addonRoot)).filter((name) => name.endsWith(".gd"));
  assert.ok(files.length > 100, `expected the addon sources, found ${files.length} files`);

  for (const file of files) {
    const source = await readFile(path.join(addonRoot, file), "utf8");
    assert.doesNotMatch(source, /\brandi\(|\brandf\(|\brandomize\(|\brand_from_seed\(/, `${file} must not use RNG`);
    assert.doesNotMatch(
      source,
      /Time\.get_datetime|Time\.get_date_|Time\.get_time_|Time\.get_unix_time/,
      `${file} must not put wall-clock time in responses`
    );
  }
});
