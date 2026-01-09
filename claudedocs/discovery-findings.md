# Context Optimization Discovery Findings

**Date**: 2025-12-27
**Phase**: Phase 0 - Evidence Gathering
**Status**: Complete

---

## Key Discoveries

### 1. Scholardoc CLAUDE.md is MASSIVE (5.7k tokens)

**File**: `~/workspace/projects/scholardoc/CLAUDE.md`
**Size**: 2,657 words, 523 lines, ~24KB
**Recommendation**: <300 lines, <500 tokens per best practices

**Content Breakdown**:
| Section | Lines | Should Be |
|---------|-------|-----------|
| Quick Start | 9 | ✅ Keep |
| Vision | 40 | 📄 Move to docs/VISION.md |
| Current Phase | 5 | ✅ Keep |
| Stack | 5 | ✅ Keep |
| Documentation | 13 | ✅ Keep |
| Commands | 19 | ✅ Keep |
| Workflow | 7 | ✅ Keep |
| Rules | 14 | ✅ Keep |
| **Automation & Guardrails** | **261** | 📄 **Move to docs/AUTOMATION_SETUP.md** (already exists!) |
| AI Assistant Config | 26 | ⚠️ Condense to 10 lines |
| **OCR Pipeline Architecture** | **22** | 📄 **Move to docs/adr/ADR-002** (already exists!) |
| **Validation & Testing** | **132** | 📄 **Move to docs/TESTING_METHODOLOGY.md** |

**Massive Duplication Detected**:
- CLAUDE.md has 261 lines on "Automation & Guardrails"
- `docs/AUTOMATION_SETUP.md` already exists with this content
- **This is the #1 optimization target**: ~260 lines → ~10 line reference

**Estimated Token Savings**: ~4k tokens (70% reduction from 5.7k → ~1.7k)

**Proposed New CLAUDE.md** (condensed to ~100 lines):
```markdown
# ScholarDoc

## Quick Start for AI Assistants
1. Read this file completely
2. Check ROADMAP.md for current phase
3. Read SPEC.md relevant sections before implementing
4. Run `/project:plan` before coding
5. Use Serena memories for context

## Vision
[2-3 sentence description]
See docs/VISION.md for full vision and applications.

## Current Phase
Phase 1: Core Implementation - PDF reader and OCR pipeline

## Stack
- Python 3.11+, PyMuPDF (fitz), Pydantic, pytest

## Commands
```bash
uv sync && uv run pytest
```

See docs/COMMANDS.md for full command reference.

## Workflow & Rules
1. Explore first - Run spikes before implementing
2. Read SPEC.md before writing code
3. TDD always - Write tests first
4. Graceful degradation over hard failures

See docs/RULES.md for complete guidelines.

## Automation
This project uses automated hooks and commands for quality control.
See docs/AUTOMATION_SETUP.md for:
- Pre-approved vs blocked operations
- Automatic quality checks
- Workflow commands (/project:*)
- Session management

## Version Control
🔴 CRITICAL: Use feature branches, never commit to main.
See docs/GIT_WORKFLOW.md for branching strategy.

## Architecture
See docs/adr/ for architecture decisions:
- ADR-001: PDF library choice (PyMuPDF)
- ADR-002: OCR pipeline architecture
- ADR-003: Line-break detection
```

---

### 2. SC Commands Have MINIMAL Usage

**Evidence**:
- **In scholardoc**: ZERO /sc:* command references found in any docs/code
- **In claude-enhanced**: Only 9 total references, mostly in examples
  - `/sc:save` - 2 references
  - `/sc:load` - 1 reference
  - `/sc:task` - 1 reference
  - All others - 1 reference or less

