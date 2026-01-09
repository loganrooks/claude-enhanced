# Session: Guides and Architecture Framework

**Date**: 2026-01-08
**Status**: In Progress - Guides partially complete, architecture clarified

---

## Key Decisions Made This Session

### 1. Two-Level Improvement System

**Decision**: The autonomous-dev system operates at two interrelated levels:
- **Level 1 (claude-enhanced)**: The generator - creates project ecosystems
- **Level 2 (project)**: The generated ecosystem - runs within specific projects

**Rationale**: Feedback from projects should route appropriately:
- Project-specific issues → Fix at Level 2
- Systemic patterns → Improve Level 1 (the generator itself)

**Trade-offs**: More complex routing, but enables the system to improve its own generation over time.

### 2. Exploration Agents are Gatherers, Not Analysts

**Decision**: The 9 exploration agents should GATHER information and FLAG concerns. Opus (main session) performs the actual analysis and synthesis.

**Rationale**: 
- Sonnet agents are good at following instructions and collecting data
- Opus is better at judgment, synthesis, and decision-making
- Cleaner separation of concerns

**Impact**: Need to revise the 9 agents I created earlier - they currently do too much analysis.

### 3. Guides Inform Generation (Not Templates to Copy)

**Decision**: Guides encode best practices and principles. Init applies guides + project analysis to GENERATE project-specific commands/agents, not just fill in placeholders.

**Rationale**:
- Different projects need different adaptations
- Templates with placeholders are too rigid
- Generated artifacts should be right-sized and appropriate

**Impact**: Guides should have clear structure (purpose, principles, structure, quality criteria, anti-patterns) that generation can apply.

### 4. Commands Are Always Loaded

**Fact verified**: Commands load into context at session start, not on invoke. ~2000 tokens for a good command set is acceptable overhead IF the commands are excellent quality.

### 5. Token Efficiency Means No Waste, Not Minimal Size

**Decision**: Token efficiency isn't about making everything tiny. It's about:
- Every token serves a purpose
- No redundancy with CLAUDE.md
- Appropriate size for the task (auto.md can be larger than simple commands)
- No unnecessary prose or bloat

---

## Files Created This Session

### Guides Created (in `plugins/autonomous-dev/guides/`)

| Guide | Purpose | Status |
|-------|---------|--------|
| `autonomous-workflow.md` | Core development workflow phases and gates | Complete |
| `planning.md` | How to plan before implementing | Complete |
| `code-review.md` | Code review checklist and standards | Complete |
| `session-continuity.md` | Checkpoint/resume/handoff protocols | Complete |
| `signal-capture.md` | How to capture feedback signals | Complete |
| `improvement-cycle.md` | How improvement works at both levels | Complete |
| `exploration.md` | How to investigate a codebase | Complete |

### Guides Still Needed

| Guide | Purpose |
|-------|---------|
| `tdd.md` | Test-driven development |
| `debugging.md` | Systematic debugging |
| `refactoring.md` | Safe refactoring |
| `documentation.md` | Documentation standards |
| `release.md` | Release process |
| `pr-workflow.md` | PR creation and review |
| `command-structure.md` | What makes a good command |
| `agent-structure.md` | What makes a good agent |

### Previous Session Files (from `session_20260108_init_redesign_handoff`)

These still exist and are relevant:
- 9 exploration agents in `plugins/autonomous-dev/templates/agents/` - **Need revision to be gatherers not analysts**
- Updated `init.md` command - **Needs revision to use guides for generation**

---

## Architecture Understanding

```
claude-enhanced (Level 1 - The Generator)
├── guides/                    # Best practice knowledge
│   ├── autonomous-workflow.md
│   ├── planning.md
│   └── ...
├── templates/
│   ├── commands/
│   │   └── init.md           # Orchestrates initialization
│   └── agents/
│       └── 9 exploration agents  # Gather project info
│
│ init runs, applies guides + exploration data
↓
Generated Project Ecosystem (Level 2)
├── CLAUDE.md                 # Project-specific context
├── .claude/
│   ├── commands/             # Generated, project-specific
│   ├── agents/               # Generated, project-specific  
│   ├── hooks/                # Generated if needed
│   └── signals/              # Feedback capture
│
│ signals captured during development
↓
Improvement Cycle
├── Project fixes (Level 2)   # Adjust this project's config
└── Generator fixes (Level 1) # Improve what gets generated
```

---

## Reference Documents

### Primary Documents (Read Both)
1. `claudedocs/INIT_SYSTEM_REDESIGN_PLAN.md` - Tactical decisions (11 decisions about init implementation)
2. `claudedocs/INIT_SYSTEM_ARCHITECTURE.md` - **NEW** - Strategic architecture (two-level system, gatherers vs analysts, guides philosophy)

### Previous Handoff
Read `session_20260108_init_redesign_handoff` for earlier context on the init system redesign

### Scholardoc Reference
Scholardoc at `/home/rookslog/workspace/projects/scholardoc/` has working implementations:
- `.claude/commands/` - 17 commands (auto, plan, checkpoint, resume, signal, etc.)
- `.claude/agents/` - 13 agents (reviewers, diagnostic, improvement)
- `.claude/hooks/` - 5 Python hooks
- `CLAUDE.md` - Project documentation (~68 lines)
- `.claude/settings.json` - Permissions and hook config

---

## Next Steps (Priority Order)

1. **Complete remaining guides** - tdd, debugging, refactoring, documentation, release, pr-workflow, command-structure, agent-structure

2. **Revise exploration agents** - Make them gatherers (collect data, flag concerns) not analysts (make judgments). Currently in `plugins/autonomous-dev/templates/agents/`

3. **Revise init.md** - Update to use guides for generation, not just run agents and copy templates

4. **Design feedback routing** - How signals get classified as Level 1 vs Level 2 issues

5. **Test on a fresh project** - Validate the whole flow works

---

## Open Questions

1. **Guide application**: How exactly does Opus apply guides during generation? Direct reference? Internalized principles? Checklist?

2. **Exploration data format**: What structured format should exploration agents return so Opus can synthesize effectively?

3. **Level classification heuristics**: How do we determine if a signal indicates a project issue vs generator issue? Need concrete criteria.

4. **Cross-project learning**: How does Level 1 actually learn from multiple projects? Manual review? Aggregated memories?

---

## Context for Next Session

Start by reading:
```
read_memory("session_20260108_guides_and_architecture")  # This file
```

Then review:
- `plugins/autonomous-dev/guides/` - The guides created
- `claudedocs/INIT_SYSTEM_REDESIGN_PLAN.md` - The full plan
- `plugins/autonomous-dev/templates/agents/` - Agents that need revision

Continue with: Completing remaining guides OR revising exploration agents to be gatherers.
