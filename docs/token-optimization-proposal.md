# Token Optimization Proposal

**Goal**: Reduce non-message context overhead by 35% (30.5k tokens)
**Current**: 86.5k overhead tokens (86% context usage)
**Target**: 56k overhead tokens (66% context usage)

---

## Problem Statement

Current context breakdown:
- **Skills/Commands**: 24.1k (28%)
- **MCP Tools**: 22.0k (25%)
- **Memory Files**: 19.1k (22%)
- **System Tools**: 18.0k (21%)
- **System Prompt**: 3.3k (4%)

Most sessions only use 2-3 skills but load 44. Many commands are redundant. Framework files duplicate content.

---

## Proposed Changes

### 1. Skills Optimization (-17.9k tokens)

**Current**: 44 skills loaded (24.1k tokens)
**Target**: 6 core skills (6.2k tokens)

#### Core Skills (Keep Active)
| Skill | Tokens | Justification |
|-------|--------|---------------|
| sc:load | 842 | Session initialization |
| sc:save | 867 | Session persistence |
| sc:help | 2.0k | Discoverability |
| sc:task | 923 | Complex task orchestration |
| sc:git | 575 | Git operations |
| sc:implement | 1.0k | Code implementation |

**Total**: 6.2k tokens

#### Archive to `~/.claude/skills.disabled/` (18 skills)
- sc:spec-panel (4.4k) - specialized, rarely used
- sc:brainstorm (1.2k) - covered by interactive mode
- sc:workflow (1.1k) - covered by /project:auto
- sc:reflect (939) - covered by /project:improve
- sc:improve (929) - covered by /project:improve
- sc:estimate (919) - specialized
- sc:index (892) - specialized
- sc:spawn (887) - covered by sc:task
- sc:explain (883) - covered by native Claude
- sc:select-tool (873) - internal optimization
- sc:cleanup (848) - manual operation
- sc:troubleshoot (807) - covered by /project:diagnose
- sc:build (790) - project-specific
- sc:design (778) - covered by /project:plan
- sc:document (773) - covered by /project:document
- sc:analyze (766) - covered by /project:diagnose
- sc:research (738) - covered by MODE_DeepResearch when enabled
- sc:test (722) - covered by /project:auto
- sc:business-panel (697) - specialized

**Savings: 17.9k tokens**

**Implementation**:
```bash
mkdir -p ~/.claude/skills.disabled
mv ~/.claude/skills/{spec-panel,brainstorm,workflow,reflect,improve,estimate,index,spawn,explain,select-tool,cleanup,troubleshoot,build,design,document,analyze,research,test,business-panel}.md ~/.claude/skills.disabled/
```

**Restore when needed**:
```bash
mv ~/.claude/skills.disabled/research.md ~/.claude/skills/
```

---

### 2. Project Commands Consolidation (-6.1k tokens)

**Current**: 20 commands (~20k tokens)
**Target**: 8 essential commands (13.9k tokens)

#### Essential Commands (Keep)
| Command | Tokens | Role |
|---------|--------|------|
| init | 4.0k | Onboarding & setup |
| improve | 2.5k | Self-improvement loop |
| review-pr | 1.9k | GitHub PR review |
| diagnose | 1.7k | Diagnostics & debugging |
| create-pr | 1.3k | PR creation |
| auto | 1.1k | Autonomous workflows |
| plan | 756 | Planning phase |
| signal | 625 | Correction capture |

**Total**: 13.9k tokens

#### Consolidate/Archive
| Command | Tokens | Action |
|---------|--------|--------|
| analyze-logs | 1.7k | Merge into diagnose |
| document | 601 | Called by auto when needed |
| refactor | 523 | Called by auto when needed |
| release | 488 | Called by auto when needed |
| debug | 455 | Merge into diagnose |
| resume | 524 | Merge into improved session mgmt |
| checkpoint | 489 | Merge into improved session mgmt |
| implement | 403 | Covered by auto |
| review | 349 | Covered by review-pr |
| spike | 338 | Covered by auto experiment phase |
| tdd | 329 | Covered by auto |
| explore | 238 | Covered by auto exploration phase |

**Savings: 6.1k tokens**

**Implementation**:
```bash
mkdir -p .claude/commands.disabled
mv .claude/commands/{analyze-logs,document,refactor,release,debug,resume,checkpoint,implement,review,spike,tdd,explore}.md .claude/commands.disabled/
```

**Note**: Update diagnose.md to include analyze-logs functionality inline.

---

### 3. Memory Files Optimization (-10.6k tokens)

**Current**: 19.1k tokens
**Target**: 8.5k tokens

#### A. Comment Out Optional Components (-5.4k)

**~/.claude/CLAUDE.md** changes:
```markdown
# Core Framework (Always Loaded - Essential)
@FLAGS.md
@PRINCIPLES.md
@RULES.lean.md  # Use condensed version

# Behavioral Modes (Core - Always Loaded)
@MODE_Introspection.md
@MODE_Orchestration.md
@MODE_Task_Management.md

# MCP Documentation (Active)
@MCP_Serena.md

# OPTIONAL COMPONENTS - COMMENTED OUT
# Uncomment as needed for specific tasks
# Token savings: ~5.4k

# Research (uncomment for web research tasks)
# @RESEARCH_CONFIG.md              # -2.8k
# @MODE_DeepResearch.md            # -301

# Advanced Analysis (uncomment for deep thinking)
# @MCP_Sequential.md               # -330

# Library Documentation (uncomment for framework questions)
# @MCP_Context7.md                 # -303

# Bulk Code Operations (uncomment for pattern-based edits)
# @MCP_Morphllm.md                 # -331

# Interactive Discovery (uncomment for vague requirements)
# @MODE_Brainstorming.md           # -456

# Symbol Communication (uncomment for token pressure)
# @MODE_Token_Efficiency.md        # -884
```

