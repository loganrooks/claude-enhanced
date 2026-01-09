# Context Optimization Analysis

**Date**: 2025-12-27
**Project**: scholardoc (via claude-enhanced)
**Current Context**: 172k/200k tokens (86%)
**Goal**: Reduce system overhead by 35% (~28k tokens)

---

## Current Context Breakdown

### Fixed Overhead (Cannot Optimize)
| Component | Tokens | % of Total | Notes |
|-----------|--------|------------|-------|
| System prompt | 3.3k | 1.7% | Built-in Claude Code prompts |
| System tools | 18.0k | 9.0% | Native tools (Bash, Read, Edit, etc.) |
| Custom agents | 465 | 0.2% | Agent metadata only |
| Messages | 63.7k | 31.9% | Conversation history |
| Autocompact buffer | 45.0k | 22.5% | Reserved for context management |
| **Subtotal** | **130.5k** | **65.3%** | **Not optimizable** |

### Optimizable Overhead
| Component | Tokens | % of Total | Optimization Potential |
|-----------|--------|------------|----------------------|
| **User sc:* commands** | 24.1k | 12.1% | HIGH - Can disable unused |
| **Project commands** | 20.0k | 10.0% | HIGH - Can disable unused |
| **User ~/.claude framework** | 13.4k | 6.7% | MEDIUM - Alternative configs exist |
| **Project CLAUDE.md** | 5.7k | 2.9% | MEDIUM - May have redundancy |
| **MCP tools** | 22.0k | 11.0% | LOW - May need most tools |
| **Subtotal** | **85.2k** | **42.7%** | **Target for 35% reduction** |

**Target Savings**: 35% of 85.2k = ~30k tokens
**New Optimizable Total**: ~55k tokens
**New Total Context**: ~142k tokens (~71% usage)

---

## Detailed Component Analysis

### 1. User SC Commands (24.1k tokens) - HIGHEST PRIORITY

**Current State**: All 25 commands loaded at session start

**Top Consumers**:
| Command | Tokens | Usage Frequency | Keep? |
|---------|--------|----------------|-------|
| sc:spec-panel | 4.4k | Rare (spec reviews) | ❌ Disable |
| sc:help | 2.0k | Low (reference only) | ✅ Keep |
| sc:brainstorm | 1.2k | Low (requirements discovery) | ❌ Disable |
| sc:workflow | 1.1k | Low (PRD workflows) | ❌ Disable |
| sc:implement | 1.0k | HIGH (feature work) | ✅ Keep |
| sc:reflect | 939 | Low (validation) | ❌ Disable |
| sc:improve | 929 | Medium (code quality) | ❌ Disable |
| sc:task | 923 | HIGH (complex tasks) | ✅ Keep |
| sc:estimate | 919 | Rare (planning) | ❌ Disable |
| sc:index | 892 | Rare (docs) | ❌ Disable |
| sc:spawn | 887 | Low (orchestration) | ❌ Disable |
| sc:explain | 883 | Medium (code explanation) | ❌ Disable |
| sc:select-tool | 873 | Low (tool selection) | ❌ Disable |
| sc:save | 867 | HIGH (session mgmt) | ✅ Keep |
| sc:cleanup | 848 | Low (refactoring) | ❌ Disable |
| sc:load | 842 | HIGH (session mgmt) | ✅ Keep |
| sc:troubleshoot | 807 | Medium (debugging) | ❌ Disable |
| sc:build | 790 | Low (build ops) | ❌ Disable |
| sc:design | 778 | Low (architecture) | ❌ Disable |
| sc:document | 773 | Low (docs) | ❌ Disable |
| sc:analyze | 766 | Medium (analysis) | ❌ Disable |
| sc:research | 738 | Rare (web research) | ❌ Disable |
| sc:test | 722 | Medium (testing) | ❌ Disable |
| sc:business-panel | 697 | Rare (strategy) | ❌ Disable |
| sc:git | 575 | HIGH (version control) | ✅ Keep |

**Recommended**: Keep 6 essential (help, implement, task, save, load, git) = ~6.2k tokens
**Disable**: 19 commands = ~17.9k tokens
**Savings**: ~17.9k tokens

### 2. Project Commands (20.0k tokens) - HIGH PRIORITY

**Current State**: All 20 commands loaded at session start

