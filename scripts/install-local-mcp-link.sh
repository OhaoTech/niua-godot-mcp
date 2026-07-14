#!/usr/bin/env bash
# Point ~/.local/bin/niua-godot-mcp at THIS public checkout (not a stale lab embed).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN_DIR="${HOME}/.local/bin"
mkdir -p "$BIN_DIR"
ln -sfn "$ROOT/src/godot-mcp/cli.js" "$BIN_DIR/niua-godot-mcp"
chmod +x "$ROOT/src/godot-mcp/cli.js"
echo "Linked: $BIN_DIR/niua-godot-mcp -> $ROOT/src/godot-mcp/cli.js"
echo "Restart your MCP client (Codex/Claude/Cursor) so it reloads the server."
echo "Allowlist should include your game folder, e.g. GODOT_MCP_ALLOWED_PROJECT_ROOTS=/home/you/Desktop/lab/game"
