# Init System Redesign Plan

**Date**: 2026-01-08
**Status**: Planning Complete, Ready for Implementation
**Companion**: `INIT_SYSTEM_ARCHITECTURE.md` - Strategic architecture and design philosophy

---

## Executive Summary

Redesign the autonomous development plugin's initialization system to be:
1. Environment-aware (user + system + project)
2. Adaptive and self-modifying
3. Token-efficient (self-deleting after use)
4. Comprehensive yet modular (9 specialized exploration agents)

---

## Key Design Decisions & Reasoning

### Decision 1: Init as Command, Not Agent

**Decision**: Keep init.md as a command that orchestrates agents, not an agent itself.

**Reasoning**:
- Agents cannot spawn other agents (Task tool limitation documented in subagents guide)
- Init needs to spawn 9 exploration agents for comprehensive analysis
- Commands execute in the main session context, which CAN spawn agents
- The command can self-delete after completion to save future context tokens

**Trade-off**: Commands load into context at session start, but self-deletion mitigates this.

---

### Decision 2: Self-Deleting Command

**Decision**: Init command optionally deletes itself after successful initialization.

**Reasoning**:
- Init is large (will be comprehensive) but only runs once per project
- After initialization, it's just wasting context tokens every session
- User can re-run by copying from template or re-downloading plugin
- Provides option, not forced deletion

---

### Decision 3: 9 Specialized Exploration Agents

**Decision**: Use 9 focused agents rather than fewer comprehensive ones.

**Reasoning**:
- Each agent has limited context window - can't read entire codebase effectively
- Splitting by file sets ensures bounded workload per agent
- More agents = more parallelism = faster initialization
- Focused agents = better quality analysis (single responsibility)
- Sonnet-level agents can evaluate and make recommendations, not just gather facts

**The 9 Agents**:

| Agent | Scope | Key Files | Purpose |
|-------|-------|-----------|---------|
| env-analyzer | ~/.claude/, .claude/, MCP | 30-60 files | Understand development environment |
| project-identity | configs, README, structure | 15-30 files | What IS this project (facts) |
| workflow-analyzer | CI/CD, git, conventions | 10-20 files | How is this developed |
| architecture-analyzer | modules, boundaries, patterns | sampled | System design evaluation |
| code-quality | source code, linters | sampled + tools | Implementation quality |
| security-analyzer | auth, secrets, deps | sampled + tools | Security posture |
| test-analyzer | tests/, coverage | test dirs | Test health |
| docs-analyzer | docs/, README, ADRs | docs dirs | Documentation + alignment |
| workspace-hygiene | everything | broad scan | Clutter, dead code, organization |

---

### Decision 4: Agents Report IS, OUGHT, and MISSING

**Decision**: Each agent reports not just what exists, but what should exist and what's missing.

**Reasoning**:
- Descriptive-only reports don't enable transformation decisions
- Init needs prescriptive insights to generate appropriate config
- "You have no ADRs" is less useful than "You SHOULD have ADRs for decision X, Y, Z"
- Enables gap analysis and improvement roadmap generation

---

### Decision 5: Sonnet Agents with Opus Orchestration

**Decision**: Exploration agents are Sonnet, orchestrated by Opus main session.

**Reasoning**:
- Sonnet is capable of evaluation and recommendations (not just fact-gathering)
- Sonnet should be self-reflective: flag when something needs Opus-level judgment
- Opus crafts comprehensive, customized prompts for each agent based on detected project type
- Opus does final synthesis, conflict resolution, and user conversations
- Cost-effective: Sonnet for parallel exploration, Opus for orchestration

---

### Decision 6: Dynamic Agent Instructions Based on Project Type

**Decision**: Opus first detects project type, then crafts customized prompts for agents.

**Reasoning**:
- Different projects have different tools (pytest vs jest, ruff vs eslint)
- Security scanning differs (pip-audit vs npm audit vs cargo audit)
- Generic prompts would miss project-specific opportunities
- Opus reads key config files first, then includes relevant tools/patterns in agent prompts

**Flow**:
1. Opus quick-detects project type (read package.json/pyproject.toml/Cargo.toml)
2. Opus spawns all 9 agents with customized prompts
3. Agents run in parallel
4. Opus collects reports, synthesizes, generates config

---

### Decision 7: MCP Servers as Prerequisites

**Decision**: Serena and Sequential-Thinking MCP servers are REQUIRED, not optional.

**Reasoning**:
- Serena provides project memory - core to the self-improving system
- Sequential-Thinking enables complex analysis
- Without these, the system is significantly degraded
- Init should check availability and guide installation if missing

**Implementation**:
- Phase 0 of init checks MCP availability
- If missing, provide installation guidance
- Can configure at project level in generated settings.json

---

### Decision 8: Environment Analysis Includes Evaluation

**Decision**: env-analyzer doesn't just detect user agents - it evaluates their quality.

**Reasoning**:
- User might have outdated or poorly-written agents
- "Leverage existing" shouldn't be automatic
- Need conversation with user: "Your security-engineer agent is outdated, should we use it, improve it, or replace it?"
- Enables informed decisions about what to leverage vs replace

---

### Decision 9: Architecture Separate from Code Quality

**Decision**: Split architecture-analyzer and code-quality into separate agents.

**Reasoning**:
- Architecture = MACRO (module boundaries, dependencies, system design)
- Code quality = MICRO (implementation, complexity, smells)
- Different expertise, different analysis lens
- Can have "good architecture, poor implementation" or vice versa
- Clearer separation of concerns in reports

