export async function pollBridgeHealth({
  host,
  port,
  timeoutMs,
  token = null
}) {
  const url = `http://${host}:${port}/health`;
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const remainingMs = Math.max(1, timeoutMs - (Date.now() - startedAt));
      const response = await fetchWithTimeout(url, Math.min(1000, remainingMs), { token });
      if (response.ok) {
        return {
          host,
          port,
          tokenConfigured: Boolean(token),
          available: true,
          status: response.status,
          error: null
        };
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }

    await sleep(100);
  }

  return {
    host,
    port,
    tokenConfigured: Boolean(token),
    available: false,
    status: null,
    error: lastError ?? "bridge health check timed out"
  };
}

export async function fetchWithTimeout(url, timeoutMs, { token = null } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {};
  if (token) {
    headers["x-niua-mcp-token"] = token;
  }

  try {
    return await fetch(url, {
      headers,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
