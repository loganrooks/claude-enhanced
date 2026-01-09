# Context Optimization Session - 2025-12-27

## Session Summary

**Goal**: Reduce Claude Code context usage from 86% (172k/200k tokens) to 65-69% through comprehensive optimization

**Outcome**: Created and user-approved comprehensive 5-phase optimization plan
- Expected savings: ~35-43k tokens (41-50% of optimizable overhead)
- Final context target: 65-69% (down from 86%)
- Execution time: 90-120 minutes

## Key Discoveries

### Phase 0: Discovery
- Scholardoc CLAUDE.md is 10x too large (523 lines vs ~100 recommended)
- Contains 260+ lines duplicating content already in docs/AUTOMATION_SETUP.md
- ZERO sc:* command usage detected in scholardoc
- All 25 sc:* commands load at session start (not progressive like Skills)

### Phase 0.5: Validation
- **Critical finding**: Several sc:* commands ARE valuable for other projects (task, implement, git, research, brainstorm)
- User's architectural vision: /init should GENERATE project-adapted commands from templates
- Decision: Option B (aggressive) - keep only help/load/save globally, implement proper architecture later
- CLAUDE.balanced.md verified to include MODE_Task_Management.md (TodoWrite dependency)

### Additional Optimizations (Option C)
- Project commands have redundancies: diagnose.md + analyze-logs.md both analyze logs (~1.7k each)
- Large project commands need progressive disclosure: init.md (4.0k), improve.md (2.5k), review-pr.md (1.9k)
- MCP servers may be unused: context7 (~1.7k), ide (~1.3k) can potentially be disabled

## Architectural Vision

**Problem**: Global commands loaded for all sessions regardless of project needs
**Vision**: /init generates project-adapted commands from templates
**Benefits**: 
- Stack-specific commands (python-tdd, react-frontend, django-api)
- Saves 20-30k additional tokens per project
- Better alignment with project workflows

See: claudedocs/PLUGIN-ARCHITECTURE-VISION.md for full roadmap

## Approved Plan

### Phase 1: Scholardoc CLAUDE.md (~4k savings)
- Extract content to docs/ files (VISION.md, TESTING_METHODOLOGY.md, etc.)
- Condense from 523 lines to ~100 lines via progressive disclosure

### Phase 2: Global sc:* commands (~20.6k savings)
- Keep only: help.md, load.md, save.md
- Disable 22 commands → sc.disabled/

### Phase 3: Framework switch (~6.6k savings)
- Switch to CLAUDE.balanced.md
- Removes RULES.md, RESEARCH_CONFIG.md, MODE_Introspection.md

### Phase 4: Project commands (~5-10k savings)
- Merge diagnose.md + analyze-logs.md → single comprehensive diagnose.md
- Progressive disclosure for init.md, improve.md, review-pr.md
- Investigate and disable unused commands

### Phase 5: MCP optimization (~2-3k savings)
- Investigate context7, ide usage in scholardoc
- Disable if unused (test thoroughly)
- Keep serena (critical) and sequential-thinking (used for analysis)

## Critical Learnings

### Process Improvements
1. **Always follow proper workflow**: Explore → Plan → Review → Execute
2. **Evidence-based decisions**: Don't optimize based on assumptions, gather data first
3. **Validation gates**: Test after each phase before proceeding
4. **Consider cross-project value**: Don't disable features used elsewhere

### Technical Insights
1. **Custom commands vs Skills**: Commands load ALL content at start, Skills use progressive disclosure
2. **Progressive disclosure pattern**: Reference docs/ instead of inline content
3. **MCP via plugins**: Servers configured via plugin system, not settings.json
4. **Incremental optimization**: Can execute phases independently with separate rollbacks

## Next Session

Execute approved 5-phase optimization plan:
1. Start with Phase 1 (scholardoc CLAUDE.md)
2. Validate each phase before proceeding
3. Document actual savings achieved
4. Monitor for regressions

## Files Created
- claudedocs/context-optimization-analysis.md
- claudedocs/discovery-findings.md
- claudedocs/phase-0.5-validation-findings.md
- claudedocs/FINAL-OPTIMIZATION-PLAN.md
- claudedocs/PLUGIN-ARCHITECTURE-VISION.md

## Status
✅ Plan approved by user
⏳ Ready for execution
