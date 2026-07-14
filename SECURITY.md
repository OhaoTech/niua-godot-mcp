# Security Policy

## Trust Model

The NIUA Godot MCP bridge is a local development tool. It lets an MCP
client write files, create scenes, attach scripts, run the game, and inspect
the Godot editor through a bridge bound to `127.0.0.1`.

Treat any agent or MCP client with access to this bridge as trusted to edit
the current Godot project. The bridge does not sandbox generated GDScript and
does not try to decide whether game code is safe. `create_script`,
`write_script`, and `attach_script` intentionally allow arbitrary GDScript so
an agent can build gameplay.

## Local Bridge Authentication

**Users do not configure tokens.** On the happy path, `open_project` generates a
per-session secret, starts Godot with it, and writes a project-local session
file at `<project>/.godot/niua_mcp_bridge.json` (mode 0600 when the OS allows).
The MCP client and JS SDK resolve auth automatically from that file or the
server's in-memory process table.

The Godot bridge only accepts requests that present the matching
`X-NIUA-MCP-Token` header when a token was configured for that editor process.
If the editor was started with an empty token (advanced/manual), the bridge
accepts localhost requests without a header.

### Advanced: manual editor + tools

Only needed if you launch Godot yourself and still want a locked bridge:

```bash
export NIUA_MCP_TOKEN="$(openssl rand -base64 32 | tr '+/' '-_' | tr -d '=')"
export GODOT_MCP_TOKEN="$NIUA_MCP_TOKEN"
godot --path /path/to/project --editor
```

Prefer `open_project` so session handoff stays automatic.

If a bridge cannot be reached, run `diagnose_project_setup` with
`checkBridge=true` and verify the project is open with the NIUA addon enabled.

## Filesystem Protections

Bridge write operations only accept `res://` paths. They reject traversal,
absolute paths, writes into `res://.godot/`, writes into
`res://addons/niua_mcp/`, and paths that cross a symbolic link.

These checks prevent accidental writes outside the project and prevent the
agent from overwriting the bridge addon while it is running.

## Payload Limits

HTTP bridge requests and file-write tools enforce a payload size limit. The
default is 64 MiB. To raise or lower it for a trusted local workflow, set
`NIUA_MCP_MAX_PAYLOAD_BYTES` or `GODOT_MCP_MAX_PAYLOAD_BYTES` before launching
the editor.

Oversized requests fail with a clear error that names the limit and asks the
agent to reduce the file size or raise the limit intentionally.

## Not In Scope

This bridge does not defend against a malicious trusted agent, malicious
GDScript authored by that agent, compromised local user accounts, or arbitrary
processes that can read the token from the same user environment.

## Reporting a Vulnerability

Report security issues privately to team@ohao.tech. Please do not open a
public issue for security-sensitive reports.
