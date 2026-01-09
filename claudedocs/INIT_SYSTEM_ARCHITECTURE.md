# Init System Architecture

**Date**: 2026-01-08
**Companion to**: `INIT_SYSTEM_REDESIGN_PLAN.md`
**Status**: Architecture Defined, Implementation In Progress

---

## Overview

This document captures the architectural thinking and design philosophy behind the autonomous-dev initialization system. It complements the tactical decisions in `INIT_SYSTEM_REDESIGN_PLAN.md` with strategic reasoning.

---

## Core Insight: Two-Level Improvement System

The autonomous-dev system operates at two interrelated levels:

```
LEVEL 1: claude-enhanced (The Generator)
│
│   Contains: guides/, init logic, exploration agents
│   Purpose: Generate project ecosystems
│
│   generates →
↓
LEVEL 2: Project Ecosystem (The Generated)
│
│   Contains: CLAUDE.md, .claude/commands/, agents/, hooks/
│   Purpose: Support development in specific project
│
│   used during development →
↓
Feedback Signals
│
├──→ Level 2 fixes (project-specific adjustments)
│
└──→ Level 1 fixes (improve what gets generated)
```

### Why This Matters

**Without Level 1 awareness**: Every project reinvents fixes. Same issues recur across projects. No systemic learning.

**With Level 1 awareness**: Patterns of fixes flow upstream. Generator improves. Future projects start better.

### Routing Decisions

| Signal Pattern | Route To | Example |
|----------------|----------|---------|
| Unique to this project's context | Level 2 | "Add scholardoc-specific lint rule" |
| Would occur in other projects too | Level 1 | "Plan command always needs risk section" |
| Same fix needed across projects | Level 1 | "Exploration consistently misses X" |

---

## Design Philosophy

### Hermeneutic, Not Foundational

The system is cyclical, not linear:
- Guides inform generation
- Generation reveals gaps in guides
- Feedback improves both
- Understanding parts through whole, whole through parts

**Implication**: Don't treat any component as "done." Expect iteration. Design for revision.

### Gatherers and Analysts

**Exploration agents (Sonnet)**: Gather information, flag concerns, return structured data.

**Opus (main session)**: Analyze, synthesize, judge, decide, recommend.

**Reasoning**:
- Sonnet is good at following instructions, collecting, pattern-matching
- Opus is better at judgment, synthesis, handling ambiguity
- Clear separation enables parallel gathering with centralized thinking
- Avoids Sonnet agents making judgments that need Opus oversight

**What gatherers should return**:
- Raw findings (files, configs, outputs)
- Counts and measurements
- Patterns observed
- Concerns flagged (without deep analysis)
- Uncertainties acknowledged

**What Opus does with gathered data**:
- Synthesizes across all 9 reports
- Identifies conflicts and priorities
- Makes judgments about severity
- Forms recommendations
- Engages user in decisions

### Guides Inform Generation (Not Templates)

**Wrong model**: Templates with placeholders → fill in blanks → copy to project

**Right model**: Guides encode principles → Opus applies to project context → generates appropriate artifacts

**Why this matters**:
- Different projects need different adaptations
- Placeholders are too rigid
- Generated artifacts should be right-sized
- Quality comes from understanding principles, not string replacement

**Guide structure**:
```
Purpose: What is this for?
Principles: Core ideas that don't change
Structure: What elements should be present?
Quality Criteria: How to evaluate if it's good?
Anti-patterns: What to avoid?
Adaptation Notes: How to customize for project
```

### Token Efficiency = No Waste, Appropriate Size

**Misconception**: Token efficiency means making everything minimal.

