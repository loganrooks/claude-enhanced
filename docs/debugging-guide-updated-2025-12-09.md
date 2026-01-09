# Debugging Guide

> **Last Updated:** December 9, 2025  
> **Claude Code Version:** v2.0+  
> **Purpose:** Troubleshooting common issues, diagnostic tools, recovery strategies

## What's New (December 2025)

| Feature | Status | Description |
|---------|--------|-------------|
| Checkpointing | ✅ GA | Automatic state tracking with /rewind |
| /usage Command | ✅ GA | Check subscription plan limits |
| /status Tabs | ✅ GA | Status, Usage, Config tabs in one view |
| Ctrl+R History | ✅ GA | Search prompt history |
| Sticky Thinking | ✅ GA | Tab toggle persists across sessions |
| Enhanced /doctor | ✅ GA | CLAUDE.md and MCP context for debugging |

---

## Quick Diagnostics

### First Steps When Something Goes Wrong

```bash
# 1. Check Claude Code health
claude doctor

# 2. Check your version
claude --version

# 3. Check current context usage
/context

# 4. View session cost/usage
/cost      # Session API token usage
/usage     # Subscription plan limits (NEW)

# 5. Check overall status
/status    # Shows Status, Usage, and Config tabs
```

### The /status Command (NEW in v2.0)

The `/status` command now shows three tabs:

| Tab | Information |
|-----|-------------|
| **Status** | IDE connection, extension version, model |
| **Usage** | Weekly and session usage percentages |
| **Config** | Checkpoints enabled, theme, settings |

Use this to diagnose connection issues, verify quotas, and check configuration.

---

## Recovery Strategies

### Checkpointing & /rewind (NEW in v2.0)

Claude Code automatically tracks all file edits, creating checkpoints you can restore.

**Access the rewind menu:**
- Press **Esc twice** (Esc + Esc)
- Or use the `/rewind` command

**Restore options:**

| Option | What It Does |
|--------|--------------|
| Conversation only | Rewind to a user message, keep code changes |
| Code only | Revert file changes, keep conversation |
| Both | Restore code AND conversation to prior point |

**When to use /rewind:**

```markdown
1. Claude went down wrong path
   → Rewind conversation to earlier message
   → Guide Claude in different direction

2. Code changes broke something
   → Rewind code only
   → Keep useful conversation context

3. Everything went wrong
   → Rewind both
   → Start fresh from known good state
```

**Checkpoint Limitations:**

⚠️ Checkpoints do NOT track:
- Files modified by bash commands (rm, mv, cp)
- Manual edits outside Claude Code
- Files in other directories
- Git operations
- Concurrent session edits

**Best practice:** Use Git for permanent version control, checkpoints for quick session-level undo.

### Git Recovery

```bash
# See what changed
git status
git diff

# Discard all changes
git checkout -- .

# Revert to specific commit
git reset --hard HEAD~1
```

### Session Recovery

```bash
# Resume previous session
claude --resume

# Continue most recent session
claude --continue

# List recent sessions
ls -lt ~/.claude/projects/*/
```

---

## Diagnostic Commands Reference

| Command | Purpose |
|---------|---------|
| `claude doctor` | Run system diagnostics (enhanced with CLAUDE.md/MCP context) |
| `/status` | Session status, usage, and config tabs |
| `/context` | Context window usage breakdown |
| `/cost` | Session API token usage |
| `/usage` | Subscription plan limits (NEW) |
| `/config` | View/edit configuration |
| `/mcp` | MCP server status |
| `/ide` | Connect to IDE |
| `/rewind` | Checkpoint restore menu (NEW) |
| `/hooks` | View registered hooks |
| `--verbose` | Detailed logging |
| `--debug` | Debug mode with full logs |
| `--mcp-debug` | Debug MCP configuration |

---

## Common Issues by Category

### Installation Problems

#### "Command not found: claude"