**Top Consumers**:
| Command | Tokens | Purpose | Keep? |
|---------|--------|---------|-------|
| init | 4.0k | Project onboarding | ✅ Keep |
| improve | 2.5k | Code quality workflow | ✅ Keep |
| review-pr | 1.9k | GitHub PR review | ✅ Keep |
| diagnose | 1.7k | Claude log analysis | ✅ Keep |
| analyze-logs | 1.7k | Log analysis | ⚠️ Redundant with diagnose? |
| create-pr | 1.3k | GitHub PR creation | ✅ Keep |
| auto | 1.1k | Autonomous workflow | ✅ Keep |
| plan | 756 | Planning workflow | ✅ Keep |
| signal | 625 | Signal capture | ✅ Keep |
| document | 601 | Documentation | ⚠️ Consider disable |
| resume | 524 | Resume work | ⚠️ Low usage |
| refactor | 523 | Refactoring | ⚠️ Low usage |
| checkpoint | 489 | Save progress | ⚠️ Redundant with save? |
| release | 488 | Release workflow | ⚠️ Low usage |
| debug | 455 | Debugging | ⚠️ Overlap with diagnose? |
| implement | 403 | Feature implementation | ⚠️ Redundant with improve? |
| review | 349 | Code review | ⚠️ Overlap with review-pr? |
| spike | 338 | Exploratory work | ⚠️ Low usage |
| tdd | 329 | Test-driven dev | ⚠️ Low usage |
| explore | 238 | Codebase exploration | ⚠️ Low usage |

**Analysis Needed**:
- Are diagnose/analyze-logs redundant?
- Is checkpoint redundant with sc:save?
- Is debug redundant with diagnose?
- Is implement redundant with improve?
- Is review redundant with review-pr?

**Conservative Estimate**: Keep 10-12 core commands, disable 8-10 low-usage
**Potential Savings**: ~5-7k tokens

### 3. User ~/.claude Framework (13.4k tokens) - MEDIUM PRIORITY

**Current Components**:
| File | Tokens | Essential? |
|------|--------|-----------|
| RULES.md | 3.4k | Medium - overlaps with PRINCIPLES |
| RESEARCH_CONFIG.md | 2.8k | Low - only for research tasks |
| MODE_Task_Management.md | 957 | HIGH - TodoWrite support |
| MODE_Token_Efficiency.md | 884 | HIGH - compression support |
| FLAGS.md | 1.2k | HIGH - behavioral flags |
| PRINCIPLES.md | 575 | HIGH - core philosophy |
| MODE_Introspection.md | 419 | Low - debugging only |
| MODE_Orchestration.md | 415 | HIGH - tool selection |
| MCP_Serena.md | 362 | HIGH - project memory |
| MCP_Morphllm.md | 331 | Low - bulk edits |
| MCP_Sequential.md | 330 | Medium - complex analysis |
| MCP_Context7.md | 303 | Low - doc lookup |
| MODE_DeepResearch.md | 301 | Low - research only |
| MODE_Brainstorming.md | 456 | Low - requirements discovery |
| CLAUDE.md | 684 | HIGH - entry point |

**Alternative Configs Already Prepared**:
- **CLAUDE.balanced.md** (~4.8k): Removes RULES, MODE_Introspection, RESEARCH_CONFIG, MODE_DeepResearch = ~6.6k savings
- **CLAUDE.minimal.md** (~2.6k): Keeps only core = ~10.8k savings (too aggressive)

**Recommended**: Switch to balanced mode
**Savings**: ~6.6k tokens

### 4. Project CLAUDE.md (5.7k tokens) - NEEDS ANALYSIS

**Current State**: Unknown - need to read and analyze for redundancy

**Questions**:
- Does it duplicate user ~/.claude framework content?
- Are there project-specific instructions that MUST stay?
- Can some be moved to on-demand loading?

**Analysis Required**: Read scholardoc/.claude/CLAUDE.md and identify optimization opportunities

**Estimated Savings**: 1-2k tokens (conservative)

### 5. MCP Tools (22.0k tokens) - LOW PRIORITY

