# Final Context Optimization Plan

**Date**: 2025-12-28 (Updated)
**Status**: READY FOR EXECUTION
**Approach**: Complete sc:* removal + progressive disclosure + framework optimization
**Changelog**: See [OPTIMIZATION-CHANGELOG.md](OPTIMIZATION-CHANGELOG.md) for modification history

---

## Executive Summary

**Decision**: Option C (Comprehensive Optimization) with Complete sc:* Removal

**Key Insight**: Scholardoc is a fully-adapted deployment with complete `/project:*` ecosystem. The sc:* commands provide zero value:
- `sc:help` → Helps with a system we're deprecating
- `sc:load/save` → Redundant with `/project:resume` and `/project:checkpoint`

**Phases**:
- Phases 1-3: Core optimizations (CLAUDE.md, ALL sc:*, framework) = **~35k tokens**
- Phase 4: Project command optimization = ~5-10k tokens
- Phase 5: MCP investigation and optimization = ~2-5k tokens
- **Total savings: ~42-50k tokens**

**Rationale**:
- Scholardoc has comprehensive project-specific commands for EVERYTHING
- sc:* system is being deprecated in favor of project-adapted commands via /init
- Zero global commands needed for a fully-adapted deployment
- Maximum token savings with easy rollback

---

## Baseline Note

**Clean session baseline**: 90k/200k (45%)
- The 172k figure was from a session WITH conversation history
- Token savings are measured against optimizable overhead, not total context
- Target: Reduce optimizable overhead significantly

---

## Optimization Breakdown

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| **1. Scholardoc CLAUDE.md** | 5.7k | ~1.7k | **~4.0k** |
| **2. Global sc:* commands** | 24.1k | 0k | **~24.1k** |
| **3. User ~/.claude framework** | 13.4k | ~6.8k | **~6.6k** |
| **4. Project commands** | 20.0k | ~13-15k | **~5-7k** |
| **5. MCP tools** | 22.0k | ~19-20k | **~2-3k** |
| **Total Savings** | | | **~42-50k tokens** |

**Optimizable overhead**: 85.2k → ~35-43k remaining (50-60% reduction achieved)

---

## Phase 1: Scholardoc CLAUDE.md Condensation

### Current State
- **Size**: 523 lines, 2,657 words, ~5.7k tokens
- **Problem**: Duplicates content already in docs/

### Changes

**1.1: Extract to Documentation Files**

```bash
cd ~/workspace/projects/scholardoc

# Create docs/VISION.md (extract 40 lines from CLAUDE.md)
# Content: Full vision and applications section

# Create docs/TESTING_METHODOLOGY.md (extract 132 lines)
# Content: Validation & Testing Methodology section

# Note: docs/AUTOMATION_SETUP.md already exists with Automation content!
```

**1.2: Replace with Condensed CLAUDE.md**

New structure (~100 lines):
```markdown
# ScholarDoc

## Quick Start for AI Assistants
1-6. [Keep existing quick start]

## Vision
[2-3 sentence summary]
See docs/VISION.md for full vision and applications.

## Current Phase
[Keep as-is]

## Stack
[Keep as-is, condensed]

## Commands
```bash
uv sync && uv run pytest
```
See docs/COMMANDS.md for full reference.

## Workflow & Rules
[5-10 lines summary]
See docs/RULES.md for complete guidelines.

## Automation
This project uses automated hooks and workflow commands.
See docs/AUTOMATION_SETUP.md for complete reference.

## Version Control
🔴 CRITICAL: Use feature branches, never commit to main.
See docs/GIT_WORKFLOW.md for branching strategy.

## Architecture
Key decisions in docs/adr/
- ADR-001: PDF library choice
- ADR-002: OCR pipeline architecture
- ADR-003: Line-break detection

## Validation & Testing
Follow systematic methodology to avoid procedural mistakes.
See docs/TESTING_METHODOLOGY.md for complete guide.
```

**Expected**: 523 lines → ~100 lines (81% reduction)
**Savings**: ~4.0k tokens

### Validation
- [ ] Start new session in scholardoc
- [ ] Verify references work (all docs/ files exist)
- [ ] Run `/project:plan` - should complete normally
- [ ] Check `/context` for ~4k token reduction

