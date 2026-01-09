# Context Optimization Proposal v2.0

**Date**: 2025-12-27
**Project**: scholardoc (via claude-enhanced)
**Status**: DRAFT - Awaiting Review & Approval
**Current Context**: 172k/200k tokens (86%)
**Goal**: Reduce to ~70% (~140k tokens) through systematic overhead reduction

---

## Executive Summary

This proposal outlines a **systematic, evidence-based approach** to reducing Claude Code context overhead by ~35% without compromising functionality. Unlike a hasty optimization, this follows best practices from official Claude Code documentation:

1. **Explore**: Analyze actual usage patterns
2. **Plan**: Create evidence-based optimization strategy
3. **Review**: Have another agent validate the plan
4. **Execute**: Implement approved optimizations incrementally
5. **Validate**: Test each change before proceeding

**Key Principle** (from `docs/claude-md-best-practices-updated-2025-12-09.md`):
> "Think of /init as a starting point, not a finished product... we think you should spend some time thinking very carefully about every single line that goes into it."

This same principle applies to optimization - we must think carefully about what we remove.

---

## Current State Analysis

### Context Breakdown (from /context output)

| Component | Tokens | % | Optimizable? |
|-----------|--------|---|--------------|
| **Fixed Overhead** |
| System prompt | 3.3k | 1.7% | ❌ No |
| System tools | 18.0k | 9.0% | ❌ No |
| Custom agents | 465 | 0.2% | ❌ No |
| Messages | 63.7k | 31.9% | ⚠️ Via /compact only |
| Autocompact buffer | 45.0k | 22.5% | ❌ No |
| **Optimizable Overhead** |
| User sc:* commands | 24.1k | 12.1% | ✅ Yes |
| Project commands | 20.0k | 10.0% | ✅ Yes |
| User ~/.claude framework | 13.4k | 6.7% | ✅ Yes |
| Project CLAUDE.md | 5.7k | 2.9% | ✅ Yes |
| MCP tools | 22.0k | 11.0% | ✅ Yes |
| **Total** | **172k** | **86%** | |
| **Optimizable** | **85.2k** | **42.7%** | |

**Target**: 35% reduction in optimizable overhead = ~30k token savings
**Result**: ~142k total context (~71% usage) with ~58k buffer remaining

---

## Critical Knowledge Gaps

Before optimizing, we MUST answer:

### 1. Custom Commands Usage (sc:* and project commands)

**What we DON'T know**:
- Which sc:* commands are actually invoked in scholardoc workflows?
- Which project commands are essential vs. rarely used?
- Are there redundancies between sc:* and project commands?

**How to discover**:
```bash
# Search scholardoc session memories for command invocations
mcp__serena__search_for_pattern --pattern "/sc:|/project:" --relative_path ".serena/memories"

# Check project CLAUDE.md for command references
grep -r "/sc:\|/project:" ~/workspace/projects/scholardoc/.claude/

# Review project workflow documentation
find ~/workspace/projects/scholardoc/docs -name "*workflow*" -o -name "*guide*"
```

### 2. CLAUDE.md Content Analysis

**What we DON'T know**:
- What's in scholardoc's 5.7k token CLAUDE.md?
- How much is project-specific vs. duplicating user ~/.claude framework?
- What can be moved to progressive disclosure (docs/)?

**How to discover**:
```bash
# Read and analyze scholardoc CLAUDE.md
read ~/workspace/projects/scholardoc/.claude/CLAUDE.md

# Compare with user framework for duplication
diff -u ~/.claude/CLAUDE.md ~/workspace/projects/scholardoc/.claude/CLAUDE.md
```

### 3. MCP Server Usage

**What we DON'T know**:
- Which MCP servers are actually used in scholardoc workflows?
- Can context7 be disabled? (appears unused based on tokens)
- What does the "ide" MCP server provide?

**How to discover**:
```bash
# List active MCP servers
/mcp

# Search for MCP tool usage in memories
mcp__serena__search_for_pattern --pattern "mcp__" --relative_path ".serena/memories"
```

### 4. Actual vs. Perceived Usage

**What we DON'T know**:
- Commands marked "HIGH usage" - are they actually high?
- Commands marked "LOW usage" - could they be zero usage?

**How to discover**:
- Review session memories in both projects
- Check git history for command additions/modifications
- Interview user about actual workflow patterns

---

## Understanding the Architecture

### Custom Commands vs Skills (Critical Distinction)

From `docs/slash-commands-reference-2025-12-11.md` and `docs/skills-guide-updated-2025-12-09.md`:

| Aspect | Custom Commands (sc:*) | Skills |
|--------|----------------------|--------|
| **Loading** | ALL content at session start | Progressive: metadata → SKILL.md → files |
| **Token Cost** | Full content every session | 50-200 tokens initially |
| **Location** | `~/.claude/commands/` | `~/.claude/skills/` |
| **Structure** | Single .md file | Directory with SKILL.md + resources |
| **Discovery** | Explicit invocation | Automatic (context-based) |

