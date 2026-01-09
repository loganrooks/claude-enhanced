# Slash Commands & CLI Reference Guide

**Updated:** December 11, 2025  
**Claude Code Version:** 2.0+  
**Model:** Opus 4.5 / Sonnet 4.5

---

## Overview

Claude Code provides three types of commands:

| Type | Invocation | Example |
|------|------------|---------|
| **CLI Commands** | Terminal, before starting | `claude -p "query"` |
| **Slash Commands** | Inside session, start with `/` | `/help`, `/compact` |
| **Custom Commands** | User-defined, markdown files | `/review`, `/deploy` |

This guide covers all three comprehensively.

---

## Built-in Slash Commands

### Session Management

| Command | Purpose | Notes |
|---------|---------|-------|
| `/clear` | Clear conversation history | Resets context completely |
| `/compact [instructions]` | Compact conversation with optional focus | Preserves key context while reducing tokens |
| `/exit` | Exit the REPL | Also: Ctrl+D |
| `/resume` | Resume a previous conversation | Interactive session picker |
| `/rewind` | Rewind conversation and/or code | Also: Esc+Esc |

### Configuration & Status

| Command | Purpose | Notes |
|---------|---------|-------|
| `/config` | Open Settings interface (Config tab) | Edit settings interactively |
| `/context` | Visualize context usage as colored grid | Shows token distribution |
| `/cost` | Show token usage statistics | See current session costs |
| `/doctor` | Check installation health | Diagnose problems |
| `/help` | Display available commands | Shows all slash commands |
| `/permissions` | View or update permissions | Tool access control |
| `/privacy-settings` | View and update privacy settings | Data handling preferences |
| `/status` | Open Settings interface (Status tab) | Version, model, account info |
| `/usage` | Show plan limits and rate status | Subscription plans only |

### Project & Memory

| Command | Purpose | Notes |
|---------|---------|-------|
| `/add-dir` | Add additional working directories | For monorepos, multi-project |
| `/init` | Initialize project with CLAUDE.md | Auto-generates project config |
| `/memory` | Edit CLAUDE.md memory files | Persistent project instructions |

### Code & Development

| Command | Purpose | Notes |
|---------|---------|-------|
| `/review` | Request code review | Reviews current changes |
| `/security-review` | Security review of pending changes | Scans for vulnerabilities |
| `/pr-comments` | View pull request comments | GitHub integration |
| `/todos` | List current todo items | Tracked from conversation |

### Model & Agents

| Command | Purpose | Notes |
|---------|---------|-------|
| `/model` | Select or change AI model | Sonnet, Opus, Haiku |
| `/agents` | Manage custom subagents | View, create, configure |
| `/bashes` | List background bash tasks | Manage async processes |

### Plugins & Extensions

| Command | Purpose | Notes |
|---------|---------|-------|
| `/plugin` | Manage Claude Code plugins | Install, enable, disable |
| `/mcp` | Manage MCP server connections | OAuth, status, tools |
| `/hooks` | Manage hook configurations | Event handlers |

### IDE & Terminal

| Command | Purpose | Notes |
|---------|---------|-------|
| `/ide` | Manage IDE integrations | VS Code, JetBrains status |
| `/terminal-setup` | Install Shift+Enter binding | iTerm2, VS Code terminals |
| `/vim` | Enter vim mode | Alternating insert/command |
| `/statusline` | Set up status line UI | Terminal customization |

### Other

| Command | Purpose | Notes |
|---------|---------|-------|
| `/bug` | Report bugs to Anthropic | Sends conversation data |
| `/export [filename]` | Export conversation | To file or clipboard |
| `/install-github-app` | Set up GitHub Actions | For repository |
| `/login` | Switch Anthropic accounts | Authentication |
| `/logout` | Sign out | End session |
| `/output-style [style]` | Set output style | Selection menu or direct |
| `/release-notes` | View release notes | What's new |
| `/sandbox` | Enable sandboxed bash | Filesystem/network isolation |

---

## CLI Commands

### Basic Usage

```bash
# Start interactive REPL
claude

# Start with initial prompt
claude "explain this project"

# Print mode - query and exit (headless)
claude -p "explain this function"

# Process piped content
cat logs.txt | claude -p "explain these errors"

# Continue most recent conversation
claude -c

# Resume specific session
claude -r "session-id" "continue this task"

# Update Claude Code
claude update
```

### CLI Flags Reference

#### Session & Mode Flags

