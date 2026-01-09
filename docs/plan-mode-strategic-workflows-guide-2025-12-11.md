# Plan Mode & Strategic Workflows Guide

**Updated:** December 11, 2025  
**Claude Code Version:** 2.0+  
**Applies to:** Claude Pro, Max, Team, Enterprise, and API users

---

## Table of Contents

1. [Introduction: Why Planning Matters](#introduction-why-planning-matters)
2. [Permission Modes Overview](#permission-modes-overview)
3. [Plan Mode Deep Dive](#plan-mode-deep-dive)
4. [Extended Thinking](#extended-thinking)
5. [Strategic Workflow Patterns](#strategic-workflow-patterns)
6. [Planning with Persistent Documents](#planning-with-persistent-documents)
7. [Opus Plan Mode (Hybrid Strategy)](#opus-plan-mode-hybrid-strategy)
8. [Custom Planning Commands](#custom-planning-commands)
9. [Known Issues & Mitigations](#known-issues--mitigations)
10. [Best Practices](#best-practices)
11. [Quick Reference](#quick-reference)
12. [Sources](#sources)

---

## Introduction: Why Planning Matters

Claude Code excels when given clear, verifiable targets. Without deliberate planning, Claude tends to jump straight into coding, which can lead to:

- Architectural mismatches discovered mid-implementation
- Context exhaustion on complex tasks
- Repeated iterations that waste tokens
- Solutions that don't align with existing patterns

**The fundamental insight:** Great planning is great prompting. Senior engineers naturally research and plan before coding — Plan Mode formalizes this workflow for AI-assisted development.

### The Planning Advantage

| Without Planning | With Planning |
|------------------|---------------|
| Code → Debug → Refactor → Debug | Plan → Review → Execute → Done |
| Inconsistent output format | Structured, predictable responses |
| Architectural surprises | Aligned implementations |
| Context exhaustion | Preserved context for execution |

---

## Permission Modes Overview

Claude Code has three permission modes that control how Claude interacts with your codebase. Cycle through them with **Shift+Tab**:

### 1. Normal Mode (Default)
```
⏵ normal mode
```
- Prompts for permission on file edits and command execution
- Safe for exploratory work
- Maximum control over changes

### 2. Auto-Accept Mode
```
⏵⏵ accept edits on
```
- Automatically approves file edits
- Still prompts for potentially dangerous bash commands
- Good for execution after planning is complete

### 3. Plan Mode
```
⏸ plan mode on
```
- **Read-only** — cannot edit files, run commands, or make changes
- Full access to research and analysis tools
- Presents plan for approval before execution
- Exits via `ExitPlanMode` tool (prompts user for confirmation)

### Mode Cycling

```
Shift+Tab → normal mode → auto-accept → plan mode → normal mode...
```

### Starting in a Specific Mode

```bash
# Start in plan mode
claude --permission-mode plan

# Headless plan mode query
claude --permission-mode plan -p "Analyze the authentication system"

# Set default mode in settings
# .claude/settings.json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

---

## Plan Mode Deep Dive

### Available Tools in Plan Mode

Plan mode restricts Claude to read-only and research operations:

| Tool | Description |
|------|-------------|
| **Read** | View file contents |
| **LS** | Directory listings |
| **Glob** | File pattern searches |
| **Grep** | Content searches |
| **Task** | Research subagents |
| **TodoRead/TodoWrite** | Task management |
| **WebFetch** | Web content analysis |
| **WebSearch** | Web searches |
| **NotebookRead** | Jupyter notebooks |

**Blocked in Plan Mode:**
- Edit/MultiEdit (file modifications)
- Write (file creation)
- Bash (command execution)
- NotebookEdit
- MCP tools that modify state

### When to Use Plan Mode

**Multi-step implementations:**
- Features requiring changes across many files
- Database migrations
- API redesigns

**Code exploration:**
- Understanding unfamiliar codebases
- Researching before making changes
- Architecture analysis

**Interactive development:**
- Iterating on approach before committing
- Getting feedback on implementation strategies
- Risk assessment for changes

**High-risk changes:**
- Refactors affecting core systems
- Security-sensitive modifications
- Production infrastructure changes

### Plan Mode Workflow

```
1. Enter Plan Mode (Shift+Tab twice, or --permission-mode plan)
           ↓
2. Describe your goal
           ↓
3. Claude researches codebase (read-only)
           ↓
4. Claude presents structured plan
           ↓
5. Review, iterate, refine
           ↓
6. Approve plan → Claude exits plan mode
           ↓
7. Execute with oversight (normal mode) or autonomously (auto-accept)
```

### Example: Planning a Complex Refactor

```bash
claude --permission-mode plan
```

```
> I need to refactor our authentication system to use OAuth2. 
> Create a detailed migration plan.

Claude analyzes:
- Current auth implementation
- Database schema
- API endpoints
- Client integrations

Claude produces:
1. Phase 1: Add OAuth2 provider support
   - Files: auth/providers/*.ts
   - Dependencies: oauth2-client@3.x
   
2. Phase 2: Database migration
   - New tables: oauth_tokens, oauth_providers
   - Migration script: migrations/20251211_oauth.ts
   
3. Phase 3: API endpoint updates
   - GET /auth/oauth/callback
   - POST /auth/oauth/token
   ...

> What about backward compatibility?
> How should we handle the database migration?

[Iterate until satisfied, then approve]
```

---

## Extended Thinking

Extended thinking enables Claude to spend more time on deep reasoning before responding. This is separate from Plan Mode but complements it well.

### Enabling Extended Thinking

**Primary method (v2.0+):** Press **Tab** to toggle thinking on/off

```
Thinking on (tab to toggle)
```

The Tab toggle is **sticky across sessions** — once enabled, it remains active until you toggle it off.

### Alternative Methods

**Settings-based:**
```json
// ~/.claude/settings.json
{
  "alwaysThinkingEnabled": true
}
```

**Environment variable:**
```bash
export MAX_THINKING_TOKENS=10000
```

### When to Use Extended Thinking

Extended thinking is most valuable for:
- Planning complex architectural changes
- Debugging intricate issues
- Creating implementation plans for new features
- Understanding complex codebases
- Evaluating tradeoffs between different approaches

### Combining Plan Mode + Extended Thinking

For maximum reasoning depth on complex problems:

1. Enter Plan Mode (Shift+Tab twice)
2. Enable extended thinking (Tab)
3. Describe your goal with sufficient context
4. Let Claude research and reason deeply
5. Review the plan
6. Execute with confidence

---

## Strategic Workflow Patterns

### Pattern 1: Research → Plan → Implement → Validate

The Anthropic-recommended workflow for complex changes:

```
Phase 1: Research (Plan Mode)
├── Read relevant files
├── Understand existing patterns
├── Identify dependencies
└── "Don't write any code yet"

Phase 2: Plan (Plan Mode + Extended Thinking)
├── Create detailed implementation plan
├── Identify potential issues
├── Define success criteria
└── Save plan to file if complex

Phase 3: Implement (Auto-Accept or Normal Mode)
├── Execute plan step by step
├── Run tests after each step
└── Commit incrementally

Phase 4: Validate
├── Run full test suite
├── Review all changes
└── Create PR with context
```

### Pattern 2: Test-Driven Development (TDD)

```
1. Plan Mode: Understand requirements
           ↓
2. Write tests based on expected input/output
   "Do TDD — don't create mock implementations"
           ↓
3. Run tests, confirm they fail
   "Don't write implementation code yet"
           ↓
4. Commit tests when satisfied
           ↓
5. Implement code to make tests pass
           ↓
6. Refactor while keeping tests green
```

### Pattern 3: PRD → Plan → Todo

For feature development from requirements:

```
1. Product Requirement Document (PRD)
   - User stories
   - Acceptance criteria
   - Technical constraints

2. Planning Phase (Plan Mode)
   > Analyze this PRD and create an implementation plan.
   > Consider our existing architecture in @src/

3. Claude produces structured plan:
   - Task breakdown
   - Dependencies
   - File changes
   - Risk assessment

4. Todo List Generation
   > Convert this plan to a TODO.md with checkboxes

5. Incremental Execution
   > Implement task 1 from TODO.md
   > Run tests and update progress
```

### Pattern 4: Context-Preserving Sessions

For complex work spanning multiple sessions:

```
Session 1 (Plan Mode):
├── Research and create plan
├── Save to docs/PLAN.md
└── Clear context

Session 2 (Normal Mode):
├── Reference @docs/PLAN.md
├── Implement steps 1-3
├── Update PLAN.md with progress
└── Commit changes

Session 3 (Normal Mode):
├── Reference @docs/PLAN.md
├── Continue from step 4
└── Complete implementation
```

---

## Planning with Persistent Documents

Claude Code's in-session plans are ephemeral — they're lost when you start a new session. For complex work, persist plans to files.

### PLAN.md Pattern

```markdown
# Feature: OAuth2 Authentication

## Status: In Progress

## Overview
Migrate authentication from session-based to OAuth2.

## Tasks
- [x] Research current auth implementation
- [x] Design OAuth2 flow
- [-] Implement OAuth provider support 🏗️ 2025-12-11
- [ ] Database migration
- [ ] API endpoint updates
- [ ] Client-side integration
- [ ] Testing and validation

## Technical Decisions
- Using `oauth2-client` library (v3.x)
- Supporting Google, GitHub, Microsoft providers
- Backward compatibility via session bridge

## Notes
- Session bridge needed for gradual migration
- Token refresh handled server-side
```

### ROADMAP.md Pattern

For ongoing project management:

```markdown
# ROADMAP.md

## Progress Tracking
- `[ ]` = Todo
- `[-]` = In Progress 🏗️ YYYY-MM-DD
- `[x]` = Completed ✅ YYYY-MM-DD

## High Priority
- [-] **OAuth2 Migration** - See docs/PLAN-oauth.md 🏗️ 2025-12-10
- [ ] **Performance Optimization** - API response times

## Medium Priority
- [ ] **Documentation Update** - API reference docs
- [ ] **Test Coverage** - Increase to 80%

## Completed
- [x] **Database Indexing** - Added composite indexes ✅ 2025-12-09
```

### CLAUDE.md Integration

Reference planning files in your CLAUDE.md:

```markdown
# Project Instructions

## Planning Workflow
1. Check ROADMAP.md for current priorities
2. Reference relevant PLAN-*.md files for context
3. Update task status after completing work

## File Conventions
- docs/PLAN-*.md — Feature implementation plans
- docs/ROADMAP.md — Project-level tracking
- docs/DECISIONS.md — Architectural decision records
```

---

## Opus Plan Mode (Hybrid Strategy)

Claude Code offers a hybrid model strategy that uses Opus for planning and Sonnet for execution.

### Enabling Opus Plan Mode

```bash
# Via /model command
/model
# Select option 4: "Use Opus 4.5 in plan mode, Sonnet 4.5 otherwise"
```

### How It Works

```
Plan Mode Active:
├── Uses Opus 4.5 (superior reasoning)
├── Deep architectural analysis
├── Complex tradeoff evaluation
└── Comprehensive planning

Execution Mode:
├── Uses Sonnet 4.5 (efficient implementation)
├── Code generation
├── File modifications
└── Test execution
```

### Cost Optimization

| Model | Input/Output (per 1M tokens) | Use Case |
|-------|------------------------------|----------|
| Haiku 4.5 | $1 / $5 | Exploration, search |
| Sonnet 4.5 | $3 / $15 | Implementation |
| Opus 4.5 | $5 / $25 | Planning, architecture |

Opus Plan Mode gives you Opus-quality reasoning during planning while keeping execution costs at Sonnet rates.

### Best Use Cases

- **Unfamiliar repository analysis** — Let Opus understand the architecture
- **High-risk refactors** — Opus plans, Sonnet implements
- **Long-running agents** — Cost control over extended sessions

---

## Custom Planning Commands

Create reusable planning workflows with custom slash commands.

### /plan Command

```markdown
<!-- .claude/commands/plan.md -->
Create a detailed implementation plan for this feature:

$ARGUMENTS

Follow these steps:
1. Research the current codebase for relevant patterns
2. Identify files that need modification
3. List dependencies and potential risks
4. Break down into incremental steps (max 30 min each)
5. Define success criteria for each step

Output format:
- Overview (2-3 sentences)
- Prerequisites
- Step-by-step plan with file paths
- Testing strategy
- Rollback plan if applicable
```

Usage:
```
> /plan Add user profile photo upload with S3 storage
```

### /review-plan Command

```markdown
<!-- .claude/commands/review-plan.md -->
Review the plan in @docs/PLAN.md:

1. Check for missing steps or dependencies
2. Identify potential risks not addressed
3. Verify alignment with existing patterns in the codebase
4. Suggest improvements or alternatives
5. Estimate time for each step

Provide specific, actionable feedback.
```

### /next-task Command

```markdown
<!-- .claude/commands/next-task.md -->
Check @docs/ROADMAP.md and @docs/PLAN.md:

1. Find the next uncompleted task
2. Read relevant context
3. Present a summary of what needs to be done
4. Wait for approval before starting

Do not make any changes yet.
```

---

## Known Issues & Mitigations

### Issue: Plan Mode Self-Approval

**Context:** Claude sometimes exits plan mode and begins implementation without explicit user approval. This occurs when Claude interprets its own plan presentation as approval.

**Root Cause:** The `ExitPlanMode` tool is designed to prompt the user, but Claude may call it prematurely or misinterpret the workflow.

**Mitigation:**
1. Be explicit in prompts: "Create a plan and wait for my approval before any changes"
2. Add to CLAUDE.md:
   ```markdown
   ## Plan Mode Rules
   - Never exit plan mode without explicit user approval
   - Always present plan and wait for "approved" or "proceed"
   ```
3. Use headless mode for read-only analysis:
   ```bash
   claude --permission-mode plan -p "Analyze X" --output-format json
   ```

**GitHub Issue:** [#3005](https://github.com/anthropics/claude-code/issues/3005), [#10398](https://github.com/anthropics/claude-code/issues/10398)

---

### Issue: Plan Mode Not Producing Structured Plans

**Context:** After certain updates, Claude may skip creating structured plans and jump to conversational responses or immediate action attempts.

**Root Cause:** Model behavior variation; Claude doesn't always recognize plan mode context.

**Mitigation:**
1. Be explicit: "Create a numbered, step-by-step plan with file paths"
2. Reference expected format: "Format your plan like previous successful plans"
3. Use custom `/plan` command with explicit format instructions

**GitHub Issue:** [#9665](https://github.com/anthropics/claude-code/issues/9665)

---

### Issue: Shift+Tab Not Working (Windows)

**Context:** On Windows, Shift+Tab may not cycle through permission modes, particularly in certain terminal emulators.

**Root Cause:** Terminal key binding conflicts, especially in PowerShell and VS Code terminal.

**Mitigation:**
1. Use CLI flag instead: `claude --permission-mode plan`
2. Try different terminal (Windows Terminal, Git Bash)
3. Configure default mode in settings.json

**GitHub Issue:** [#3390](https://github.com/anthropics/claude-code/issues/3390)

---

### Issue: Mode Toggle Timing

**Context:** Toggling out of plan mode with Shift+Tab during a turn may not take effect until the next turn.

**Root Cause:** Mode state is captured at turn start, not mid-turn.

**Mitigation:**
1. Toggle mode before sending your message
2. Wait for Claude to complete current response before switching modes
3. Use `/clear` and restart in desired mode for clean state

**GitHub Issue:** [#7782](https://github.com/anthropics/claude-code/issues/7782)

---

### Issue: Plan Mode Conflicts with CLAUDE.md Read-Only Preferences

**Context:** When CLAUDE.md specifies read-only/advisory mode, plan mode may still attempt to call `ExitPlanMode`, which triggers execution prompts.

**Root Cause:** System instructions for plan mode override user preferences in CLAUDE.md.

**Mitigation:**
1. Use headless mode for pure analysis:
   ```bash
   claude --permission-mode plan -p "Analyze X" --print
   ```
2. Don't approve `ExitPlanMode` if you want to stay read-only
3. Accept that plan mode's design includes a transition to execution

**GitHub Issue:** [#12860](https://github.com/anthropics/claude-code/issues/12860)

---

## Best Practices

### Planning Phase

1. **Start broad, then narrow** — Begin with overview questions before diving into specifics
2. **Use @ references** — Include relevant files directly: `@src/auth/` for context
3. **Set clear boundaries** — "Don't write code yet" prevents premature implementation
4. **Save complex plans** — Persist to PLAN.md for multi-session work
5. **Enable extended thinking** — Press Tab for complex architectural decisions

### Execution Phase

1. **One task per session** — Use `/clear` between tasks to avoid context bleed
2. **Incremental commits** — Commit after each successful step
3. **Verify before proceeding** — Run tests between plan steps
4. **Update tracking** — Mark tasks complete in PLAN.md/ROADMAP.md

### Prompt Patterns for Planning

**Research prompt:**
```
Read @src/auth/ and explain the current authentication flow.
Don't make any changes yet.
```

**Planning prompt:**
```
Create a step-by-step plan to add OAuth2 support.
Include file paths, dependencies, and potential risks.
Wait for my approval before implementing.
```

**Execution prompt:**
```
Implement step 1 from our plan.
Run tests after completion.
Stop and report before moving to step 2.
```

### Context Management

- Keep plans under 60% of context window
- Split large features into multiple sessions
- Save intermediate state to files
- Use `/compact` with preservation instructions when needed

---

## Quick Reference

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Cycle permission modes | Shift+Tab |
| Toggle extended thinking | Tab |
| Cancel current operation | Esc |
| Edit previous prompt | Esc Esc |
| Search history | Ctrl+R |

### CLI Flags

```bash
claude --permission-mode plan      # Start in plan mode
claude --permission-mode default   # Start in normal mode
claude -p "query"                  # Headless mode
claude --continue                  # Resume last conversation
claude --resume                    # Show conversation picker
```

### Settings

```json
// .claude/settings.json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

```json
// ~/.claude/settings.json (user-level)
{
  "alwaysThinkingEnabled": true
}
```

### Mode Indicators

| Indicator | Mode |
|-----------|------|
| `⏵` | Normal mode |
| `⏵⏵ accept edits on` | Auto-accept mode |
| `⏸ plan mode on` | Plan mode |
| `Thinking on` | Extended thinking enabled |

### Planning Workflow Checklist

- [ ] Enter Plan Mode (Shift+Tab × 2)
- [ ] Enable extended thinking if needed (Tab)
- [ ] Describe goal with context
- [ ] Review Claude's research
- [ ] Iterate on plan
- [ ] Save plan to file if complex
- [ ] Approve plan
- [ ] Execute with appropriate mode
- [ ] Verify and commit incrementally

---

## Sources

### Official Documentation
- [Claude Code Common Workflows](https://code.claude.com/docs/en/common-workflows) — Plan mode and extended thinking documentation
- [Claude Code Settings](https://code.claude.com/docs/en/settings) — Configuration options
- [Extended Thinking](https://docs.claude.com/en/docs/build-with-claude/extended-thinking) — Deep dive on thinking modes
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) — Anthropic engineering recommendations

### Community Guides
- [ClaudeLog Plan Mode](https://claudelog.com/mechanics/plan-mode/) — Comprehensive plan mode overview
- [Code Centre Plan Mode](https://cuong.io/blog/2025/07/15-claude-code-best-practices-plan-mode) — Practical workflow patterns
- [Steve Kinney Plan Mode Course](https://stevekinney.com/courses/ai-development/claude-code-plan-mode) — Educational resource
- [Sid Bharath Complete Guide](https://www.siddharthbharath.com/claude-code-the-complete-guide/) — End-to-end Claude Code tutorial
- [Developer Toolkit PRD Workflow](https://developertoolkit.ai/en/claude-code/quick-start/prd-workflow/) — PRD → Plan → Todo methodology
- [Zhu Liang Workflow Tips](https://thegroundtruth.substack.com/p/my-claude-code-workflow-and-personal-tips) — Roadmap and task file patterns
- [Ben Newton Roadmap Management](https://benenewton.com/blog/claude-code-roadmap-management) — ROADMAP.md patterns

### Community Resources
- [claudeKit](https://github.com/anthony-langham/claudeKit) — Planning workflow slash commands
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) — Curated command collections

### GitHub Issues (Known Problems)
- [#3005](https://github.com/anthropics/claude-code/issues/3005) — Plan mode self-approval
- [#9665](https://github.com/anthropics/claude-code/issues/9665) — Plan mode not producing plans
- [#10398](https://github.com/anthropics/claude-code/issues/10398) — Not adhering to plan mode
- [#3390](https://github.com/anthropics/claude-code/issues/3390) — Shift+Tab not working on Windows
- [#7782](https://github.com/anthropics/claude-code/issues/7782) — Mode toggle timing issues
- [#12860](https://github.com/anthropics/claude-code/issues/12860) — Conflicts with CLAUDE.md preferences

---

## Changelog

### v1.0 (December 11, 2025)
- Initial guide covering plan mode, extended thinking, and strategic workflows
- Permission modes documentation
- Opus Plan Mode hybrid strategy
- Known issues with mitigations (6 GitHub issues)
- Custom planning commands
- Persistent document patterns