### Rollback
```bash
git checkout ~/workspace/projects/scholardoc/CLAUDE.md
```

---

## Phase 2: Complete sc:* Removal

### Current State
- **Total**: 25 commands, ~24.1k tokens
- **Usage**: ZERO invocations in scholardoc (has /project:* equivalents)

### Rationale for Complete Removal

Scholardoc has project-specific equivalents for EVERYTHING:

| sc:* Command | Scholardoc Equivalent |
|--------------|----------------------|
| sc:help | Project commands are self-documenting |
| sc:load | `/project:resume` |
| sc:save | `/project:checkpoint` |
| sc:implement | `/project:implement` |
| sc:test | `/project:tdd` |
| sc:research | `/project:explore` |
| sc:git | Native git workflows in CLAUDE.md |

**Why not keep sc:help?** It documents a system we're deprecating. Pointless overhead.

**Why not keep sc:load/save?** Scholardoc's `/project:resume` and `/project:checkpoint` are tailored to its workflow.

### Changes

**Disable ALL** (25 commands, ~24.1k tokens):

```bash
# Create disabled directory
mkdir -p ~/.claude/commands/sc.disabled

# Move ALL sc:* commands
cd ~/.claude/commands/sc
mv *.md ../sc.disabled/

# Verify empty
ls -1
# Should show nothing (empty directory)
```

**Expected**: 24.1k → 0k tokens (100% reduction)
**Savings**: ~24.1k tokens

### Validation
- [ ] Start new session in scholardoc
- [ ] Verify NO sc:* commands appear in `/help`
- [ ] Test `/project:resume` - session restore works
- [ ] Test `/project:checkpoint` - session save works
- [ ] Test `/project:plan`, `/project:implement` - core workflows work
- [ ] Check `/context` for ~24.1k token reduction

### Rollback
```bash
mv ~/.claude/commands/sc.disabled/*.md ~/.claude/commands/sc/
rmdir ~/.claude/commands/sc.disabled/
```

---

## Phase 3: User Framework (CLAUDE.balanced.md)

### Current State
- **Standard**: 13.4k tokens (loads all framework files)
- **Balanced**: 6.8k tokens (already exists, tested)

### Changes

**Implementation**:

```bash
# Backup current
cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.standard.backup

# Switch to balanced
cp ~/.claude/CLAUDE.balanced.md ~/.claude/CLAUDE.md
```

**What's Removed**:
- RULES.md (3.4k) - load on-demand via `/memory add ~/.claude/RULES.md`
- RESEARCH_CONFIG.md (2.8k) - load for research tasks only
- MODE_Introspection.md (419) - load for complex debugging

**What's Kept** (Essential):
- FLAGS.md (1.2k) ✅
- PRINCIPLES.md (575) ✅
- MODE_Orchestration.md (415) ✅
- **MODE_Task_Management.md (957)** ✅ **TodoWrite dependency**
- MODE_Token_Efficiency.md (884) ✅
- MCP_Serena.md (362) ✅

**Expected**: 13.4k → ~6.8k tokens (49% reduction)
**Savings**: ~6.6k tokens

### Validation
- [ ] Start new session
- [ ] Test TodoWrite functionality:
  ```
  TodoWrite: [
    {"content": "Test 1", "status": "pending", "activeForm": "Testing"},
    {"content": "Test 2", "status": "in_progress", "activeForm": "Working"},
    {"content": "Test 3", "status": "completed", "activeForm": "Done"}
  ]
  ```
- [ ] Verify task list displays correctly
- [ ] Verify essential workflows work
- [ ] Check `/context` for ~6.6k token reduction

### Rollback
```bash
cp ~/.claude/CLAUDE.standard.backup ~/.claude/CLAUDE.md
```

---

## Phase 4: Project Commands Optimization

### Current State
- **Total**: 20 project-specific commands in scholardoc/.claude/commands/
- **Size**: ~20.0k tokens total
- **Potential redundancies**: Multiple commands with overlapping functionality

### Analysis

**Large Commands Requiring Progressive Disclosure**:
- `init.md` (4.0k, 400 lines) - Comprehensive onboarding
- `improve.md` (2.5k, 250 lines) - Code quality improvements
- `review-pr.md` (1.9k, 200 lines) - Pull request review

