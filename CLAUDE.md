# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude-enhanced is an autonomous development system for Claude Code. It provides a `.claude-template` that can be copied to any project to enable:

- **Autonomous workflows** with self-review gates
- **Session continuity** via Serena MCP project memory
- **Feedback capture** that routes improvements upstream

## Architecture

### Two-Level System

```
Level 1: claude-enhanced (The Generator)
├── guides/           # Principles for generating artifacts
├── init-agents/      # 9 gatherer agents for codebase analysis
├── templates/        # CLAUDE.md and settings.json templates
└── commands/         # Static commands (signal, checkpoint, resume)

         ↓ generates

Level 2: Project Ecosystem (The Generated)
├── CLAUDE.md         # Project-specific rules and commands
├── .claude/commands/ # Project-tailored workflows
├── .claude/agents/   # Project-tailored reviewers
└── Serena memories   # Persistent project knowledge
```

### Key Design Decisions

**Gatherers vs Analysts**: Exploration agents (Sonnet) collect raw data without making judgments. Opus synthesizes findings and makes decisions. This enables parallel gathering with centralized thinking.

**Guides, Not Templates**: Guides encode principles that Opus applies to generate project-specific artifacts. Placeholders are avoided; artifacts are right-sized for each project.

**Feedback Routing**: Signals are classified as Level 1 (systemic, improves generator) or Level 2 (project-specific). Level 1 patterns flow upstream to improve future projects.

## Directory Structure

```
.claude-template/           # Copy this to target projects as .claude/
├── commands/
│   ├── init.md             # 6-phase initialization orchestrator
│   ├── signal.md           # Feedback capture
│   ├── checkpoint.md       # Session state save
│   └── resume.md           # Session restore
├── guides/                 # 17 best-practice guides
│   ├── autonomous-workflow.md
│   ├── command-structure.md
│   ├── agent-structure.md
│   └── ... (planning, tdd, debugging, etc.)
├── init-agents/            # 9 exploration agents
│   ├── env-analyzer.md
│   ├── project-identity.md
│   ├── architecture-analyzer.md
│   └── ... (6 more)
├── templates/
│   ├── CLAUDE.template.md
│   └── settings.template.json
└── signals/, reviews/      # Storage directories

docs/                       # Reference documentation
claudedocs/                 # Design documents and plans
```

## Init System

The init command (`/project:init`) orchestrates project setup:

| Phase | Description |
|-------|-------------|
| 0. Prerequisites | Check MCP servers (Serena, Sequential-Thinking) |
| 1. Exploration | 9 parallel gatherer agents analyze codebase |
| 2. Synthesis | Opus evaluates findings, scores health |
| 3. Conversation | Ask about preferences, resolve conflicts |
| 4. Generation | Create CLAUDE.md, commands, agents, memories |
| 5. Validation | Verify commands work, no placeholders |
| 6. Report | Summary and next steps |

**Init modes**: `full` (default), `minimal` (quick), `validate` (health check), `reset` (clear and reinit)

## Requirements

- Claude Code CLI
- Serena MCP server (project memory, semantic understanding)
- Sequential-Thinking MCP server (recommended for complex analysis)

## Working on This Codebase

### Adding a New Guide

1. Create in `.claude-template/guides/`
2. Follow structure: Purpose → Principles → Process → Quality Criteria → Anti-patterns → Adaptation Notes
3. Guides inform generation, they are not templates to copy

### Adding an Exploration Agent

1. Create in `.claude-template/init-agents/`
2. Agent is a **gatherer** - collects data, doesn't judge
3. Return structured findings: `## Findings`, `## Concerns`, `## Uncertainties`
4. Opus performs synthesis across all agents

### Modifying Init Command

The init command is large (~500 lines) because it orchestrates all phases. Changes should:
- Maintain the gatherer/analyst separation
- Keep agent prompts focused on data collection
- Ensure Opus does all judgment and synthesis

### Testing Changes

After modifying the template, test on a fresh project:
```bash
cp -r .claude-template /path/to/test-project/.claude
cd /path/to/test-project
# Run /project:init
```

## Related Documentation

- `claudedocs/INIT_SYSTEM_ARCHITECTURE.md` - Detailed architecture rationale
- `claudedocs/INIT_SYSTEM_REDESIGN_PLAN.md` - Tactical decisions
- `claudedocs/FEEDBACK_ROUTING_ARCHITECTURE.md` - Signal routing design
