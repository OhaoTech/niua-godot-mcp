export function diagnosticCheck({
  code,
  ok,
  severity,
  message,
  path: checkPath = null,
  data = {}
}) {
  return {
    code,
    ok: Boolean(ok),
    severity,
    message,
    path: checkPath,
    data
  };
}