**Potential Redundancies**:
- `diagnose.md` (1.7k, 180 lines) vs `analyze-logs.md` (1.7k, 170 lines)
  - Both analyze session logs for patterns
  - Both provide improvement recommendations
  - **Merge opportunity**: Combine into single `diagnose.md`

**Other Investigation Targets**:
- `checkpoint.md` vs session management (sc:save already handles this)
- `review.md` vs `review-pr.md` (different scopes but potential overlap)
- `implement.md` vs `improve.md` (implementation vs improvement)

### Changes

**4.1: Merge diagnose + analyze-logs**

```bash
cd ~/workspace/projects/scholardoc/.claude/commands

# Read both files to understand functionality
# Merge into single comprehensive diagnose.md
# Key features to preserve:
# - Signal file analysis (from diagnose.md)
# - Log pattern detection (from analyze-logs.md)
# - Root cause analysis (from diagnose.md)
# - Improvement recommendations (from both)

# Move redundant file
mv analyze-logs.md .disabled/analyze-logs.md.bak

# Git commit
git add .
git commit -m "refactor: merge analyze-logs into diagnose for efficiency"
```

**Expected**: 3.4k → ~2.0k tokens (41% reduction, ~1.4k savings)

**4.2: Progressive Disclosure for Large Commands**

```bash
# For init.md (4.0k tokens):
# Extract detailed sections to scholardoc/docs/
# - ONBOARDING_CHECKLIST.md (comprehensive setup steps)
# - DEVELOPMENT_STANDARDS.md (detailed coding standards)
# Keep: Quick start, critical workflows, references to docs/

# For improve.md (2.5k tokens):
# Extract to docs/IMPROVEMENT_WORKFLOWS.md
# Keep: Command syntax, common improvements, reference to full guide

# For review-pr.md (1.9k tokens):
# Extract to docs/PR_REVIEW_CHECKLIST.md
# Keep: Core review steps, reference to detailed checklist
```

**Expected**: 8.4k → ~4-5k tokens (40-50% reduction, ~3.4-4.4k savings)

**4.3: Investigate and Disable Redundancies**

Commands to evaluate:
- `checkpoint.md` - May be redundant with sc:save
- `pause.md` / `resume.md` - Check if used
- Any other low-usage commands

```bash
# Check command usage in project
grep -r "/project:" ~/workspace/projects/scholardoc/.claude/ --include="*.md"

# Move unused commands to .disabled/
mkdir -p ~/workspace/projects/scholardoc/.claude/commands/.disabled
mv [unused].md .disabled/
```

**Expected**: ~1-2k additional savings

### Total Phase 4 Savings

**Conservative**: ~5k tokens (25% reduction)
**Aggressive**: ~7-10k tokens (35-50% reduction)

### Validation
- [ ] Start new session in scholardoc
- [ ] Test `/project:diagnose` - verify merged functionality works
- [ ] Test `/project:init` - verify condensed version has all critical info
- [ ] Test `/project:improve` - verify workflow still clear
- [ ] Test `/project:review-pr` - verify PR reviews work
- [ ] Check `/context` for ~5-10k token reduction

### Rollback
```bash
cd ~/workspace/projects/scholardoc
git checkout .claude/commands/
# OR restore from backup:
cp -r .claude/commands/.disabled/*.md .claude/commands/
```

---

## Phase 5: MCP Investigation and Optimization

### Current State
- **Total MCP**: ~22.0k tokens at session start
- **Active servers**: serena, context7, sequential-thinking, ide (from /context output)
- **Unknown**: Actual usage patterns for each server

### Investigation Steps

**5.1: Check Context7 Usage**

```bash
# Check if Context7 is actually used in scholardoc sessions
# Look for library documentation lookups in recent logs

# Scholardoc stack: Python 3.11+, PyMuPDF, pytest, hypothesis
# Question: Do we actually look up library docs via Context7?

# If NOT used regularly:
# Disable context7 MCP plugin
# Savings: ~1.7k tokens
```

**5.2: Check IDE MCP Usage**

