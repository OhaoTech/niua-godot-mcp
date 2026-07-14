// src/godot-mcp/sdk/summary.js
// One compact line-block per runner. Intermediates never go here — only counts,
// failures, and explicitly-chosen notes reach stdout (and thus model context).
export function summarize(label, { ok = 0, fail = [], notes = [] } = {}) {
  const lines = [`[${label}] ok=${ok} fail=${fail.length}`];
  for (const f of fail) lines.push(`  FAIL ${f}`);
  for (const n of notes) lines.push(`  · ${n}`);
  return lines.join("\n");
}

export function printSummary(label, parts) {
  // eslint-disable-next-line no-console
  console.log(summarize(label, parts));
}