| Flag | Description | Example |
|------|-------------|---------|
| `-p`, `--print` | Print response without interactive mode | `claude -p "query"` |
| `-c`, `--continue` | Load most recent conversation | `claude -c` |
| `-r`, `--resume` | Resume specific session by ID | `claude -r abc123 "query"` |
| `--fork-session` | Create new session ID when resuming | `claude -r abc123 --fork-session` |
| `--session-id` | Use specific UUID for conversation | `claude --session-id "550e8400-..."` |

#### Model & Agent Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--model` | Set model (alias or full name) | `claude --model opus` |
| `--agent` | Specify agent for session | `claude --agent code-reviewer` |
| `--agents` | Define custom subagents via JSON | See below |
| `--fallback-model` | Fallback when default overloaded | `claude -p --fallback-model sonnet` |

#### Output Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--output-format` | Output format: `text`, `json`, `stream-json` | `claude -p --output-format json` |
| `--input-format` | Input format: `text`, `stream-json` | `claude -p --input-format stream-json` |
| `--json-schema` | Get validated JSON matching schema | `claude -p --json-schema '{"type":"object"}'` |
| `--include-partial-messages` | Include streaming events | With `stream-json` output |
| `--verbose` | Enable verbose logging | `claude --verbose` |

#### Permission Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--permission-mode` | Start in permission mode | `claude --permission-mode plan` |
| `--allowedTools` | Allow specific tools | `"Bash(git:*)" "Read"` |
| `--disallowedTools` | Disallow specific tools | `"Edit" "Write"` |
| `--dangerously-skip-permissions` | Skip all permission prompts | Use with caution |
| `--max-turns` | Limit agentic turns | `claude -p --max-turns 3` |

#### System Prompt Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--append-system-prompt` | Append to default prompt | `--append-system-prompt "Use TypeScript"` |
| `--system-prompt` | Replace entire system prompt | `--system-prompt "You are a Python expert"` |
| `--system-prompt-file` | Load prompt from file | `--system-prompt-file ./prompt.txt` |

> **Recommendation:** Use `--append-system-prompt` for most cases. It preserves Claude Code's built-in capabilities while adding your requirements.

#### Configuration Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--add-dir` | Add working directories | `claude --add-dir ../apps ../lib` |
| `--settings` | Load settings from file/JSON | `claude --settings ./settings.json` |
| `--setting-sources` | Specify setting sources | `claude --setting-sources user,project` |
| `--tools` | Specify available tools | `--tools "Bash,Edit,Read"` |

#### MCP & Plugin Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--mcp-config` | Load MCP servers from file | `claude --mcp-config ./mcp.json` |
| `--strict-mcp-config` | Only use specified MCP config | Ignores other MCP configs |
| `--plugin-dir` | Load plugins from directory | `claude --plugin-dir ./my-plugins` |

#### Debug Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--debug` | Enable debug mode | `claude --debug "api,hooks"` |
| `-v`, `--version` | Output version number | `claude -v` |
| `--ide` | Auto-connect to IDE | `claude --ide` |

### Agents Flag Format

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use after code changes.",
    "prompt": "You are a senior code reviewer. Focus on quality and security.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors.",
    "prompt": "You are an expert debugger. Identify root causes."
  }
}'
```

| Field | Required | Description |
|-------|----------|-------------|
| `description` | Yes | When the subagent should be invoked |
| `prompt` | Yes | System prompt for the subagent |
| `tools` | No | Array of tools (inherits all if omitted) |
| `model` | No | `sonnet`, `opus`, or `haiku` |

### Output Format Examples

**JSON Output:**
```bash
claude -p "analyze code" --output-format json
```

```json
{
  "type": "result",
  "subtype": "success",
  "total_cost_usd": 0.003,
  "duration_ms": 1234,
  "num_turns": 6,
  "result": "Response text...",
  "session_id": "abc123"
}
```

**Scripting Pattern:**
```bash
# Extract session ID
SESSION=$(claude -p "start review" --output-format json | jq -r '.session_id')

# Continue session
claude --resume "$SESSION" -p "check compliance"
claude --resume "$SESSION" -p "generate summary"
```

---

## Custom Slash Commands

### Creating Custom Commands

**Project Commands** (shared with team):
```bash
mkdir -p .claude/commands
echo "Review this code for security issues:" > .claude/commands/security.md
```
Usage: `/security` — shows "(project)" in `/help`

**Personal Commands** (all projects):
```bash
mkdir -p ~/.claude/commands
echo "Analyze performance bottlenecks:" > ~/.claude/commands/perf.md
```
Usage: `/perf` — shows "(user)" in `/help`

### Command Syntax

**Basic Command:**
```markdown
# .claude/commands/review.md
Review this code for:
- Security vulnerabilities
- Performance issues
- Code style violations
```

**With Arguments ($ARGUMENTS):**
```markdown
# .claude/commands/fix-issue.md
Fix GitHub issue #$ARGUMENTS following our coding standards.