```bash
# Option 1: Use npx
npx @anthropic-ai/claude-code

# Option 2: Add npm global bin to PATH
echo 'export PATH=$PATH:$(npm config get prefix)/bin' >> ~/.bashrc
source ~/.bashrc

# Option 3: Fix npm permissions and reinstall
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g @anthropic-ai/claude-code

# Option 4: Use native installer
curl -fsSL https://claude.ai/install.sh | bash
```

#### Permission Denied During Installation

```bash
# Never use sudo with npm install -g
# Instead, fix ownership:
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
npm install -g @anthropic-ai/claude-code
```

#### Node.js Version Errors

```bash
# Check version
node --version  # Should be 18+ 

# If wrong version, use nvm
nvm install 20
nvm use 20
npm install -g @anthropic-ai/claude-code
```

### WSL-Specific Issues

#### OS/Platform Detection Issues

```bash
# WSL may use Windows npm - check paths
which npm   # Should start with /usr/, not /mnt/c/
which node  # Should start with /usr/, not /mnt/c/

# Fix: Install Node via Linux package manager
sudo apt update
sudo apt install nodejs npm

# Or use nvm in WSL
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### IDE Detection Fails in WSL2

WSL2 uses NAT networking which can block IDE detection.

**Option 1: Configure Windows Firewall**
```powershell
# In PowerShell as Admin
wsl hostname -I  # Find your WSL IP range

New-NetFirewallRule -DisplayName "Allow WSL2 Internal Traffic" `
  -Direction Inbound -Protocol TCP -Action Allow `
  -RemoteAddress 172.21.0.0/16 -LocalAddress 172.21.0.0/16
```

**Option 2: Use Mirrored Networking**
```ini
# ~/.wslconfig
[wsl2]
networkingMode=mirrored
```

### Context and Memory Issues

#### "Conversation too long" / Context Lost

```bash
# Compress conversation (keeps key context)
/compact

# Full reset (loses all context)
/clear

# Check current usage
/status  # Look at Usage tab
```

**Prevention:**
- Use `/compact` at 50% context usage
- Start new sessions for unrelated tasks
- Keep CLAUDE.md lean (<5K tokens)

#### CLAUDE.md Not Being Read

```bash
# Check file exists and location
ls -la CLAUDE.md
pwd

# Verify Claude sees it
claude
> "What does my CLAUDE.md say?"

# Check for multiple CLAUDE.md files causing conflicts
find . -name "CLAUDE.md" -o -name "CLAUDE.local.md"
ls ~/.claude/CLAUDE.md 2>/dev/null || echo "No user CLAUDE.md"
```

#### Conflicting CLAUDE.md Rules

```markdown
# Problem: Project says one thing, user config says another

# Project CLAUDE.md:
- Use TypeScript strict mode

# ~/.claude/CLAUDE.md:
- Skip TypeScript for quick prototypes

# Solution: Be more specific
# In project CLAUDE.md:
- Use TypeScript strict mode for all production code in src/
- Prototypes in /experiments/ can skip strict mode
```

### Performance Issues

#### Slow Responses

```bash
# Use faster model for simple tasks
claude --model=haiku

# Or switch during session
/model haiku

# Clear old context
/compact

# Check internet connection
curl -I https://api.anthropic.com
```

#### High Memory Usage

```bash
# Monitor Claude Code memory
top -p $(pgrep -f claude)

# Restart Claude Code
exit
claude

# Clear node module cache
npm cache clean --force
```

#### Token Limit Hit Too Fast

```bash
# Check what's consuming tokens
/context

# Identify heavy MCP servers
/mcp
# Disable unused ones

# Compact conversation
/compact
```

### Custom Commands Not Working

1. **Restart Claude Code** - Commands load on startup
2. **Check file format** - Must contain instructions, not just name
3. **Verify location** - Must be in `.claude/commands/`
4. **Check permissions** - File must be readable

```bash
# Debug command loading
ls -la .claude/commands/
cat .claude/commands/your-command.md
```

### Hook Issues

#### Hook Not Triggering

```bash
# Check hook configuration
cat .claude/settings.json | jq '.hooks'

