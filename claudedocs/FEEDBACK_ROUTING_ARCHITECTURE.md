# Feedback Routing Architecture

**Date**: 2026-01-08
**Status**: Design Complete
**Companion Documents**:
- `.claude-template/guides/review-workflow.md` - Project-level review process
- `.claude-template/guides/meta-review-workflow.md` - System effectiveness review
- `.claude-template/guides/signal-format.md` - Signal schema
- `.claude-template/guides/serena-memory-schemas.md` - Memory schemas

---

## Overview

The feedback routing system enables continuous improvement at two levels:
1. **Level 2 (Project)**: Project-specific improvements
2. **Level 1 (Generator)**: Systemic improvements to claude-enhanced itself

The system captures signals (explicit and implicit), diagnoses root causes, proposes improvements, and tracks whether those improvements actually work.

---

## Core Principles

### 1. Passive Capture, Batch Analysis
- Data accumulates continuously (signals, logs)
- Analysis happens periodically (weekly/monthly)
- No expensive hooks on every session

### 2. Implicit Over Explicit
- Don't rely solely on user running `/signal`
- Detect patterns from native logs, git history, conversation analysis
- Explicit signals supplement implicit detection

### 3. Interactive Correction
- When user signals, stop and understand (don't just log)
- Capture rich context in the moment
- Adjust immediately, record for later review

### 4. Pull Not Push
- Projects don't export to claude-enhanced
- claude-enhanced pulls from project memories
- Serena at user-level enables cross-project visibility

### 5. Feedback on Feedback
- Meta-review evaluates if the system works
- Track recurrence, effectiveness, bloat
- Adjust the process itself when needed

---

## Signal Classification

### Three Tiers

| Tier | Source | Confidence | Example |
|------|--------|------------|---------|
| **Explicit** | `/signal` command | High | User runs `/signal wrong approach` |
| **Implicit-Observable** | Native log analysis | Medium | Frustration patterns, repeated corrections |
| **Implicit-Latent** | Retrospective audit | Lower | Code quality issues, VC violations |

### Two Levels

| Level | Scope | Example | Action |
|-------|-------|---------|--------|
| **Level 2** | Project-specific | "Use our UserService class" | Fix in project |
| **Level 1** | Systemic | "Check for existing libs first" | Update claude-enhanced guides |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PROJECT A                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   User: /signal                                                      │
│      │                                                               │
│      ▼                                                               │
│   ┌──────────────────────┐                                          │
│   │ Interactive Dialog   │  ← Stop, reflect, understand             │
│   │ - What was I doing?  │                                          │
│   │ - What went wrong?   │                                          │
│   │ - Root cause?        │                                          │
│   └──────────┬───────────┘                                          │
│              │                                                       │
│              ▼                                                       │
│   ┌──────────────────────┐                                          │
│   │ .claude/signals/     │  ← Rich signal (JSONL)                   │
│   │ corrections.jsonl    │    See: guides/signal-format.md          │
│   └──────────┬───────────┘                                          │
│              │                                                       │
│              │  Weekly Review                                        │
│              ▼                                                       │
│   ┌──────────────────────┐     ┌─────────────────────┐             │
│   │ Review Workflow      │────▶│ Native Claude Logs  │             │
│   │ (guides/review-      │     │ ~/.claude/projects/ │             │
│   │  workflow.md)        │     └─────────────────────┘             │
│   │                      │     ┌─────────────────────┐             │
│   │ - Read signals       │────▶│ Git History         │             │
│   │ - Analyze logs       │     │ fix/revert patterns │             │
│   │ - Retrospective audit│     └─────────────────────┘             │
│   │ - Diagnose           │                                          │
│   │ - Propose            │                                          │
│   └──────────┬───────────┘                                          │
│              │                                                       │
│              ▼                                                       │
│   ┌──────────────────────┐     ┌─────────────────────┐             │
│   │ Serena Memories      │     │ .claude/reviews/    │             │
│   │ - feedback_state     │     │ review_20260108.md  │             │
│   │ - improvement_history│     │ (proposals file)    │             │
│   │ - recurring_issues   │     └─────────────────────┘             │
│   └──────────────────────┘                                          │
│              │                                                       │
│              │  Human applies improvements                           │
│              ▼                                                       │
│   ┌──────────────────────┐                                          │
│   │ Update Serena        │                                          │
│   │ - outcome: applied   │                                          │
│   │ - recurrence: false  │                                          │
│   └──────────────────────┘                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
              │
              │  Level 1 signals stay in project memories
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CLAUDE-ENHANCED                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Monthly Cross-Project Review                                       │
│      │                                                               │
│      ▼                                                               │
│   ┌──────────────────────┐                                          │
│   │ For each project:    │                                          │
│   │   activate_project() │                                          │
│   │   read memories      │  ← Pull model                            │
│   │   extract L1 signals │                                          │
│   │   extract recurring  │                                          │
│   └──────────┬───────────┘                                          │
│              │                                                       │
│              ▼                                                       │
│   ┌──────────────────────┐                                          │
│   │ Synthesize Patterns  │                                          │
│   │ - What's systemic?   │                                          │
│   │ - What guides need   │                                          │
│   │   updating?          │                                          │
│   └──────────┬───────────┘                                          │
│              │                                                       │
│              ▼                                                       │
│   ┌──────────────────────┐     ┌─────────────────────┐             │
│   │ Update Guides        │────▶│ .claude-template/   │             │
│   │                      │     │ guides/*.md         │             │
│   └──────────┬───────────┘     └─────────────────────┘             │
│              │                                                       │
│              ▼                                                       │
│   ┌──────────────────────┐                                          │
│   │ Serena Memories      │                                          │
│   │ - level1_patterns    │                                          │
│   │ - guide_improvement  │                                          │
│   │   _log               │                                          │
│   └──────────────────────┘                                          │
│              │                                                       │
│              │  Quarterly                                            │
│              ▼                                                       │
│   ┌──────────────────────┐                                          │
│   │ Meta-Review          │                                          │
│   │ - Is system working? │                                          │
│   │ - Metrics & trends   │                                          │
│   │ - Process adjustments│                                          │
│   └──────────┬───────────┘                                          │
│              │                                                       │
│              ▼                                                       │
│   ┌──────────────────────┐                                          │
│   │ meta_review_state    │                                          │
│   └──────────────────────┘                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Signal Capture

**`/signal` command** (`.claude-template/commands/signal.md`)
- Interactive stop-and-reflect, not passive logging
- Captures: user feedback, context, diagnosis, improvement hint, level
- Writes to `.claude/signals/corrections.jsonl`
- Schema: `.claude-template/guides/signal-format.md`

### Project Review

**Review workflow** (`.claude-template/guides/review-workflow.md`)
- Cadence: Weekly or after PR merge
- Inputs: Explicit signals, native logs, git history
- Process: Gather → Analyze implicit → Retrospective audit → Classify → Diagnose → Propose
- Outputs: Proposals file, Serena memories

**Serena memories written**:
- `feedback_state` - Review status, pending proposals
- `improvement_history` - Signals, diagnoses, improvements, outcomes
- `recurring_issues` - Issues that keep coming back
- `learned_preferences` - Project-specific patterns

### Cross-Project Review

**Triggered**: Monthly (or when patterns emerge)
**Location**: Run from within claude-enhanced project

**Process**:
1. Activate each project via Serena
2. Read `improvement_history`, `recurring_issues`
3. Extract Level 1 signals and escalation candidates
4. Synthesize patterns
5. Update guides as needed
6. Write to claude-enhanced's Serena

**Serena memories written**:
- `level1_patterns` - Cross-project patterns
- `guide_improvement_log` - What was updated and why

### Meta-Review

**Meta-review workflow** (`.claude-template/guides/meta-review-workflow.md`)
- Cadence: Quarterly
- Purpose: Evaluate if the improvement system works

**Metrics tracked**:
| Metric | Target |
|--------|--------|
| Signal volume trend | Decreasing |
| Recurrence rate | < 20% |
| Fix effectiveness | > 70% |
| L1 hit rate | > 60% |
| System size | Within targets |

**Serena memory written**:
- `meta_review_state` - Metrics, assessment, recommendations

---

## Serena Architecture

### User-Level Installation

Serena is installed at user level with multiple projects:
```
~/.serena/
├── projects/
│   ├── scholardoc/
│   │   └── memories/
│   ├── acadlib/
│   │   └── memories/
│   └── claude-enhanced/
│       └── memories/
```

### Memory Scoping

- Each project has its own memory space
- `activate_project("X")` switches context
- claude-enhanced can read all project memories

### Memory Schemas

Full schemas in `.claude-template/guides/serena-memory-schemas.md`.

**Project-level**:
- `feedback_state` - Current review state
- `improvement_history` - Log of signals and improvements
- `recurring_issues` - Persistent problems
- `learned_preferences` - Project-specific patterns

**claude-enhanced-level**:
- `level1_patterns` - Cross-project patterns
- `guide_improvement_log` - Guide update history
- `meta_review_state` - System health metrics

---

## Cadence Summary

| Frequency | Activity | Location | Purpose |
|-----------|----------|----------|---------|
| As needed | `/signal` | Project | Capture explicit corrections |
| Weekly | Project review | Project | Process signals, propose improvements |
| After PR | Project review | Project | Review changes, capture patterns |
| Monthly | Cross-project review | claude-enhanced | Identify L1 patterns, update guides |
| Quarterly | Meta-review | claude-enhanced | Evaluate system effectiveness |

---

## File Locations

### In Projects (after init)

```
project/
├── .claude/
│   ├── signals/
│   │   └── corrections.jsonl      # Raw signals (JSONL)
│   └── reviews/
│       └── review_YYYYMMDD.md     # Review proposals
```

### In claude-enhanced

```
claude-enhanced/
├── .claude-template/
│   ├── commands/
│   │   └── signal.md              # Signal command
│   └── guides/
│       ├── review-workflow.md     # Project review guide
│       ├── meta-review-workflow.md # Meta-review guide
│       ├── signal-format.md       # Signal schema
│       └── serena-memory-schemas.md # Memory schemas
└── claudedocs/
    └── FEEDBACK_ROUTING_ARCHITECTURE.md  # This document
```

---

## Design Decisions

### Why Interactive Signals?

**Problem**: Deferred analysis loses context. "wrong approach" means nothing a week later.

**Solution**: `/signal` triggers immediate reflection. Claude stops, understands, captures rich context, then continues.

### Why Pull Not Push?

**Problem**: Projects would need to know where claude-enhanced lives, write files across projects.

**Solution**: Serena at user-level lets claude-enhanced pull from all projects. Cleaner, no cross-project file writes.

### Why Serena for State, Files for Logs?

**Problem**: Where should data live?

**Solution**:
- Raw signals → JSONL files (append-only logs, easy to archive)
- Processed state → Serena memories (persist across sessions, queryable)
- Files are for events, memories are for knowledge

### Why Three Review Levels?

**Problem**: Different cadences serve different purposes.

**Solution**:
- Weekly/PR: Project-level, tactical
- Monthly: Cross-project, pattern identification
- Quarterly: Meta-level, system effectiveness

---

## Future Considerations

### Not Yet Implemented

1. **Implicit signal detection**: Native log analysis for frustration patterns
2. **Automated review triggers**: Cron/CI for scheduled reviews
3. **Review completion tracking**: Are projects actually running reviews?

### Open Questions

1. How do we handle projects that don't use this system?
2. Should there be a "bootstrap" for new projects to inherit patterns?
3. How do we version the improvement system itself?

---

## Quick Reference

**Capture a correction**: `/signal [description]`

**Run project review**: Follow `.claude-template/guides/review-workflow.md`

**Apply improvements**: Human reads proposals, asks Claude to implement

**Cross-project review**: Activate claude-enhanced, pull from projects, synthesize

**Meta-review**: Follow `.claude-template/guides/meta-review-workflow.md` quarterly
