# NIUA Godot MCP Compatibility

## Supported Matrix

- Node.js: `>=20`
- Godot: `4.6.x`
- Primary CI platform: Linux with the official Godot `4.6.2-stable` x86_64 build
- Cross-platform minimum: macOS and Windows run path-handling unit coverage without a Godot GUI

Godot `4.5.x` and `4.7.x` are best-effort. Other versions are reported as
untested through the bridge health response so agents can diagnose version
drift before a deep editor operation fails.

## Deterministic Installs

CI uses `npm ci --ignore-scripts` against the committed `package-lock.json`.
The package intentionally has no `postinstall` lifecycle script.

## CI Gates

- Every push runs the Linux unit suite with Node 20.
- Every push and pull request runs macOS and Windows path-handling unit tests.
- Every pull request runs `npm run conformance -- --slice full` against a real
  headless Godot editor launched from the official pinned Godot build.
