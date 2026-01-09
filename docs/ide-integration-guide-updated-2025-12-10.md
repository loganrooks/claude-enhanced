# IDE Integration Guide

> **Last Updated:** December 10, 2025  
> **Claude Code Version:** v2.0+  
> **Purpose:** VS Code, JetBrains, Desktop App, and Terminal CLI setup and features

## Overview

Claude Code offers multiple integration options to match your workflow:

| Environment | Best For | Key Features |
|-------------|----------|--------------|
| Terminal CLI | Power users, automation | Full features, scripting, rewind |
| VS Code Extension | Visual developers | Native sidebar, inline diffs |
| VS Code Legacy CLI | Terminal + IDE hybrid | Auto context sharing, IDE diffs |
| JetBrains Plugin | JetBrains users | Similar to VS Code legacy |
| JetBrains Claude Agent | AI Assistant subscribers | Native AI chat integration |
| Claude Desktop App | Parallel sessions | Git worktrees, multi-instance |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Claude Code Integrations                            │
├─────────────────┬─────────────────┬──────────────────┬──────────────────────┤
│  Terminal CLI   │  VS Code Ext.   │   JetBrains      │   Desktop App        │
│  (Full Power)   │   (Beta)        │   (2 Options)    │   (Parallel)         │
├─────────────────┼─────────────────┼──────────────────┼──────────────────────┤
│ • All features  │ • Sidebar UI    │ Plugin:          │ • Git worktrees      │
│ • Rewind        │ • Plan mode     │ • Diff viewer    │ • Multiple sessions  │
│ • Headless mode │ • Auto-accept   │ • Selection ctx  │ • .worktreeinclude   │
│ • Hooks         │ • Inline diffs  │ • Diagnostics    │ • Web integration    │
│ • MCP servers   │ • MCP servers   │                  │ • Bundled version    │
│ • Background    │ • @-mentions    │ Claude Agent:    │                      │
│   tasks         │ • Multi-session │ • AI Assistant   │                      │
│ • Ctrl+R search │                 │ • JetBrains MCP  │                      │
└─────────────────┴─────────────────┴──────────────────┴──────────────────────┘
```

---

## Terminal CLI (Most Complete)

The terminal CLI remains the most feature-complete option.

### Installation

```bash
# Via npm (recommended)
npm install -g @anthropic-ai/claude-code

# Via Homebrew (macOS)
brew install anthropic-ai/tap/claude-code
```

### Key Features

| Feature | How |
|---------|-----|
| Start session | `claude` |
| Resume session | `claude --resume` |
| Headless mode | `claude -p "prompt"` |
| Model selection | `claude --model opus` |
| Debug mode | `claude --verbose` |

### Essential Commands

```bash
# In-session commands
/help          # Show all commands
/status        # Current session info
/context       # Context window usage
/cost          # Token usage
/compact       # Compress conversation
/clear         # Start fresh
/model         # Switch model
/config        # Configuration
/rewind        # Undo changes (or Esc Esc)
/ide           # Connect to IDE
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Toggle extended thinking (sticky) |
| Esc Esc | Rewind/checkpoint |
| Ctrl+C | Cancel current operation |
| Ctrl+D | End session |
| Ctrl+R | Search prompt history |
| Ctrl+B | Background current task |

### Terminal-Only Features

These features are only available in the terminal CLI:

- **Rewind/Checkpoints**: Full code and conversation state restoration
- **Background Tasks**: Long-running processes that don't block Claude
- **Headless Mode**: Non-interactive scripting (`claude -p`)
- **Searchable History**: Ctrl+R for past prompts
- **Vim Mode**: `/vim` for vim keybindings
- **Full Hook Support**: All 10 lifecycle events

---

## VS Code Extension (Beta)

The native VS Code extension provides a graphical interface for Claude Code.

### Installation

1. Open VS Code (1.98.0 or higher required)
2. Go to Extensions (Cmd+Shift+X)
3. Search "Claude Code" by Anthropic
4. Install and reload

**Or from terminal:**
```bash
code --install-extension Anthropic.claude-code
```

### Features

