# Interactive Initialization Protocol

**Updated:** December 11, 2025  
**Purpose:** Context-aware, dialogue-driven project configuration for Claude Code  
**Status:** Synthesis of ecosystem best practices into actionable protocol

---

## Overview

The Interactive Initialization Protocol transforms project setup from a one-size-fits-all `/init` command into a **context-aware dialogue** that produces tailored configurations. Rather than generating generic CLAUDE.md files, this protocol discovers your project's specific needs and generates optimal configurations across all Claude Code systems.

### Why This Protocol?

| Existing Approach | This Protocol |
|-------------------|---------------|
| Generic `/init` output | Context-aware configuration |
| User manually edits | Claude asks and configures |
| One-size-fits-all | Adapts to project type |
| Assumes user knows needs | Discovers what's needed |
| Static document | Living questionnaire |
| Single artifact | Comprehensive ecosystem setup |

### What Gets Configured

The protocol produces tailored configurations for:

- **CLAUDE.md** — Project-specific guidance optimized for instruction limits
- **Hooks** — Deterministic enforcement based on detected tooling
- **Custom Commands** — Project-appropriate slash commands
- **MCP Servers** — Recommended integrations for detected stack
- **Permissions** — Security defaults based on project context
- **Team Settings** — Repository-level `.claude/settings.json`

---

## Protocol Phases

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: DISCOVERY                           │
│  Automated analysis of project structure, config files,         │
│  dependencies, and development patterns                         │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 2: DIALOGUE                            │
│  Context-aware questions based on discovery findings            │
│  (not asked if clearly answered by project state)               │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3: CONFIGURATION                       │
│  Generate tailored configs for CLAUDE.md, hooks, commands,      │
│  MCP servers, permissions, and team settings                    │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 4: VALIDATION                          │
│  Test configurations, verify hooks work, confirm with user      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Discovery

### Automated Detection Matrix

| Detection Target | Files/Patterns Checked | Information Extracted |
|------------------|------------------------|----------------------|
| **Language** | File extensions, shebang lines | Primary language, polyglot status |
| **Package Manager** | `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod` | Dependencies, scripts, versions |
| **Framework** | Framework-specific files, imports | React, Django, Rails, etc. |
| **Testing** | Test directories, config files | Framework, coverage tools, patterns |
| **Linting** | `.eslintrc`, `ruff.toml`, `.prettierrc` | Style enforcement tools |
| **CI/CD** | `.github/workflows/`, `.gitlab-ci.yml` | Existing automation |
| **Database** | Schema files, ORM configs | Database type, migration tools |
| **Monorepo** | `pnpm-workspace.yaml`, `lerna.json` | Workspace structure |
| **Documentation** | README, docs directories | Existing documentation patterns |
| **Git Patterns** | `.gitignore`, branch names | Development workflow hints |

### Discovery Command Structure

```bash
# Phase 1 runs these analyses (conceptually):
1. ls -la                           # Root structure
2. find . -name "package.json"      # Package managers
3. find . -name "*config*"          # Configuration files  
4. head -50 README.md               # Documentation patterns
5. git log --oneline -10            # Recent development activity
6. cat .gitignore                   # Ignored patterns (hints at stack)
```

### Detection Signals by Project Type

**Web Frontend (React/Vue/Angular)**
```
Signals: package.json with react/vue/angular, src/components/, .storybook/
Infer: Component architecture, state management patterns, build tools
```

**Backend API (Node/Python/Go)**
```
Signals: Express/FastAPI/Gin patterns, routes/, controllers/, OpenAPI specs
Infer: API structure, authentication patterns, database access
```

**Full-Stack**
```
Signals: Both frontend and backend signals, monorepo indicators
Infer: Service boundaries, shared code patterns, deployment targets
```

**Library/Package**
```
Signals: Minimal dependencies, src/lib structure, distribution configs
Infer: API stability concerns, documentation needs, versioning patterns
```

**CLI Tool**
```
Signals: bin/ directory, commander/argparse/cobra, installation scripts
Infer: Argument patterns, output formatting, platform considerations
```

**Data/ML**
```
Signals: notebooks/, requirements.txt with pandas/torch, data/ directories
Infer: Reproducibility needs, environment management, GPU usage
```

---

## Phase 2: Dialogue

### Dialogue Philosophy

