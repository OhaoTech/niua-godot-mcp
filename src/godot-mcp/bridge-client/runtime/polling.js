export const DEFAULT_RUNTIME_POLL_INTERVAL_MSEC = 100;
export const DEFAULT_RUNTIME_TIMEOUT_MSEC = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollRuntimeResult(
  initialResult,
  pollNext,
  {
    requestId = initialResult?.data?.requestId,
    timeoutMsec = DEFAULT_RUNTIME_TIMEOUT_MSEC,
    pollIntervalMsec = DEFAULT_RUNTIME_POLL_INTERVAL_MSEC
  } = {}
) {
  let latest = initialResult;
  const deadline = Date.now() + Number(timeoutMsec);

  while (latest.data?.pending && requestId && Date.now() < deadline) {
    await sleep(Number(pollIntervalMsec));
    latest = await pollNext(requestId);
  }

  return latest;
}
