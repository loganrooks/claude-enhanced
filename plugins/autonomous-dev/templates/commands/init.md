---
description: Initialize autonomous development system for this project
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion, mcp__serena__*
argument-hint: [mode: full|validate|reset]
---

# Project Initialization: $ARGUMENTS

**MODE: INTERACTIVE SYSTEM SETUP**

This command sets up the autonomous development system for your project. It adapts to your specific context, requirements, and workflows.

---

## Mode Selection

| Mode | Purpose |
|------|---------|
| `full` (default) | Complete interactive initialization |
| `validate` | Verify existing setup, run health check |
| `reset` | Clear and reinitialize (preserves memories) |

---

## Phase 1: Workspace Discovery

### 1.1 Detect Project Structure
```bash
# Check existing structure
ls -la
ls -la .claude/ 2>/dev/null || echo "No .claude directory"

# Detect programming languages
ls *.py pyproject.toml setup.py 2>/dev/null && echo "Python detected"
ls *.ts *.js package.json tsconfig.json 2>/dev/null && echo "TypeScript/JavaScript detected"
ls *.rs Cargo.toml 2>/dev/null && echo "Rust detected"
ls *.go go.mod 2>/dev/null && echo "Go detected"

# Check for existing docs
ls README* SPEC* REQUIREMENTS* ROADMAP* 2>/dev/null
```

### 1.2 Analyze Existing Files
- Read README.md if exists
- Read SPEC.md, REQUIREMENTS.md if exist
- Check for existing CLAUDE.md
- Detect test framework (pytest, jest, cargo test, etc.)
- Identify build tools (uv, npm, cargo, make, etc.)

### 1.3 Discovery Summary
```markdown
## Workspace Discovery

**Project Root**: [path]
**Languages**: [detected languages]
**Build Tool**: [detected build tool]
**Test Framework**: [detected test framework]
**Existing Docs**: [list]
**Existing .claude/**: [yes/no, with contents if yes]
```

---

## Phase 2: Vision Exploration (Interactive)

Use AskUserQuestion to understand the project:

### 2.1 Project Identity
```
Question: "What is this project in one sentence?"
Question: "Who are the primary users/audience?"
Question: "What's the current development phase?"
Options: [Planning, Early Development, Active Development, Maintenance, Legacy]
```

### 2.2 Key Constraints
```
Question: "What are the most important technical constraints?"
Examples: Performance, Security, Compatibility, Simplicity, etc.

Question: "Are there any 'never do' rules for this project?"
Examples: No breaking changes, No new dependencies, etc.
```

### 2.3 Workflow Preferences
```
Question: "How should the system handle uncertainty?"
Options:
- Ask immediately (interactive)
- Make reasonable assumptions, validate later
- Always explore first, then ask

Question: "What level of autonomy do you want after requirements are confirmed?"
Options:
- Full autonomy (only escalate on blockers)
- Moderate (checkpoint before major changes)
- Conservative (confirm each phase)
```

### 2.4 Custom Workflows
```
Question: "Are there project-specific workflows that need commands?"
Examples: Data migration, API sync, Custom deployment, etc.
```

---

## Phase 3: System Configuration

### 3.1 Create Directory Structure
```bash
mkdir -p .claude/{commands,agents,hooks,logs/signals}
```

### 3.2 Copy Base Templates

Copy from plugin templates, adapting for detected context:
- All commands (auto, explore, plan, implement, etc.)
- All agents (reviewers, diagnostic, improvement)
- Base hooks

### 3.3 Generate CLAUDE.md

Create project-specific CLAUDE.md from template:
```markdown
# [Project Name]

## Quick Start for AI Assistants
1. Read this file completely
2. [Phase-specific guidance]
3. Run `/project:plan` before coding
4. Use Serena memories for context

## Vision
[From user input in Phase 2]

## Current Phase
[From user input]

## Stack
[From Phase 1 discovery]

## Documentation
[From Phase 1 discovery]

## Rules
ALWAYS:
- [Generated from constraints]

NEVER:
- [Generated from constraints]

[... rest of template sections ...]
```

### 3.4 Initialize Serena Memories

```
write_memory("project_vision", """
# Project Vision

**Name**: [project name]
**Description**: [one sentence description]
**Users**: [primary users]
**Phase**: [current phase]

## Key Constraints
[from user input]

## Development Philosophy
[from workflow preferences]

---
Created by /project:init on [date]
""")

write_memory("decision_log", """
# Decision Log

Record architectural decisions here.

## Format
### YYYY-MM-DD: [Decision Title]
**Decision**: [What was decided]
**Rationale**: [Why this choice]
**Trade-offs**: [Downsides and mitigations]

---
Initialized by /project:init on [date]
""")
```

---

## Phase 4: Validation

### 4.1 Structure Check
```bash
# Verify all files created
ls -la .claude/
ls -la .claude/commands/
ls -la .claude/agents/
ls -la .claude/hooks/ 2>/dev/null
```

### 4.2 Health Check
```bash
# CLAUDE.md length
wc -l CLAUDE.md

# Component counts
echo "Commands: $(ls .claude/commands/ | wc -l)"
echo "Agents: $(ls .claude/agents/ | wc -l)"
echo "Hooks: $(ls .claude/hooks/ 2>/dev/null | wc -l)"
```

### 4.3 Memory Verification
```
list_memories()
# Should show project_vision, decision_log
```

### 4.4 Test Command Availability
Verify key commands are accessible:
- /project:auto
- /project:explore
- /project:plan
- /project:improve

---

## Phase 5: Getting Started Guide

```markdown
## Initialization Complete!

### Your Setup
- **Project**: [name]
- **CLAUDE.md**: [line count] lines
- **Commands**: [count] available
- **Agents**: [count] reviewers
- **Memories**: project_vision, decision_log

### Quick Start

1. **Start a session**:
   ```
   /project:resume
   ```

2. **Develop a feature** (autonomous):
   ```
   /project:auto <feature description>
   ```

3. **Or step-by-step**:
   ```
   /project:explore <topic>
   /project:plan <feature>
   /project:implement <feature>
   ```

4. **End a session**:
   Update `session_handoff` memory with status.

### Customization

Add project-specific:
- **Commands**: `.claude/commands/your-command.md`
- **Agents**: `.claude/agents/your-reviewer.md`
- **Rules**: Edit CLAUDE.md "Rules" section

### Self-Improvement

The system will improve itself over time:
- Run `/project:improve` after PR merges
- Run `/project:diagnose` when issues occur
- Check `.claude/logs/signals/` for captured feedback

### Need Help?

- Review CLAUDE.md for project context
- Check `.claude/commands/` for available workflows
- Use `/project:explore` to investigate the codebase
```

---

## Validate Mode

If $ARGUMENTS is "validate":

1. Skip Phases 1-3
2. Run Phase 4 health checks
3. Report any issues found
4. Suggest fixes

---

## Reset Mode

If $ARGUMENTS is "reset":

1. Preserve Serena memories (they contain project knowledge)
2. Remove .claude/commands/, .claude/agents/, .claude/hooks/
3. Remove CLAUDE.md
4. Run full initialization
