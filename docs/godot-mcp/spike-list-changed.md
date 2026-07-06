# Spike: `tools/list_changed` client compatibility (0.1.6 de-risk)

Date: 2026-07-06. Timeboxed research for the 0.1.6 session-adaptive exposure bet.
Question: if the server changes its tool list mid-session and sends
`notifications/tools/list_changed`, do real clients re-fetch and expose the new tools?

## Findings by client

| Client | Mid-session `list_changed` | Evidence |
|---|---|---|
| Claude Code | **Partial** — support added in 2.1.0, but multiple open spec-compliance reports (no-op handler, gaps) | issues #13646, #31893, #50339; docs claim auto-refresh |
| Cursor (editor + CLI) | **No** — notification ignored; new tools invisible until a new session; open feature request (2026) | forum #161459; CLI also had a first-30-tools pagination bug |
| Claude Desktop | **No** — ignored until full app restart | issue #50339 |
| Codex CLI | **Weak/unknown** — has open `tools/list` pagination non-compliance, `list_changed` support not evidenced | issue #28858 |
| GitHub Copilot | **Yes** (reported) | docs/search reports |

Supporting anecdote from our own dogfooding: two mid-development server upgrades in one day
each required a manual `/mcp` reconnect to surface new tools in Claude Code — a live
`list_changed` sender would have needed testing anyway, but the operational pain is real.

## Conclusion for 0.1.6

**Do not bet session-adaptive exposure on `list_changed` alone.** Two of the three most
important clients ignore it mid-session.

The design that works everywhere is a **two-lane architecture**:

1. **Dynamic lane** (clients that honor `list_changed`): the server starts at `core`,
   promotes domains into the live surface as the session touches them, announcing via
   `list_changed`. Declare `capabilities.tools.listChanged: true` and send the
   notification — it is free where honored and harmless where ignored.
2. **Universal fallback lane (already shipped)**: the `compact` profile's action-routed
   domain tools + `describe_tools` navigation. Routers accept new actions without any
   schema change, so the *effective* surface is adaptive even on clients with a frozen
   tool list. This is the load-bearing lane; the dynamic lane is progressive enhancement.

Implementation note: a live conformance case for the dynamic lane needs a client-side
harness that speaks MCP and asserts a re-fetched `tools/list` after the notification —
our own harness can play that client, so lane 1 is testable without any third-party app.

## Sources

- [Claude Code issue #13646 — tool list not refreshed on list_changed](https://github.com/anthropics/claude-code/issues/13646)
- [Claude Code issue #31893 — MCP spec compliance gaps](https://github.com/anthropics/claude-code/issues/31893)
- [Claude Code issue #50339 — Claude Desktop ignores list_changed](https://github.com/anthropics/claude-code/issues/50339)
- [Cursor forum #161459 — list_changed not acted on mid-session](https://forum.cursor.com/t/mcp-notifications-tools-list-changed-not-acted-on-mid-session/161459)
- [Codex issue #28858 — tools/list pagination non-compliance](https://github.com/openai/codex/issues/28858)
- [Claude Code MCP docs](https://code.claude.com/docs/en/mcp)