Steps:
1. Use `gh issue view` to get details
2. Implement the fix
3. Run tests
4. Create commit
```
Usage: `/fix-issue 123`

**With Positional Arguments ($1, $2, etc.):**
```markdown
# .claude/commands/review-pr.md
---
argument-hint: [pr-number] [priority] [assignee]
description: Review pull request with priority
---

Review PR #$1 with priority $2 and assign to $3.
Focus on security, performance, and code style.
```
Usage: `/review-pr 456 high alice`

### Command Frontmatter

| Field | Purpose | Default |
|-------|---------|---------|
| `description` | Brief description | First line of prompt |
| `argument-hint` | Arguments hint for autocomplete | None |
| `allowed-tools` | Tools the command can use | Inherits from conversation |
| `model` | Specific model to use | Inherits from conversation |
| `disable-model-invocation` | Prevent SlashCommand tool from calling | false |

**Full Example:**
```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit with context
model: claude-3-5-haiku-20241022
---

## Context
- Current git status: !`git status`
- Current git diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Task
Create a git commit with message: $ARGUMENTS
```

### Command Features

**Bash Execution (!`command`):**
```markdown
## Context
- Git status: !`git status`
- Current branch: !`git branch --show-current`
```
Output is included in command context before Claude processes.

**File References (@path):**
```markdown
Review the implementation in @src/utils/helpers.js
Compare @src/old.js with @src/new.js
```

**Namespacing (subdirectories):**
```
.claude/commands/
├── frontend/
│   └── component.md    → /component (project:frontend)
├── backend/
│   └── api.md          → /api (project:backend)
└── deploy.md           → /deploy (project)
```

---

## Keyboard Shortcuts

### Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| **Esc** | Stop Claude's current action |
| **Esc+Esc** | Open rewind menu (jump to previous message) |
| **Tab** | Toggle extended thinking |
| **Shift+Tab** | Cycle permission modes (Normal → Auto-accept → Plan) |
| **Ctrl+C** | Cancel current operation |
| **Ctrl+C twice** | Hard exit |
| **Ctrl+D** | Exit Claude Code |

### Input Editing (Bash-style)

| Shortcut | Action |
|----------|--------|
| **Ctrl+A** | Move to start of line |
| **Ctrl+E** | Move to end of line |
| **Option+F** | Move word forward |
| **Option+B** | Move word backward |
| **Ctrl+W** | Delete previous word |
| **Ctrl+R** | Search command history |
| **Up/Down** | Navigate command history |

### Multi-line Input

| Method | Description |
|--------|-------------|
| **Shift+Enter** | New line (requires `/terminal-setup`) |
| **\ + Enter** | Quick escape for newline |
| **Option+Enter** | Alternative (macOS) |

### Special Input

| Shortcut | Action |
|----------|--------|
| **Ctrl+V** | Paste images (not Cmd+V on macOS) |
| **Shift+Drag** | Reference files (not open in new tab) |
| **@filename** | Reference file in prompt |
| **#** | Add memory quickly |
| **?** | Show available shortcuts |

---

## MCP Slash Commands

MCP servers expose prompts as slash commands:

```bash
# Format
/mcp__<server-name>__<prompt-name> [arguments]

# Examples
/mcp__github__list_prs
/mcp__github__pr_review 456
/mcp__jira__create_issue "Bug title" high
```

### Managing MCP

```bash
# In terminal
claude mcp list              # List configured servers
claude mcp add <name> <cmd>  # Add server

# In session
/mcp                         # View servers, status, authenticate
```

### MCP Permissions

```bash
# Approve all tools from server
mcp__github

# Approve specific tool
mcp__github__get_issue

# Wildcards NOT supported
# ❌ mcp__github__*
```

---

## Plugin Commands

Plugin commands work like custom commands but are distributed via marketplaces:

```bash
# Direct invocation (no conflicts)
/command-name

# Plugin-prefixed (disambiguation)
/plugin-name:command-name

