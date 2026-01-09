# Session Checkpoint: Feedback Routing System Design

**Date**: 2026-01-08 21:50
**Status**: Design complete, restructuring in progress
**Read also**: `session_20260108_2150_handoff`

---

## What Was Accomplished This Session

### 1. Complete Feedback Routing Architecture

Designed system for capturing, routing, and acting on feedback at two levels:
- **Level 2 (Project)**: Project-specific improvements
- **Level 1 (Generator)**: Systemic improvements to claude-enhanced itself

### 2. Files Created

| File | Location | Purpose |
|------|----------|---------|
| `review-workflow.md` | `guides/` | Weekly/monthly project review |
| `meta-review-workflow.md` | `guides/` | Quarterly system effectiveness review |
| `signal-format.md` | `templates/formats/` | Rich signal JSON schema |
| `serena-memory-schemas.md` | `templates/formats/` | All Serena memory schemas |
| `signal.md` | `templates/commands/` | Rewritten as interactive stop-and-reflect |
| `FEEDBACK_ROUTING_ARCHITECTURE.md` | `docs/` | Full architecture documentation |

### 3. Init Command Updated

Changed all paths from `plugins/autonomous-dev/` to `.claude/`:
- Agent paths: `.claude/init-agents/env-analyzer.md` etc.
- Guide paths: `.claude/guides/command-structure.md` etc.

---

## Key Design Decisions

### Signal Capture: Interactive, Not Passive

Old approach:
```
/signal wrong approach → {"ts": "...", "note": "wrong approach"} → lost context
```

New approach:
```
/signal wrong approach
  → Claude stops, reflects on what it was doing
  → Asks clarifying question if needed
  → Diagnoses root cause WITH user
  → Captures rich context:
    - task, action, approach
    - what happened, why, should have
    - improvement hint
    - level (1 or 2)
  → Decides immediate action
  → Continues
```

### Three Signal Tiers

| Tier | Source | Confidence |
|------|--------|------------|
| Explicit | `/signal` command | High |
| Implicit-Observable | Native log analysis (weekly review) | Medium |
| Implicit-Latent | Retrospective audit | Lower |

### Pull Model for Cross-Project Learning

- Projects write rich Serena memories (`improvement_history`, `recurring_issues`)
- claude-enhanced PULLS from all project memories during monthly cross-project review
- No file-based export needed
- Serena at user-level enables this (can see all projects)

### Review Cadence

| Frequency | Activity |
|-----------|----------|
| As needed | `/signal` for explicit corrections |
| Weekly | Project review via `guides/review-workflow.md` |
| Monthly | Cross-project review (claude-enhanced pulls from projects) |
| Quarterly | Meta-review via `guides/meta-review-workflow.md` |

### Serena Memory Schemas

**Project-level:**
- `feedback_state` - Review status, pending proposals
- `improvement_history` - Signals, diagnoses, improvements, outcomes
- `recurring_issues` - Issues that keep coming back
- `learned_preferences` - Project-specific patterns

**claude-enhanced-level:**
- `level1_patterns` - Cross-project patterns
- `guide_improvement_log` - Guide update history
- `meta_review_state` - System health metrics

---

## .claude-template/ Structure Decision

### Three Categories of Artifacts

| Category | Examples | Handling |
|----------|----------|----------|
| **STATIC** | signal, checkpoint, resume, schemas | Copy as-is, universal |
| **TEMPLATED** | CLAUDE.md, settings.json | Fill placeholders |
| **REGENERATED** | auto, plan, explore, implement, reviewers | Generate from guides + analysis |

### Final Structure

```
.claude-template/
├── commands/
│   ├── init.md              # Bootstrap (self-deletes)
│   ├── signal.md            # STATIC
│   ├── checkpoint.md        # STATIC
│   └── resume.md            # STATIC
├── guides/                  # Principles + schemas
│   ├── autonomous-workflow.md
│   ├── planning.md
│   ├── exploration.md
│   ├── code-review.md
│   ├── command-structure.md
│   ├── agent-structure.md
│   ├── signal-capture.md
│   ├── signal-format.md          # Schema
│   ├── serena-memory-schemas.md  # Schema
│   ├── improvement-cycle.md
│   ├── review-workflow.md
│   ├── meta-review-workflow.md
│   ├── tdd.md
│   ├── debugging.md
│   ├── refactoring.md
│   ├── documentation.md
│   ├── release.md
│   ├── pr-workflow.md
│   └── session-continuity.md
├── init-agents/             # Used only during init
│   ├── env-analyzer.md
│   ├── project-identity.md
│   ├── workflow-analyzer.md
│   ├── architecture-analyzer.md
│   ├── code-quality.md
│   ├── security-analyzer.md
│   ├── test-analyzer.md
│   ├── docs-analyzer.md
│   └── workspace-hygiene.md
├── templates/
│   ├── CLAUDE.template.md
│   └── settings.template.json
├── signals/
│   └── .gitkeep
└── reviews/
    └── .gitkeep
```

### Init Workflow

1. User copies `.claude-template/` to project
2. Renames to `.claude/`
3. Runs `/init`
4. Init:
   - Checks prerequisites (Serena, Sequential-Thinking MCP)
   - Detects project type
   - Spawns 9 exploration agents from `.claude/init-agents/`
   - Synthesizes findings (Opus)
   - Asks user questions (conflicts, preferences)
   - Reads guides from `.claude/guides/`
   - Fills in templates → CLAUDE.md, settings.json
   - GENERATES commands from guides + project analysis
   - GENERATES agents from guides + project analysis
   - Generates hooks if needed
   - Sets up Serena memories
   - Validates
   - Reports, optionally self-deletes

---

## Design Rationale

### Why Interactive Signals?
Deferred analysis loses context. "wrong approach" is meaningless a week later. Stop-and-reflect captures rich context in the moment.

### Why Pull Not Push?
Projects don't export to claude-enhanced. claude-enhanced pulls from project memories via Serena. Cleaner, no cross-project file writes.

### Why Three Review Levels?
- Weekly: Tactical, project-level
- Monthly: Pattern identification, guide updates
- Quarterly: Meta - is the system working?

### Why Guides Over Templates for Commands?
Templates with placeholders are rigid. Guides encode principles. Opus applies principles to generate right-sized artifacts per project.

### Why Static Commands Exist?
Some commands (signal, checkpoint, resume) are truly universal. No project-specific content.

---

## Files to Read on Resume

```
# Architecture documentation
plugins/autonomous-dev/docs/FEEDBACK_ROUTING_ARCHITECTURE.md

# Key guides created this session
plugins/autonomous-dev/guides/review-workflow.md
plugins/autonomous-dev/guides/meta-review-workflow.md

# Schemas
plugins/autonomous-dev/templates/formats/signal-format.md
plugins/autonomous-dev/templates/formats/serena-memory-schemas.md

# Updated commands
plugins/autonomous-dev/templates/commands/signal.md
plugins/autonomous-dev/templates/commands/init.md

# Previous context docs
claudedocs/INIT_SYSTEM_ARCHITECTURE.md
claudedocs/INIT_SYSTEM_REDESIGN_PLAN.md
```
