# describe tools

Generated from the manifest-backed tool catalog. Do not edit by hand; run `npm run godot:mcp:docs`.

- Tools: 1 (1 in v1, 0 full-only)
- Argument names with `*` are required.

| Tool | Profiles | Description | Arguments |
| --- | --- | --- | --- |
| `describe_tools` | v1, full | Navigate the full tool catalog without paying for a flat listing. No args returns the root map of domains; { domain } lists that domain's tools with tier and summary; { name } returns one tool's full description and input schema. Always describes the whole catalog, even for tools hidden by the active profile. | domain:string, name:string |
