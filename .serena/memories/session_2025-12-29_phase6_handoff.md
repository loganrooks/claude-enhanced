# Session Handoff: Context Optimization Phase 6

**Date**: 2025-12-29
**Status**: Phase 5 COMPLETE, Phase 6 IDENTIFIED

---

## Completed Work (Phases 1-5)

### Phase 1-3 (Previous Session): ~34.7k tokens saved
- Scholardoc CLAUDE.md condensation (87% reduction)
- All 25 sc:* commands moved to `~/.claude/commands/sc.disabled/`
- Switched to CLAUDE.balanced.md framework

### Phase 4 (This Session): ~1.3k words saved
- analyze-logs.md: automation → docs/LOG_ANALYSIS_AUTOMATION.md
- init.md: templates → docs/INIT_TEMPLATES.md  
- improve.md, review-pr.md: templates condensed
- Decision: Did NOT merge diagnose + analyze-logs (different purposes)

### Phase 5 (This Session): Context7 removed
- Removed unused Context7 MCP from scholardoc permissions
- Kept Sequential-Thinking and Serena

### Git: Committed to scholardoc feature/ocr-integration, PR #8 created

---

## Phase 6: TWO PROBLEMS IDENTIFIED

### Problem 1: sc.disabled Skills Still Loading (~22k tokens!)

**Evidence** from `/context` output:
```
Skills and slash commands · /skills
User
└ sc.disabled:spec-panel: 4.4k tokens
└ sc.disabled:help: 2.0k tokens
└ sc.disabled:brainstorm: 1.2k tokens
... (25 commands totaling ~22k tokens)
```

**Issue**: The `sc.disabled/` folder naming doesn't prevent loading - it just renames the skills with `sc.disabled:` prefix. They're STILL being loaded into context.

**Potential Solutions**:
1. Move to completely different location outside `~/.claude/commands/`
2. Delete entirely (if scholardoc has /project:* equivalents for all)
3. Check if there's a proper disable mechanism

### Problem 2: Commands vs Agents Token Efficiency

**Key Discovery from Docs**:
| Type | When Loaded | Token Impact |
|------|-------------|--------------|
| Commands (Skills) | ALL at session start | Full content in context |
| Agents | Only description at start | Full prompt on invocation only |

**Current state** (from /context):
- Custom agents: 465 tokens total (16 agents)
- Project commands: ~17k tokens total (20 commands)

**Agents are 36x more token-efficient!**

**Candidates for Command → Agent Conversion**:

| Command | Tokens | Convert? | Rationale |
|---------|--------|----------|-----------|
| diagnose | 1.7k | YES | Only for debugging system |
| improve | 2.2k | YES | Periodic self-improvement |
| analyze-logs | 1.3k | YES | Periodic analysis |
| review-pr | 1.6k | YES | Only when reviewing |
| create-pr | 1.3k | YES | Only when creating PRs |
| **Subtotal** | **8.1k** | | |

**Keep as Commands** (frequently used, interactive):
- init, auto, plan, signal, checkpoint, resume
- debug, explore, implement, tdd, spike, review, refactor, document, release

**Estimated Savings**: ~8k tokens from command→agent conversion

---

## Next Steps (Priority Order)

### Step 1: Fix sc.disabled Loading
1. Investigate why `~/.claude/commands/sc.disabled/` is still loading
2. Find proper disable mechanism or move files outside commands/
3. Verify with `/context` in fresh session

### Step 2: Convert Large Commands to Agents
1. Create agent versions of: diagnose, improve, analyze-logs, review-pr, create-pr
2. Agent format: short YAML frontmatter + focused prompt
3. Place in `~/.claude/agents/` or `.claude/agents/`
4. Remove corresponding command files
5. Verify with `/context`

### Step 3: Validate in Fresh Scholardoc Session
1. Start fresh session in scholardoc
2. Run `/context` to verify savings
3. Test that agents invoke correctly
4. Run `/project:init validate`

---

## Key Documentation References

- **Cost guide**: `docs/cost-optimization-guide-updated-2025-12-09.md`
  - Commands load fully, agents only load description
  - Tool Search Tool pattern for deferred loading
  
- **Subagents guide**: `docs/subagents-orchestration-guide-2025-12-11.md`
  - Agent file format with YAML frontmatter
  - Minimal agent template example
  - Known issues with agent persistence

---

## File Locations

- Scholardoc commands: `~/workspace/projects/scholardoc/.claude/commands/`
- Global sc.disabled: `~/.claude/commands/sc.disabled/`
- Global agents: `~/.claude/agents/`
- Scholardoc agents: `~/workspace/projects/scholardoc/.claude/agents/`

---

## Rollback Info

```bash
# Restore sc:* commands if needed
mv ~/.claude/commands/sc.disabled/*.md ~/.claude/commands/sc/

# Restore commands if agent conversion fails
git checkout -- .claude/commands/
```