# Verify matcher pattern
# "Edit" matches exact tool name
# "Edit|Write" matches either
# "*" matches all

# Test hook script manually
echo '{"tool_name":"Edit"}' | .claude/hooks/your-hook.py
```

#### Hook Blocking Everything

```json
// Check exit codes in your hook
// Exit 0 = allow
// Exit 2 = block (with feedback to Claude)
// Other = non-blocking error

// For JSON output hooks:
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow"
  }
}
```

#### Hook Debugging

```bash
# Run Claude with debug mode
claude --debug

# Debug output shows:
# [DEBUG] Executing hooks for PostToolUse:Write
# [DEBUG] Found 1 hook matchers in settings
# [DEBUG] Hook command completed with status 0
```

### MCP Issues

#### MCP Server Not Connecting

```bash
# Debug MCP configuration
claude --mcp-debug

# Check server is running
ps aux | grep mcp

# Verify configuration
cat ~/.claude/mcp_settings.json | jq
```

#### MCP Consuming Too Many Tokens

```bash
# Check MCP token usage
/context

# Disable unused servers
/mcp
# Select server → disable
```

### IDE Integration Issues

#### VS Code Extension Not Working

```bash
# Ensure VS Code is 1.98.0 or higher
code --version

# Verify extension is installed
code --list-extensions | grep -i claude

# Check Claude Code CLI is accessible
claude --version

# Use /ide to connect manually
claude
> /ide
```

#### JetBrains Plugin Issues

```bash
# Install plugin via:
# Settings → Plugins → Marketplace → "Claude Code"

# For Remote Development, install on REMOTE host

# Restart IDE (sometimes twice)

# Connect manually
claude
> /ide
```

#### Diff View Not Opening

```bash
# Configure diff tool
/config
# Set "Diff tool" to "auto"

# Or specify in settings
{
  "diffTool": "auto"
}
```

---

## Debugging Workflows

### Debug: Claude Making Wrong Assumptions

```markdown
1. Check CLAUDE.md for conflicting rules
2. Use /compact to clear stale context
3. Be more explicit in your prompt:
   "Based ONLY on the code in src/auth.py, not any assumptions..."
4. Add clarifying rules to CLAUDE.md
5. Use /rewind to try different approach
```

### Debug: Code Changes Breaking Things

```markdown
1. Use Esc+Esc or /rewind to roll back
2. Ask Claude to explain what it changed and why
3. Request smaller, incremental changes
4. Enable TDD workflow to catch issues early
5. Use checkpoints as safety net
```

### Debug: Claude Ignoring Instructions

```markdown
1. Check if instruction is in CLAUDE.md (soft) vs hooks (hard)
2. Use stronger language: "YOU MUST", "NEVER", "ALWAYS"
3. Add hook enforcement for critical rules
4. Break complex instructions into simpler steps
5. Check /context - is CLAUDE.md being truncated?
```

### Debug: Slow or Stuck Sessions

```markdown
1. Check /context - near limit?
2. Run /compact
3. Check network: curl -I https://api.anthropic.com
4. Try /model haiku for faster responses
5. Check /usage - hitting plan limits?
6. Start fresh session if needed
```

### Debug: Checkpoints Not Working

```markdown
Known limitations:
- Only tracks Claude's file editing tools
- Does NOT track: rm, mv, cp, git operations
- Does NOT track: manual edits, other sessions

Solutions:
1. Use Git for important checkpoints
   "Commit working state before major changes"

2. Avoid destructive bash commands
   "Use file editing tools instead of rm/mv"

3. Check /status Config tab
   "Verify checkpoints are enabled"
```

### Debug: Extended Thinking Not Engaging

```markdown
1. Use Tab to toggle thinking ON
   - Thinking mode is now "sticky" across sessions
   - May have been toggled off previously

2. Use thinking keywords
   - "think", "think hard", "think harder"
   - All trigger thinking mode

