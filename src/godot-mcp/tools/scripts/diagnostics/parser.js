export function parseGodotScriptDiagnostics(output) {
  const diagnostics = [];
  let pending = null;

  for (const line of output.split(/\r?\n/)) {
    const scriptMessage = /^SCRIPT (ERROR|WARNING):\s*(.+)$/.exec(line.trim());
    if (scriptMessage) {
      pending = {
        severity: scriptMessage[1].toLowerCase(),
        message: scriptMessage[2],
        source: null,
        path: null,
        line: null,
        column: null,
        raw: [line]
      };
      diagnostics.push(pending);
      continue;
    }

    const location = /^\s*at:\s*(.*?)\s+\((res:\/\/.*?)(?::(\d+))?(?::(\d+))?\)\s*$/.exec(line);
    if (location && pending) {
      pending.source = location[1];
      pending.path = location[2];
      pending.line = location[3] ? Number(location[3]) : null;
      pending.column = location[4] ? Number(location[4]) : null;
      pending.raw.push(line);
      pending = null;
      continue;
    }

    if (pending && line.trim()) {
      pending.raw.push(line);
    }
  }

  return diagnostics;
}
