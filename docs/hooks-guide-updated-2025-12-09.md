# Hooks System Guide

> **Last Updated:** December 9, 2025  
> **Claude Code Version:** v2.0+  
> **Purpose:** Deterministic runtime enforcement of best practices

## What's New (December 2025)

| Feature | Status | Description |
|---------|--------|-------------|
| SessionStart/SessionEnd | ✅ GA | Session lifecycle hooks with env persistence |
| PermissionRequest | ✅ GA | Auto-approve/deny permission dialogs |
| PreCompact | ✅ GA | Hook before compact operations |
| SubagentStop | ✅ GA | Hook when subagents finish |
| Prompt-based hooks | ✅ GA | LLM-evaluated decisions (`type: "prompt"`) |
| Plugin hooks | ✅ GA | Hooks defined in plugin packages |
| updatedInput | ✅ GA | Modify tool parameters before execution |
| CLAUDE_ENV_FILE | ✅ GA | Persist environment variables from SessionStart |
| CLAUDE_CODE_REMOTE | ✅ GA | Detect web vs CLI execution context |

---

## What Are Hooks?

Hooks are shell commands (or LLM prompts) that execute at specific lifecycle events in Claude Code. Unlike CLAUDE.md (which is soft guidance), hooks provide **deterministic enforcement**.

```
CLAUDE.md: "Please run tests before committing"  ← Can be ignored
Hooks: Block commit if tests fail                ← Cannot be ignored
```

## Hook Events Reference

| Event | Trigger | Use Case |
|-------|---------|----------|
| `UserPromptSubmit` | Before processing user input | Validate prompts, add context |
| `PreToolUse` | Before any tool executes | Block dangerous actions, modify params |
| `PermissionRequest` | When permission dialog shown | Auto-approve/deny permissions |
| `PostToolUse` | After tool completes | Run linters, formatters, tests |
| `Notification` | When Claude sends notifications | Custom notification routing |
| `Stop` | When Claude finishes responding | Cleanup, summary generation |
| `SubagentStop` | When a subagent finishes | Aggregate results, verify work |
| `PreCompact` | Before compact operation | Backup transcripts |
| `SessionStart` | New session or resume | Load context, set environment |
| `SessionEnd` | Session terminates | Cleanup, logging, archiving |

---

## Hook Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      User Prompt                             │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    SessionStart Hooks                        │
│  • Load development context                                  │
│  • Set environment variables (CLAUDE_ENV_FILE)               │
│  • Initialize dependencies                                   │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│              UserPromptSubmit Hooks                          │
│  • Validate for dangerous patterns                           │
│  • Add context (timestamp, project info)                     │
│  • Block if policy violation                                 │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   Claude Processing                          │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│               PreToolUse Hooks (per tool)                    │
│  • Block dangerous commands                                  │
│  • Modify tool parameters (updatedInput)                     │
│  • Add dry-run flags                                         │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│               PermissionRequest Hooks                        │
│  • Auto-approve safe operations                              │
│  • Auto-deny dangerous patterns                              │
│  • Modify parameters before approval                         │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   Tool Execution                             │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│              PostToolUse Hooks (per tool)                    │
│  • Run linters/formatters                                    │
│  • Execute tests                                             │
│  • Validate output                                           │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                Stop / SubagentStop Hooks                     │
│  • Verify task completion                                    │
│  • Force continuation if needed                              │
│  • Aggregate subagent results                                │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   SessionEnd Hooks                           │
│  • Cleanup temporary files                                   │
│  • Log session statistics                                    │
│  • Archive transcripts                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Configuration

### Location Hierarchy

```
~/.claude/settings.json         # User-level (all projects)
.claude/settings.json           # Project-level
.claude/settings.local.json     # Personal overrides (gitignored)
Enterprise managed policy       # Organization settings
```

### Basic Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Matchers

| Pattern | Matches |
|---------|---------|
| `Write` | Exact match for Write tool |
| `Edit\|Write` | Either Edit or Write |
| `Bash` | Any Bash command |
| `Bash(git commit:*)` | Git commit commands only |
| `mcp__*` | All MCP tools |
| `mcp__github__*` | All GitHub MCP tools |
| `Notebook.*` | All Notebook tools (regex) |
| `*` or `""` | All tools |

### Events Without Matchers