```bash
# IDE MCP provides VS Code integration features
# Check if scholardoc sessions use IDE-specific features

# If NOT used (CLI-only sessions):
# Disable ide MCP plugin
# Savings: ~1.3k tokens
```

**5.3: Check Sequential-Thinking Usage**

```bash
# Sequential MCP for complex multi-step reasoning
# Check if scholardoc work requires this level of analysis

# Decision: Likely KEEP (used for complex debugging, architecture)
# But verify through log analysis
```

**5.4: Check Serena Usage**

```bash
# Serena MCP for semantic code understanding and project memory
# Critical for scholardoc workflow (/project:load, /project:save use memories)

# Decision: MUST KEEP (core to project workflows)
```

### Investigation Commands

```bash
# List all active MCP servers
# (Already have from /context output)

# Check plugin directory
ls -la ~/.claude/plugins/marketplaces/claude-plugins-official/external_plugins/

# Each plugin has mcp.json configuration
# Check which are enabled by default vs project-specific

# To disable a plugin (example):
# mv ~/.claude/plugins/[...]/context7 ~/.claude/plugins/[...]/context7.disabled

# OR modify plugin configuration (safer, reversible)
# Edit plugin settings to disable specific servers
```

### Expected Changes

**Likely to Disable**:
- **context7** (~1.7k) - If not using library doc lookups regularly
- **ide** (~1.3k) - If using CLI-only (not VS Code features)

**Must Keep**:
- **serena** - Core to project memory and workflows
- **sequential-thinking** - Used for complex analysis tasks

**Total Potential Savings**: ~2-3k tokens (conservative estimate)