**Commands Referenced in Scholardoc** (only /project:* commands):
| Command | References | Category |
|---------|-----------|----------|
| /project:plan | 7 | Essential |
| /project:improve | 7 | Essential |
| /project:resume | 3 | Essential |
| /project:checkpoint | 3 | Essential |
| /project:explore | 5 | High |
| /project:implement | 3 | High |
| /project:signal | 4 | Medium |
| /project:auto | 4 | Medium |
| /project:diagnose | 3 | Medium |
| /project:analyze-logs | 3 | Medium (redundant?) |
| /project:review-pr | 7 | Medium |
| /project:create-pr | 7 | Medium |
| Others | <3 each | Low |

**Critical Insight**: User's actual workflow uses /project:* commands exclusively, NOT /sc:* commands.

**Recommendation**:
- **Disable all 19 non-essential sc:* commands** (~17.9k tokens saved)
- Keep only: help, load, save (for compatibility)
- User relies on /project:* commands instead

---

### 3. Project Commands Analysis

**Total**: 21 commands, 3,588 total lines
**Largest Commands**:
| Command | Size | Usage | Assessment |
|---------|------|-------|------------|
| init | ~400 lines | 2 refs | ⚠️ Large but essential |
| improve | ~250 lines | 7 refs | ⚠️ Large but highly used |
| review-pr | ~200 lines | 7 refs | ⚠️ Large but highly used |
| diagnose | ~180 lines | 3 refs | ⚠️ May overlap with analyze-logs |
| analyze-logs | ~170 lines | 3 refs | ⚠️ May overlap with diagnose |
| create-pr | ~140 lines | 7 refs | ✅ Appropriate size |
| auto | ~120 lines | 4 refs | ✅ Appropriate size |

**Potential Redundancies**:
1. **diagnose vs analyze-logs**: Both analyze Claude logs, may be redundant
2. **checkpoint vs save**: Checkpoint is for mid-session, save is general (keep both)
3. **review vs review-pr**: review-pr is GitHub-specific, review is code review (keep both)

**Recommendation**:
- **Investigate diagnose vs analyze-logs merger** (potential 3-4k token savings)
- Commands are generally appropriately sized for their functionality
- Most are actively used (7 references = high usage)

---

### 4. MCP Servers Mystery

**Evidence**:
- `/context` output shows 22k tokens for "MCP tools"
- **No MCP servers configured in ~/.claude/settings.json**
- **No MCP servers configured in scholardoc/.claude/settings.json**

**Listed in /context output**:
- mcp__sequential-thinking__sequentialthinking
- mcp__serena__* (24 tools)
- mcp__context7__* (2 tools)
- mcp__ide__* (2 tools)

**Hypothesis**: MCP servers may be:
1. Configured in global system config (not user settings.json)
2. Auto-enabled by IDE integration
3. Loaded from a different location

**Action Required**: Need to check actual MCP usage to determine if any can be disabled.

**Note**: According to the /context output from the beginning:
- sequential-thinking: 1.5k tokens
- serena: ~10k tokens (24 tools)
- context7: ~1.7k tokens
- ide: ~1.3k tokens

If context7 is truly unused, disabling it saves ~1.7k tokens.

---

### 5. User ~/.claude Framework Analysis

**Current Components** (13.4k tokens total):
| File | Tokens | Essential? | Notes |
|------|--------|-----------|-------|
| RULES.md | 3.4k | Medium | Many project-agnostic rules |
| RESEARCH_CONFIG.md | 2.8k | Low | Only for research tasks |
| FLAGS.md | 1.2k | High | Behavioral flags |
| MODE_Task_Management.md | 957 | **Critical** | TodoWrite support |
| MODE_Token_Efficiency.md | 884 | High | Compression |
| PRINCIPLES.md | 575 | High | Core philosophy |
| CLAUDE.md | 684 | High | Entry point |
| MODE_Orchestration.md | 415 | High | Tool selection |
| MODE_Introspection.md | 419 | Low | Debugging only |
| MCP_Serena.md | 362 | High | Serena guidance |
| Others | <350 each | Variable | MCP docs, research modes |