Some events don't use matchers:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/prompt-validator.py"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/init-session.sh"
          }
        ]
      }
    ]
  }
}
```

**SessionStart matchers:**
- `startup` - New session
- `resume` - From `--resume`, `--continue`, or `/resume`
- `clear` - From `/clear`
- `compact` - From auto or manual compact

**Notification matchers:**
- `permission_prompt` - Permission requests
- `idle_prompt` - Claude waiting for input (60+ seconds)
- `auth_success` - Authentication success
- `elicitation_dialog` - MCP tool elicitation

---

## Hook Types

### Command Hooks (Traditional)

Execute shell commands:

```json
{
  "type": "command",
  "command": ".claude/hooks/validate.py",
  "timeout": 30
}
```

### Prompt-Based Hooks (NEW)

Use an LLM to evaluate decisions:

```json
{
  "type": "prompt",
  "prompt": "Evaluate if Claude should stop: $ARGUMENTS. Check if all tasks are complete.",
  "timeout": 30,
  "model": "haiku"
}
```

**Key differences:**

| Feature | Command Hooks | Prompt-Based Hooks |
|---------|---------------|-------------------|
| Execution | Runs bash script | Queries LLM (Haiku) |
| Decision logic | You implement in code | LLM evaluates context |
| Setup complexity | Requires script file | Just configure prompt |
| Context awareness | Limited to script logic | Natural language understanding |
| Performance | Fast (local execution) | Slower (API call) |
| Use case | Deterministic rules | Context-aware decisions |

**Prompt-based hooks work best with:**
- `Stop` - Intelligently decide if Claude should continue
- `SubagentStop` - Evaluate if subagent completed its task
- `UserPromptSubmit` - Validate user prompts with LLM
- `PreToolUse` / `PermissionRequest` - Context-aware permission decisions

---

## Environment Variables

Available in hook scripts:

| Variable | Description |
|----------|-------------|
| `CLAUDE_PROJECT_DIR` | Absolute path to project root |
| `CLAUDE_FILE_PATHS` | Space-separated list of affected files |
| `CLAUDE_SESSION_ID` | Current session ID |
| `CLAUDE_TOOL_NAME` | Name of the tool being used |
| `CLAUDE_ENV_FILE` | File path for persisting env vars (SessionStart only) |
| `CLAUDE_CODE_REMOTE` | `"true"` if running in web environment |
| `CLAUDE_PLUGIN_ROOT` | Absolute path to plugin directory (plugin hooks) |

### Using Project-Relative Paths

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-style.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Hook Input (stdin)

Hooks receive JSON data via stdin:

### Common Fields

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../session.jsonl",
  "cwd": "/Users/project",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse"
}
```

### PreToolUse Input

```json
{
  "hook_event_name": "PreToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

### PostToolUse Input

```json
{
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_response": {
    "filePath": "/path/to/file.txt",
    "success": true
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

### Stop / SubagentStop Input

```json
{
  "hook_event_name": "Stop",
  "stop_hook_active": true,
  "agent_id": "subagent-123",
  "agent_transcript_path": "/path/to/subagent/transcript.jsonl"
}
```

**Important:** `stop_hook_active` is true when Claude is already continuing due to a stop hook. Check this to prevent infinite loops.

### SessionStart Input

```json
{
  "hook_event_name": "SessionStart",
  "source": "startup"
}
```

### SessionEnd Input

```json
{
  "hook_event_name": "SessionEnd",
  "reason": "exit"
}
```

**Reason values:** `clear`, `logout`, `prompt_input_exit`, `other`

---

## Hook Output

### Simple: Exit Codes

| Exit Code | Behavior |
|-----------|----------|
| 0 | Success. stdout shown in verbose mode (or added as context for UserPromptSubmit/SessionStart) |
| 2 | Blocking error. stderr fed back to Claude |
| Other | Non-blocking error. stderr shown in verbose mode |

### Advanced: JSON Output

Return structured JSON for sophisticated control:

```json
{
  "continue": true,
  "stopReason": "string",
  "suppressOutput": true,
  "systemMessage": "string",
  "hookSpecificOutput": { ... }
}
```

### PreToolUse Decision Control

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Auto-approved documentation file",
    "updatedInput": {
      "file_path": "/modified/path.txt"
    }
  }
}
```

**Decision values:**
- `"allow"` - Bypass permission system
- `"deny"` - Block tool execution
- `"ask"` - Prompt user for confirmation

**Note:** `decision` and `reason` fields are deprecated. Use `hookSpecificOutput.permissionDecision` and `hookSpecificOutput.permissionDecisionReason`.

### PermissionRequest Decision Control

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow",
      "updatedInput": {
        "command": "npm run lint"
      }
    }
  }
}
```