**Critical Insight**: The sc:* commands are **NOT Skills** - they are **Custom Commands** that load fully at session start. This is why they consume 24.1k tokens before any work begins.

### How Custom Commands Are Loaded

From `docs/slash-commands-reference-2025-12-11.md:518`:
> "Character budget:** 15,000 characters default for command descriptions in context. Set via `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable."

The SlashCommand tool loads:
1. All command metadata (name, description)
2. Full command content (for tool to execute)
3. Limited by character budget, not file count

### CLAUDE.md Loading Behavior

From `docs/claude-md-best-practices-updated-2025-12-09.md`:

> **System-reminder discovery** (HumanLayer Research, November 25, 2025):
> Claude Code injects: `<system-reminder>IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.</system-reminder>`

**Implications**:
- Non-universal instructions get ignored anyway
- Bloated CLAUDE.md = worse performance, not just tokens
- ~150-200 instruction limit (including ~50 from system = ~100-150 available)
- Recommendation: <500 tokens, <300 lines

### MCP Token Consumption

From `docs/cost-optimization-guide-updated-2025-12-09.md:368-382`:

> MCP servers consume significant context just by being enabled:
> - GitHub: ~26,000 tokens (35 tools)
> - Slack: ~21,000 tokens (11 tools)
> - **A typical five-server setup consumes ~55K tokens before you type anything**

**Solution**: Tool Search Tool (85% reduction), but only available in API with beta flag.

---

## Proposed Optimization Strategy

### Phase 0: Discovery & Analysis (THIS PHASE)

**Goal**: Gather evidence before making changes

**Tasks**:
1. ✅ Read official Claude Code documentation
2. ⏳ Analyze scholardoc CLAUDE.md content
3. ⏳ Analyze project command usage patterns
4. ⏳ Identify sc:* command usage in both projects
5. ⏳ Review MCP server actual usage
6. ⏳ Document findings with evidence

**Deliverable**: Evidence-based optimization plan with specific file changes

### Phase 1: Low-Risk, High-Impact Optimizations

**Target**: ~18k token savings

**1.1: Disable Unused SC Commands** (~17.9k tokens)

**Evidence Required**:
- Search session memories for `/sc:` invocations
- Identify zero-use commands in last 30 days
- Confirm essential commands: help, load, save, task, implement, git

**Implementation**:
```bash
mkdir -p ~/.claude/commands/sc.disabled
# Move ONLY confirmed-unused commands
mv ~/.claude/commands/sc/{list-of-unused}.md ~/.claude/commands/sc.disabled/
```

**Validation**:
- Start new session
- Run `/help` to verify essential commands remain
- Test `/sc:load`, `/sc:save`, `/sc:task` functionality
- Check token reduction via `/context`

**Rollback**:
```bash
mv ~/.claude/commands/sc.disabled/*.md ~/.claude/commands/sc/
```

### Phase 2: Framework Optimization

**Target**: ~6.6k token savings

**2.1: Switch to CLAUDE.balanced.md** (exists, already prepared)

**Evidence Required**:
- Confirm MODE_Task_Management.md is loaded (TodoWrite dependency)
- Confirm MODE_Token_Efficiency.md is loaded (compression support)
- Review RULES.md for non-redundant content
- Test in new session before committing

**Implementation**:
```bash
# Already exists: ~/.claude/CLAUDE.balanced.md
# Test first in new session, then if successful:
cp ~/.claude/CLAUDE.md ~/.claude/CLAUDE.standard.backup
cp ~/.claude/CLAUDE.balanced.md ~/.claude/CLAUDE.md
```

**Validation**:
- Start new session in scholardoc
- Verify TodoWrite works
- Verify essential workflows function
- Check /context for token reduction

**Rollback**:
```bash
cp ~/.claude/CLAUDE.standard.backup ~/.claude/CLAUDE.md
```

### Phase 3: Project-Specific Optimization

**Target**: ~6-8k token savings

**3.1: Optimize scholardoc CLAUDE.md** (1-2k tokens)

**Evidence Required**:
- Read current content
- Identify duplication with user ~/.claude framework
- Find content suitable for progressive disclosure (move to docs/)

**Implementation**:
- TBD based on content analysis

**3.2: Optimize Project Commands** (5-7k tokens)

**Evidence Required**:
- Identify redundant commands (analyze-logs vs diagnose, etc.)
- Confirm low/zero usage commands
- Check for commands that could merge

**Implementation**:
- TBD based on usage analysis

### Phase 4: MCP Optimization (Optional)

**Target**: ~1.7k tokens

**4.1: Disable context7 MCP** (if unused)

**Evidence Required**:
- Confirm zero usage in session memories
- Verify no project dependencies

**Implementation**:
```bash
/mcp
# Disable context7 server
```

**Validation**:
- Test essential workflows
- Verify no regressions

---

## Risk Assessment

