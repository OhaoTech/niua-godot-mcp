# NIUA Godot MCP Compatibility

## Supported Matrix

- Node.js: `>=20`
- Godot: `4.6.x`
- Operating systems: Linux, macOS, and Windows
- Primary development target: Linux with the official Godot `4.6.x` x86_64 build

Godot `4.5.x` and `4.7.x` are best-effort. Other versions are reported as untested through the bridge health response so agents can diagnose version drift before a deep editor operation fails.

## Install Shape

This repository currently has no external npm dependencies and does not include a `package-lock.json`.

For a source checkout:

```bash
npm test
node src/godot-mcp/cli.js setup --client codex --project-root "$HOME/Godot/NIUAProjects"
```

For a global command from a checkout:

```bash
npm install -g .
niua-godot-mcp setup --client codex --project-root "$HOME/Godot/NIUAProjects" --write
```

If dependencies are added later, commit a lockfile and switch automation to `npm ci --ignore-scripts`.

## Local Gates

Run these before shipping docs or tool changes:

```bash
npm test
npm run godot:mcp:docs
```

`npm test` runs the Node unit suite. `npm run godot:mcp:docs` regenerates the generated tool catalog and skill reference docs.

This checkout does not include `.github` workflow files. If CI is added, it should run at least:

- Node 20 unit tests on Linux
- Path-handling tests on macOS and Windows
- A real Godot 4.6.x conformance run for editor bridge behavior

## Runtime Notes

- `capture_runtime_screenshot`, `capture_editor_screenshot`, and `capture_viewport_screenshot` can return `available:false` in headless or display-less environments.
- The default MCP tool profile is `v1`; specialized subsystem tools require `NIUA_MCP_PROFILE=full`.
- Project-management operations are restricted by `GODOT_MCP_ALLOWED_PROJECT_ROOTS`.
