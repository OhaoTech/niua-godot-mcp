# niua-godot-forge skill

A portable [Agent Skill](https://agentskills.io/specification) that teaches an agent the safe workflow for driving a Godot 4.6 editor through the **NIUA Godot MCP** — the correct build/run order, profile guidance, error recovery, and a per-subsystem tool reference loaded on demand.

This skill is the *playbook*; it does not replace the MCP server. Install and connect the `niua-godot` MCP server first (see the repo `README.md`), then install this skill into your agent platform.

## Layout

```
niua-godot-forge/
  SKILL.md            # hand-written playbook (the tested part)
  reference/          # one auto-generated doc per subsystem (26 + INDEX.md)
  README.md
```

`reference/*.md` is generated from the MCP manifest — never edit by hand. Regenerate after any tool change:

```bash
npm run godot:mcp:docs   # regenerates docs/godot-mcp/tools.md AND reference/*.md
```

## Install

The skill is a plain folder with a `SKILL.md`. Install by copying (or symlinking) it into your platform's skills directory.

### Claude Code
```bash
# personal (all projects)
cp -r skills/niua-godot-forge ~/.claude/skills/
# or project-scoped (committed with a repo)
cp -r skills/niua-godot-forge <project>/.claude/skills/
```

### Codex
```bash
cp -r skills/niua-godot-forge ~/.agents/skills/
```

### Other Agent Skills-compatible platforms (e.g. Gemini CLI)
Copy `niua-godot-forge/` into that platform's skills directory. The `SKILL.md`
frontmatter (`name` + `description`) is the cross-platform standard; the agent
loads `SKILL.md` on a matching task and reads `reference/*.md` only when a
specific subsystem is needed.

Tip: symlink instead of copy (`ln -s "$PWD/skills/niua-godot-forge" ~/.claude/skills/niua-godot-forge`) so regenerated reference docs stay current automatically.

## Verify
Ask the agent to "add a cube to my scene and run it." It should create/save the
scene to a `res://` path before running, and never trigger a blocking editor
dialog.
