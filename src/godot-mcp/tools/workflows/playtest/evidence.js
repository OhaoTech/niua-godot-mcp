import { pickBridgeConnectionArgs } from "../../../server/context.js";

/**
 * One-shot playtest job: run → probe → observe → optional screenshot → stop.
 * Returns a compact engine-level evidence pack (no chat spam of intermediates).
 */
export function createRunPlaytestEvidence({ callTool }) {
  return async function runPlaytestEvidence(args = {}) {
    const connection = pickBridgeConnectionArgs(args);
    const scenePath = String(args.scenePath ?? "").trim();
    const settleMs = clampInt(args.settleMs, 250, 0, 30_000);
    const maxDepth = clampInt(args.maxDepth, 2, 0, 8);
    const savePath = args.savePath != null ? String(args.savePath) : null;
    const stopAfter = args.stopAfter !== false;

    const steps = [];
    const fail = (code, error, recovery) => ({
      ok: false,
      errorCode: code,
      error,
      ...(recovery ? { recovery } : {}),
      evidence: null,
      steps
    });

    // 1) Settings
    const settings = await call("get_run_settings", connection, steps);
    if (!settings.ok) {
      return fail("bridge_error", settings.error, {
        tool: "open_project",
        hint: "open_project on this folder so the editor bridge is up"
      });
    }
    const mainScene = settings.data?.mainScene ?? settings.data?.main_scene ?? null;
    const mainExists = settings.data?.mainSceneExists ?? settings.data?.main_scene_exists;

    // 2) Ensure something runnable
    let runMode = "main";
    let runPath = mainScene;
    if (scenePath) {
      runMode = "custom";
      runPath = scenePath;
      if (!mainScene || mainExists === false) {
        const setMain = await call("set_main_scene", { ...connection, path: scenePath, save: true }, steps);
        if (!setMain.ok) {
          // still try custom run
          steps.push({ name: "set_main_scene", ok: false, error: setMain.error });
        }
      }
    } else if (!mainScene) {
      return fail("no_main_scene", "no main scene and no scenePath provided", {
        tool: "set_main_scene",
        hint: "pass scenePath: \"res://main.tscn\" or call set_main_scene first"
      });
    }

    // 3) Run (saveBeforeRun defaults true on bridge)
    const runArgs =
      runMode === "custom"
        ? { ...connection, path: runPath, saveBeforeRun: args.saveBeforeRun !== false }
        : { ...connection, saveBeforeRun: args.saveBeforeRun !== false };
    const runTool = runMode === "custom" ? "run_custom_scene" : "run_main_scene";
    const ran = await call(runTool, runArgs, steps);
    if (!ran.ok) {
      return fail(ran.errorCode ?? "run_failed", ran.error, ran.recovery);
    }

    // 4) Probe + settle
    await call("install_runtime_probe", { ...connection, save: true }, steps);
    if (settleMs > 0) await sleep(settleMs);

    const state = await call(
      "get_runtime_state",
      { ...connection, maxDepth },
      steps
    );
    const events = await call("get_runtime_events", { ...connection }, steps);
    const shotArgs = { ...connection };
    if (savePath) shotArgs.savePath = savePath;
    const screenshot = await call("capture_runtime_screenshot", shotArgs, steps);

    let stopped = null;
    if (stopAfter) {
      stopped = await call("stop_running_scene", { ...connection }, steps);
    }

    const status = await call("get_run_status", { ...connection }, steps);

    const evidence = buildEvidencePack({
      runMode,
      runPath,
      settings: settings.data,
      run: ran.data,
      runtimeState: state.ok ? state.data : null,
      runtimeEvents: events.ok ? events.data : null,
      screenshot: screenshot.ok ? screenshot.data : screenshot,
      runStatus: status.ok ? status.data : null,
      stopped: stopped?.ok ? stopped.data : null,
      displayServer: status.data?.displayServer ?? ran.data?.displayServer ?? null,
      interactive: status.data?.interactive ?? ran.data?.interactive ?? null
    });

    const ok = Boolean(ran.ok) && (state.ok || events.ok);
    return {
      ok,
      evidence,
      steps: steps.map(compactStep),
      error: ok ? undefined : "playtest completed with observation failures — see steps"
    };
  };

  async function call(name, toolArgs, steps) {
    try {
      const raw = await callTool(name, toolArgs);
      // callTool may return MCP content wrapper or raw object depending on path
      const payload = unwrapToolResult(raw);
      const entry = {
        name,
        ok: payload?.ok !== false,
        error: payload?.ok === false ? payload.error : undefined,
        errorCode: payload?.errorCode,
        recovery: payload?.recovery
      };
      steps.push(entry);
      return payload && typeof payload === "object" ? payload : { ok: true, data: payload };
    } catch (error) {
      const entry = {
        name,
        ok: false,
        error: error?.message ?? String(error)
      };
      steps.push(entry);
      return { ok: false, error: entry.error };
    }
  }
}

function unwrapToolResult(raw) {
  if (raw && Array.isArray(raw.content) && raw.content[0]?.text) {
    try {
      return JSON.parse(String(raw.content[0].text).trim());
    } catch {
      return { ok: false, error: "unparseable tool result" };
    }
  }
  return raw;
}

function buildEvidencePack({
  runMode,
  runPath,
  settings,
  run,
  runtimeState,
  runtimeEvents,
  screenshot,
  runStatus,
  stopped,
  displayServer,
  interactive
}) {
  const shot = screenshot && typeof screenshot === "object" ? screenshot : {};
  const available = shot.available === true || typeof shot.pngBase64 === "string" || typeof shot.path === "string";
  const headless = String(displayServer ?? "").toLowerCase() === "headless" || interactive === false;

  return {
    schemaVersion: 1,
    kind: "godot_playtest_evidence",
    run: {
      mode: runMode,
      path: runPath,
      playing: runStatus?.playing ?? run?.playing ?? null
    },
    settings: {
      mainScene: settings?.mainScene ?? settings?.main_scene ?? null,
      mainSceneExists: settings?.mainSceneExists ?? settings?.main_scene_exists ?? null
    },
    runtime: {
      stateAvailable: Boolean(runtimeState),
      eventCount: countEvents(runtimeEvents),
      nodeCount: countNodes(runtimeState)
    },
    screenshot: {
      available,
      path: shot.path ?? shot.savePath ?? null,
      reason: available
        ? null
        : headless
          ? "headless_or_no_renderer"
          : shot.reason ?? shot.error ?? "unavailable"
    },
    environment: {
      displayServer: displayServer ?? null,
      interactive: interactive ?? null,
      headless
    },
    claims: {
      ran: true,
      playableObservation: Boolean(runtimeState) || countEvents(runtimeEvents) > 0,
      visualProof: available
    }
  };
}

function countEvents(events) {
  if (!events) return 0;
  if (Array.isArray(events)) return events.length;
  if (Array.isArray(events.events)) return events.events.length;
  return 0;
}

function countNodes(state) {
  if (!state) return 0;
  if (typeof state.nodeCount === "number") return state.nodeCount;
  if (state.tree) return 1;
  return 0;
}

function compactStep(step) {
  return {
    name: step.name,
    ok: step.ok,
    ...(step.ok ? {} : { error: step.error, errorCode: step.errorCode, recovery: step.recovery })
  };
}

function clampInt(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