| Feature | Description |
|---------|-------------|
| Sidebar Panel | Dedicated Claude Code UI via Spark icon |
| Plan Mode | Review and edit Claude's plans before accepting |
| Auto-Accept Mode | Automatically apply changes as they're made |
| Extended Thinking | Toggle via button in bottom-right of prompt input |
| File Management | @-mention files or attach via file picker |
| MCP Servers | Use servers configured through CLI |
| Multi-Session | Run multiple sessions simultaneously |
| Conversation History | Access past conversations |

### Setup Tips

```bash
# Ensure 'code' command is available
# In VS Code: Cmd+Shift+P → "Shell Command: Install 'code' command in PATH"

# Then run Claude from integrated terminal
code .
# Open terminal in VS Code (Ctrl+`)
claude
```

### Not Yet Implemented

The following features are **not yet available** in the VS Code extension:

| Feature | Workaround |
|---------|------------|
| MCP/Plugin config UI | Use `/mcp` or `/plugin` (opens terminal-based config) |
| Subagent configuration | Configure through CLI first |
| Checkpoints | Not available |
| Conversation rewinding | `/rewind` coming soon |
| `#` shortcut (add to memory) | Not supported |
| `!` shortcut (bash commands) | Not supported |
| Tab completion for files | Not supported |
| Model selection UI | Use `/General Config` → enter model string directly |

### Third-Party Provider Setup

For Bedrock, Vertex AI, or custom gateways:

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "AWS_REGION": "us-east-2",
    "AWS_PROFILE": "your-profile"
  }
}
```

Disable login prompt:
```json
{
  "claudeCode.disableLoginPrompt": true
}
```

### Security Considerations

When running with auto-edit in VS Code:
- Claude may modify IDE configuration files
- Consider enabling [VS Code Restricted Mode](https://code.visualstudio.com/docs/editor/workspace-trust#_restricted-mode) for untrusted workspaces
- Use manual approval mode for sensitive operations
- Review all changes before accepting

---

## VS Code Legacy CLI Integration

The original integration allows Claude Code in the terminal to interact with VS Code.

### How It Works

```bash
# Auto-activates when running from VS Code integrated terminal
claude

# Or connect from external terminal
claude
> /ide
```

### Features

| Feature | Description |
|---------|-------------|
| Selection Context | Current selection/tab shared automatically |
| Diff Viewing | Changes shown in IDE diff viewer |
| File References | Cmd+Option+K (Mac) / Alt+Ctrl+K (Win/Linux) |
| Diagnostic Sharing | Lint/syntax errors shared automatically |

### Configuration

```bash
# Set diff tool to auto for IDE detection
claude
> /config
# Set "Diff tool" → "auto"
```

Or in settings.json:
```json
{
  "diffTool": "auto"
}
```

### Compatible IDEs

Both the extension and legacy integration work with:
- Visual Studio Code
- Cursor
- Windsurf
- VSCodium

---

## Cursor Integration

Cursor (VS Code fork) works similarly to VS Code.

### Setup

```bash
# Install cursor CLI
# In Cursor: Cmd+Shift+P → "Install 'cursor' to shell"

# Run Claude in Cursor terminal
cursor .
# Open integrated terminal
claude
```

### Installing Claude Code Extension in Cursor

If the extension doesn't auto-detect Cursor:

```bash
# Find your Claude Code installation
claude --version
# Note: Claude Code installed at ~/.claude/local

# Install VSIX manually
cursor --install-extension ~/.claude/local/vscode/claude-code.vsix
```

---

## JetBrains IDEs

Two integration options available for JetBrains IDEs (IntelliJ IDEA, PyCharm, WebStorm, GoLand, PhpStorm, etc.):

### Option 1: Claude Code Plugin (Anthropic)

#### Installation

1. Settings → Plugins → Marketplace
2. Search "Claude Code [Beta]"
3. Install from Anthropic PBC
4. Restart IDE (sometimes twice)

#### Usage

```bash
# In JetBrains integrated terminal
claude