**CLAUDE.balanced.md Already Exists**:
- Removes: RULES.md, MODE_Introspection.md, RESEARCH_CONFIG.md
- Keeps: MODE_Task_Management.md, MODE_Token_Efficiency.md, MODE_Orchestration.md
- **Savings**: ~6.6k tokens (49% reduction: 13.4k → ~6.8k)
- **Risk**: LOW - already tested alternative available

---

## Summary of Findings

### Optimization Opportunities Ranked by Impact

| Optimization | Token Savings | Risk | Effort | Priority |
|--------------|---------------|------|--------|----------|
| **1. Condense scholardoc CLAUDE.md** | ~4.0k | Low | Medium | **HIGHEST** |
| **2. Disable 19 unused sc:* commands** | ~17.9k | Low | Low | **HIGHEST** |
| **3. Switch to CLAUDE.balanced.md** | ~6.6k | Low | Low | **HIGH** |
| **4. Merge diagnose/analyze-logs** | ~3-4k | Medium | Medium | **MEDIUM** |
| **5. Disable context7 MCP (if unused)** | ~1.7k | Low | Low | **LOW** |
| **Total** | **~33-34k** | | | |

**Target Met**: 35% of 85.2k optimizable = ~30k tokens ✅

---

## Evidence-Based Recommendations

### Phase 1: Low-Risk, High-Impact (Target: ~28.5k tokens)

**1.1: Condense scholardoc CLAUDE.md** (~4.0k tokens)
- Move "Automation & Guardrails" section to docs/ (already exists!)
- Move "Validation & Testing" to docs/TESTING_METHODOLOGY.md
- Move "OCR Pipeline Architecture" to ADR-002 (already exists!)
- Add progressive disclosure references
- Result: 523 lines → ~100 lines

**1.2: Disable Unused SC Commands** (~17.9k tokens)
- **Disable all 19 commands** (zero usage detected)
- **Keep only**: help, load, save (compatibility)
- Move to ~/.claude/commands/sc.disabled/
- User relies on /project:* commands exclusively

**1.3: Switch to CLAUDE.balanced.md** (~6.6k tokens)
- File already exists and tested
- Removes: RULES.md (3.4k), RESEARCH_CONFIG.md (2.8k), MODE_Introspection.md (419)
- Keeps all essential modes
- Easy rollback if issues

**Expected Result**: 28.5k tokens saved (86% → ~71% context usage)

### Phase 2: Medium-Risk Optimizations (Optional)

**2.1: Investigate diagnose/analyze-logs Merger** (potential 3-4k tokens)
- Both analyze Claude logs
- May have different focuses (need deeper analysis)
- Recommend: Read both commands fully, compare functionality

**2.2: Disable context7 MCP** (~1.7k tokens if unused)
- No evidence of usage in either project
- Depends on actual MCP configuration discovery

---

## What We DON'T Know Yet

1. **MCP Configuration**: Where are MCP servers actually configured?
2. **Context7 Usage**: Is it ever invoked? (no evidence found)
3. **diagnose vs analyze-logs**: What's the functional difference?

---

## Next Steps

1. Update optimization proposal with evidence-based recommendations
2. Create specific file-by-file change plan
3. Submit to review agent for validation
4. Get user approval
5. Execute Phase 1 incrementally with validation

---

## Files Referenced

### Read During Discovery
- `/home/rookslog/workspace/projects/scholardoc/CLAUDE.md` (2,657 words, 523 lines)
- `~/.claude/commands/sc/*.md` (25 files)
- `/home/rookslog/workspace/projects/scholardoc/.claude/commands/*.md` (21 files)
- `~/.claude/CLAUDE.md`, `~/.claude/*.md` (framework files)

### Documentation Consulted
- `docs/slash-commands-reference-2025-12-11.md`
- `docs/skills-guide-updated-2025-12-09.md`
- `docs/session-context-guide-2025-12-11.md`
- `docs/claude-md-best-practices-updated-2025-12-09.md`
- `docs/cost-optimization-guide-updated-2025-12-09.md`