**Current Servers**:
| Server | Tokens | Usage | Keep? |
|--------|--------|-------|-------|
| serena | ~10k | HIGH (semantic code, memory) | ✅ Keep |
| sequential-thinking | 1.5k | HIGH (complex analysis) | ✅ Keep |
| context7 | 1.7k | LOW (doc lookup) | ⚠️ Consider disable |
| ide | 1.3k | UNKNOWN | ⚠️ Evaluate |

**Analysis Needed**: Check MCP server actual usage patterns

**Conservative Estimate**: Disable context7 if rarely used
**Potential Savings**: ~1.7k tokens

---

## Optimization Strategy

### Phase 1: High-Impact, Low-Risk (Target: ~18k tokens)
1. **Disable 19 unused sc:* commands** (~17.9k savings)
   - Keep: help, implement, task, save, load, git
   - Disable: All others (move to .disabled/)
   - Risk: LOW - commands rarely used

2. **Switch to CLAUDE.balanced.md** (Not executed yet - analyze first)
   - Risk: MEDIUM - may lose needed functionality
   - Should test in new session first

### Phase 2: Medium-Impact, Requires Analysis (Target: ~7k tokens)
1. **Optimize project commands** (~5-7k savings)
   - Identify redundant commands
   - Disable low-usage commands
   - Risk: MEDIUM - need usage analysis

2. **Optimize project CLAUDE.md** (~1-2k savings)
   - Remove duplicate content
   - Move optional content to on-demand loading
   - Risk: LOW - project-specific

### Phase 3: Low-Impact, Optional (Target: ~2k tokens)
1. **Disable unused MCP servers** (~1.7k savings)
   - context7 if rarely used
   - Risk: LOW - can re-enable easily

### Total Potential Savings
- Phase 1: ~18k tokens
- Phase 2: ~7k tokens
- Phase 3: ~2k tokens
- **Total**: ~27k tokens (meets 35% reduction goal)

---

## Risk Assessment

### Critical Risks
1. **Breaking TodoWrite functionality** - MODE_Task_Management.md must stay
2. **Losing project memory** - Serena MCP must stay
3. **Breaking session management** - sc:save/load must stay
4. **Removing essential project commands** - Need usage analysis

### Mitigation Strategies
1. **Full backups before changes** (DONE for ~/.claude)
2. **Test in new session** before permanent changes
3. **Incremental approach** - Phase 1 first, evaluate, then Phase 2
4. **Easy rollback** - Keep all disabled files in .disabled/ folders
5. **Documentation** - Log all changes with restoration instructions

---

## Questions Requiring Investigation

### Project Commands Analysis
1. Is `analyze-logs` redundant with `diagnose`?
2. Is `checkpoint` redundant with `sc:save`?
3. Is `debug` redundant with `diagnose`?
4. Is `implement` redundant with `improve`?
5. Is `review` redundant with `review-pr`?
6. Which commands are actually used in scholardoc workflows?

### Project CLAUDE.md Analysis
1. What content is in scholardoc/.claude/CLAUDE.md?
2. Does it duplicate user ~/.claude framework?
3. What is project-specific vs. general?
4. What can be moved to on-demand loading?

### Framework Testing
1. Does CLAUDE.balanced.md preserve all essential functionality?
2. Should we test balanced mode before committing?
3. Are there edge cases where RULES.md or MODE_Introspection.md are critical?

### MCP Usage Analysis
1. Is context7 actually used in scholardoc workflows?
2. What does the ide MCP server provide?
3. Can we disable servers and re-enable on-demand?

---

## Recommended Next Steps

1. **Read and analyze** scholardoc/.claude/CLAUDE.md for optimization opportunities
2. **Read and analyze** project commands for redundancy and usage patterns
3. **Create detailed optimization plan** with specific file moves/edits
4. **Have plan reviewed** by another agent for quality/safety
5. **Get user approval** before executing any changes
6. **Execute Phase 1** (sc:* optimization) first
7. **Test in new session** to verify savings and functionality
8. **Evaluate results** before proceeding to Phase 2
9. **Document all changes** with rollback instructions

---

## Success Criteria

- [ ] Context usage reduced from 86% to ~71% (172k → ~142k)
- [ ] System overhead reduced by 35% (~30k tokens saved)
- [ ] All essential functionality preserved (TodoWrite, session mgmt, project workflows)
- [ ] Easy rollback capability maintained
- [ ] Changes documented for future reference
- [ ] No breaking changes to scholardoc workflows
