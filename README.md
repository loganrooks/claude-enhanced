# Claude Enhanced

Autonomous development system for Claude Code with self-review gates and continuous improvement.

## Quick Start

```bash
# Copy template to your project
cp -r .claude-template /your/project/

# Rename to .claude
mv /your/project/.claude-template /your/project/.claude

# In Claude Code, run init
/project:init
```

## What You Get

After init, your project has:

- **Autonomous workflows** - `/project:auto` runs full dev cycles with minimal intervention
- **Smart commands** - Generated for your stack (test, lint, build commands detected)
- **Self-review gates** - AI reviewers catch issues at each phase
- **Feedback capture** - `/project:signal` learns from corrections
- **Session continuity** - Checkpoint/resume across sessions via Serena

## Requirements

- Claude Code CLI
- Serena MCP server (project memory)
- Sequential-Thinking MCP (recommended)

## Structure

```
.claude-template/     # Copy this to projects
├── commands/         # Static commands (signal, checkpoint, resume)
├── guides/           # Principles for generating project-specific artifacts
├── init-agents/      # 9 gatherer agents for codebase analysis
└── templates/        # CLAUDE.md and settings.json templates

docs/                 # Documentation
claudedocs/           # Design documents and plans
```

## How Init Works

1. **Prerequisites** - Checks MCP servers
2. **Exploration** - 9 parallel agents analyze your codebase
3. **Synthesis** - Opus evaluates findings, scores health
4. **Conversation** - Asks about preferences and conflicts
5. **Generation** - Creates commands, agents, CLAUDE.md for your project
6. **Validation** - Verifies everything works

## Commands

| Command | Purpose |
|---------|---------|
| `/project:init` | Initialize (run once) |
| `/project:auto <task>` | Autonomous development |
| `/project:plan <task>` | Create implementation plan |
| `/project:signal` | Capture feedback/correction |
| `/project:checkpoint` | Save session state |
| `/project:resume` | Restore session |

## License

MIT
