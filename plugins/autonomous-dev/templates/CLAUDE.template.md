# {{PROJECT_NAME}}

## Quick Start for AI Assistants
1. Read this file completely
2. Check project docs for current phase and priorities
3. Run `/project:plan` before coding
4. Use Serena memories for context: `project_vision`, `decision_log`

## Vision
<!-- AUTHORITATIVE: This section is the source of truth -->
<!-- Last verified: {{DATE}} -->

{{PROJECT_DESCRIPTION}}

**Primary Goal**: {{PRIMARY_GOAL}}

**Users**: {{TARGET_USERS}}

## Current Phase
**Phase**: {{CURRENT_PHASE}}
**Focus**: {{CURRENT_FOCUS}}

## Stack
{{STACK_DESCRIPTION}}

## Documentation
<!-- List key project docs here -->
- README.md - Project overview
- [Add project-specific docs]

**Read relevant docs before implementing.** Don't invent requirements.

## Commands
<!-- Customize for your project's build/test tools -->
```bash
# Install/setup
{{INSTALL_COMMAND}}

# Run tests
{{TEST_COMMAND}}

# Lint
{{LINT_COMMAND}}

# Build (if applicable)
{{BUILD_COMMAND}}
```

## Workflow
1. **Explore first** - Understand before changing
2. **Plan** - Define scope, tests, tasks before implementation
3. **TDD** - Write tests first
4. **Review** - Use self-review agents at each phase

## Rules

### ALWAYS:
{{ALWAYS_RULES}}

### NEVER:
{{NEVER_RULES}}

---

## Automation & Guardrails

### Pre-Approved Operations (No confirmation needed)
- Read any file
- Edit source files
- Run tests, lint, build commands
- Git status, diff, log, add, commit
- Standard file operations

### Blocked Operations (Will be denied)
- `rm -rf`, `rm -r` (use explicit file deletion)
- `sudo` anything
- `git push --force`, `git reset --hard`
- Piping to shell (`curl | sh`)

### Workflow Commands

**Discovery & Planning:**
- `/project:explore <topic>` - Read-only investigation
- `/project:plan <feature>` - Create implementation plan

**Implementation:**
- `/project:implement <feature>` - TDD workflow
- `/project:refactor <code>` - Safe refactoring
- `/project:document <target>` - Documentation generation

**Quality & Review:**
- `/project:debug <error>` - Systematic debugging

**Release & Maintenance:**
- `/project:release [version]` - Release preparation
- `/project:improve [trigger]` - Self-improvement cycle

**Autonomous Mode:**
- `/project:auto <feature>` - Full autonomous development with review gates

**Session Management:**
- `/project:resume` - Restore context from previous session
- `/project:checkpoint <note>` - Save current state

### Development Workflow Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT LIFECYCLE                         │
│                                                                  │
│   explore ──▶ plan ──▶ implement ──▶ review ──▶ release         │
│      │          │          │           │                         │
│      ▼          ▼          ▼           ▼                         │
│   understand  scope &    TDD with    quality                     │
│   codebase    tests      refactor    gates                       │
│                                                                  │
│   ◀──────────── iterate ◀───────────────┘                       │
│                    │                                             │
│                    ▼                                             │
│               debug (if issues found)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Autonomous Development Mode

For minimal human intervention after requirements are confirmed:

**Command:** `/project:auto <feature-description>`

**Flow:**
1. **Phase 0**: Requirements lock-in (HUMAN-IN-LOOP)
2. **Phases 1-4**: Autonomous with self-review gates
3. **Phase 5**: Validation (tests, lint)
4. **Phase 6**: Completion and reporting

**Self-Review Gates:**
| Gate | Reviewer | Catches |
|------|----------|---------|
| After exploration | exploration-reviewer | Incomplete understanding |
| After planning | plan-reviewer | Flawed design |
| After implementation | code-reviewer | Bugs, security issues |
| After documentation | documentation-reviewer | Inaccuracies |

### Self-Improvement Protocol

The system follows its own explore → plan → implement → review cycle:

**Commands:**
- `/project:improve [trigger]` - Full improvement cycle
- `/project:diagnose <signal>` - Root cause analysis

**Triggers:**
- `pr-merge` — After PR merged
- `error` — After significant error
- `weekly` — Weekly maintenance
- `context-loss` — After re-explanation needed

**System Health Limits:**
- CLAUDE.md: < 500 lines
- Agents: < 10
- Hooks: < 10

### Session Management

**Commands:**
- `/project:resume` — Restore context from previous session
- `/project:checkpoint <note>` — Save current state mid-session

**Key Memories:**
| Memory | Purpose |
|--------|---------|
| `session_handoff` | What was worked on, accomplished, next steps |
| `decision_log` | Architectural decisions with rationale |
| `project_vision` | Canonical project description (AUTHORITATIVE) |

---

## AI Assistant Configuration

### MCP Servers
| Server | Purpose |
|--------|---------|
| **Serena** | Project memory, symbol operations |
| **Context7** | Library docs when needed |
| **Sequential** | Complex analysis when requested |

### Version Control Workflow

**Use feature branches for ALL work, never commit directly to main.**

```bash
# Start new work
git checkout -b feature/<name>

# During work
git add -A && git commit -m "feat: description"

# Ready for review
git push -u origin feature/<name>
gh pr create --title "feat: <name>" --body "..."
```

**Commit Message Format:** `type: description`
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `test:` tests
- `refactor:` code improvement
- `chore:` maintenance
