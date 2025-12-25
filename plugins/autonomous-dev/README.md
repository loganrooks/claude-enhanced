# Autonomous Development Plugin

A Claude Code plugin that provides autonomous development workflows with self-review gates and a closed-loop self-improvement system.

## Philosophy

**Thorough collaboration upfront, autonomous execution after.**

This plugin implements:
1. **Autonomous Development** (`/project:auto`) - Minimal human intervention after requirements are confirmed
2. **Self-Review Gates** - AI reviewers at each development phase catch issues early
3. **Self-Improvement Loop** - The system continuously improves itself based on errors and feedback

## Features

### Workflow Commands
| Command | Purpose |
|---------|---------|
| `/project:init` | Initialize the system for your project |
| `/project:auto <feature>` | Autonomous development with review gates |
| `/project:explore <topic>` | Read-only investigation |
| `/project:plan <feature>` | Create implementation plan |
| `/project:implement <feature>` | TDD implementation workflow |
| `/project:debug <error>` | Systematic debugging |
| `/project:refactor <code>` | Safe refactoring |
| `/project:release [version]` | Release preparation |
| `/project:document <target>` | Documentation generation |
| `/project:improve [trigger]` | Self-improvement cycle |
| `/project:diagnose <signal>` | Root cause analysis |
| `/project:analyze-logs [scope]` | Pattern analysis for self-improvement |
| `/project:resume` | Restore session context |
| `/project:checkpoint <note>` | Save session state |

### Review Agents
| Agent | Purpose |
|-------|---------|
| exploration-reviewer | Validates exploration completeness |
| plan-reviewer | Catches planning flaws |
| code-reviewer | Reviews for bugs, security, quality |
| documentation-reviewer | Ensures doc accuracy |
| experiment-reviewer | Validates spike conclusions |
| diagnostic-agent | Traces errors to root causes |
| improvement-reviewer | Validates system improvements |

## Installation

### Quick Install

Run the init command in your project:
```
/project:init
```

This will:
1. Explore your workspace to understand the project
2. Ask questions about vision, constraints, and workflows
3. Generate a customized CLAUDE.md
4. Set up commands, agents, and hooks
5. Initialize Serena memories
6. Run a health check

### Manual Install

1. Copy `templates/` contents to your project's `.claude/` directory
2. Customize `CLAUDE.template.md` → `CLAUDE.md` for your project
3. Run `/project:init validate` to verify setup

## How It Works

### Autonomous Development Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS DEVELOPMENT                             │
│                                                                       │
│   ┌─────────────┐                                                    │
│   │ PHASE 0     │  ◀── HUMAN-IN-LOOP                                │
│   │ Requirements│      Questions, clarification, approval            │
│   └──────┬──────┘                                                    │
│          │ approved                                                   │
│          ▼                                                            │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │                    AUTONOMOUS PHASES                          │   │
│   │                                                               │   │
│   │  Explore ──▶ Plan ──▶ Implement ──▶ Document                 │   │
│   │     │          │          │            │                      │   │
│   │  [REVIEW]   [REVIEW]   [REVIEW]    [REVIEW]                  │   │
│   │                                                               │   │
│   └──────────────────────────────────────────────────────────────┘   │
│          │                                                            │
│          ▼                                                            │
│   Tests + Lint + Final Validation → Commit → Report                  │
└──────────────────────────────────────────────────────────────────────┘
```

### Self-Improvement Loop

```
Error/Interruption/Friction
        │
        ▼
    EXPLORE ──▶ DIAGNOSE ──▶ PLAN ──▶ IMPLEMENT ──▶ REVIEW
        │                                              │
        └──────────────────────────────────────────────┘
                              │
                              ▼
              Better commands, agents, hooks, docs
```

## Enhanced Logging & Analysis

### Data Capture

The `session-logger` hook captures rich session data automatically:

| Data Type | Location | Purpose |
|-----------|----------|---------|
| Session metrics | `.claude/logs/sessions/` | Files, commits, errors per session |
| Signal files | `.claude/logs/signals/` | Issues auto-detected for improvement |
| Native logs | `~/.claude/projects/` | Full tool calls, tokens, conversations |

### Claude Agent SDK Integration

The plugin supports automated analysis via Claude Agent SDK:

```bash
# Headless analysis
claude-code --print "Run /project:analyze-logs week all"

# GitHub Actions integration for weekly analysis
# See docs/self-improvement-protocol.md
```

### Pattern Detection

Automatically detected and logged:
- Uncommitted changes at session end
- Lint errors
- TODO accumulation
- Large commits (may indicate missing incremental commits)
- Hotspot files (frequently changed)

## Configuration

### System Health Limits

The self-improvement system monitors these metrics:
- **CLAUDE.md**: < 500 lines (essential rules only)
- **Agents**: < 10 (avoid over-fragmentation)
- **Hooks**: < 10 (avoid slowdown)

### Customization Points

After initialization, customize:
- `CLAUDE.md` - Add project-specific rules and constraints
- `.claude/commands/` - Add project-specific commands
- `.claude/agents/` - Add project-specific reviewers
- Serena memories - Store project knowledge

## Requirements

- Claude Code CLI
- Serena MCP server (for memory persistence)

## Examples

See `examples/` for sample configurations:
- `python-project/` - Python/uv/pytest setup
- `typescript-project/` - TypeScript/npm setup

## License

MIT