3. Frame problem as complex
   "This is a challenging problem. Think hard about trade-offs."

4. Check model
   - Extended thinking works best with Opus
```

### Debug: Subagents Not Working

```markdown
1. Check subagent definition
   ls -la .claude/agents/

2. Verify @mention syntax
   @security-auditor (not /security-auditor)

3. Check tool permissions in agent definition
   tools: Read, Grep, Glob

4. Use --agents flag for dynamic agents
   claude --agents="custom-agent:path/to/agent.md"
```

---

## Prompt History Search (NEW)

Press **Ctrl+R** to search through prompt history:

```
(reverse-i-search): auth
> "Review the authentication module for security issues"
```

- Press Ctrl+R repeatedly to cycle through older matches
- Plain text matching (not regex)
- Search terms highlighted in results

---

## Reporting Bugs

```bash
# Built-in bug reporter (includes context)
/bug

# Manual report with logs
claude doctor > diagnostic.txt
# File issue at github.com/anthropics/claude-code
```

---

## Preventive Measures

### Daily Habits

- [ ] Start sessions with `claude doctor`
- [ ] Use `/compact` before context gets full
- [ ] Keep CLAUDE.md under 5K tokens
- [ ] Commit working code before major changes
- [ ] Check `/usage` before large tasks

### Weekly Maintenance

- [ ] Review and prune CLAUDE.md
- [ ] Update Claude Code: `npm update -g @anthropic-ai/claude-code`
- [ ] Check for hook script errors in logs
- [ ] Review MCP server token usage
- [ ] Clear old session data if needed

### Project Setup

- [ ] Create focused CLAUDE.md with clear rules
- [ ] Set up hooks for enforcement
- [ ] Configure appropriate permissions
- [ ] Test custom commands work
- [ ] Verify checkpoints are enabled (/status → Config)

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | API authentication |
| `CLAUDE_CODE_SHELL_PREFIX` | Wrap shell commands |
| `CLAUDE_CODE_PROXY_RESOLVES_HOSTS` | Proxy DNS resolution |
| `HTTPS_PROXY` | HTTP proxy configuration |
| `DEBUG` | Enable debug logging |

---

## Log Locations

```bash
# Session transcripts
~/.claude/projects/{project-path}/{session-uuid}.jsonl

# Debug logs (when using --debug)
# Output to stderr

# Hook execution logs
# View with claude --debug or /hooks

# MCP server logs
# View with --mcp-debug
```

---

## Quick Troubleshooting Checklist

```markdown
□ Is Claude Code up to date? (claude --version)
□ Is Node.js 18+? (node --version)
□ Does claude doctor pass?
□ Is CLAUDE.md being read? (ask Claude)
□ Is context usage reasonable? (/context)
□ Are hooks configured correctly? (/hooks)
□ Are MCP servers responding? (/mcp)
□ Is IDE connected? (/status → Status tab)
□ Is there quota remaining? (/usage)
□ Has session been compacted recently? (/compact)
```

---

## References

**Official Documentation:**
- [Claude Code Troubleshooting](https://code.claude.com/docs/en/troubleshooting)
- [Checkpointing Reference](https://code.claude.com/docs/en/checkpointing)
- [Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
- [CLI Reference](https://code.claude.com/docs/en/cli-reference)

**Community Resources:**
- [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- [ClaudeLog Troubleshooting](https://claudelog.com/troubleshooting/)
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)

---

## Changelog

### December 9, 2025
- Added Checkpointing and /rewind documentation
- Added /usage command for plan limits
- Added /status tabs (Status, Usage, Config)
- Added Ctrl+R prompt history search
- Added sticky thinking mode note
- Added enhanced /doctor capabilities
- Added subagent debugging section
- Expanded hook debugging with exit codes
- Added checkpoint limitations and workarounds
- Updated diagnostic commands reference

### December 4, 2025
- Initial debugging guide
- Installation troubleshooting
- WSL-specific issues
- MCP and IDE debugging
- Basic recovery strategies