For deny:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "deny",
      "message": "Dangerous command blocked",
      "interrupt": true
    }
  }
}
```

### PostToolUse Decision Control

```json
{
  "decision": "block",
  "reason": "Linting errors found",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "ESLint found 3 errors in the modified file"
  }
}
```

### Stop/SubagentStop Decision Control

```json
{
  "decision": "block",
  "reason": "Tests are still failing. Please fix the remaining 2 test failures."
}
```

### SessionStart Decision Control

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Project context: React 18 app with TypeScript. Current sprint: Auth refactor."
  }
}
```

### Prompt-Based Hook Response Schema

For `type: "prompt"` hooks, the LLM must respond with:

```json
{
  "decision": "approve",
  "reason": "All tasks appear complete",
  "continue": false,
  "stopReason": "Work completed successfully",
  "systemMessage": "Session finished"
}
```

---

## Session Lifecycle Hooks

### SessionStart: Environment Setup

Persist environment variables for the entire session:

```bash
#!/bin/bash
# .claude/hooks/init-session.sh

if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
  echo 'export API_KEY=your-api-key' >> "$CLAUDE_ENV_FILE"
  echo 'export PATH="$PATH:./node_modules/.bin"' >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

**Capture environment changes from setup commands:**

```bash
#!/bin/bash

ENV_BEFORE=$(export -p | sort)

# Setup commands that modify environment
source ~/.nvm/nvm.sh
nvm use 20

if [ -n "$CLAUDE_ENV_FILE" ]; then
  ENV_AFTER=$(export -p | sort)
  comm -13 <(echo "$ENV_BEFORE") <(echo "$ENV_AFTER") >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

### SessionStart: Load Context

```python
#!/usr/bin/env python3
import json
import subprocess

# Get recent git activity
recent_commits = subprocess.run(
    ["git", "log", "--oneline", "-5"],
    capture_output=True, text=True
).stdout

# Get current branch
branch = subprocess.run(
    ["git", "branch", "--show-current"],
    capture_output=True, text=True
).stdout.strip()

# Return context for Claude
output = {
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": f"Current branch: {branch}\nRecent commits:\n{recent_commits}"
    }
}
print(json.dumps(output))
```

### SessionEnd: Cleanup and Logging

```bash
#!/bin/bash
# .claude/hooks/session-cleanup.sh

# Archive transcript
if [ -n "$CLAUDE_TRANSCRIPT_PATH" ]; then
  cp "$CLAUDE_TRANSCRIPT_PATH" ~/.claude/archives/
fi

# Clean up temp files
rm -rf /tmp/claude-session-*

# Log session end
echo "$(date): Session ended" >> ~/.claude/session-log.txt
```

---

## Permission Automation

### PermissionRequest: Auto-Approve Safe Operations

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "Read",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/auto-approve-reads.py"
        }]
      }
    ]
  }
}
```

```python
#!/usr/bin/env python3
import json
import sys

input_data = json.load(sys.stdin)
tool_input = input_data.get("tool_input", {})
file_path = tool_input.get("file_path", "")

# Auto-approve documentation and config reads
SAFE_PATTERNS = [".md", ".mdx", ".txt", ".json", ".yaml", ".yml"]

if any(file_path.endswith(ext) for ext in SAFE_PATTERNS):
    output = {
        "hookSpecificOutput": {
            "hookEventName": "PermissionRequest",
            "decision": {
                "behavior": "allow"
            }
        }
    }
    print(json.dumps(output))
    sys.exit(0)

# Let other files go through normal permission flow
sys.exit(0)
```

### PermissionRequest: Block Dangerous Commands

```python
#!/usr/bin/env python3
import json
import sys
import re

input_data = json.load(sys.stdin)
tool_name = input_data.get("tool_name", "")
tool_input = input_data.get("tool_input", {})

if tool_name == "Bash":
    command = tool_input.get("command", "")
    
    DANGEROUS = [
        r'rm\s+.*-[rf]',
        r'sudo\s+rm',
        r'chmod\s+777',
        r'>\s*/etc/',
        r'curl.*\|\s*sh',
    ]
    
    for pattern in DANGEROUS:
        if re.search(pattern, command, re.IGNORECASE):
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "PermissionRequest",
                    "decision": {
                        "behavior": "deny",
                        "message": f"Blocked dangerous pattern: {pattern}",
                        "interrupt": False
                    }
                }
            }
            print(json.dumps(output))
            sys.exit(0)