# With arguments
/pr-review-toolkit:review-pr 123
```

Plugin commands appear in `/help` after installation.

---

## SlashCommand Tool

Claude can invoke custom commands programmatically during conversation.

**Enable by referencing in prompts:**
```markdown
# In CLAUDE.md
> Run /write-tests when writing new functions.
```

**Supported commands must:**
- Be user-defined (not built-in like `/compact`)
- Have `description` frontmatter field

**Disable SlashCommand tool:**
```bash
/permissions
# Add to deny rules: SlashCommand
```

**Disable specific command:**
```markdown
---
disable-model-invocation: true
description: Manual-only command
---
```

**Permission rules:**
```bash
# Exact match
SlashCommand:/commit

# Prefix match (allows arguments)
SlashCommand:/review-pr:*
```

**Character budget:** 15,000 characters default for command descriptions in context. Set via `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable.

---

## Common Patterns

### CI/CD Integration

```bash
# Automated code review
git diff HEAD~1 | claude -p \
  --append-system-prompt "You are a security engineer" \
  --output-format json \
  --allowedTools "Read,Grep" \
  > review.json

# Check test results
claude -p "run tests and report failures" \
  --max-turns 5 \
  --output-format json | jq '.subtype'
```

### Multi-step Automation

```bash
#!/bin/bash
# Start session
SESSION=$(claude -p "analyze codebase" --output-format json | jq -r '.session_id')

# Continue with context
claude -r "$SESSION" -p "identify security issues"
claude -r "$SESSION" -p "suggest fixes"
claude -r "$SESSION" -p "generate report"
```

### Parallel Execution

```bash
# Run multiple analyses in parallel
claude -p "analyze frontend" &
claude -p "analyze backend" &
wait
```

### Context Management

```bash
# Check context usage
/context

# Compact when nearing limits
/compact "preserve current task context"

# Clear for fresh start
/clear
```

---

## Skills vs Slash Commands

| Aspect | Slash Commands | Skills |
|--------|----------------|--------|
| **Complexity** | Simple prompts | Complex capabilities |
| **Structure** | Single .md file | Directory with SKILL.md + resources |
| **Discovery** | Explicit (`/command`) | Automatic (context-based) |
| **Files** | One file only | Multiple files, scripts, templates |

**Use slash commands for:**
- Frequently-used prompts
- Quick templates
- Explicit control over invocation

**Use Skills for:**
- Complex workflows
- Multiple reference files
- Automatic activation by context

---

## Quick Reference Card

### Most Used Commands

| Command | Purpose |
|---------|---------|
| `/help` | See all commands |
| `/init` | Initialize project |
| `/compact` | Reduce context |
| `/clear` | Reset conversation |
| `/cost` | Check token usage |
| `/model` | Switch model |
| `/rewind` | Undo changes |
| `/doctor` | Troubleshoot |

### Most Used CLI Flags

| Flag | Purpose |
|------|---------|
| `-p` | Print mode (headless) |
| `-c` | Continue last session |
| `-r <id>` | Resume specific session |
| `--model` | Set model |
| `--output-format json` | JSON output |
| `--max-turns` | Limit turns |
| `--verbose` | Debug output |

### Most Used Shortcuts

| Shortcut | Action |
|----------|--------|
| Esc | Stop Claude |
| Esc+Esc | Rewind |
| Tab | Toggle thinking |
| Shift+Tab×2 | Plan mode |
| Ctrl+C×2 | Exit |

---

## Sources

### Official Documentation
- [Slash Commands](https://code.claude.com/docs/en/slash-commands) — Complete slash commands reference
- [CLI Reference](https://code.claude.com/docs/en/cli-reference) — CLI flags and options
- [Interactive Mode](https://code.claude.com/docs/en/interactive-mode) — Keyboard shortcuts and input modes
- [Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) — Official workflows guide

### Community Resources
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code) — Curated commands collection
- [wshobson/commands](https://github.com/wshobson/commands) — 57 production-ready commands
- [Claude Code Cheatsheet](https://awesomeclaude.ai/code-cheatsheet) — Comprehensive reference
- [First Principles Reference](https://firstprinciplescg.com/resources/claude-code-slash-commands-the-complete-reference-guide/) — Complete command listing

### Guides
- [Builder.io Guide](https://www.builder.io/blog/claude-code) — Practical tips
- [Shipyard Cheatsheet](https://shipyard.build/blog/claude-code-cheat-sheet/) — Config and workflows
- [Egghead Shortcuts](https://egghead.io/the-essential-claude-code-shortcuts~dgsee) — Essential shortcuts

---

## Changelog

### v1.0 (December 11, 2025)
- Initial comprehensive reference
- 30+ built-in slash commands documented
- Complete CLI flags reference
- Custom commands with frontmatter
- Keyboard shortcuts reference
- MCP and plugin commands
- Common patterns and examples