The protocol asks **only questions that cannot be answered through discovery**. Each question includes:
- Why it's being asked
- How the answer affects configuration
- Sensible defaults based on detection

### Core Question Categories

#### 2.1 Team & Workflow Questions

```markdown
**Team Size & Collaboration**
(Asked when: git log shows multiple contributors OR .github/CODEOWNERS exists)

How many developers actively work on this project?
[ ] Solo developer
[ ] Small team (2-5)
[ ] Medium team (6-15)
[ ] Large team (15+)

→ Affects: Commit message requirements, review hooks, documentation level
```

```markdown
**Autonomy Preference**
(Asked when: No existing permission config detected)

How much autonomy should Claude have?
[ ] Conservative — Ask before file edits and commands
[ ] Moderate — Auto-approve edits, ask for commands
[ ] Aggressive — Auto-approve most actions, ask for dangerous ones
[ ] Maximum — Skip permissions (--dangerously-skip-permissions)

→ Affects: Permission defaults, safety hooks, approval workflows
```

```markdown
**Quality vs Speed Tradeoff**
(Asked when: CI/CD detected but no test requirements clear)

What's your priority balance?
[ ] Quality-first — Run all tests, formatters, linters before commits
[ ] Balanced — Run fast checks inline, full suite on commit
[ ] Speed-first — Minimal checks, rely on CI for validation

→ Affects: PostToolUse hooks, pre-commit configuration
```

#### 2.2 Technical Preferences

```markdown
**Test-Driven Development**
(Asked when: Test framework detected)

Do you practice TDD?
[ ] Yes — Tests before implementation
[ ] Sometimes — Tests alongside implementation
[ ] Rarely — Tests after implementation
[ ] Never — No testing requirements

→ Affects: CLAUDE.md workflow section, test hook triggers
```

```markdown
**Code Review Standards**
(Asked when: PR templates or review automation detected)

What are your code review requirements?
[ ] Strict — All changes require review
[ ] Standard — Features require review, fixes can self-merge
[ ] Light — Review for major changes only
[ ] None — No formal review process

→ Affects: Branch naming hooks, PR automation commands
```

```markdown
**Documentation Requirements**
(Asked when: Docs directory or documentation tools detected)

Documentation expectations?
[ ] Comprehensive — All public APIs, architecture docs, changelogs
[ ] Standard — README, key API docs, inline comments
[ ] Minimal — Just README and critical notes
[ ] None — Code is the documentation

→ Affects: CLAUDE.md instructions, documentation reminder hooks
```

#### 2.3 Environment & Tooling

```markdown
**Primary Development Environment**
(Asked always — cannot be reliably detected)

Where do you primarily run Claude Code?
[ ] Terminal (standalone)
[ ] VS Code extension
[ ] Cursor
[ ] JetBrains IDE
[ ] Remote/SSH

→ Affects: Keyboard shortcut documentation, IDE-specific commands
```

```markdown
**MCP Server Interests**
(Asked when: No existing .mcp.json detected)

Which integrations would be useful? (select all that apply)
[ ] GitHub/GitLab — Issue and PR management
[ ] Figma — Design-to-code workflows
[ ] Database — Direct schema access
[ ] Sentry — Error tracking context
[ ] Slack — Team notifications
[ ] None — Prefer standalone

→ Affects: MCP server configuration, related slash commands
```

#### 2.4 Special Requirements

```markdown
**Compliance or Regulatory Needs**
(Asked when: Keywords like HIPAA, SOC2, PCI detected in docs)

Any compliance requirements affecting development?
[ ] HIPAA (healthcare data)
[ ] SOC 2 (security controls)
[ ] PCI DSS (payment data)
[ ] GDPR (EU data protection)
[ ] None / Not applicable

→ Affects: Security hooks, data handling warnings in CLAUDE.md
```

```markdown
**Sensitive Paths**
(Asked when: Secrets, credentials, or .env patterns detected)

Any paths Claude should never modify?
(Enter comma-separated paths or 'none')
Example: .env.production, secrets/, config/credentials.yml

→ Affects: PreToolUse hooks blocking dangerous edits
```

---

## Phase 3: Configuration Generation

### 3.1 CLAUDE.md Generation

Based on discovery and dialogue, generate a CLAUDE.md following the **Progressive Disclosure** pattern:

```markdown
# CLAUDE.md
# Generated by Interactive Initialization Protocol
# Last updated: [timestamp]

## Project Context

[Auto-generated project summary from discovery]

**Tech Stack:** [detected stack]
**Project Type:** [detected type]
**Team Size:** [from dialogue]

## Essential Commands

```bash
# Development
[detected dev command]

# Testing
[detected test command]

# Building
[detected build command]

# Linting
[detected lint command]
```

## Architecture Overview

[Generated from discovery - directory structure, key patterns]

## Coding Standards

[From detected linter configs and dialogue preferences]

## Additional Context

For detailed guidance, see:
- `.claude/docs/architecture.md` — System design details
- `.claude/docs/workflows.md` — Development workflows
- `.claude/docs/conventions.md` — Code style specifics

Claude should read these files when working on related tasks.
```

**Key Principles Applied:**

1. **~100-150 instruction limit** — Keep core CLAUDE.md focused
2. **Progressive Disclosure** — Reference separate docs for details
3. **WHY/WHAT/HOW structure** — Clear organizational framework
4. **Universal applicability** — No task-specific hotfixes

### 3.2 Hooks Configuration

Generate `.claude/settings.json` with hooks based on detected tooling:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "echo 'Session started at $(date)' >> .claude/session.log"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "[detected-formatter] $CLAUDE_FILE_PATH",
            "description": "Auto-format on file write"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command", 
            "command": "[detected-linter] $CLAUDE_FILE_PATH",
            "description": "Lint check on file write"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo $CLAUDE_FILE_PATH | grep -qE '(\\.env|\\.secret|credentials)' && exit 1 || exit 0",
            "description": "Block writes to sensitive files"
          }
        ]
      }
    ]
  }
}
```

**Hook Selection Matrix:**

| Detected Tool | Hook Generated |
|---------------|----------------|
| Prettier | PostToolUse: `prettier --write $CLAUDE_FILE_PATH` |
| ESLint | PostToolUse: `eslint --fix $CLAUDE_FILE_PATH` |
| Ruff | PostToolUse: `ruff check --fix $CLAUDE_FILE_PATH` |
| Black | PostToolUse: `black $CLAUDE_FILE_PATH` |
| TypeScript | PostToolUse: `tsc --noEmit` (on .ts files) |
| Jest | Optional: `npm test -- --findRelatedTests $CLAUDE_FILE_PATH` |
| Pytest | Optional: `pytest $CLAUDE_FILE_PATH -x` |

### 3.3 Custom Commands

Generate `.claude/commands/` structure based on project type:

**Universal Commands:**

```markdown
<!-- .claude/commands/review.md -->
---
description: Comprehensive code review of recent changes
---
Review the code changes since the last commit:

1. Check for style violations and consistency
2. Identify potential bugs or edge cases
3. Verify error handling is appropriate
4. Check for security concerns
5. Suggest performance improvements if relevant

Focus on substantive issues, not stylistic preferences already handled by formatters.
```

```markdown
<!-- .claude/commands/test-related.md -->
---
description: Run tests related to recent changes
allowed-tools: Bash
---
Find and run tests related to files changed since last commit:

1. Identify changed files
2. Find corresponding test files
3. Run those tests with verbose output
4. Summarize results
```

**Project-Type Specific Commands:**

| Project Type | Generated Commands |
|--------------|-------------------|
| React | `/component` — Generate component with tests |
| API | `/endpoint` — Generate endpoint with validation |
| Library | `/api-doc` — Generate API documentation |
| CLI | `/command` — Generate CLI command handler |
| Data | `/notebook` — Create analysis notebook |

### 3.4 MCP Server Configuration

Generate `.mcp.json` based on detected stack and dialogue:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

**MCP Recommendations by Stack:**

| Detected Stack | Recommended MCPs |
|----------------|------------------|
| Any with GitHub | `@modelcontextprotocol/server-github` |
| PostgreSQL | `@modelcontextprotocol/server-postgres` |
| Design files | Figma MCP (if available) |
| Monorepo | Filesystem MCP with workspace roots |
| API development | Postman/Insomnia MCP |

### 3.5 Permission Configuration

Generate appropriate permission defaults:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(pnpm:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Read",
      "Write"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)",
      "Bash(curl|wget * | *sh:*)"
    ]
  }
}
```

**Permission Presets:**