# Or connect from external terminal
claude
> /ide
```

#### Features

| Feature | Shortcut |
|---------|----------|
| Quick launch | Cmd+Esc (Mac) / Ctrl+Esc (Win/Linux) |
| File reference | Cmd+Option+K (Mac) / Alt+Ctrl+K |
| Diff viewing | Automatic in IDE diff viewer |
| Selection context | Automatic |
| Diagnostic sharing | Automatic |

#### Plugin Settings

Settings → Tools → Claude Code [Beta]:

| Setting | Description |
|---------|-------------|
| Claude command | Path to claude binary |
| Option+Enter for multiline | macOS only |
| Automatic updates | Auto-update plugin |

### Option 2: Claude Agent (JetBrains AI Assistant)

Built into JetBrains AI Assistant subscription—no separate plugin needed.

#### Activation

1. Ensure JetBrains AI Assistant is enabled
2. Open AI Chat
3. Switch agent to "Claude" in the dropdown

#### Features

| Feature | Description |
|---------|-------------|
| Native IDE integration | Runs directly in AI chat |
| JetBrains MCP Server | Full IDE capabilities access |
| Plan Mode | Preview implementation strategy |
| Approval-based operations | Won't edit without permission |
| Context management | Add files, folders, images |

#### Benefits Over Plugin

- No separate authentication
- Uses existing AI subscription
- Unified chat interface with Junie
- Access to IDE features via MCP

### Remote Development

For JetBrains Remote Development:
- Install plugin on **remote host**, not local client
- Settings → Plugin (Host) → Install Claude Code

### Security Note

When running with auto-edit in JetBrains:
- Claude may modify IDE config files
- Consider disabling auto-edit for sensitive operations
- Review all changes before accepting

### WSL Troubleshooting

If getting "No available IDEs detected" on WSL2:

**Option 1: Configure Windows Firewall**
```powershell
# Get WSL2 IP range
wsl hostname -I

# Add firewall rule
New-NetFirewallRule -DisplayName "Allow WSL2 Internal Traffic" `
  -Direction Inbound -Protocol TCP -Action Allow `
  -RemoteAddress 172.21.0.0/16 -LocalAddress 172.21.0.0/16
```

**Option 2: Switch to mirrored networking**

Add to `%USERPROFILE%\.wslconfig`:
```ini
[wsl2]
networkingMode=mirrored
```

---

## Claude Code Desktop App

Released November 2025 alongside Opus 4.5, the desktop app provides native parallel session management.

### Installation

Download from [claude.ai/download](https://claude.ai/download)

**Note:** Local sessions not available on Windows arm64.

### Features

| Feature | Description |
|---------|-------------|
| Git Worktrees | Multiple isolated sessions per repo |
| .worktreeinclude | Copy gitignored files to worktrees |
| Web Sessions | Launch cloud sessions from desktop |
| Bundled Version | Auto-managed Claude Code updates |
| Parallel Sessions | Run multiple tasks simultaneously |

### Using Git Worktrees

Each session gets its own isolated worktree:

```
project/
├── main branch (your IDE)
└── ~/.claude-worktrees/
    ├── feature-auth/      # Session 1
    ├── fix-bug-123/       # Session 2
    └── refactor-api/      # Session 3
```

### .worktreeinclude File

Create `.worktreeinclude` in your repo root to copy gitignored files:

```
.env
.env.local
.env.*
**/.claude/settings.local.json
```

Files matching these patterns AND listed in .gitignore will be copied to new worktrees.

### Enterprise Configuration

Organizations can disable local Claude Code use with the `isClaudeCodeForDesktopEnabled` enterprise policy option.

---

## Connecting External Terminal to IDE

If you prefer running Claude from an external terminal:

```bash
# Start Claude
claude

# Connect to running IDE
/ide