sys.exit(0)
```

---

## Prompt-Based Hook Examples

### Intelligent Stop Hook

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "You are evaluating whether Claude should stop working.\n\nContext: $ARGUMENTS\n\nAnalyze the conversation and determine if:\n1. All user-requested tasks are complete\n2. Any errors need to be addressed\n3. Follow-up work is needed\n\nRespond with JSON: {\"decision\": \"approve\" or \"block\", \"reason\": \"your explanation\"}",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### SubagentStop Verification

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Evaluate if this subagent completed its task.\n\nInput: $ARGUMENTS\n\nCheck if:\n- The assigned task was completed\n- Any errors occurred\n- Additional work is needed\n\nReturn: {\"decision\": \"approve\" or \"block\", \"reason\": \"explanation\"}"
          }
        ]
      }
    ]
  }
}
```

---

## Plugin Hooks

Plugins can provide hooks that integrate with your configuration:

### Plugin Hook Structure

```json
{
  "description": "Automatic code formatting",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

**Plugin hooks:**
- Defined in plugin's `hooks/hooks.json`
- Automatically merged when plugin is enabled
- Use `${CLAUDE_PLUGIN_ROOT}` for plugin-relative paths
- Run alongside user/project hooks in parallel

---

## Best Practices Enforcement

### TDD Enforcement (Block-at-Commit)

**Key insight:** Don't block during writes—let agent finish its plan, then check at commit.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit:*)",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/require-tests-pass.sh"
        }]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# .claude/hooks/require-tests-pass.sh

if [ ! -f /tmp/tests-passed ]; then
  echo "❌ Cannot commit: Tests must pass first" >&2
  echo "Run 'npm test' and ensure all tests pass" >&2
  exit 2
fi
exit 0
```

### Auto-Format on Edit

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/auto-format.sh"
        }]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# .claude/hooks/auto-format.sh

for file in $CLAUDE_FILE_PATHS; do
  case "$file" in
    *.py)
      ruff check --fix "$file" && black "$file"
      ;;
    *.ts|*.tsx|*.js|*.jsx)
      prettier --write "$file"
      ;;
    *.go)
      gofmt -w "$file"
      ;;
  esac
done
```

**⚠️ Warning:** Auto-formatting hooks can be token-expensive. One team discovered a Prettier hook drained 160k tokens. Consider using `run_in_background: true` or block-at-commit instead.

### Type Check TypeScript Files

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "if [[ \"$CLAUDE_FILE_PATHS\" =~ \\.(ts|tsx)$ ]]; then npx tsc --noEmit --skipLibCheck || echo '⚠️ TypeScript errors'; fi"
        }]
      }
    ]
  }
}
```

### Run Tests After Code Changes

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/run-tests.sh",
          "run_in_background": true
        }]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# .claude/hooks/run-tests.sh

if [[ "$CLAUDE_FILE_PATHS" =~ (src/|tests/) ]]; then
  npm test --watchAll=false 2>&1 | head -20
  
  if [ $? -eq 0 ]; then
    touch /tmp/tests-passed
    echo "✅ Tests passed"
  else
    rm -f /tmp/tests-passed
    echo "❌ Tests failed"
  fi
fi
```

---

## PreCompact Hook

Backup transcripts before compaction:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cp \"$CLAUDE_TRANSCRIPT_PATH\" ~/.claude/backups/pre-compact-$(date +%s).jsonl"
        }]
      }
    ]
  }
}
```

---

## MCP Tool Hooks

MCP tools follow the pattern `mcp__<server>__<tool>`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [{
          "type": "command",
          "command": "echo 'Memory operation' >> ~/mcp-ops.log"
        }]
      },
      {
        "matcher": "mcp__github__create_issue",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/validate-github-issue.py"
        }]
      }
    ]
  }
}
```

---

## Common Patterns

### Block-at-Submit (Recommended)

Don't block during writes—let agent finish its plan, then check at commit:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit:*)",
        "hooks": [{ "command": "check-all-tests.sh" }]
      }
    ]
  }
}
```

### Hint Hooks (Non-Blocking)

Fire-and-forget feedback without blocking:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{
          "command": "echo 'Remember to update tests!'",
          "suppressOutput": false
        }]
      }
    ]
  }
}
```

### State Tracking

Use temp files to track state across hooks:

```bash
# In PostToolUse after tests pass
touch /tmp/tests-passed

# In PreToolUse before commit
test -f /tmp/tests-passed || exit 2
```

### Web vs CLI Detection

```bash
#!/bin/bash

if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
  # Running in web environment
  echo "Web mode: skipping desktop notifications"