### Critical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking TodoWrite | Low | Critical | Keep MODE_Task_Management.md |
| Losing project memory | Low | Critical | Never touch Serena MCP |
| Breaking session mgmt | Low | Critical | Keep sc:save/load/task |
| Removing essential commands | Medium | High | Evidence-based analysis first |
| CLAUDE.md over-optimization | Medium | Medium | Test balanced mode first |

### Rollback Plan

Each phase has explicit rollback commands. Additionally:

**Full Restore**:
```bash
# User framework (already backed up)
cp ~/.claude/backups/pre-optimization-20251226-132225/*.md ~/.claude/

# SC commands
mv ~/.claude/commands/sc.disabled/*.md ~/.claude/commands/sc/
rmdir ~/.claude/commands/sc.disabled/

# Project (if modified)
git -C ~/workspace/projects/scholardoc checkout .claude/
```

---

## Questions for Review Agent

1. **Completeness**: Does this proposal address all major token sources?
2. **Safety**: Are the rollback strategies sufficient?
3. **Evidence**: Is the discovery phase thorough enough?
4. **Incrementality**: Should we add more checkpoints between phases?
5. **Missing Risks**: What risks haven't been considered?

---

## Questions for User

1. **Usage Patterns**: Which of these workflows do you actually use?
   - `/sc:brainstorm` for requirements discovery
   - `/sc:spec-panel` for specification reviews
   - `/sc:business-panel` for business strategy
   - `/sc:research` for web research
   - `/sc:improve` vs `/project:improve` (redundant?)

2. **Project Commands**: Which project commands are essential?
   - Do you use `/project:diagnose` AND `/project:analyze-logs`? (seem redundant)
   - Is `/project:checkpoint` redundant with `/sc:save`?
   - Is `/project:review` different from `/project:review-pr`?

3. **Tolerance**: How much functionality are you willing to trade for token savings?
   - Conservative: Keep anything possibly useful
   - Moderate: Remove confirmed low-usage
   - Aggressive: Keep only essentials

4. **Workflow**: What does a typical scholardoc session look like?
   - Which commands do you invoke regularly?
   - Which MCP servers do you actually use?

---

## Success Criteria

- [ ] Context usage reduced from 86% to ≤71% (172k → ≤142k tokens)
- [ ] At least 30k tokens saved (35% of optimizable overhead)
- [ ] All essential workflows preserved and tested
- [ ] TodoWrite functionality intact
- [ ] Session management (save/load) working
- [ ] Easy rollback capability maintained
- [ ] No breaking changes to scholardoc workflows
- [ ] Changes documented with restoration instructions

---

## Next Steps

1. **Immediate**: Have this proposal reviewed by another agent
2. **After Review**: Address feedback and revise plan
3. **After User Approval**: Execute Phase 0 (Discovery)
4. **After Discovery**: Update plan with evidence-based recommendations
5. **Incremental Execution**: One phase at a time with validation gates

---

## References

### Official Claude Code Documentation Cited

1. **`docs/slash-commands-reference-2025-12-11.md`**
   - Custom commands vs Skills distinction (lines 577-595)
   - SlashCommand tool character budget (line 518)
   - Command loading behavior

2. **`docs/skills-guide-updated-2025-12-09.md`**
   - Progressive disclosure architecture (lines 88-117)
   - Skills vs other mechanisms comparison (lines 377-389)

3. **`docs/session-context-guide-2025-12-11.md`**
   - Context management best practices
   - /compact vs /clear guidance (lines 51-169)
   - Lost-in-the-middle problem (lines 63-75)

4. **`docs/claude-md-best-practices-updated-2025-12-09.md`**
   - System-reminder discovery (lines 40-61)
   - Instruction limits research (lines 62-70)
   - Token guidance: <500 tokens, <150 instructions (lines 306-318)

5. **`docs/cost-optimization-guide-updated-2025-12-09.md`**
   - MCP token consumption patterns (lines 368-382)
   - Tool Search Tool for MCP optimization (lines 383-428)
   - Context management strategies (lines 270-362)

### Community Best Practices

- **HumanLayer Research** (November 25, 2025): System-reminder behavior
- **Community Consensus**: Reset context every ~20 iterations

---

## Appendix: What We Changed Our Mind About

### Original Hasty Approach (REJECTED)

❌ **What we did**: Immediately disabled 19 sc:* commands without analysis
❌ **Why it was wrong**: No evidence of which commands are actually used
❌ **What we learned**: "Spend time thinking very carefully about every single line"

### Evidence-Based Approach (CURRENT)

✅ **Phase 0**: Discover actual usage patterns first
✅ **Evidence-driven**: Only remove what's proven unused
✅ **Incremental**: Test each change before proceeding
✅ **Reviewable**: Get another agent to validate the plan
✅ **User-approved**: Don't execute without user sign-off

---

**Proposal Status**: DRAFT - Awaiting Agent Review
**Next Action**: Submit to review agent for quality/safety validation
**Timeline**: No execution until user approves reviewed plan
