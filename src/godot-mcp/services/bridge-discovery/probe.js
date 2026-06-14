import { fetchWithTimeout } from "../process-manager.js";

export async function probeEditorBridge({
  host,
  port,
  timeoutMs,
  token = process.env.GODOT_MCP_TOKEN ?? process.env.NIUA_MCP_TOKEN ?? null
}) {
  try {
    const health = await fetchJsonFromBridge({
      host,
      port,
      path: "/health",
      timeoutMs,
      token
    });

    if (health?.ok !== true || typeof health?.data?.status !== "string") {
      throw new Error("not a NIUA Godot bridge");
    }

    let project = null;
    let projectError = null;
    try {
      const projectInfo = await fetchJsonFromBridge({
        host,
        port,
        path: "/project/info",
        timeoutMs,
        token
      });
      project = projectInfo?.data ?? null;
    } catch (error) {
      projectError = error.message;
    }

    return {
      available: true,
      host,
      port,
      health: health.data,
      project,
      projectError
    };
  } catch (error) {
    return {
      available: false,
      host,
      port,
      error: error.message
    };
  }
}

export async function fetchJsonFromBridge({
  host,
  port,
  path: bridgePath,
  timeoutMs,
  token = null
}) {
  const response = await fetchWithTimeout(`http://${host}:${port}${bridgePath}`, timeoutMs, { token });
  const text = await response.text();
  let payload;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`invalid JSON from ${bridgePath}: ${error.message}`);
  }

  if (!response.ok) {
    const message = payload?.error ?? payload?.message ?? response.statusText;
    throw new Error(`HTTP ${response.status}: ${message}`);
  }

  return payload;
}