else
  # Running in local CLI
  osascript -e 'display notification "Hook triggered" with title "Claude Code"'
fi
```

---

## Debugging Hooks

### Basic Troubleshooting

1. **Check configuration** - Run `/hooks` to see registered hooks
2. **Verify syntax** - Ensure JSON is valid
3. **Test commands** - Run hook commands manually first
4. **Check permissions** - Scripts must be executable
5. **Review logs** - Use `claude --debug` for execution details

### Debug Mode

```bash
claude --debug
```

Output shows:

```
[DEBUG] Executing hooks for PostToolUse:Write
[DEBUG] Getting matching hook commands for PostToolUse with query: Write
[DEBUG] Found 1 hook matchers in settings
[DEBUG] Matched 1 hooks for query "Write"
[DEBUG] Found 1 hook commands to execute
[DEBUG] Executing hook command: <command> with timeout 60000ms
[DEBUG] Hook command completed with status 0: <stdout>
```

### Log All Hook Executions

```bash
#!/bin/bash
# Wrapper that logs everything
echo "[$(date)] Hook: $0 Input: $(cat)" >> ~/.claude/hook-debug.log
exec /path/to/actual-hook.sh
```

---

## Security Considerations

### Best Practices

1. **Validate and sanitize inputs** - Never trust input data blindly
2. **Always quote shell variables** - Use `"$VAR"` not `$VAR`
3. **Block path traversal** - Check for `..` in file paths
4. **Use absolute paths** - Specify full paths for scripts
5. **Skip sensitive files** - Avoid `.env`, `.git/`, keys

### Configuration Safety

Claude Code snapshots hooks at startup:
- Changes during session require `/hooks` review
- Prevents malicious modification during session
- Restart or use `/hooks` menu to apply changes

---

## Full Example Configuration

```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup",
      "hooks": [{
        "type": "command",
        "command": ".claude/hooks/init-session.sh"
      }]
    }],
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": ".claude/hooks/check-secrets.py"
      }]
    }],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/block-dangerous.py"
        }]
      },
      {
        "matcher": "Bash(git commit:*)",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/require-tests-pass.sh"
        }]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "Read",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/auto-approve-reads.py"
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/auto-format.sh"
          },
          {
            "type": "command",
            "command": ".claude/hooks/run-tests.sh",
            "run_in_background": true
          }
        ]
      }
    ],
    "Stop": [{
      "hooks": [{
        "type": "prompt",
        "prompt": "Check if all tasks are complete: $ARGUMENTS\nReturn: {\"decision\": \"approve\" or \"block\", \"reason\": \"...\"}"
      }]
    }],
    "SessionEnd": [{
      "hooks": [{
        "type": "command",
        "command": ".claude/hooks/session-cleanup.sh"
      }]
    }]
  }
}
```

---

## Execution Details

- **Timeout**: 60 seconds default, configurable per hook
- **Parallelization**: All matching hooks run in parallel
- **Deduplication**: Identical hook commands deduplicated automatically
- **Environment**: Runs in current directory with Claude Code's environment
- **Input**: JSON via stdin
- **Output varies by event:**
  - PreToolUse/PermissionRequest/PostToolUse/Stop/SubagentStop: Progress in verbose mode
  - Notification/SessionEnd: Debug log only
  - UserPromptSubmit/SessionStart: stdout added as context

---

## References

**Official Documentation:**
- [Hooks Reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [Get Started with Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)

**Community Resources:**
- [Claude Code Hooks Mastery](https://github.com/disler/claude-code-hooks-mastery)
- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
- [LaunchDarkly SessionStart Hook](https://github.com/launchdarkly-labs/claude-code-session-start-hook)

---

## Changelog

### December 9, 2025
- Added SessionStart, SessionEnd, PermissionRequest, PreCompact, SubagentStop events
- Added prompt-based hooks (`type: "prompt"`) documentation
- Added plugin hooks section
- Updated decision control with new `permissionDecision` API
- Added `updatedInput` for parameter modification
- Added `CLAUDE_ENV_FILE` for environment persistence
- Added `CLAUDE_CODE_REMOTE` environment variable
- Added SubagentStop `agent_id` and `agent_transcript_path` fields
- Added Notification matchers (permission_prompt, idle_prompt, auth_success, elicitation_dialog)
- Added SessionStart matchers (startup, resume, clear, compact)
- Expanded security considerations
- Added debugging section

### December 4, 2025
- Initial guide with core hook events
- PreToolUse, PostToolUse, UserPromptSubmit, Stop, Notification
- Basic patterns and examples
