# Context Optimization Plan - Final (Evidence-Based)

**Date**: 2025-12-27
**Status**: READY FOR REVIEW
**Evidence**: See [discovery-findings.md](discovery-findings.md)

---

## Executive Summary

Phase 0 Discovery revealed **THREE high-impact, low-risk optimizations** that collectively save ~28.5k tokens:

1. **Scholardoc CLAUDE.md is 10x too large** (523 lines vs <100 recommended)
   - Contains 260+ lines duplicating content already in docs/
   - **Savings**: ~4k tokens (70% reduction)

2. **All 19 sc:* commands are unused** (zero invocations found)
   - User workflow relies exclusively on /project:* commands
   - **Savings**: ~17.9k tokens (74% reduction)

3. **Balanced framework config exists and tested**
   - Removes non-essential modes while keeping TodoWrite
   - **Savings**: ~6.6k tokens (49% reduction)

**Total Savings**: 28.5k tokens (33% of optimizable overhead)
**Result**: 172k → ~143k tokens (86% → 72% context usage)
**Risk**: LOW (all changes have easy rollback)

---

## Phase 1: Implementation Plan

### 1.1: Condense Scholardoc CLAUDE.md

**Current State**: 523 lines, 2,657 words, ~5.7k tokens
**Target**: ~100 lines, ~400 words, ~1.7k tokens
**Savings**: ~4k tokens

**Changes**:

```bash
# 1. Create new documentation files (content already exists, just reorganize)
cd ~/workspace/projects/scholardoc

# Extract "Automation & Guardrails" section (261 lines)
# → docs/AUTOMATION_SETUP.md (already exists with this content!)
# → Just reference it in CLAUDE.md

# Extract "Validation & Testing Methodology" section (132 lines)
# → Create docs/TESTING_METHODOLOGY.md

# Extract "Vision" section (40 lines)
# → Create docs/VISION.md

# 2. Create condensed CLAUDE.md
# → Replace with minimal version (see discovery-findings.md for template)

# 3. Validate
wc -l CLAUDE.md  # Should be ~100 lines
```

**New CLAUDE.md Structure** (~100 lines):
```
├─ Quick Start (9 lines) ✅ Keep
├─ Vision (5 lines) → Reference docs/VISION.md
├─ Current Phase (5 lines) ✅ Keep
├─ Stack (5 lines) ✅ Keep
├─ Documentation (5 lines) → List key docs
├─ Commands (10 lines) → Reference docs/COMMANDS.md
├─ Workflow & Rules (10 lines) → Reference docs/RULES.md
├─ Automation (10 lines) → Reference docs/AUTOMATION_SETUP.md
├─ Version Control (10 lines) → Reference docs/GIT_WORKFLOW.md
└─ Architecture (5 lines) → Reference docs/adr/
```

**Validation**:
- Start new Claude Code session in scholardoc
- Verify essential info still accessible
- Check token reduction via `/context`

**Rollback**:
```bash
git checkout CLAUDE.md  # Git restore if needed
```

---

### 1.2: Disable Unused SC Commands

**Evidence**: ZERO /sc:* command usage detected in any project
**Current**: 25 commands, ~24.1k tokens
**Target**: 3 commands, ~6.2k tokens
**Savings**: ~17.9k tokens

**Keep** (3 essential):
- `help.md` (2.0k) - Command reference
- `load.md` (842) - Session restore (compatibility)
- `save.md` (867) - Session persist (compatibility)

**Disable** (22 commands):
- ALL others including: spec-panel, brainstorm, workflow, implement, reflect, improve, task, estimate, index, spawn, explain, select-tool, cleanup, troubleshoot, build, design, document, analyze, research, test, business-panel, git

**Implementation**:

