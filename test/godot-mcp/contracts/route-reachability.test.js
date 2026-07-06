import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";

import { readAddonFile } from "../helpers/plugin-files.js";

// Route reachability contract: a read route lives in FOUR places — the route
// catalog (endpoint -> handler), the read-routes aggregator HANDLERS allowlist,
// a domain file's HANDLERS map, and the domain method itself. Registering a
// route in three of the four compiles fine and then 400s at runtime with
// "route handler did not return a Dictionary" (the /runtime/state/result
// gap the live gate caught on 2026-07-04). This pins all four together so the
// drift is a CI failure, not a live-editor surprise.

const HANDLER_KEY_PATTERN = /"(_[a-z0-9_]+)":\s*true/g;
const CATALOG_HANDLER_PATTERN = /"handler":\s*"(_[a-z0-9_]+)"/g;
const FUNC_PATTERN = /func (_[a-z0-9_]+)\(/g;

function matches(source, pattern) {
  return new Set([...source.matchAll(pattern)].map((entry) => entry[1]));
}

async function readDomainFiles() {
  const addonDir = new URL("../../../godot/addons/niua_mcp/", import.meta.url);
  const names = (await readdir(addonDir)).filter(
    (name) =>
      name.startsWith("niua_mcp_bridge_read_") &&
      name.endsWith("_routes.gd") &&
      name !== "niua_mcp_bridge_read_routes.gd"
  );
  const files = await Promise.all(names.map((name) => readAddonFile(name)));
  return names.map((name, index) => ({ name, source: files[index] }));
}

test("every read-catalog handler is reachable through aggregator and a domain file", async () => {
  const [catalog, aggregator] = await Promise.all([
    readAddonFile("niua_mcp_bridge_read_route_catalog.gd"),
    readAddonFile("niua_mcp_bridge_read_routes.gd")
  ]);
  const domains = await readDomainFiles();

  const catalogHandlers = matches(catalog, CATALOG_HANDLER_PATTERN);
  const aggregatorHandlers = matches(aggregator, HANDLER_KEY_PATTERN);

  const domainHandlers = new Set();
  for (const domain of domains) {
    for (const handler of matches(domain.source, HANDLER_KEY_PATTERN)) {
      assert.ok(
        matches(domain.source, FUNC_PATTERN).has(handler),
        `${domain.name} lists "${handler}" in HANDLERS but does not define func ${handler}()`
      );
      domainHandlers.add(handler);
    }
  }

  assert.ok(catalogHandlers.size > 0, "read route catalog parsed no handlers");
  for (const handler of catalogHandlers) {
    assert.ok(
      aggregatorHandlers.has(handler),
      `read catalog routes to "${handler}" but the aggregator HANDLERS allowlist omits it — the bridge would 400 with "route handler did not return a Dictionary"`
    );
    assert.ok(
      domainHandlers.has(handler),
      `read catalog routes to "${handler}" but no read domain file claims it in HANDLERS`
    );
  }

  // Reverse direction: aggregator entries no catalog route reaches are dead
  // weight that hides typos (a misspelled new entry looks "registered").
  for (const handler of aggregatorHandlers) {
    assert.ok(
      catalogHandlers.has(handler),
      `aggregator allowlists "${handler}" but no read catalog route uses it — dead entry or catalog typo`
    );
  }
});
