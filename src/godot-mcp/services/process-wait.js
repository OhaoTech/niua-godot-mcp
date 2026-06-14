export async function waitForChildSpawn(child, timeoutMs) {
  if (child.pid) {
    return;
  }

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, timeoutMs);
    child.once("spawn", () => {
      clearTimeout(timeout);
      resolve();
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

export async function waitForProjectExit(entry, timeoutMs) {
  if (entry.status !== "running") {
    return true;
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), timeoutMs);
    entry.child.once("exit", () => {
      clearTimeout(timeout);
      resolve(true);
    });
  });
}