#### B. Condense RULES.md (-1.9k)

Create **RULES.lean.md** (1.5k from 3.4k):
- Remove redundancies with PRINCIPLES.md
- Merge workflow rules into MODE_Task_Management.md
- Extract git-specific rules to optional GIT_RULES.md
- Keep only critical, non-redundant rules

#### C. Slim Project CLAUDE.md (-4.2k)

**scholardoc/CLAUDE.md** changes:
```markdown
# Scholardoc - Claude Code Configuration

Uses SuperClaude framework (see ~/.claude/CLAUDE.md)

## Project-Specific Settings

### Tech Stack
- Python 3.11+, pytest, ruff, mypy
- uv for dependency management

### Test Command
`uv run pytest`

### Critical Paths
- Core extraction: scholardoc/extractors/
- Storage: scholardoc/storage/
- Tests: tests/

### Project Patterns
- Use frozen dataclasses for configs
- Cascading extractor pattern for document processing
- Structured logging with Loguru

See autonomous-dev plugin docs in .claude/ for workflow commands.
```

**Savings: 10.6k total**

---

### 4. MCP Server Optimization (-3.2k tokens)

**Disable non-essential MCP servers** via Claude Code settings:

#### Disable
- **context7** (1.7k) - Enable only when needed for library docs
- **sequential-thinking** (1.5k) - Enable only for deep analysis

#### Keep Active
- **serena** (essential for project memory and semantic operations)

**Settings change**:
```json
{
  "mcpServers": {
    "serena": { "enabled": true },
    "context7": { "enabled": false },
    "sequential-thinking": { "enabled": false }
  }
}
```

**Savings: 3.2k tokens**

---

## Summary

| Category | Current | Target | Savings | Method |
|----------|---------|--------|---------|--------|
| Skills | 24.1k | 6.2k | -17.9k | Archive to .disabled/ |
| Commands | ~20k | 13.9k | -6.1k | Consolidate/merge |
| Memory | 19.1k | 8.5k | -10.6k | Comment out + condense |
| MCP Tools | 22k | 18.8k | -3.2k | Disable in settings |
| System | 21.3k | 21.3k | 0 | No change |
| **Total** | **86.5k** | **46.7k** | **-39.8k** | **46% reduction** |

**Result**: Context usage drops from 86% → 66% (40k tokens freed)

---

## Implementation Phases

### Phase 1: Quick Wins (Manual, 5 minutes)
1. Disable Context7 and Sequential MCP servers
2. Comment out optional components in ~/.claude/CLAUDE.md
3. **Immediate savings**: ~8.6k tokens

### Phase 2: Skills Optimization (10 minutes)
1. Create ~/.claude/skills.disabled/
2. Move 18 non-essential skills
3. Test with sc:help to verify core skills work
4. **Additional savings**: ~17.9k tokens

### Phase 3: Commands Consolidation (20 minutes)
1. Create .claude/commands.disabled/ in scholardoc
2. Merge analyze-logs into diagnose.md
3. Archive 11 redundant commands
4. Test essential commands
5. **Additional savings**: ~6.1k tokens

### Phase 4: Framework Refinement (30 minutes)
1. Create RULES.lean.md (condensed rules)
2. Slim scholardoc/CLAUDE.md to project-specific only
3. Extract git rules to optional file
4. **Additional savings**: ~6.1k tokens

**Total time**: ~65 minutes
**Total savings**: ~38.7k tokens (45% reduction)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Disabled skill needed | Medium | Easy restore from .disabled/ |
| Command consolidation breaks workflow | High | Keep backups, test thoroughly |
| MCP server needed mid-session | Low | Enable in settings, restart |
| Lost framework functionality | Medium | Document what was removed, keep originals |

---

## Rollback Plan

All changes are non-destructive:

```bash
# Restore skills
mv ~/.claude/skills.disabled/* ~/.claude/skills/

# Restore commands
mv .claude/commands.disabled/* .claude/commands/

# Restore CLAUDE.md
git checkout ~/.claude/CLAUDE.md

# Re-enable MCP servers
# Edit settings.json, set enabled: true
```

---

## Success Metrics

- [ ] Context usage ≤ 70% at session start
- [ ] Essential workflows (auto, plan, improve) work unchanged
- [ ] Session can handle 30%+ more conversation turns
- [ ] No functionality loss for current project needs

---

## Post-Implementation

### Monitor (2 weeks)
- Track which disabled skills are requested
- Identify missing command functionality
- Measure actual context savings in practice

### Optimize Further
- Create skill "packs" (dev, research, business)
- Implement lazy-load for commands
- Create CLAUDE.minimal.md for lightweight sessions

### Document
- Update SuperClaude README with lean mode
- Create restoration guide
- Share learnings for broader optimization
