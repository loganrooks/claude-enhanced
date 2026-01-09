# Session Handoff: Feedback System + Init Restructure

**Date**: 2026-01-08 21:50
**Priority**: HIGH - Continue this work
**Read also**: `session_20260108_2150_feedback_architecture` (comprehensive design details)

---

## Quick Summary

Designed complete feedback routing system. Now restructuring plugin:
- From: `plugins/autonomous-dev/templates/`
- To: `.claude-template/` that users copy to projects

---

## What's Done

1. **Feedback architecture designed** - signals, review, meta-review, Serena integration
2. **Files created**:
   - `guides/review-workflow.md`
   - `guides/meta-review-workflow.md`
   - `templates/formats/signal-format.md`
   - `templates/formats/serena-memory-schemas.md`
   - `templates/commands/signal.md` (rewritten as interactive)
   - `docs/FEEDBACK_ROUTING_ARCHITECTURE.md`
3. **Init paths updated** - Changed from `plugins/autonomous-dev/` to `.claude/`

## What's NOT Done

1. **Create .claude-template/ directory**
2. **Move files to new structure**:
   - Static commands → `.claude-template/commands/`
   - Guides → `.claude-template/guides/`
   - Init-agents → `.claude-template/init-agents/`
   - Schemas (signal-format, serena-memory-schemas) → `.claude-template/guides/`
3. **Create template files**:
   - `CLAUDE.template.md`
   - `settings.template.json`
4. **Clean up old structure**
5. **Test on fresh project**

---

## Key Decisions Made

| Decision | Choice |
|----------|--------|
| Signal capture | Interactive stop-and-reflect (not passive log) |
| Cross-project | Pull model (claude-enhanced reads project memories) |
| Artifact categories | Static / Templated / Regenerated |
| Format vs Template | Merge - schemas go in guides/ |

---

## To Resume

```
# 1. Read both memories
read_memory("session_20260108_2150_feedback_architecture")
read_memory("session_20260108_2150_handoff")

# 2. Read architecture doc
cat plugins/autonomous-dev/docs/FEEDBACK_ROUTING_ARCHITECTURE.md

# 3. Continue with remaining tasks:
#    - Create .claude-template/ structure
#    - Move files
#    - Create CLAUDE.template.md and settings.template.json
#    - Test on fresh project
```

---

## Remaining Tasks (in order)

1. Create `.claude-template/` directory with subdirs
2. Copy static commands: signal.md, checkpoint.md, resume.md, init.md
3. Copy all 17 guides (+ move schemas from formats/ to guides/)
4. Copy 9 init-agents
5. Create `templates/CLAUDE.template.md`
6. Create `templates/settings.template.json`
7. Create empty dirs: signals/, reviews/
8. Test: copy to new project, rename, run /init
9. Clean up old templates/commands/ that are now regenerated

---

## Critical Context

- Serena is user-level (sees all projects)
- Guides stay in project for ongoing reference (review workflows)
- Init generates most commands from guides + analysis
- Static commands are universal, just copied
- Three categories: STATIC / TEMPLATED / REGENERATED