```bash
# Create disabled directory
mkdir -p ~/.claude/commands/sc.disabled

# Move all except help, load, save
cd ~/.claude/commands/sc

# Keep: help.md, load.md, save.md
# Disable everything else
for cmd in spec-panel brainstorm workflow implement reflect improve task estimate index spawn explain select-tool cleanup troubleshoot build design document analyze research test business-panel git; do
  mv ${cmd}.md ../sc.disabled/ 2>/dev/null
done

# Verify what remains
ls -1
# Should show only: help.md, load.md, save.md
```

**Validation**:
- Start new Claude Code session
- Run `/help` - verify sc:help, sc:load, sc:save appear
- Verify sc:task, sc:implement, etc. DO NOT appear
- Check `/context` for token reduction (~17.9k savings)

**Rollback**:
```bash
mv ~/.claude/commands/sc.disabled/*.md ~/.claude/commands/sc/
rmdir ~/.claude/commands/sc.disabled/
```

---

### 1.3: Switch to CLAUDE.balanced.md

**Current**: ~/.claude/CLAUDE.md loads 13.4k tokens
**Target**: CLAUDE.balanced.md loads ~6.8k tokens
**Savings**: ~6.6k tokens

**What Changes**:
| File | Standard | Balanced |
|------|----------|----------|
| RULES.md (3.4k) | ✅ Loaded | ❌ Removed |
| RESEARCH_CONFIG.md (2.8k) | ✅ Loaded | ❌ Removed |
| MODE_Introspection.md (419) | ✅ Loaded | ❌ Removed |
| MODE_Task_Management.md (957) | ✅ Loaded | ✅ **Kept** |
| MODE_Token_Efficiency.md (884) | ✅ Loaded | ✅ **Kept** |
| MODE_Orchestration.md (415) | ✅ Loaded | ✅ **Kept** |
| All others | ✅ Loaded | ✅ **Kept** |

**Critical**: MODE_Task_Management.md MUST stay (TodoWrite dependency)

**Implementation**:

```bash
# Backup current
cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.standard.backup

# Switch to balanced
cp ~/.claude/CLAUDE.balanced.md ~/.claude/CLAUDE.md
```

**Validation**:
- Start new Claude Code session
- Verify TodoWrite works: Run any task and use TodoWrite
- Verify token efficiency symbols work
- Check `/context` for token reduction (~6.6k savings)
- Confirm essential functionality preserved

**Rollback**:
```bash
cp ~/.claude/CLAUDE.standard.backup ~/.claude/CLAUDE.md
```

---

## Expected Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Context** | 172k (86%) | ~143.5k (72%) | -28.5k tokens |
| **Scholardoc CLAUDE.md** | 5.7k | ~1.7k | -4.0k tokens |
| **User sc:* commands** | 24.1k | ~6.2k | -17.9k tokens |
| **User framework** | 13.4k | ~6.8k | -6.6k tokens |
| **Project commands** | 20.0k | 20.0k | No change |
| **MCP tools** | 22.0k | 22.0k | No change |
| **Free buffer** | 28k (14%) | ~56.5k (28%) | +28.5k tokens |

**Optimization Efficiency**: 33% reduction in optimizable overhead (28.5k / 85.2k)
**Overall Reduction**: 17% of total context usage
**Remaining Buffer**: 2x increase in available space

---

## Risk Assessment

### Changes & Risks

| Change | Risk Level | Impact if Failed | Mitigation |
|--------|-----------|------------------|------------|
| Condense scholardoc CLAUDE.md | LOW | Missing context in sessions | Git rollback, easy to restore |
| Disable 22 sc:* commands | **VERY LOW** | Commands unavailable | Zero usage = zero impact |
| Switch to balanced framework | LOW | TodoWrite breaks | MODE_Task_Management kept |

### Safety Measures

1. **All changes have 1-command rollback**
2. **Git version control** for CLAUDE.md changes
3. **Incremental validation** after each change
4. **No permanent deletions** - files moved to .disabled/ folders

---

## Execution Checklist