---

### Decision 10: Docs-Analyzer Includes Alignment Checking

**Decision**: docs-analyzer checks not just completeness but accuracy (do docs match code).

**Reasoning**:
- Inaccurate docs are worse than no docs
- ADRs that aren't followed are misleading
- Roadmap that doesn't match work is confusing
- Design-implementation gap detection is critical
- Folding into docs-analyzer (vs separate agent) keeps it focused on "documentation health"

---

### Decision 11: Workspace-Hygiene as Dedicated Agent

**Decision**: Dedicated agent for clutter, organization, dead code.

**Reasoning**:
- "Miscellaneous" issues don't fit other categories
- Dead files, unused deps, inconsistent naming affect developer experience
- Build artifacts checked in, random files in root - need detection
- General project hygiene is a distinct concern

---

## Implementation Structure

### Files to Create

```
plugins/autonomous-dev/
├── templates/
│   ├── commands/
│   │   └── init.md                    # Enhanced init command (self-deleting)
│   ├── agents/
│   │   ├── env-analyzer.md
│   │   ├── project-identity.md
│   │   ├── workflow-analyzer.md
│   │   ├── architecture-analyzer.md
│   │   ├── code-quality.md
│   │   ├── security-analyzer.md
│   │   ├── test-analyzer.md
│   │   ├── docs-analyzer.md
│   │   └── workspace-hygiene.md
│   └── docs/
│       └── INIT_REFERENCE.md          # Templates, prompts, examples
```

### Init Command Phases

```
Phase 0: PREREQUISITES
├── Check Serena MCP available
├── Check Sequential-Thinking MCP available
├── If missing: guide installation, block until resolved
└── Quick project type detection

Phase 1: EXPLORATION (parallel)
├── Spawn all 9 agents with customized prompts
├── Agents run in parallel
└── Collect all reports

Phase 2: SYNTHESIS
├── Opus reviews all reports
├── Identifies conflicts (user setup vs project needs)
├── Identifies leverage opportunities
├── Identifies gaps and priorities
└── Prepares decision points for user

Phase 3: CONVERSATION
├── Present findings to user
├── Ask about conflicts: "Use yours, use ours, or replace?"
├── Ask about preferences: autonomy level, workflow style
├── Confirm priorities from assessment
└── Document decisions

Phase 4: GENERATION
├── Generate CLAUDE.md (project-specific, no placeholders)
├── Generate settings.json (permissions based on stack)
├── Copy/adapt commands (customized for detected stack)
├── Copy/adapt agents (skip if user has equivalent)
├── Initialize Serena memories
└── Generate improvement_roadmap from assessment

Phase 5: VALIDATION
├── Run detected test command
├── Run detected lint command
├── Verify file structure
├── Verify Serena memories created
└── Report any issues

Phase 6: CLEANUP & REPORT
├── Summary of what was generated
├── Next steps for user
├── Offer to delete init.md
└── If accepted: remove init.md from .claude/commands/
```

---

## Agent Prompt Structure

Each agent should follow this structure:

```markdown
---
name: [agent-name]
description: [when to invoke - for auto-delegation]
tools: Read, Glob, Grep, Bash
model: sonnet
---

# [Agent Name]

## Your Role
[Clear statement of what this agent does]

## Scope
[What files/directories to analyze]
[What's in scope vs out of scope]

## Analysis Framework
[Specific things to look for]
[How to evaluate, not just describe]

## Report Format

### What IS (Current State)
[Factual findings]

### What SHOULD BE (Recommendations)
[Prescriptive insights]

### What's MISSING (Gaps)
[Things that should exist but don't]

### Confidence & Uncertainties
[What you're confident about]
[What needs Opus-level review]

## Tools Available
[Which tools to use and how]
[Project-specific tools if applicable]
```

---

## Files to Reference

### Existing (to learn from)
- `/home/rookslog/workspace/projects/scholardoc/.claude/commands/init.md` - Current init command
- `/home/rookslog/workspace/projects/scholardoc/docs/INIT_TEMPLATES.md` - Template reference
- `/home/rookslog/workspace/projects/scholardoc/.claude/agents/*.md` - Current agents
- `/home/rookslog/workspace/projects/claude-enhanced/docs/subagents-orchestration-guide-2025-12-11.md` - Agent best practices

### User Environment
- `~/.claude/CLAUDE.md` - User's global config (currently balanced mode)
- `~/.claude/agents/` - User's global agents (11 active)
- `~/.claude/agents.disabled/` - Archived conflicting agents
- `~/.claude/settings.json` - Global permissions

---

## Open Questions for Implementation

1. **MCP Installation**: How exactly are Serena and Sequential-Thinking installed? Need to research and document.

2. **Self-Deletion Mechanism**: How does a command delete itself? Probably `rm .claude/commands/init.md` at the end.

3. **Template Source**: Where do templates come from during init? Plugin directory? Downloaded fresh?

4. **Diary System**: Still to be designed - how does the reflection/learning system work?

---

## Next Steps

1. Research MCP installation process
2. Draft init.md command with all phases
3. Draft each of the 9 agents
4. Create INIT_REFERENCE.md with templates
5. Test on a fresh project
6. Add diary/reflection system
7. Archive old src/, claudedocs/
8. Update README for plugin distribution