### Validation
- [ ] After disabling each MCP server:
- [ ] Start new session in scholardoc
- [ ] Verify project commands still work
- [ ] Test memory operations: list_memories, read_memory
- [ ] Test symbol operations (if Serena disabled - DON'T)
- [ ] Check `/context` for token reduction per server
- [ ] If any workflow breaks, re-enable that server

### Rollback
```bash
# Re-enable disabled MCP plugin
mv ~/.claude/plugins/[...]/context7.disabled ~/.claude/plugins/[...]/context7

# OR revert plugin configuration changes
git checkout ~/.claude/plugins/config.json
```

### Risk Assessment

**Phase 5 Risks**:
- **MEDIUM**: MCP servers may be auto-loaded for reasons we don't understand
- **MEDIUM**: Disabling may break subtle workflows not captured in validation
- **LOW**: Easy rollback (just re-enable plugin)

**Recommendation**: Execute Phase 5 LAST, after Phases 1-4 validated
**Approach**: Disable one server at a time, validate thoroughly before next

---

## Execution Checklist

### Pre-Execution
- [ ] Full backup of ~/.claude/ exists (from 2025-12-26)
- [ ] Full backup of scholardoc exists (tar.gz)
- [ ] Git status clean in scholardoc

### Execution Order

**Phase 1: Scholardoc CLAUDE.md**
1. [ ] cd ~/workspace/projects/scholardoc
2. [ ] Create docs/VISION.md with extracted content
3. [ ] Create docs/TESTING_METHODOLOGY.md with extracted content
4. [ ] Create docs/COMMANDS.md, docs/RULES.md, docs/GIT_WORKFLOW.md (progressive disclosure)
5. [ ] Replace CLAUDE.md with condensed version
6. [ ] Git commit: "refactor: condense CLAUDE.md via progressive disclosure"
7. [ ] **VALIDATE** in new session
8. [ ] Check `/context` for ~4k reduction

**Phase 2: Complete sc:* Removal**
1. [ ] mkdir -p ~/.claude/commands/sc.disabled
2. [ ] Move ALL 25 commands to sc.disabled/
3. [ ] Verify sc/ directory is empty
4. [ ] **VALIDATE** in new session - test /project:resume, /project:checkpoint
5. [ ] Check `/context` for ~24.1k reduction

**Phase 3: Framework Switch**
1. [ ] cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.standard.backup
2. [ ] cp ~/.claude/CLAUDE.balanced.md ~/.claude/CLAUDE.md
3. [ ] **VALIDATE** TodoWrite in new session
4. [ ] Check `/context` for ~6.6k reduction

**Phase 4: Project Commands**
1. [ ] cd ~/workspace/projects/scholardoc/.claude/commands
2. [ ] Read diagnose.md and analyze-logs.md completely
3. [ ] Merge into single comprehensive diagnose.md
4. [ ] Move analyze-logs.md to .disabled/
5. [ ] Apply progressive disclosure to init.md, improve.md, review-pr.md
6. [ ] Create corresponding docs/ files for extracted content
7. [ ] Check for other redundant commands and disable if unused
8. [ ] Git commit: "refactor: optimize project commands for token efficiency"
9. [ ] **VALIDATE** in new session
10. [ ] Check `/context` for ~5-10k reduction

**Phase 5: MCP Investigation**
1. [ ] Check plugin directory structure
2. [ ] Analyze which MCP servers are actually used
3. [ ] Disable context7 if unused (test thoroughly)
4. [ ] Disable ide if CLI-only sessions (test thoroughly)
5. [ ] **VALIDATE** after each disable
6. [ ] Check `/context` for ~2-3k reduction

### Post-Execution
- [ ] Start fresh session in scholardoc
- [ ] Run `/context` - verify significant token reduction
- [ ] Test TodoWrite - verify works
- [ ] Test /project:resume and /project:checkpoint (replaced sc:load/save)
- [ ] Test project commands: /project:plan, /project:implement, /project:diagnose
- [ ] Test merged diagnose command functionality
- [ ] Test condensed init, improve, review-pr commands
- [ ] Verify MCP servers work if kept, or workflows succeed without them
- [ ] Document actual savings achieved for each phase

---

## Success Criteria

**Phase 1-3 (Core Optimizations)**:
- [ ] Context usage reduced from 86% to ≤72%
- [ ] At least 25k tokens saved (target: ~28.5k)

**Phase 4-5 (Comprehensive Optimizations)**:
- [ ] Context usage reduced from 86% to ≤69%
- [ ] At least 35k tokens saved (target: ~35-43k)

**Functional Requirements** (All Phases):
- [ ] TodoWrite functionality working
- [ ] Session management (save/load) working
- [ ] No regressions in scholardoc workflows
- [ ] All kept project commands functional
- [ ] Merged diagnose command provides full functionality
- [ ] Progressive disclosure works (references to docs/ are accessible)
- [ ] MCP servers (if kept) work correctly
- [ ] Git history clean with clear commits

**Risk Management**:
- [ ] Each phase validated before proceeding to next
- [ ] Rollback tested and working for each phase
- [ ] No data loss or workflow breakage

---

## Expected Results

**After Phase 1-3 (Core)**:

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| Scholardoc CLAUDE.md | 5.7k | ~1.7k | **-4.0k** |
| Global sc:* | 24.1k | 0k | **-24.1k** |
| User framework | 13.4k | ~6.8k | **-6.6k** |
| **Phase 1-3 Total** | | | **~34.7k** |

**After Phase 4-5 (Comprehensive)**:

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| Project commands | 20.0k | ~13-15k | **-5-7k** |
| MCP tools | 22.0k | ~19-20k | **-2-3k** |
| **Phase 4-5 Additional** | | | **~7-10k** |

**Total Optimization**:
- **Total savings**: ~42-50k tokens
- **Optimizable overhead**: 85.2k → ~35-43k (50-60% reduction)
- **Context pressure**: HIGH → LOW

---

## Rollback Plan

If any phase fails:

**Full Restore (Nuclear)**:
```bash
# Restore user framework (Phase 3)
cp ~/.claude/CLAUDE.standard.backup ~/.claude/CLAUDE.md

# Restore sc commands (Phase 2)
mv ~/.claude/commands/sc.disabled/*.md ~/.claude/commands/sc/
rmdir ~/.claude/commands/sc.disabled/

# Restore scholardoc CLAUDE.md (Phase 1)
cd ~/workspace/projects/scholardoc
git checkout CLAUDE.md
git clean -fd docs/  # Remove new docs if needed

# Restore project commands (Phase 4)
git checkout .claude/commands/
# OR
cp -r .claude/commands/.disabled/*.md .claude/commands/

# Re-enable MCP servers (Phase 5)
mv ~/.claude/plugins/[...]/context7.disabled ~/.claude/plugins/[...]/context7
mv ~/.claude/plugins/[...]/ide.disabled ~/.claude/plugins/[...]/ide
```

**Per-Phase Rollback**: See each phase's rollback section above

**Incremental Rollback**: Can rollback individual phases without affecting others

---

## Next Steps After Execution

### Immediate (Week 1)
- Monitor for missing context or broken workflows
- Track if any disabled sc:* commands are needed
- Verify savings persist across multiple sessions

### Short-term (Week 2-4)
- Evaluate if any disabled commands should be restored
- Consider Phase 2 optimizations if needed

### Long-term (Future)
- **Implement architectural vision**: Project-adapted commands via /init
- See [PLUGIN-ARCHITECTURE-VISION.md](PLUGIN-ARCHITECTURE-VISION.md) for roadmap

---

## Files Modified

### Phase 1-3: New Files Created
- `~/workspace/projects/scholardoc/docs/VISION.md`
- `~/workspace/projects/scholardoc/docs/TESTING_METHODOLOGY.md`
- `~/workspace/projects/scholardoc/docs/COMMANDS.md`
- `~/workspace/projects/scholardoc/docs/RULES.md`
- `~/workspace/projects/scholardoc/docs/GIT_WORKFLOW.md`

### Phase 1-3: Modified Files
- `~/workspace/projects/scholardoc/CLAUDE.md` (523 → ~100 lines)
- `~/.claude/CLAUDE.md` (switched to balanced)

### Phase 1-3: Moved Files
- ALL 25 files: `~/.claude/commands/sc/*.md` → `sc.disabled/` (complete sc:* removal)

### Phase 4: New Files Created
- `~/workspace/projects/scholardoc/docs/ONBOARDING_CHECKLIST.md` (extracted from init.md)
- `~/workspace/projects/scholardoc/docs/DEVELOPMENT_STANDARDS.md` (extracted from init.md)
- `~/workspace/projects/scholardoc/docs/IMPROVEMENT_WORKFLOWS.md` (extracted from improve.md)
- `~/workspace/projects/scholardoc/docs/PR_REVIEW_CHECKLIST.md` (extracted from review-pr.md)

### Phase 4: Modified Files
- `~/workspace/projects/scholardoc/.claude/commands/diagnose.md` (merged with analyze-logs)
- `~/workspace/projects/scholardoc/.claude/commands/init.md` (condensed via progressive disclosure)
- `~/workspace/projects/scholardoc/.claude/commands/improve.md` (condensed via progressive disclosure)
- `~/workspace/projects/scholardoc/.claude/commands/review-pr.md` (condensed via progressive disclosure)

### Phase 4: Moved Files
- `~/workspace/projects/scholardoc/.claude/commands/analyze-logs.md` → `.disabled/`
- Potentially other unused commands → `.disabled/`

### Phase 5: Modified Configuration
- MCP plugin configuration (context7, ide disabled if unused)
- Plugin directories renamed to .disabled if servers removed

### Backup Files
- `~/.claude/CLAUDE.standard.backup`
- `~/workspace/projects/scholardoc/.claude/commands/.disabled/` (backup of removed commands)

---

**Plan Status**: READY FOR EXECUTION
**Scope**: Comprehensive 5-phase optimization with complete sc:* removal
**Expected Savings**: ~42-50k tokens (50-60% of optimizable overhead)
**Key Change**: Complete sc:* removal (not partial) - scholardoc has /project:* equivalents
**Estimated Time**:
- Phases 1-3: 45 minutes
- Phase 4: 30-45 minutes (merge, progressive disclosure)
- Phase 5: 15-30 minutes (investigation, testing)
- **Total: 90-120 minutes**
**Risk Level**:
- Phases 1-3: VERY LOW (validated approach, easy rollback)
- Phase 4: LOW (git-tracked, easy rollback)
- Phase 5: MEDIUM (MCP changes less understood, thorough testing required)
**Rollback Complexity**: SIMPLE (1-3 commands per phase, incremental rollback supported)
**Changelog**: See [OPTIMIZATION-CHANGELOG.md](OPTIMIZATION-CHANGELOG.md)