### Pre-Execution
- [ ] Full backup of ~/.claude/ (already exists from 2025-12-26)
- [ ] Full backup of scholardoc/.claude/ (tar.gz exists)
- [ ] Git status clean in scholardoc (commit or stash changes)

### Execution Order
1. [ ] **1.1: Condense scholardoc CLAUDE.md**
   - [ ] Create docs/VISION.md
   - [ ] Create docs/TESTING_METHODOLOGY.md
   - [ ] Replace CLAUDE.md with condensed version
   - [ ] Git commit: "refactor: condense CLAUDE.md via progressive disclosure"
   - [ ] Validate in new session
   - [ ] Check /context for token reduction

2. [ ] **1.2: Disable sc:* commands**
   - [ ] Create ~/.claude/commands/sc.disabled/
   - [ ] Move 22 commands to disabled/
   - [ ] Validate in new session
   - [ ] Check /context for token reduction

3. [ ] **1.3: Switch to balanced framework**
   - [ ] Backup current CLAUDE.md
   - [ ] Copy balanced version
   - [ ] Validate TodoWrite functionality
   - [ ] Check /context for token reduction

### Post-Execution Validation
- [ ] Start fresh Claude Code session in scholardoc
- [ ] Run `/context` - verify ~143k total usage
- [ ] Test TodoWrite - verify MODE_Task_Management loaded
- [ ] Test essential workflows - verify no regressions
- [ ] Run `/help` - verify only essential commands listed
- [ ] Document actual token savings achieved

---

## Rollback Plan

If any phase fails validation:

**Rollback 1.1 (CLAUDE.md)**:
```bash
cd ~/workspace/projects/scholardoc
git checkout CLAUDE.md
git clean -fd docs/  # Remove new docs if created
```

**Rollback 1.2 (sc:* commands)**:
```bash
mv ~/.claude/commands/sc.disabled/*.md ~/.claude/commands/sc/
rmdir ~/.claude/commands/sc.disabled/
```

**Rollback 1.3 (framework)**:
```bash
cp ~/.claude/CLAUDE.standard.backup ~/.claude/CLAUDE.md
```

**Full Restore (nuclear option)**:
```bash
# Restore user framework
cp ~/.claude/backups/pre-optimization-20251226-132225/*.md ~/.claude/

# Restore sc commands
mv ~/.claude/commands/sc.disabled/*.md ~/.claude/commands/sc/
rmdir ~/.claude/commands/sc.disabled/

# Restore scholardoc CLAUDE.md
cd ~/workspace/projects/scholardoc
git checkout CLAUDE.md
```

---

## Success Criteria

- [ ] Context usage reduced from 86% to ≤72%
- [ ] At least 25k tokens saved (target: 28.5k)
- [ ] TodoWrite functionality working
- [ ] Session management (save/load) working
- [ ] No regressions in scholardoc workflows
- [ ] All changes documented with rollback paths
- [ ] Git history clean with clear commit messages

---

## Post-Optimization Monitoring

### Week 1
- Monitor for missing context issues
- Track if any disabled commands are needed
- Verify token savings persist across sessions

### Week 2+
- Consider Phase 2 optimizations if needed
- Evaluate diagnose/analyze-logs merger
- Check if context7 MCP can be disabled

---

## Files to Be Modified

### New Files Created
- `~/workspace/projects/scholardoc/docs/VISION.md` (from CLAUDE.md)
- `~/workspace/projects/scholardoc/docs/TESTING_METHODOLOGY.md` (from CLAUDE.md)

### Modified Files
- `~/workspace/projects/scholardoc/CLAUDE.md` (523 lines → ~100 lines)
- `~/.claude/CLAUDE.md` (switched to balanced version)

### Moved Files
- 22 files from `~/.claude/commands/sc/` → `~/.claude/commands/sc.disabled/`

### Backup Files Created
- `~/.claude/CLAUDE.standard.backup` (copy of current framework config)

---

