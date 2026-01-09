# Session Handoff: Autonomous Dev Plugin Template

**Date**: 2025-12-29
**Status**: Planning complete, ready for implementation
**Context**: High (clear and resume)

---

## Key Decision: Work BACKWARDS from Scholardoc

Instead of fixing `plugins/autonomous-dev/`, **reverse-engineer the template from scholardoc's working .claude folder**.

Scholardoc has a tested, tried-and-true setup that was derived from the plugin but refined through actual use.

---

## What We Completed This Session

### Phase 6 Context Optimization (DONE)
1. ✅ Moved sc.disabled to ~/.claude/archive/sc-commands/ (~22k tokens saved)
2. ✅ Converted 5 large+infrequent commands to agents in scholardoc
3. ✅ Added proper YAML frontmatter to all 12 scholardoc agents (name, description, tools, model: inherit)
4. ✅ Archived 5 conflicting user agents to ~/.claude/agents.disabled/

### Plugin Architecture Planning (IN PROGRESS)
- Created plan at `/home/rookslog/.claude/plans/sprightly-crafting-thacker.md`
- Explored existing `plugins/autonomous-dev/` (17 commands, 7 agents, 1 hook)
- User decisions:
  - Template folder: `claude-template/`
  - Distribution: Copy-paste, rename to .claude, run /project:init
  - Automation: Guided setup with questions
  - Template syntax: `{{VAR}}`
  - Stacks: Python + MCP Server + Generic
  - Journal: Commit (for cross-clone learning)

---

## Critical User Feedback

### REMOVE Session-Logger Hook
- User said hooks were "disastrous"
- Remove from BOTH:
  - `plugins/autonomous-dev/templates/hooks/session-logger.md` (DELETE)
  - Any references in scholardoc

### Use Permissions Only (No Hooks)
- settings.json allow/deny/ask
- Block dangerous: rm -rf, sudo, force push
- Auto-approve safe operations

### Two-Phase Autonomy Model
User wants: "Extensive initialization/planning phase with human involvement → then let it run on its own"

With **journal system** to capture when auto goes wrong → feeds back to improve init questions/spikes.

### Spike Before Decisions
Init should ask: "Should we run a spike to investigate X before proceeding?"
Run spikes DURING init, not later.

---

## Next Steps (After Resume)

### Step 1: Reverse-Engineer from Scholardoc
```bash
# Scholardoc's working .claude folder is the source of truth
~/workspace/projects/scholardoc/.claude/
├── commands/     # 15 commands (refined from plugin)
├── agents/       # 12 agents (with proper YAML frontmatter)
├── settings.json # Permissions model
└── CLAUDE.md     # Condensed project config
```

### Step 2: Create claude-template/ from scholardoc
- Extract generic versions of commands
- Add {{VAR}} template variables for stack-specific values
- Create stack templates (Python, MCP Server, Generic)
- Add journal system
- Add user-config conflict detection to init

### Step 3: Enhance init.md
- Add autonomy level selection
- Add spike-before-decisions prompts
- Add user-level config (~/.claude/) conflict detection
- Improve planning phase (user noted it was lacking)

### Step 4: Remove session-logger
- From scholardoc (if present)
- From plugin templates
- Update all references in commands (improve.md, etc.)

### Step 5: Commit Everything
- scholardoc: .claude/agents/, .claude/commands/
- claude-enhanced: claude-template/
- .gitignore: .serena/memories/, .serena/cache/ (keep project.yml)

---

## Files to Reference

### Scholardoc (Source of Truth)
- `~/workspace/projects/scholardoc/.claude/commands/` - 15 working commands
- `~/workspace/projects/scholardoc/.claude/agents/` - 12 agents with proper frontmatter
- `~/workspace/projects/scholardoc/.claude/settings.json` - Permission model

### Plugin (Reference Only)
- `plugins/autonomous-dev/templates/` - Original templates
- `plugins/autonomous-dev/docs/` - Good docs to keep

### Plan File
- `/home/rookslog/.claude/plans/sprightly-crafting-thacker.md` - Full implementation plan

---

## Key Insight

> "We have a tested tried and true system in scholardoc that is already initialized. Work backwards to what would have been the template that would have initialized it."

This is the right approach - extract from working reality, not theoretical template.

---

## Rollback Info

```bash
# Restore archived user agents if needed
mv ~/.claude/agents.disabled/*.md ~/.claude/agents/

# Restore sc commands if needed
mv ~/.claude/archive/sc-commands/*.md ~/.claude/commands/sc/
```
