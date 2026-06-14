import { splitBridgeArgs } from "../../server/context.js";
import { normalizeBoundedInteger } from "../../shared/numbers.js";
import {
  selectedProcessLogEntries,
  serializeProjectProcessLogs
} from "../../services/process-manager.js";

export async function getGodotOutputLogs(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  const includeBridge = payload.includeBridge !== false;
  const includeProcess = payload.includeProcess !== false;
  const maxLines = normalizeBoundedInteger(payload.maxLines, {
    fallback: 100,
    min: 1,
    max: 1000
  });

  let bridgeLogs = [];
  let runtimeEvents = [];
  const bridge = {
    included: includeBridge,
    available: false,
    host: client.host,
    port: client.port,
    error: null
  };
  const runtime = {
    included: includeBridge,
    available: false,
    host: client.host,
    port: client.port,
    error: null
  };

  if (includeBridge) {
    try {
      const bridgeResponse = await client.getLogs();
      bridge.available = true;
      bridgeLogs = Array.isArray(bridgeResponse?.data?.logs)
        ? bridgeResponse.data.logs.slice(-maxLines)
        : [];
    } catch (error) {
      bridge.error = error.message;
      if (!includeProcess) {
        throw error;
      }
    }

    try {
      const runtimeResponse = await client.getRuntimeEvents({
        limit: maxLines,
        kinds: ["runtime_log"]
      });
      runtime.available = true;
      runtimeEvents = Array.isArray(runtimeResponse?.data?.events)
        ? runtimeResponse.data.events.slice(-maxLines)
        : [];
    } catch (error) {
      runtime.error = error.message;
    }
  }

  const processLogs = includeProcess
    ? selectedProcessLogEntries(payload).map((entry) => serializeProjectProcessLogs(entry, maxLines))
    : [];

  return {
    ok: true,
    data: {
      logs: bridgeLogs,
      bridge,
      runtime,
      runtimeEvents,
      runtimeLogs: runtimeEvents.map(formatRuntimeLogEvent),
      processLogs,
      stdout: flattenProcessLogStream(processLogs, "stdout"),
      stderr: flattenProcessLogStream(processLogs, "stderr")
    }
  };
}

function flattenProcessLogStream(processLogs, stream) {
  return processLogs.flatMap((entry) => entry[stream]);
}

function formatRuntimeLogEvent(event) {
  const level = String(event?.level ?? "info");
  const message = String(event?.message ?? "");
  return `${level.toUpperCase()}: ${message}`;
}