**Reality**: Token efficiency means:
- Every token serves a purpose
- No redundancy (don't repeat CLAUDE.md in commands)
- Appropriate size for task (auto.md can be larger than signal.md)
- No unnecessary prose or padding

**Acceptable overhead**: ~2000 tokens for an excellent command set is fine. The cost is justified if commands are high quality.

**Commands are always loaded**: They go into context at session start, not on invoke. This is the real cost to consider.

---

## Component Roles

### Guides (`plugins/autonomous-dev/guides/`)

**Purpose**: Encode best practices that inform generation.

**Not**: Templates to copy.

**Contents**:
- Workflow patterns (autonomous development, planning, etc.)
- Review standards (code review, plan review, etc.)
- Process protocols (checkpoints, signals, improvement)
- Quality criteria (what makes a good X)

**How used**: Opus reads guides, understands principles, generates project-specific implementations.

### Exploration Agents (`plugins/autonomous-dev/templates/agents/`)

**Purpose**: Gather project information in parallel.

**Not**: Analysts making recommendations.

**Contents**:
- 9 specialized gatherers (env, identity, workflow, architecture, quality, security, tests, docs, hygiene)
- Each has bounded scope
- Each returns structured findings

**How used**: Init spawns all 9 in parallel, collects reports, Opus synthesizes.

### Init Command (`plugins/autonomous-dev/templates/commands/init.md`)

**Purpose**: Orchestrate the initialization process.

**Responsibilities**:
1. Check prerequisites (MCP servers)
2. Detect project type
3. Spawn exploration agents
4. Synthesize findings
5. Engage user in decisions
6. Generate project ecosystem
7. Validate and report
8. Optionally self-delete

**Self-deletion**: Init is large but only runs once. Deleting after use saves future context.

### Generated Project Ecosystem

**CLAUDE.md**: Project-specific context (stack, commands, rules, phase)

**Commands**: Project-specific implementations of workflow patterns

**Agents**: Project-specific reviewers and validators

**Hooks**: Automated enforcement (if needed)

**Signals**: Feedback capture for improvement

**Memories**: Cross-session context (Serena)

---

## Feedback System Architecture

### Signal Capture

**When**: During development, capture correction moments.

**What**: Timestamp, type, note, context.

**Where**: `.claude/signals/corrections.jsonl`

**Principle**: Low friction. Capture immediately. Analyze later.

### Signal Types

| Type | Trigger | Example |
|------|---------|---------|
| correction | Human interrupts/corrects | "no stop", "wrong approach" |
| violation | Workflow rule broken | Skipped checkpoint |
| repeated | Same issue 2+ times | Re-explaining same concept |
| quality | Quality gate failure | Test failure that should have been caught |

### Improvement Cycle

1. **Gather signals** from multiple sources
2. **Find patterns** (not individual incidents)
3. **Diagnose root cause** (trace to system component)
4. **Classify level** (project-specific vs systemic)
5. **Propose improvement** (proportionate to problem)
6. **Implement and verify**
7. **Route to Level 1** if systemic

### Level 1 Escalation

When patterns indicate generator issues:
1. Document the pattern clearly
2. Identify which guide/logic needs updating
3. Propose specific change
4. Update claude-enhanced
5. Future projects benefit

---

## Open Questions

### How does Opus apply guides?

Options:
- Direct reference (read guide, follow steps)
- Internalized principles (understand guide, generate freely)
- Checklist (verify against quality criteria)

Likely: Combination. Read guide for structure, internalize principles, verify against criteria.

### Exploration data format

What structured format should agents return for effective synthesis?

Needs: Consistent structure across agents, machine-parseable, human-readable.

Candidate:
```markdown
## Findings
[structured data]

## Concerns
[flagged issues with severity]

## Uncertainties
[what couldn't be determined]
```

### Cross-project learning

How does Level 1 actually learn from multiple projects?

Options:
- Manual review of aggregated feedback
- Serena memories across projects
- Periodic synthesis sessions

Current approach: Manual for now. Design for future automation.

---

## Implementation Status

### Completed

- [x] **9 exploration agents** - REVISED to gatherer pattern (2026-01-08)
  - env-analyzer.md - gathers Claude config, MCP servers, user agents
  - project-identity.md - gathers project metadata, README, type indicators
  - workflow-analyzer.md - gathers CI/CD, git conventions, scripts
  - architecture-analyzer.md - gathers module structure, dependencies
  - code-quality.md - gathers lint output, complexity, debt markers
  - security-analyzer.md - gathers secrets detection, vulnerability scans
  - test-analyzer.md - gathers test framework, coverage, patterns
  - docs-analyzer.md - gathers documentation inventory, ADRs
  - workspace-hygiene.md - gathers artifacts, gitignore, naming patterns
- [x] **Init command structure** - REVISED (2026-01-08)
  - Uses gatherer pattern in agent prompts
  - Phase 2 synthesis done by Opus
  - References guides for generation
  - Condensed from 746 lines to 515 lines
- [x] **15 guides created** (ALL COMPLETE):
  - autonomous-workflow.md
  - planning.md
  - code-review.md
  - session-continuity.md (updated with timestamp naming convention)
  - signal-capture.md
  - improvement-cycle.md
  - exploration.md
  - tdd.md
  - debugging.md
  - refactoring.md
  - documentation.md
  - release.md
  - pr-workflow.md
  - command-structure.md
  - agent-structure.md

### Remaining

- [ ] Design feedback routing mechanics
- [ ] Test on fresh project
- [ ] Document Level 1 escalation process

---

## References

### Related Documents

- `claudedocs/INIT_SYSTEM_REDESIGN_PLAN.md` - Tactical decisions (11 decisions)
- `claudedocs/PLUGIN-ARCHITECTURE-VISION.md` - Broader plugin vision
- `plugins/autonomous-dev/guides/` - Best practice guides

### Scholardoc Reference Implementation

- `/home/rookslog/workspace/projects/scholardoc/.claude/` - Working project setup
- 17 commands, 13 agents, 5 hooks
- Demonstrates patterns we're encoding in guides

### Serena Memories

- `session_20260108_guides_and_architecture` - Session checkpoint
- `session_20260108_init_redesign_handoff` - Previous session handoff