## Next Steps

1. ✅ Discovery complete ([discovery-findings.md](discovery-findings.md))
2. ✅ Evidence-based plan created (this document)
3. ⏳ **Submit plan to review agent** for quality/safety validation
4. ⏳ Address review feedback
5. ⏳ Get user approval
6. ⏳ Execute Phase 1 with validation gates
7. ⏳ Monitor and document results

---

## Appendix: Example Commands

### Condensed Scholardoc CLAUDE.md Example

```markdown
# ScholarDoc

## Quick Start for AI Assistants
1. Read this file completely
2. Check ROADMAP.md for current phase (Phase 1: OCR pipeline integration)
3. If implementing: Read SPEC.md relevant sections
4. If exploring: Check spikes/ for prior work
5. Run `/project:plan` before coding
6. Use Serena memories: `ocr_pipeline_architecture`, `session_handoff`

## Vision
ScholarDoc extracts structured knowledge from scholarly PDFs into a flexible intermediate representation (ScholarDocument) designed for RAG pipelines, flashcard generation, research organization, and citation management.

**Core Insight:** Separate extraction from presentation.

See [docs/VISION.md](docs/VISION.md) for full vision and applications.

## Current Phase
Phase 1: Core Implementation - PDF reader and OCR pipeline
Current Task: Integrate validated OCR pipeline
See ROADMAP.md for full plan, spikes/FINDINGS.md for exploration results.

## Stack
- Python 3.11+, PyMuPDF (fitz), Pydantic, pytest, hypothesis, ruff, uv

## Commands
```bash
uv sync && uv run pytest             # Install deps and test
uv run ruff check . && ruff format . # Lint and format
```

See [docs/COMMANDS.md](docs/COMMANDS.md) for full command reference including spikes.

## Workflow & Rules
1. **Explore first** - Run spikes before implementing (spikes/)
2. Check ROADMAP.md for current phase/milestone
3. Read SPEC.md before writing code
4. TDD always - Write tests first (/project:tdd)
5. Graceful degradation over hard failures

See [docs/RULES.md](docs/RULES.md) for complete development guidelines.

## Automation
This project uses automated hooks and workflow commands for quality control.

**Workflow Commands**: `/project:plan`, `/project:implement`, `/project:improve`, `/project:resume`, etc.

See [docs/AUTOMATION_SETUP.md](docs/AUTOMATION_SETUP.md) for:
- Pre-approved vs blocked operations
- Automatic quality checks (ruff, pytest)
- Complete workflow command reference
- Session management with Serena memories

## Version Control
🔴 **CRITICAL**: Use feature branches for ALL work, never commit directly to main.

```bash
git checkout -b feature/<name>  # Start work
git push -u origin feature/<name>  # Create PR
```

See [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) for branching strategy and commit format.

## Architecture
Key decisions documented in docs/adr/:
- ADR-001: PDF library choice (PyMuPDF)
- ADR-002: OCR pipeline architecture (spellcheck as selector)
- ADR-003: Line-break detection (block-based filtering)

See [docs/adr/](docs/adr/) for all architecture decision records.

## Validation & Testing
Follow systematic methodology to avoid procedural mistakes.

**Critical**: Use FULL validation set (130+ pairs), not subsets.

See [docs/TESTING_METHODOLOGY.md](docs/TESTING_METHODOLOGY.md) for:
- Ground truth data organization
- Metrics to track (detection rate, false positives)
- Testing rules and common mistakes
- Validation set usage
```

**Result**: 523 lines → ~90 lines (83% reduction)
**Token Estimate**: ~5.7k → ~1.5k (~73% reduction)
**Content Preserved**: 100% (via progressive disclosure to docs/)

---

**Plan Status**: READY FOR AGENT REVIEW
**Estimated Execution Time**: 30 minutes
**Risk Level**: LOW
**Rollback Complexity**: SIMPLE (1 command per phase)