| Autonomy Level | Preset |
|----------------|--------|
| Conservative | Minimal allows, extensive denies |
| Moderate | Standard allows, safety denies |
| Aggressive | Broad allows, critical-only denies |
| Maximum | Empty denies, skip permission checks |

---

## Phase 4: Validation

### Validation Checklist

```markdown
□ CLAUDE.md generated and readable
  → Ask Claude: "Summarize this project based on CLAUDE.md"
  
□ Essential commands work
  → Run: dev, test, build, lint commands
  
□ Hooks execute correctly
  → Test: Create file, verify formatter runs
  → Test: Attempt blocked action, verify block
  
□ Custom commands load
  → Run: /project: and verify commands appear
  
□ MCP servers connect (if configured)
  → Run: /mcp and verify server status
  
□ Permissions appropriate
  → Test: Safe action auto-approves
  → Test: Dangerous action prompts
```

### Verification Commands

```bash
# Verify hooks are loaded
/hooks

# Verify MCP servers
/mcp

# Test CLAUDE.md is read
"What build system does this project use?"

# Verify custom commands
# Press / and check command list

# Test permission settings
/permissions
```

### User Confirmation Flow

```markdown
## Configuration Summary

I've generated the following configurations:

**CLAUDE.md** (42 instructions, within limit)
- Project: [detected type]
- Commands: dev, test, build, lint documented
- Architecture: [key patterns]

**Hooks** (4 configured)
- SessionStart: Session logging
- PostToolUse(Write): Prettier, ESLint
- PreToolUse(Write): Sensitive file protection

**Custom Commands** (3 generated)
- /review — Code review workflow
- /test-related — Run related tests
- /[project-specific] — [description]

**MCP Servers** (2 configured)
- GitHub — Issue/PR management
- Filesystem — Extended file access

**Permissions**
- Mode: Moderate
- Auto-approve: Package manager, git operations
- Block: Destructive commands

Would you like to:
1. Accept all configurations
2. Review and modify specific sections
3. Start over with different preferences
4. Export configurations without applying
```

---

## Implementation Options

### Option A: Custom Slash Command

Create `/project:init-interactive` command:

```markdown
<!-- .claude/commands/init-interactive.md -->
---
description: Interactive project initialization protocol
---
Run the Interactive Initialization Protocol for this project.

## Phase 1: Discovery
First, analyze this project by examining:
1. File structure and key directories
2. Package manager files (package.json, pyproject.toml, etc.)
3. Configuration files (.eslintrc, tsconfig.json, etc.)
4. Test setup and patterns
5. CI/CD configuration
6. README and documentation
7. Git history patterns

Report your findings before proceeding.

## Phase 2: Dialogue
Based on discovery, ask targeted questions about:
- Team size and workflow
- Autonomy preferences
- Quality vs speed tradeoffs
- Special requirements

Only ask questions that cannot be answered from discovery.

## Phase 3: Configuration
Generate tailored configurations for:
- CLAUDE.md (following 100-150 instruction limit)
- Hooks in .claude/settings.json
- Custom commands in .claude/commands/
- MCP servers in .mcp.json (if requested)
- Permission defaults

## Phase 4: Validation
Test configurations and confirm with user before finalizing.
```

### Option B: Skill Package

Structure as a distributable skill:

```
init-protocol-skill/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   └── init-interactive.md
├── SKILL.md                    # Protocol instructions
├── templates/
│   ├── claude-md-web.md
│   ├── claude-md-api.md
│   ├── claude-md-library.md
│   └── hooks-presets.json
└── README.md
```

```json
// plugin.json
{
  "name": "init-protocol",
  "version": "1.0.0",
  "description": "Interactive initialization protocol for Claude Code projects",
  "commands": ["commands/"]
}
```

### Option C: Standalone Guide

Use this document as a prompt template:

```markdown
I'd like to run the Interactive Initialization Protocol for this project.

Please:
1. Analyze the project structure (Phase 1: Discovery)
2. Ask me targeted questions based on what you find (Phase 2: Dialogue)
3. Generate appropriate configurations (Phase 3: Configuration)
4. Help me validate the setup (Phase 4: Validation)

Focus on:
- CLAUDE.md that stays within instruction limits
- Hooks for detected tooling
- Custom commands for common workflows
- Appropriate permission defaults

Let's start with discovery.
```

---

## Quick Reference

