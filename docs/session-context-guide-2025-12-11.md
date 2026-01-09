# Claude Code Session & Context Management Guide

**Updated:** December 11, 2025  
**Version:** 1.1  
**Verified Against:** Claude Code v2.0+, Sonnet 4.5, Opus 4.5  

---

## Table of Contents

1. [Introduction: The Mental Model](#introduction-the-mental-model)
2. [Context Management](#context-management)
3. [Session Management](#session-management)
4. [Checkpointing & Rewind](#checkpointing--rewind)
5. [Advanced Patterns](#advanced-patterns)
6. [Anti-Patterns & Troubleshooting](#anti-patterns--troubleshooting)
7. [Quick Reference](#quick-reference)
8. [MCP Tools for Context Management](#mcp-tools-for-context-management)
9. [Sources](#sources)

---

## Introduction: The Mental Model

### Context vs. Sessions: What's the Difference?

Think of Claude Code as having two types of memory:

| Concept | Analogy | Persistence | Scope |
|---------|---------|-------------|-------|
| **Context Window** | Working memory / RAM | Current session only | Everything Claude "sees" right now |
| **Session** | Saved document | Stored on disk | Complete conversation history |
| **CLAUDE.md** | Reference manual | Permanent | Loaded fresh each session |

**Context** is what Claude can actively reason about — it fills up as you work and degrades performance when overloaded.

**Sessions** are saved conversations you can resume later, preserving the full history of your work.

### Why This Matters

Left unchecked, poor context management causes:
- **Higher token usage** (more cost, slower responses)
- **Context drift** (old/irrelevant info confuses outputs)
- **Performance degradation** (community consensus: quality degrades significantly after ~20 iterations)
- **Information leakage** (secrets or sensitive logs stuck in session)

**The goal:** Keep context lean and relevant, use sessions strategically, and know when to reset.

---

## Context Management

### Understanding Context Windows

| Model | Standard Context | Extended Context | Notes |
|-------|------------------|------------------|-------|
| Opus 4.5 | 200K tokens | — | ~500 pages of text |
| Sonnet 4.5 | 200K tokens | 1M tokens (beta) | Extended context at premium pricing |
| Haiku 4.5 | 200K tokens | — | Same window, faster processing |

**Context Awareness (Sonnet/Haiku 4.5):** These models natively track remaining token budget. Claude receives updates like `<system_warning>Token usage: 35000/200000; 165000 remaining</system_warning>` after each tool call.

### The "Lost in the Middle" Problem

LLMs recall information best from the **beginning and end** of context — details in the middle are more likely to be ignored. This is why:

- Instructions in CLAUDE.md (beginning) are followed well
- Recent conversation (end) is fresh
- Middle portions of long sessions get "forgotten"

**Community consensus:** Reset context every **20 iterations** as performance degrades significantly beyond this threshold.

### Key Context Commands

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/context` | Visualize context usage breakdown | Check before long operations, diagnose bloat |
| `/compact` | Summarize context, preserve essentials | At ~70% capacity, natural milestones |
| `/clear` | Wipe conversation history | Task complete, switching focus, fresh start |
| `/cost` | Show token usage and cost estimates | Monitor spending, budget management |

### /context: Your Context Dashboard

```
/context
```

This command shows a visual breakdown of what's consuming your context window:
- **Messages** (conversation history)
- **Files** (loaded content)
- **Tool outputs** (command results, file reads)
- **MCP servers** (tool definitions consuming baseline tokens)

**Pro tip:** Run `/context` mid-session to understand your usage patterns. In a typical monorepo, a fresh session costs ~20K tokens (10%) just for baseline context.

### /compact: Strategic Compression

```bash
# Basic compaction
/compact

# Guided compaction (recommended)
/compact Focus on preserving:
- Current authentication implementation details
- Database schema decisions
- API endpoint specifications
Summarize but don't lose the error handling patterns we discussed.
```

**How it works:** Claude summarizes the conversation, replacing verbose history with a condensed version. Key decisions and context are preserved.

**When to compact:**
- At ~70-85% context usage (don't wait for auto-compact at 95%)
- Natural milestones (feature complete, PR ready, commit made)
- Before long new tasks that would push toward limits
- When you want to preserve key decisions but reduce token footprint

**Auto-Compaction:**
- Triggers automatically at ~95% capacity
- Can lose important context (Claude decides what to preserve)
- Manual compaction gives you control over what's retained

### /clear: The Clean Slate

```bash
# Full reset
/clear
```

**What it does:**
- Wipes all conversation history
- Keeps CLAUDE.md loaded
- Preserves session (you can still `/resume` if saved)
- **Does NOT** re-read CLAUDE.md (use restart for that)

**When to use /clear:**
- Switching to completely unrelated work
- After completing a feature/task
- Context has drifted too far off track
- /compact wouldn't help (too much irrelevant content)

**Important distinction:**
- `/clear` = Keep session, wipe conversation
- Restart Claude = Wipe everything, re-read CLAUDE.md

### Context Budget Management

**Token budgets by plan:**
- Standard: 200K tokens
- Enterprise: 500K tokens
- Extended (Sonnet beta): 1M tokens

**What consumes context:**

| Component | Typical Usage | Notes |
|-----------|---------------|-------|
| System prompt | ~3-5K | Fixed overhead |
| CLAUDE.md | Varies | Keep under 500 tokens ideally |
| MCP servers | ~1-3K per server | Tool definitions add up |
| File contents | Varies | Large files consume heavily |
| Conversation | Accumulates | Primary growth area |

**Optimization strategies:**
1. Keep CLAUDE.md lean (<500 tokens, <100 lines)
2. Disable unused MCP servers
3. Compact or clear regularly
4. Use @imports for detailed docs instead of inline content

---

## Session Management

### Session Basics

Every Claude Code conversation creates a session with:
- Unique session ID (UUID)
- Full message history
- Tool call records
- File references and modifications
- Background task state

Sessions persist to disk (`~/.claude/`) and can be resumed across machine restarts.

### Session Commands

**From CLI:**

```bash
# Continue most recent session (current directory)
claude --continue
claude -c

# Resume specific session (interactive picker)
claude --resume
claude -r

# Resume by session ID
claude --resume 550e8400-e29b-41d4-a716-446655440000
claude -r abc123-def456

# Start with specific session ID (for scripts/automation)
claude --session-id my-custom-id

# Resume in headless mode
claude --resume session-id --print "Generate summary"
claude -p --continue "now add unit tests"
```

**From within session:**

```
/resume
```
Displays interactive list of recent sessions to select.

### Finding Session IDs

**Current limitation:** No built-in command shows the current session ID during an interactive session (GitHub issue #1407 tracks this request).

**Workarounds:**
1. Session ID appears in `--resume` interactive picker
2. Session files stored in `~/.claude/` directory
3. Capture programmatically via SDK:

```typescript
import { query } from "@anthropic-ai/claude-code";

for await (const message of query({ prompt: "Hello" })) {
  if (message.type === 'system' && message.subtype === 'init') {
    console.log(`Session ID: ${message.session_id}`);
  }
}
```

### Session Continuity Patterns

**Pattern 1: Daily Workflow**
```bash
# Morning: continue yesterday's work
claude --continue

# Natural break: clear and start fresh task
> /clear

# End of day: session auto-saves, resume tomorrow
```

**Pattern 2: Multi-Track Development**
```bash
# Track 1: Feature work
claude --session-id feature-auth

# Track 2: Bug fix (separate terminal)
claude --session-id bugfix-payments

# Resume either track later
claude --resume feature-auth
```

**Pattern 3: Headless Automation**
```bash
# Capture session ID
session_id=$(claude -p "Start review" --output-format json | jq -r '.session_id')

# Chain multiple operations on same session
claude --resume "$session_id" -p "Check compliance"
claude --resume "$session_id" -p "Generate summary"
```

### Session Forking (SDK)

The Agent SDK supports forking sessions to try different approaches:

```typescript
// Fork to try alternative approach
const forkedResponse = query({
  prompt: "Now let's redesign this as a GraphQL API instead",
  options: {
    resume: sessionId,
    forkSession: true,  // Creates new session ID
    model: "claude-sonnet-4-5"
  }
});

// Original session remains unchanged
```

### Session Persistence Across Restarts

Sessions survive Claude Code restarts and even machine reboots. Background tasks also persist:

```bash
# Session 1: Start a dev server in background
> "Run the dev server in background"
# python3 -m http.server 8080  (running as bash_3)

# Later: Resume session
claude --continue
> "Check if the dev server is still running"
# Process verified, bash_3 still active
```

**Tracked across sessions:**
- Background task IDs (bash_1, bash_2, etc.)
- Incremental output positions
- File context memory

---

## Checkpointing & Rewind

### Understanding Checkpoints

Introduced in Claude Code v2.0.0, checkpoints automatically capture code state before each edit, providing instant rollback capability.

**Key characteristics:**
- **Automatic:** Created at every user prompt submission
- **File-level:** Tracks file edits made through Claude's tools
- **Separate dimensions:** Code state and conversation state tracked independently
- **Session-scoped:** For quick recovery, not permanent history

### What Checkpoints Track (and Don't)

| Tracked | Not Tracked |
|---------|-------------|
| Direct file edits via Claude's tools | Files modified by bash commands |
| Code state at each prompt | Manual edits outside Claude Code |
| Conversation history | Changes from concurrent sessions |

**Limitation:** Bash commands like `rm file.txt`, `mv old.txt new.txt`, or `cp source.txt dest.txt` are NOT captured by checkpoints.

### Accessing Checkpoints

**Quick access:**
```
Press Esc twice (Esc + Esc)
```

**Slash command:**
```
/rewind
```

Both open the checkpoint interface showing your prompt history with timestamps.

### Rewind Options

| Option | What It Restores | Best For |
|--------|------------------|----------|
| **Conversation only** | Conversation to prior prompt | Re-phrasing prompt, changing direction without losing code |
| **Code only** | File changes to prior state | Undoing bad edits while keeping conversation context |
| **Both** | Complete rollback | Full reset after experimental tangent |

**Most common use case:** "Code only" — ideal when Claude's edits are wrong but you want to see the conversation that led to the mistake.

### Practical Rewind Scenarios

**Scenario 1: Over-engineering**
```
# Claude proposed massive refactoring across 10 files
# Decision: Impact scope too large

/rewind
→ Select "conversation only"
→ Re-instruct: "Refactor only auth.ts first"
→ Result: File changes preserved, conversation redone
```

**Scenario 2: Broken Tests**
```
# After adding API endpoint, all existing tests fail
# Decision: New endpoint fine, but existing code modification inappropriate

/rewind
→ Select "code only"
→ Add instruction: "Don't modify existing endpoints"
→ Result: Code rolled back, conversation context maintained
```

**Scenario 3: Complete Direction Change**
```
# Progressed GraphQL migration over 5 prompts
# Requirement changed: continue REST API instead

/rewind
→ Navigate to pre-migration checkpoint
→ Select "both"
→ Result: Complete state restored
```

### Checkpoints vs. Git

| Checkpoints | Git |
|-------------|-----|
| Ephemeral safety net | Permanent history |
| Session-scoped | Project-scoped |
| Instant access | Requires commands |
| Conversation aware | Code only |
| Auto-created | Manual commits |

**Best practice:** Use checkpoints for in-session experimentation, Git for permanent milestones.

```bash
# Workflow
> "Make experimental changes"
# Checkpoint auto-created

# If it works:
> "Commit these changes"
# Git commit for permanence

# If it fails:
/rewind → code only
# Back to pre-experiment state
```

### Checkpoint Maintenance

Checkpoints have built-in cleanup:
- Session-local only (don't expect cross-machine)
- Community reports suggest ~30 day expiration
- Can manually clean:

```bash
# Delete checkpoints older than 15 days
find .claude/checkpoints -type f -mtime +15 -delete
```

---

## Advanced Patterns

### Pattern 1: Document & Clear

For complex, multi-session work that spans days:

```
# 1. Document current state
> "Document our current progress, decisions made, and next steps 
   to docs/progress/auth-migration.md"

# 2. Clear context
/clear

# 3. Resume in fresh session
> "Read docs/progress/auth-migration.md and continue from where we left off"
```

**Benefits:**
- Human-readable progress tracking
- Works across machines/developers
- Version controllable
- Survives any technical issues

### Pattern 2: Custom Catchup Command

Create a repeatable restart workflow:

```markdown
# .claude/commands/catchup.md
---
allowed-tools: Bash(git diff:*), Bash(git status:*)
description: Reboot session with current branch context
---

## Context
- Current git status: !`git status`
- Current git diff (staged and unstaged): !`git diff HEAD`
- Changed files on this branch: !`git diff --name-only main`

## Your task
Review the changes on this branch and summarize what's been done.
Be ready to continue development.
```

**Usage:**
```
/clear
/catchup
```

### Pattern 3: Subagent Delegation

Delegate context-heavy tasks to subagents to keep main context clean:

```
> "Spawn a subagent to analyze all authentication-related files 
   and report back a summary. The subagent should use its own context 
   and return only the key findings."
```

**Benefits:**
- Subagent uses isolated context
- Main context stays clean
- Only relevant findings return to main session
- Enables parallel work patterns

### Pattern 4: Session Notes File

Create explicit session markers for complex work:

```
# Before ending a complex session
> "Create SESSION_NOTES.md with current context, open questions, and next steps"

# On resume
> "Read SESSION_NOTES.md and continue"
> "Update SESSION_NOTES.md with our progress"
```

### Pattern 5: Multi-Branch Exploration

Use session forking to explore different approaches:

```bash
# Original work
claude --session-id project-main

# Branch 1: Try approach A
claude --resume project-main
# Work on approach A...

# Branch 2: Try approach B (new terminal)
claude --resume project-main
# Work on approach B...

# Both branches share the same starting context
```

### Pattern 6: Git-Aligned Sessions

Align sessions with version control:

```bash
# Create session named after branch
claude --session-id feature-$(git branch --show-current)

# Commit frequently
> "Commit these changes with a descriptive message"

# If session goes wrong, git provides backup
git stash
/rewind
```

### Pattern 7: Iterative Refinement Cycles

For batch processing or iterative improvement:

```
# Initial implementation
> "Implement the parser"

# Test and iterate
> "Run tests and fix issues"

# Checkpoint before risky change
# (automatic)

# Major refactor
> "Refactor for performance"

# If tests fail after refactor
/rewind → code only
> "Refactor with constraint: don't change the public API"
```

---

## Anti-Patterns & Troubleshooting

### Common Anti-Patterns

**❌ Letting auto-compact decide everything**
```
# Auto-compact at 95% often loses important context
# Better: Manual compact at 70%
/compact preserve: API contracts, test patterns, current task
```

**❌ One long session for everything**
```
# Wrong: Auth feature → bug fix → new API → refactor in one session
# Right: Clear between unrelated tasks
```

**❌ Repeating instructions every message**
```
# Wrong: Telling Claude formatting preferences each message
# Right: Put persistent instructions in CLAUDE.md
```

**❌ Ignoring context indicators**
```
# Wrong: Continuing despite "context 90% full" warning
# Right: Compact or clear proactively
```

**❌ Using /clear when you need /compact**
```
# Wrong: /clear when you need to preserve some decisions
# Right: /compact with specific preservation instructions
```

**❌ Never clearing context**
```
# Wrong: 50+ iteration session with degraded quality
# Right: Clear after ~20 iterations or at natural boundaries
```

### Troubleshooting Guide

**Symptom: Claude ignores CLAUDE.md or previous instructions**

Fixes:
- Confirm file is in session's working directory
- Check for subdirectory CLAUDE.md that overrides parent
- Use verbose mode to see current prompt: `claude --verbose`
- Verify instructions are concise (<100 lines, <50 rules)

**Symptom: Performance degrades over long sessions ("forgets" early context)**

Fixes:
- Compact the session: `/compact preserve: [key items]`
- Extract stable facts into CLAUDE.md
- Snapshot parts of conversation to files, reference instead of repeating
- Consider starting fresh session with only concise context

**Symptom: /clear doesn't fully reset**

Known issue (GitHub #2538): Some file/branch caches may persist after `/clear`.

Fix:
- Quit Claude Code and restart (`claude`) to fully clear caches
- This re-reads CLAUDE.md as well

**Symptom: Context returns after /clear**

Known issue (GitHub #4629): Some old context can reappear in subsequent prompts.

Fix:
- Full restart instead of `/clear`
- If persistent, check for memory or cache corruption

**Symptom: Can't find session to resume**

Options:
- Use `claude --resume` for interactive picker
- Check `~/.claude/` directory for session files
- Session IDs shown in picker include timestamps and summaries

**Symptom: Checkpoints don't capture certain changes**

Remember: Checkpoints only track direct file edits via Claude's tools.

Not tracked:
- `rm`, `mv`, `cp` via bash
- Manual file edits
- Changes from other processes

Fix:
- Use Git for changes made via bash commands
- Commit before bash-based file operations

---

## Quick Reference

### Command Cheatsheet

| Category | Command | Purpose |
|----------|---------|---------|
| **Context** | `/context` | View context usage breakdown |
| | `/compact` | Compress context, preserve summary |
| | `/compact [instructions]` | Guided compression |
| | `/clear` | Wipe conversation history |
| | `/cost` | Token usage and cost stats |
| **Session** | `/resume` | Interactive session picker |
| | `claude -c` | Continue most recent |
| | `claude -r [id]` | Resume by session ID |
| | `claude --session-id [id]` | Start with specific ID |
| **Checkpoints** | `Esc + Esc` | Quick rewind access |
| | `/rewind` | Checkpoint interface |

### Decision Tree: What To Do When

```
Context filling up (>70%)?
├── Still on same task?
│   └── /compact with preservation instructions
├── Task complete?
│   └── /clear
└── Mixed relevant/irrelevant?
    └── /compact to keep relevant parts

Session interrupted?
├── Want to continue exactly?
│   └── claude --continue
├── Want specific old session?
│   └── claude --resume
└── Want fresh start?
    └── Just run: claude

Made bad changes?
├── Just last edit?
│   └── /rewind → code only
├── Conversation went wrong direction?
│   └── /rewind → conversation only
└── Everything wrong?
    └── /rewind → both

Performance degraded?
├── Long session (>20 iterations)?
│   └── /clear + fresh start
├── Irrelevant context accumulated?
│   └── /compact aggressively
└── CLAUDE.md too long?
    └── Refactor to be more concise
```

### Context Management Timeline

```
Session Start                                            Session End
    │                                                        │
    ▼                                                        ▼
[CLAUDE.md loaded]──[Work]──[~70%: /compact]──[More work]──[/clear or save]
    │                    │              │
    │                    │              └── With preservation instructions
    │                    │
    │                    └── Or /clear if switching tasks
    │
    └── Baseline: system + CLAUDE.md + MCP = ~20-30K tokens
```

### Ideal Workflow Patterns

**For Single Features:**
1. Start fresh or `/clear`
2. Define task clearly
3. Work iteratively (~20 iterations max)
4. Commit at milestones
5. `/clear` before next feature

**For Long Projects:**
1. Document progress to markdown files
2. `/clear` between work sessions
3. "Read progress.md and continue" pattern
4. Git commit at logical points
5. Use `/rewind` for experiments

**For Parallel Work:**
1. Name sessions by branch/feature
2. Use `claude --session-id [name]`
3. Resume specific session as needed
4. Keep sessions task-focused

---

## MCP Tools for Context Management

### Serena: Semantic Code Understanding

Serena is an MCP server that provides IDE-like semantic code understanding through Language Server Protocol (LSP) integration. It's particularly relevant for context management because it can significantly reduce token usage in large codebases.

**What Serena Does:**
- **Semantic code retrieval** — finds symbols, references, and relationships (not just text matching)
- **Token-efficient code access** — reads only necessary code instead of entire files
- **Cross-session memory** — stores project understanding in `.serena/memories/`
- **Symbol-level operations** — `find_symbol`, `find_referencing_symbols`, `insert_after_symbol`

**Installation:**
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena \
  serena start-mcp-server --context claude-code --project $(pwd)
```

> **Critical:** Use `--context claude-code` to disable Serena tools that duplicate Claude Code's native capabilities. This prevents tool conflicts.

**When Serena Shines:**
- Large codebases (10K+ lines) where token savings matter
- Understanding unfamiliar code structure
- Finding all usages of a symbol across the project
- Planning phases before implementation

### Known Issues and Mitigations

Serena has documented issues that can be mitigated through better practices:

#### Issue: Worse Debugging Performance
**Context:** Users report Claude becomes less capable at finding/fixing bugs when Serena is active for everything.

**Root Cause:** Serena's semantic tools optimize for *understanding* code structure, not for the *exploratory reading* that debugging requires. The process of reading files directly often provides Claude with important contextual clues.

**Mitigation:**
```markdown
# In CLAUDE.md
## Tool Selection
- Use Serena for: code structure analysis, finding symbols, planning refactors
- Use native Claude Code tools for: debugging, bug-fixing, exploratory investigation
- When debugging, prefer direct file reads over semantic queries
```

#### Issue: Claude Stops Using Serena Mid-Session
**Context:** Serena is active early in sessions but usage drops as conversation grows.

**Root Cause:** This affects ALL MCP tools — as context fills, MCP tool descriptions get deprioritized. Not Serena-specific.

**Mitigations:**

1. **SessionStart Hook** — Reinject tool preferences at session start:
```bash
# .claude/hooks/session-start.sh
echo "For code analysis, prefer Serena's find_symbol over grep"
echo "Use Serena for understanding code structure before making changes"
```

2. **Explicit Slash Command** — Create a `/go` command (Rob Marshall pattern):
```markdown
# .claude/commands/go.md
Always use:
- serena for semantic code retrieval and editing tools
- context7 for up-to-date documentation
Read the CLAUDE.md root file before you do anything.
#$ARGUMENTS
```

3. **Shorter Sessions** — Use Serena's memory handoff:
```
"Create a summary of our progress and save it to a Serena memory, 
then I'll start a fresh session"
```

#### Issue: Monorepo/Execution Conflicts
**Context:** Users report Serena making unwanted changes or conflicting with Claude Code's native tools.

**Root Cause:** Tool overlap — Serena has editing tools that compete with Claude Code's native tools when not configured properly.

**Mitigation:** Always use the `--context claude-code` flag, which disables overlapping tools. Additionally:
```markdown
# In CLAUDE.md
## Serena Usage
- Serena is for ANALYSIS only in this project
- All file edits go through Claude Code's native tools
- Use Serena's find_* tools, avoid its edit tools
```

### Serena Decision Framework

| Scenario | Use Serena? | Rationale |
|----------|-------------|-----------|
| Large codebase (10K+ lines) | ✅ Yes | Token savings significant |
| Small project (<5K lines) | ❌ No | Overhead exceeds benefit |
| Understanding new codebase | ✅ Yes | Semantic navigation valuable |
| Active debugging | ❌ No | Exploratory reading more effective |
| Refactoring planning | ✅ Yes | Find all references efficiently |
| Quick bug fix | ❌ No | Direct file access faster |
| Multi-session project | ✅ Yes | Memory persistence helps |

### Alternative MCP Tools for Context

If Serena's complexity isn't warranted, consider simpler alternatives:

**Memory Bank MCP** — Simple key-value persistence:
```bash
claude mcp add memory-bank -s user -- npx @movibe/memory-bank-mcp --mode code
```

**MCP Memory Keeper** — SQLite-backed context persistence:
```bash
claude mcp add memory-keeper -- npx mcp-memory-keeper
```

These provide cross-session memory without the semantic code analysis overhead.

---

## Sources

### Official Documentation
- [Claude Code - Checkpointing](https://docs.claude.com/en/docs/claude-code/checkpointing)
- [Claude Code - Session Management (Agent SDK)](https://platform.claude.com/docs/en/agent-sdk/sessions)
- [Claude Docs - Context Windows](https://docs.claude.com/en/docs/build-with-claude/context-windows)
- [Claude Docs - Slash Commands in SDK](https://docs.claude.com/en/docs/claude-code/sdk/sdk-slash-commands)
- [Claude Code - Slash Commands](https://code.claude.com/docs/en/slash-commands)
- [Anthropic - Enabling Claude Code to Work More Autonomously](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously) (September 2025)
- [Anthropic - Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Community Sources
- [Steve Kinney - Claude Code Session Management](https://stevekinney.com/courses/ai-development/claude-code-session-management)
- [Steve Kinney - Claude Code Compaction](https://stevekinney.com/courses/ai-development/claude-code-compaction)
- [MCPcat - Managing Claude Code Context](https://mcpcat.io/guides/managing-claude-code-context/)
- [Shrivu Shankar - How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature) (December 2025)
- [CometAPI - Managing Claude Code's Context: A Practical Handbook](https://www.cometapi.com/managing-claude-codes-context/)
- [ClaudeLog - How to Use Checkpoints in Claude Code](https://claudelog.com/faqs/how-to-use-checkpoints-in-claude-code/)
- [ClaudeLog - What is the /context Command](https://claudelog.com/faqs/what-is-context-command-in-claude-code/)
- [ClaudeLog - What is the --continue Flag](https://claudelog.com/faqs/what-is-continue-flag-in-claude-code/)
- [ClaudeLog - Restarting Claude Code](https://claudelog.com/faqs/restarting-claude-code/)
- [Skywork AI - Claude Code 2.0 Best Practices](https://skywork.ai/blog/claude-code-2-0-best-practices-ai-coding-workflow-2025/)
- [SmartScope - Claude Code 2.0 Checkpoint Practical Guide](https://smartscope.blog/en/generative-ai/claude/claude-code-2-0-checkpoint-patterns/)
- [Devoriales - Claude Code Cheat Sheet](https://devoriales.com/post/400/claude-code-cheat-sheet-the-reference-guide)
- [Sid Bharath - Cooking with Claude Code: Complete Guide](https://www.siddharthbharath.com/claude-code-the-complete-guide/)
- [Vibe Sparking AI - Mastering Claude Code Sessions](https://www.vibesparking.com/en/blog/ai/claude-code/docs/cli/2025-08-28-mastering-claude-code-sessions-continue-resume-automate/)

### GitHub Issues
- [Issue #1407 - Add session ID retrieval command](https://github.com/anthropics/claude-code/issues/1407)
- [Issue #2538 - /clear doesn't fully reset caches](https://github.com/anthropics/claude-code/issues/2538)
- [Issue #4629 - Context returns after /clear](https://github.com/anthropics/claude-code/issues/4629)

### Serena MCP Sources
- [GitHub - oraios/serena](https://github.com/oraios/serena) - Official repository (17K+ stars)
- [Serena Issue #449 - Context loss during debugging](https://github.com/oraios/serena/issues/449)
- [Serena Issue #241 - Claude rarely uses Serena](https://github.com/oraios/serena/issues/241)
- [Serena Discussion #340 - Usage drops as conversation grows](https://github.com/oraios/serena/discussions/340)
- [Serena Discussion #219 - Workflow with Claude Code](https://github.com/oraios/serena/discussions/219)
- [Rob Marshall - Turning Claude Code into a Development Powerhouse](https://robertmarshall.dev/blog/turning-claude-code-into-a-development-powerhouse/)
- [DEV.to - How to use AI more efficiently with Serena MCP](https://dev.to/webdeveloperhyper/how-to-use-ai-more-efficiently-for-free-serena-mcp-5gj6)
- [ClaudeLog - Serena MCP](https://claudelog.com/claude-code-mcps/serena/)

---

## Changelog

### v1.1 (December 11, 2025)
- Added MCP Tools for Context Management section
- Comprehensive Serena coverage with known issues and mitigations
- Alternative MCP tools (Memory Bank, Memory Keeper)
- Decision framework for when to use Serena

### v1.0 (December 11, 2025)
- Initial release
- Comprehensive coverage of context and session management
- Checkpointing and rewind patterns
- Advanced workflow patterns
- Troubleshooting guide
- Quick reference and decision trees
