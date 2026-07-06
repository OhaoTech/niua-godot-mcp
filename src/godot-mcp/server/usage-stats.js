import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// Local, private tool-usage counters — the rails for usage-derived tiers
// (capability-graph ADR, session-adaptive exposure). Records ONLY tool names,
// call counts, and thrown-error counts: no arguments, no paths, no project
// names, nothing leaves the machine. Opt out with NIUA_MCP_USAGE_STATS=off.

export const USAGE_STATS_ENV_VAR = "NIUA_MCP_USAGE_STATS";
export const USAGE_DIR_ENV_VAR = "NIUA_MCP_USAGE_DIR";

const DISABLED_VALUES = new Set(["off", "0", "false", "no"]);
const FLUSH_INTERVAL_MSEC = 5000;

export function usageStatsEnabled(env = process.env) {
  return !DISABLED_VALUES.has(String(env[USAGE_STATS_ENV_VAR] ?? "on").toLowerCase());
}

export function usageStatsDir(env = process.env) {
  return path.resolve(env[USAGE_DIR_ENV_VAR] ?? "runs/tool-usage");
}

function sortedCounts(map) {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => (a < b ? -1 : 1)));
}

export function createUsageRecorder({
  env = process.env,
  profile = "",
  serverVersion = "",
  pid = process.pid
} = {}) {
  if (!usageStatsEnabled(env)) {
    return {
      enabled: false,
      filePath: null,
      record() {},
      async flush() {},
      snapshot() {
        return null;
      }
    };
  }

  const startedAt = new Date().toISOString();
  const filePath = path.join(
    usageStatsDir(env),
    `usage-${startedAt.replaceAll(":", "-")}-${pid}.json`
  );
  const counts = new Map();
  const errors = new Map();
  let totalCalls = 0;
  let lastFlushMsec = 0;
  let warnedWriteFailure = false;
  let flushChain = Promise.resolve();

  async function writeSnapshot() {
    const payload = {
      version: 1,
      startedAt,
      updatedAt: new Date().toISOString(),
      profile,
      serverVersion,
      totalCalls,
      counts: sortedCounts(counts),
      errors: sortedCounts(errors)
    };
    await mkdir(path.dirname(filePath), { recursive: true });
    // Atomic write: the server is routinely killed (harness teardown, editor
    // shutdown) and a torn writeFile leaves an unparseable file for every
    // future reader of the evidence base. Same-directory rename is atomic.
    const tmpPath = `${filePath}.tmp`;
    await writeFile(tmpPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    await rename(tmpPath, filePath);
  }

  // Flushes serialize on a chain: a throttled background flush and an explicit
  // flush() would otherwise race on the shared tmp file (rename ENOENT) or
  // rename an older payload over a newer one.
  function flush() {
    lastFlushMsec = Date.now();
    flushChain = flushChain.then(writeSnapshot, writeSnapshot);
    return flushChain;
  }

  return {
    enabled: true,
    filePath,
    // Counting must never break a tool call: flushes are throttled and disk
    // errors degrade to a single stderr warning, not a thrown error.
    record(toolName, ok = true) {
      totalCalls += 1;
      counts.set(toolName, (counts.get(toolName) ?? 0) + 1);
      if (!ok) {
        errors.set(toolName, (errors.get(toolName) ?? 0) + 1);
      }
      if (Date.now() - lastFlushMsec >= FLUSH_INTERVAL_MSEC) {
        flush().catch((error) => {
          if (!warnedWriteFailure) {
            warnedWriteFailure = true;
            process.stderr.write(`niua-godot-mcp: usage stats write failed (${error?.message}); continuing without them\n`);
          }
        });
      }
    },
    flush,
    snapshot() {
      return {
        totalCalls,
        counts: sortedCounts(counts),
        errors: sortedCounts(errors)
      };
    }
  };
}