### Trigger the Protocol

```
# If implemented as command:
/project:init-interactive

# If using as prompt:
"Run the Interactive Initialization Protocol"

# Manual sequence:
1. "Analyze this project for initialization"
2. [Answer questions]
3. "Generate configurations"
4. "Validate setup"
```

### Expected Outputs

| Artifact | Location | Purpose |
|----------|----------|---------|
| CLAUDE.md | Project root | Project context |
| .claude/settings.json | .claude/ | Hooks and permissions |
| .claude/commands/*.md | .claude/commands/ | Custom commands |
| .mcp.json | Project root | MCP server config |
| .claude/docs/*.md | .claude/docs/ | Progressive disclosure docs |

### Key Principles

1. **Discovery Before Questions** — Don't ask what can be detected
2. **Instruction Limits** — ~100-150 instructions in CLAUDE.md
3. **Progressive Disclosure** — Reference separate docs for details
4. **Deterministic Enforcement** — Use hooks, not just guidance
5. **Context-Aware Defaults** — Sensible presets based on detection
6. **Validation Required** — Test before finalizing

---

## Comparison: Standard /init vs This Protocol

| Aspect | Standard /init | Interactive Protocol |
|--------|----------------|---------------------|
| **Process** | One command, one output | 4-phase workflow |
| **Customization** | User edits after | Built into process |
| **Hooks** | Not generated | Tailored to tooling |
| **Commands** | Not generated | Project-appropriate |
| **MCP** | Not configured | Recommended by stack |
| **Permissions** | Default | Based on preferences |
| **Validation** | None | Built-in testing |
| **Documentation** | Single file | Progressive disclosure |

---

## Common Patterns

### Pattern: Greenfield Project

```
Discovery: Empty directory or minimal scaffold
Dialogue: Full questionnaire needed
Output: Complete configuration with sensible defaults
```

### Pattern: Existing Project with Config

```
Discovery: Rich information available
Dialogue: Minimal — confirm detected settings
Output: Refined configuration respecting existing choices
```

### Pattern: Team Onboarding

```
Discovery: Existing CLAUDE.md and configs
Dialogue: Personal preferences only
Output: CLAUDE.local.md for personal overrides
```

### Pattern: Monorepo Workspace

```
Discovery: Workspace structure detected
Dialogue: Per-workspace preferences
Output: Root + per-workspace configurations
```

---

## Troubleshooting

### "Claude ignores CLAUDE.md instructions"

1. Check instruction count — may exceed ~150 limit
2. Verify instructions are universally applicable
3. Review system reminder filtering effect
4. Move specific instructions to separate docs

### "Hooks don't run"

1. Verify `.claude/settings.json` syntax
2. Check hook matcher patterns
3. Test command outside hooks first
4. Review hook output for errors

### "Commands don't appear"

1. Confirm files in `.claude/commands/`
2. Verify `.md` extension
3. Check `description` frontmatter exists
4. Restart Claude Code session

### "MCP server won't connect"

1. Run `/mcp` to check status
2. Verify environment variables set
3. Test server command manually
4. Use `--mcp-debug` flag

---

## Sources

### Official Documentation
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) — Anthropic Engineering (April 2025)
- [Using CLAUDE.md Files](https://claude.com/blog/using-claude-md-files) — Claude Product Blog (November 2025)

### Community Best Practices
- [Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — HumanLayer (November 2025)
- [Claude Code Init Repository](https://github.com/istealersn-dev/claude-code-init) — Project initialization toolkit
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code) — Curated workflow collection

### Configuration Guides
- [Configuring Claude Code](https://ainativedev.io/news/configuring-claude-code) — AI Native Dev (June 2025)
- [ClaudeLog Configuration Guide](https://claudelog.com/configuration/) — Comprehensive settings reference
- [Developer Toolkit Project Initialization](https://developertoolkit.ai/en/claude-code/quick-start/project-initialization/) — Step-by-step guide

### Methodology
- [Documentation Methodology Appendix](documentation-methodology-appendix-2025-12-11.md) — This project's documentation standards

---

## Changelog

### v1.0.0 (December 11, 2025)
- Initial protocol design
- Four-phase workflow structure
- Detection matrices for common project types
- Dialogue questionnaire framework
- Configuration generation templates
- Validation procedures
- Implementation options (command, skill, prompt)