# Claude will detect:
# - VS Code
# - Cursor
# - JetBrains IDEs
# - Windsurf
# - Other supported editors
```

---

## Feature Comparison Matrix

| Feature | Terminal | VS Code Ext | VS Code Legacy | JetBrains Plugin | JetBrains Agent | Desktop |
|---------|:--------:|:-----------:|:--------------:|:----------------:|:---------------:|:-------:|
| Full command set | ✅ | ✅ | ✅ | ✅ | Partial | ✅ |
| Inline diffs | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Rewind | ✅ | ❌* | ❌ | ❌ | ❌ | ✅ |
| Headless mode | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MCP servers | ✅ | ✅ | ✅ | ✅ | ✅** | ✅ |
| Hooks | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Selection context | Manual | Manual | Auto | Auto | ✅ | Manual |
| Diagnostic sharing | Manual | Manual | Auto | Auto | ✅ | Manual |
| Background tasks | ✅ | Limited | Limited | Limited | ❌ | ✅ |
| Multiple sessions | Via tmux | ✅ | ❌ | ❌ | ❌ | ✅ |
| Plan mode | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Git worktrees | Manual | ❌ | ❌ | ❌ | ❌ | ✅ |

*Coming soon  
**Via JetBrains MCP Server

---

## Recommended Setups by Use Case

### Web Developer (React/Node)

```
VS Code Extension (Beta)
├── Sidebar panel for visual feedback
├── Inline diffs for quick changes
├── ESLint/TypeScript errors shared
└── npm scripts in integrated terminal
```

### Enterprise Java/Kotlin

```
JetBrains + Claude Agent
├── Native AI chat integration
├── JetBrains MCP server access
├── Refactoring tools + Claude
└── Single AI subscription
```

### DevOps/Automation

```
Terminal CLI
├── Headless mode for CI/CD
├── Full hook support
├── Scripting and piping
└── SSH/remote servers
```

### Multi-Task Developer

```
Claude Desktop App
├── Git worktrees for isolation
├── Run 3+ sessions in parallel
├── Bug fix + feature + docs simultaneously
└── Web session integration
```

### Terminal Power User

```
Terminal CLI + /ide command
├── Run Claude from any terminal
├── Connect to any IDE for diffs
├── Full rewind support
├── Vim mode, Ctrl+R history
```

---

## Troubleshooting

### VS Code Extension Not Working

```bash
# Verify VS Code version (need 1.98.0+)
code --version

# Reinstall extension
code --uninstall-extension Anthropic.claude-code
code --install-extension Anthropic.claude-code

# Run from integrated terminal specifically
```

### JetBrains Plugin Not Detecting

```bash
# Restart IDE (sometimes twice needed)
# Verify plugin is installed
# Check Settings → Tools → Claude Code

# For Remote Dev, install on remote host
```

### IDE Not Found with /ide

```bash
# Ensure IDE CLI is on PATH
which code    # VS Code
which cursor  # Cursor
which idea    # IntelliJ

# Add to PATH if missing
# For VS Code: Cmd+Shift+P → "Shell Command: Install 'code'"
```

### Diffs Not Opening in IDE

```bash
# Configure diff tool
/config
# Set "Diff tool" → "auto"

# Or in settings.json
{
  "diffTool": "auto"
}
```

### JetBrains Esc Key Not Working

If Esc doesn't interrupt Claude in JetBrains terminals:

1. Settings → Keymap
2. Search for Esc-related shortcuts
3. Remove conflicting bindings or add exception for terminal
4. Apply changes

---

## References

**Official Documentation:**
- [VS Code Integration](https://code.claude.com/docs/en/vs-code)
- [JetBrains Integration](https://code.claude.com/docs/en/jetbrains)
- [Desktop App](https://code.claude.com/docs/en/desktop)
- [Troubleshooting Guide](https://code.claude.com/docs/en/troubleshooting)

**JetBrains Resources:**
- [Claude Agent in JetBrains IDEs](https://blog.jetbrains.com/ai/2025/09/introducing-claude-agent-in-jetbrains-ides/)
- [AI Assistant Documentation](https://www.jetbrains.com/help/ai-assistant/ai-chat.html)

**Community Resources:**
- [ClaudeLog IDE FAQs](https://claudelog.com/faqs/how-to-use-claude-code-with-vs-code/)
- [Cursor VSIX Workaround](https://gist.github.com/sotayamashita/3da81de9d6f2c307d15bf83c9e6e1af6)

---

## Changelog

### December 10, 2025
- Complete guide rewrite based on December 2025 sources
- Added Claude Code Desktop App section (released Nov 2025)
- Added JetBrains Claude Agent (AI Assistant integration)
- Documented VS Code extension "not yet implemented" features
- Added .worktreeinclude documentation
- Added feature comparison matrix
- Added WSL troubleshooting for JetBrains
- Added security considerations for auto-edit
- Verified all features against official documentation

### December 4, 2025
- Initial guide creation
- VS Code, JetBrains, terminal setup
- Cursor integration basics
