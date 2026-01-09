# Claude Code End-to-End Development Workflows Guide

**Updated:** December 10, 2025  
**Version:** 2.0  
**Verified Against:** Claude Code v2.0+, Opus 4.5, Sonnet 4.5  

---

## Table of Contents

1. [Introduction](#part-1-introduction)
2. [Core Principles](#part-2-core-principles)
3. [Phase 1: Ideation & Requirements](#part-3-phase-1-ideation--requirements)
4. [Phase 2: Architecture & Design](#part-4-phase-2-architecture--design)
5. [Phase 3: Implementation](#part-5-phase-3-implementation)
6. [Phase 4: Quality Assurance](#part-6-phase-4-quality-assurance)
7. [Phase 5: Deployment & Operations](#part-7-phase-5-deployment--operations)
8. [Complete Worked Examples](#part-8-complete-worked-examples)
9. [Context Management Strategies](#part-9-context-management-strategies)
10. [Subagent Orchestration Patterns](#part-10-subagent-orchestration-patterns)
11. [CI/CD Automation](#part-11-cicd-automation)
12. [Quick Reference](#part-12-quick-reference)
13. [References](#part-13-references)

---

## Part 1: Introduction

This guide provides comprehensive, battle-tested workflows for end-to-end software development with Claude Code. Whether you're building a simple feature or architecting a complex system, these patterns will help you achieve consistent, high-quality results.

### Why Structured Workflows Matter

Without structured workflows, agentic development often encounters:

- **Scope drift**: Claude expands beyond original requirements
- **Hallucination**: Claude invents APIs, functions, or patterns that don't exist
- **Context loss**: Important decisions forgotten in long sessions  
- **Quality inconsistency**: Results vary dramatically between sessions
- **Wasted iterations**: Rework from inadequate planning

Structured workflows prevent these issues through explicit phases, checkpoints, and verification steps.

### The Development Journey

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Phase 1   │──▶│   Phase 2   │──▶│   Phase 3   │──▶│   Phase 4   │──▶│   Phase 5   │
│  Ideation & │   │ Architecture│   │Implementation│  │   Quality   │   │ Deployment  │
│Requirements │   │  & Design   │   │              │   │  Assurance  │   │ & Operations│
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
      │                 │                 │                 │                 │
   CLAUDE.md         SPEC.md          Tests +          All tests        Monitoring
   REQUIREMENTS.md   ARCHITECTURE.md   Code            pass              deployed
   QUESTIONS.md      ADRs             Committed        Reviewed          Running
```

### What's New in December 2025

Key updates since Claude Code v2.0:

- **Plan Mode**: Dedicated read-only mode for planning complex changes
- **Checkpoints & Rewind**: Save/restore code state with Esc Esc or /rewind
- **Extended Thinking Toggle**: Tab to toggle thinking on/off (replaces old keyword system)
- **Background Tasks**: Long-running processes that don't block Claude
- **Context Editing**: Automatic management of conversation context
- **VS Code Extension**: Native IDE integration with inline diffs
- **Custom Agents**: Configure specialized subagents with isolated contexts
- **Hooks System**: Deterministic automation at lifecycle points
- **1M Token Context**: Sonnet 4.5 now supports 1 million token context window
- **Opus 4.5 for Pro**: Pro users now have access to Opus 4.5

---

## Part 2: Core Principles

### The Five Principles

1. **Explicit Over Implicit**
   - Write down requirements, not assumptions
   - Document decisions in Architecture Decision Records (ADRs)
   - Use CLAUDE.md to encode project conventions
   - Specify expected behaviors, not just happy paths

2. **Verify Continuously**
   - Test-Driven Development is the "Anthropic-favorite workflow"
   - Run tests after every meaningful change
   - Use hooks to automate verification
   - Don't trust code that hasn't been executed

3. **Checkpoint Frequently**
   - Commit working states before risky changes
   - Use Claude Code's checkpoint system for rapid rewind
   - Document progress in persistent files (ROADMAP.md, TODO.md)
   - Create restore points at phase boundaries

4. **Context Is Precious**
   - Monitor context usage with `/context`
   - Use `/compact` strategically at ~70% capacity
   - Delegate to subagents for context-intensive tasks
   - Write findings to files for future reference

5. **Security as Default**
   - Never store secrets in CLAUDE.md or conversation
   - Use permission modes appropriate to trust level
   - Review automated changes before production
   - Enable only necessary MCP servers

### Permission Modes

Claude Code offers three permission modes (Shift+Tab to cycle):

| Mode | Indicator | Use Case |
|------|-----------|----------|
| **Normal** | (default) | Interactive development with approval |
| **Auto-Accept** | `⏵⏵ accept edits on` | Trusted automated workflows |
| **Plan Mode** | `⏸ plan mode on` | Read-only exploration and planning |

```bash
# Start in Plan Mode
claude --permission-mode plan

# Start with dangerous permissions (use with caution)
claude --dangerously-skip-permissions
```

### Extended Thinking

Extended thinking improves reasoning for complex tasks. **In Claude Code v2.0+, the primary mechanism is the Tab toggle:**

**How to Enable:**
- Press **Tab** during a session to toggle thinking on/off
- The thinking state is displayed in the Claude Code UI
- The toggle is **sticky** - remains active across sessions until manually toggled off

**Natural Language Prompts:**
Phrases like "think" and "think hard" may still trigger extended thinking, but the specific tiered keyword system with token budgets (ultrathink, megathink, etc.) documented in early 2025 is **not mentioned in current official documentation** and its status is unclear. The old keyword highlighting was removed in v2.0.

**Best Practice:** Use the Tab toggle as your primary control mechanism. Natural language like "think through this carefully" or "analyze this deeply" can supplement but shouldn't be relied upon for specific thinking budget control.

**Environment Variable:**
```bash
export MAX_THINKING_TOKENS=10000  # Set permanent thinking budget (value varies by use case)
```
*Note: Official docs confirm this variable works but don't specify recommended values. Anthropic's Bedrock docs suggest 1024 for balanced performance; adjust based on your needs.*

**When to Use Extended Thinking:**
- Architecture and design decisions
- Complex debugging scenarios
- Multi-step planning
- Evaluating tradeoffs between approaches

**When NOT Needed:**
- Simple edits and fixes
- Routine refactoring
- Quick prototyping
- Opus 4.5 (already optimized for deep reasoning - rarely needs extra thinking)

---

## Part 3: Phase 1 - Ideation & Requirements

### Goal
Transform vague ideas into clear, actionable requirements that prevent scope drift.

### Workflow 1: Brainstorming with Extended Thinking

**When to use:** Starting from a vague idea or problem statement

```
User: I want to build a personal finance tracker web app. Here's the vibe:
- Clean, modern interface (think Notion meets Mint)
- Track income, expenses, and savings goals
- Beautiful charts and insights
- Built with React and a simple backend
- Should feel fast and delightful

Use Plan Mode and think deeply about how to approach this.
```

Claude will:
1. Enter Plan Mode (read-only exploration)
2. Engage extended thinking for analysis
3. Ask clarifying questions before proceeding
4. Create a structured plan with phases

### Workflow 2: Requirements Gathering with Plan Mode

**When to use:** Complex multi-step features

```
Shift+Tab to enter Plan Mode
"I need to implement OAuth2 authentication for our API. Create a detailed migration plan."
```

Claude will analyze the codebase and create a comprehensive plan before any edits.

### Workflow 3: Creating Specifications from Vague Descriptions

**When to use:** Translating business needs to technical specs

```
User: "Users need to save products for later and share collections with friends."

Claude, think through this requirement and create a detailed specification including:
1. User stories with acceptance criteria
2. Data model requirements
3. API endpoints needed
4. Security considerations
5. Edge cases and error handling
```

### Phase 1 Artifacts

| Artifact | Purpose | Template |
|----------|---------|----------|
| `REQUIREMENTS.md` | Functional requirements | User stories, acceptance criteria |
| `SPEC.md` | Technical specification | Data models, APIs, integrations |
| `QUESTIONS.md` | Open questions log | Tracked questions requiring clarification |
| `CLAUDE.md` (updated) | Project context | Tech stack, patterns, commands |

### Phase 1 Checklist

- [ ] All requirements documented with acceptance criteria
- [ ] Technical constraints identified
- [ ] Open questions logged and prioritized
- [ ] CLAUDE.md updated with project context
- [ ] Stakeholder review completed

### Anti-Patterns to Avoid

**❌ Jumping to Code Too Quickly**
```
User: "Build me an auth system"
Claude: [immediately starts writing code]
```

**✅ Better Approach**
```
User: "Build me an auth system"
Claude: "Before implementing, let me understand your requirements:
1. What authentication methods do you need? (username/password, OAuth, SSO)
2. What's your current user model?
3. Do you have specific security requirements?
..."
```

**❌ Ignoring Constraints**
```
User: "Create a new database table"
Claude: [creates PostgreSQL table]
// But project uses MongoDB
```

**✅ Prevention via CLAUDE.md**
```markdown
## Technology Stack
- Database: MongoDB Atlas (NOT PostgreSQL)
- ORM: Mongoose
- No raw SQL queries
```

---

## Part 4: Phase 2 - Architecture & Design

### Goal
Create solid architectural foundations that guide implementation.

### Workflow 1: Architecture Design with Extended Thinking

**When to use:** Major features or system redesigns

```
User: I need to design a real-time notification system. 
[Enable thinking with Tab, then:]
Think through the following deeply:
1. Message queue architecture
2. WebSocket vs SSE vs polling
3. Scalability considerations
4. Failure modes and recovery
5. Integration with existing services

Create an Architecture Decision Record (ADR) for the chosen approach.
```

**ADR Template:**
```markdown
# ADR-001: Real-time Notification Architecture

## Status
Proposed

## Context
Users need real-time notifications for events like messages, updates, and alerts.

## Decision
We will use Server-Sent Events (SSE) for the notification delivery mechanism.

## Consequences
### Positive
- Simple implementation
- Built-in reconnection
- Lower server overhead than WebSockets

### Negative
- One-directional only
- Less browser support than WebSocket
```

### Workflow 2: Database Schema Design with Subagents

**When to use:** Complex data modeling requiring deep analysis

```
User: Design a database schema for our e-commerce platform. Use subagents to:
1. Analyze current data patterns
2. Research best practices for similar systems
3. Propose normalized and denormalized options
4. Create migration plan
```

Claude orchestrates specialized subagents:
```
Main Claude (Orchestrator)
├── Data Analyst Subagent: Reviews existing schemas and usage patterns
├── Research Subagent: Investigates best practices
└── Schema Designer Subagent: Creates optimized schema
```

### Workflow 3: API Design with OpenAPI

**When to use:** RESTful API development

```
User: Design the API for our user management service. Include:
- Standard CRUD operations
- Authentication endpoints
- Rate limiting headers
- Error response format
- OpenAPI 3.0 specification
```

### Phase 2 Artifacts

| Artifact | Purpose |
|----------|---------|
| `ARCHITECTURE.md` | System architecture overview |
| `docs/adr/` | Architecture Decision Records |
| `diagrams/` | System and sequence diagrams |
| `migrations/` | Database migration scripts |
| `openapi.yaml` | API specification |

### The "Explore, Plan, Code" Pattern

Anthropic recommends this three-phase approach for complex changes:

1. **Explore**: Read relevant files, understand patterns, investigate questions
   ```
   "Read the authentication module and understand how we currently handle sessions.
   Don't write any code yet."
   ```

2. **Plan**: Create detailed plan with extended thinking
   ```
   [Enable thinking with Tab]
   "Analyze how to add OAuth2 support. Create a detailed implementation plan
   with files to modify and order of changes."
   ```

3. **Code**: Implement following the plan
   ```
   "Implement step 1 of the plan: Create the OAuth configuration module."
   ```

---

## Part 5: Phase 3 - Implementation

### Goal
Write clean, tested, documented code following project conventions.

### Workflow 1: Test-Driven Development (TDD)

**The Anthropic-Favorite Workflow**

TDD is explicitly called out as Anthropic's recommended approach for changes verifiable with tests.

```
Step 1: Write the tests first

User: "Write tests for a SavingsAccount class with:
- deposit(amount) - adds to balance
- withdraw(amount) - removes from balance, throws if insufficient
- calculateDailyInterest(rate) - applies daily interest rate

Be explicit that we're doing TDD - don't create mock implementations.
Write failing tests only."

Step 2: Verify tests fail

User: "Run the tests and confirm they fail for the right reasons.
Do NOT write any implementation code yet."

Step 3: Commit the tests

User: "Good, the tests fail as expected. Commit these tests with message:
'test: add SavingsAccount test suite (red phase)'"

Step 4: Implement to pass

User: "Now implement the minimal code to make all tests pass.
Don't over-engineer - just make the tests green."

Step 5: Refactor

User: "Tests pass. Now refactor for quality while keeping tests green:
- Extract common setup
- Improve naming
- Add documentation"
```

**Key TDD Principles:**
- Explicitly tell Claude you're doing TDD to prevent mock implementations
- Verify tests fail before implementing
- Implement minimal code to pass
- Refactor only with green tests

### Workflow 2: Checkpoint-Driven Development

**When to use:** Risky changes or experimental approaches

```bash
# 1. Ensure working state
git status && git commit -am "checkpoint: before risky refactor"

# 2. Start Claude Code
claude

# 3. Use checkpoints during work
# Claude automatically creates checkpoints before changes
# Press Esc Esc to rewind to previous checkpoint

# 4. Or use /rewind command
/rewind
# Select: [Restore code only] [Restore conversation only] [Restore both]
```

### Workflow 3: Parallel Development with Subagents

**When to use:** Independent tasks that can run simultaneously

```
User: We need to implement:
1. Backend API for user profiles
2. Frontend React components
3. Database migrations
4. Unit tests for all components

Spawn subagents to work on these in parallel where dependencies allow.
```

Claude orchestrates parallel work:
```
Main Claude (Orchestrator) - holds the plan, coordinates
├── Backend Subagent: API implementation (runs first)
├── Frontend Subagent: React components (waits for API types)
├── Database Subagent: Migrations (runs first)
└── Testing Subagent: Tests for completed work (runs after each)
```

### Workflow 4: Code Review with Executor-Evaluator Pattern

**When to use:** Ensuring code quality during implementation

```
Pattern: One Claude writes, another reviews

Terminal 1 (Executor):
claude --working-dir ./project-feature

Terminal 2 (Evaluator):
claude --permission-mode plan
"Review the changes in ./project-feature for:
- Security vulnerabilities
- Performance issues
- Code style violations
- Missing error handling"
```

### Phase 3 Best Practices

**Do:**
- Commit working states frequently
- Run tests after each meaningful change
- Use descriptive commit messages
- Document non-obvious decisions in code comments

**Don't:**
- Let Claude implement without tests
- Skip the planning phase
- Allow scope creep during implementation
- Ignore test failures "for now"

### Using Git Worktrees for Parallel Development

```bash
# Create isolated worktrees for parallel Claude sessions
git worktree add ../project-auth -b feature/auth main
git worktree add ../project-api -b feature/api main

# Run Claude in each worktree
cd ../project-auth && claude
cd ../project-api && claude
```

This allows multiple Claude instances to work on different features simultaneously without conflicts.

---

## Part 6: Phase 4 - Quality Assurance

### Goal
Ensure code meets quality standards through comprehensive testing and review.

### Workflow 1: Test Gap Analysis

**When to use:** Evaluating test coverage

```
User: Analyze our test coverage and identify gaps:
1. Which functions lack unit tests?
2. Which integration scenarios are missing?
3. What edge cases aren't covered?
4. Create a prioritized list of tests to add.

Enable thinking (Tab) for this analysis.
```

### Workflow 2: Integration Testing

**When to use:** Testing component interactions

```
User: Create integration tests for the user authentication flow:
1. Registration → Email verification → Login
2. Password reset flow
3. OAuth integration
4. Session management

Use our existing test patterns from tests/integration/.
```

### Workflow 3: Visual Target Testing

**When to use:** UI components with specific visual requirements

```
User: I'm attaching a screenshot of the target design.
Implement this component and compare your output to the target.
Iterate until visual parity is achieved.

[screenshot.png]
```

Claude can:
1. Analyze the target image
2. Implement the component
3. Compare rendered output to target
4. Iterate until matching

### Workflow 4: Hooks for Continuous Validation

Use hooks to automate quality checks:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint:fix && npm run typecheck",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### TDD Guard for Enforcing TDD

[TDD Guard](https://github.com/nizos/tdd-guard) is a community tool that enforces TDD principles:

```bash
# Install TDD Guard
npm install -g tdd-guard

# Configure hooks
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|TodoWrite",
        "hooks": [{ "type": "command", "command": "tdd-guard" }]
      }
    ]
  }
}
```

TDD Guard blocks implementation when:
- No relevant failing test exists
- Tests haven't been run
- Implementation exceeds minimal requirements

### Phase 4 Artifacts

| Artifact | Purpose |
|----------|---------|
| Unit tests | Component-level verification |
| Integration tests | System interaction verification |
| E2E tests | User journey verification |
| Coverage reports | Test completeness metrics |
| Mutation reports | Test effectiveness metrics |

---

## Part 7: Phase 5 - Deployment & Operations

### Goal
Deploy reliably and maintain operational excellence.

### Workflow 1: CI/CD Automation with Headless Mode

Claude Code's headless mode (`-p` flag) enables CI/CD integration:

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Claude Code
        run: |
          curl -sSL https://claude.ai/install.sh | sh
          echo "$HOME/.claude/bin" >> $GITHUB_PATH
      
      - name: Run Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          gh pr diff ${{ github.event.pull_request.number }} | \
          claude -p "Review this PR for security vulnerabilities, 
            performance issues, and code quality. 
            Output JSON with findings." \
            --output-format json \
            --allowedTools "Read,Grep" \
          > review.json
      
      - name: Post Review Comment
        uses: actions/github-script@v6
        with:
          script: |
            const review = require('./review.json');
            // Post findings as PR comment
```

### Workflow 2: Automated Code Quality Checks

```bash
#!/bin/bash
# pre-commit-claude.sh

# Security audit
claude -p "Analyze staged files for security issues" \
  --allowedTools "Read,Grep" \
  --output-format json > security.json

# Check for issues
if jq -e '.issues | length > 0' security.json; then
  echo "Security issues found:"
  jq '.issues[]' security.json
  exit 1
fi
```

### Workflow 3: Batch Processing for Large-Scale Changes

```bash
# Fan-out pattern for migrations
# 1. Generate task list
claude -p "List all React components needing Vue migration" \
  --allowedTools "Read,Glob,Grep" > migration-list.txt

# 2. Process each file
for file in $(cat migration-list.txt); do
  claude -p "Migrate $file from React to Vue. 
    Return 'OK' if successful, 'FAIL' if not." \
    --allowedTools "Edit,Bash(git commit:*)" \
    --permission-mode acceptEdits
done
```

### Workflow 4: Monitoring Setup

```
User: Set up monitoring for our Node.js API:
1. Health check endpoint at /health
2. Prometheus metrics at /metrics
3. Structured logging with correlation IDs
4. Error tracking integration
5. Performance metrics (p50, p95, p99)
```

### Workflow 5: Incident Response

```bash
# Automated incident investigation
investigate_incident() {
  local description="$1"
  local severity="${2:-medium}"
  
  claude -p "Incident: $description (Severity: $severity)" \
    --append-system-prompt "You are an SRE expert. Diagnose the issue, 
      assess impact, and provide immediate action items." \
    --output-format json \
    --allowedTools "Bash,Read,WebSearch" \
    --mcp-config monitoring-tools.json
}

investigate_incident "Payment API returning 500 errors" "high"
```

### Phase 5 Artifacts

| Artifact | Purpose |
|----------|---------|
| CI/CD pipelines | Automated build/deploy |
| Monitoring dashboards | System health visibility |
| Runbooks | Operational procedures |
| Alert configurations | Automated incident detection |

---

## Part 8: Complete Worked Examples

### Example 1: Building a REST API Feature End-to-End

**Scenario:** Add user profile endpoints to an existing Express.js API

#### Phase 1: Requirements
```
User: I need to add user profile management to our API. Users should be able to:
- View their profile
- Update their profile (name, bio, avatar)
- Delete their account

Use Plan Mode to analyze our existing codebase and propose a plan.
```

#### Phase 2: Design
```
User: Based on your analysis, create:
1. API endpoint specifications
2. Data model updates
3. Validation requirements
4. Test plan

Write this to docs/features/user-profile.md
```

#### Phase 3: Implementation (TDD)
```
User: Let's implement using TDD. First, write the tests for the
GET /api/users/:id/profile endpoint. We're doing test-driven development,
so don't create any implementation yet.
```

```
User: Tests look good and fail correctly. Now implement the minimal code
to make these tests pass.
```

```
User: All tests pass. Let's continue with PUT /api/users/:id/profile.
Write the tests first.
```

#### Phase 4: Quality
```
User: Run all tests and analyze coverage. Are there any edge cases we missed?
```

#### Phase 5: Deploy
```
User: Create a PR with these changes. Include:
- Descriptive PR title and body
- Test coverage report
- Migration instructions if any
```

### Example 2: Debugging a Complex Issue

**Scenario:** Users report intermittent 500 errors during checkout

#### Investigation Phase
```
User: We're seeing intermittent 500 errors in checkout. 
[Enable thinking with Tab]
Analyze possible causes given our architecture:
- React frontend
- Node.js API
- PostgreSQL database
- Stripe integration

Spawn a subagent to investigate error logs while you analyze the code.
```

#### Root Cause Analysis
```
User: Based on your analysis, the issue seems to be in the payment processing.
Create a detailed diagnosis with:
1. Root cause
2. Affected code paths
3. Reproduction steps
4. Recommended fix
```

#### Fix Implementation (with TDD)
```
User: Write a test that reproduces this bug, then implement the fix.
Use TDD approach - test must fail first.
```

#### Verification
```
User: Run all payment-related tests. Also test the manual reproduction steps
to confirm the fix works end-to-end.
```

---

## Part 9: Context Management Strategies

### Understanding Context

Claude Code's context window is like working memory—it fills up as you work. Effective context management is crucial for long sessions.

### Key Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/context` | View context usage | Check before long operations |
| `/clear` | Clear all context | Task complete, switching focus |
| `/compact` | Summarize context | ~70% capacity, preserve key info |
| `/resume` | Resume previous session | Continue previous work |
| `/continue` | Continue most recent | Quick continuation |

### Strategy 1: Document & Clear

For complex, multi-session work:

```
1. Have Claude write progress to a file:
   "Document our current progress, decisions made, and next steps 
   to docs/progress/auth-migration.md"

2. Clear context:
   /clear

3. Start fresh session with context:
   "Read docs/progress/auth-migration.md and continue from where we left off"
```

### Strategy 2: Strategic Compaction

```
# At ~70% context capacity
/compact Focus on preserving:
- Current authentication implementation details
- Database schema decisions
- API endpoint specifications
Summarize but don't lose the error handling patterns we discussed.
```

### Strategy 3: Subagent Delegation

Delegate context-heavy tasks to subagents:

```
User: "Spawn a subagent to analyze all authentication-related files 
and report back a summary. The subagent should use its own context 
and return only the key findings."
```

Benefits:
- Subagent uses isolated context
- Main context stays clean
- Only relevant findings return

### Context Management Anti-Patterns

**❌ Letting auto-compact decide:**
```
# Auto-compact at 95% often loses important context
# Better: manual compact at 70%
```

**❌ One long session for everything:**
```
# Wrong: Auth feature → bug fix → new API → refactor in one session
# Right: Clear between unrelated tasks
```

**❌ Repeating instructions:**
```
# Wrong: Telling Claude formatting preferences each message
# Right: Put persistent instructions in CLAUDE.md
```

### Session Continuity Patterns

```bash
# Continue the most recent conversation
claude --continue "Now refactor this for better performance"

# Resume specific session by ID
claude --resume 550e8400-e29b-41d4-a716-446655440000 "Update the tests"

# Resume in non-interactive/headless mode
claude --resume 550e8400 --print "Generate migration summary"
```

---

## Part 10: Subagent Orchestration Patterns

### Understanding Subagents

Subagents are specialized Claude instances with:
- **Isolated context windows**: Prevents "context pollution"
- **Custom system prompts**: Tailored for specific domains
- **Configurable tool access**: Restrict capabilities per agent
- **Automatic delegation**: Claude routes tasks based on context

### Built-in Subagents (v2.0+)

| Subagent | Purpose | Introduced |
|----------|---------|-----------|
| **Plan Subagent** | Dedicated planning with resumption | ~v2.0.28* |
| **Explore Subagent** | Haiku-powered codebase search | ~v2.0.17* |

*Version numbers from community tracking (ClaudeLog); official docs confirm features exist but don't specify introduction versions.*

### Manual Subagent Invocation

```
User: "Use 3 subagents to analyze these aspects in parallel:
1. Security analysis of auth.ts
2. Performance review of cache system  
3. Type checking of utils.ts"
```

### Custom Subagent Definition

Create `.claude/agents/code-reviewer.md`:

```markdown
---
name: code-reviewer
description: Expert code review specialist. Use for quality, security, and 
  maintainability reviews.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality 
and security.

## Review Checklist
1. Security vulnerabilities
2. Performance issues
3. Code style violations
4. Missing error handling
5. Test coverage gaps

## Output Format
Provide findings as:
- **Critical**: Must fix before merge
- **Warning**: Should fix soon
- **Suggestion**: Nice to have
```

### Orchestration Patterns

#### Pattern 1: Sequential Pipeline
```
requirements-analyst → system-architect → code-reviewer

"Use the requirements-analyst to analyze these requirements,
then have the system-architect design the solution,
finally have the code-reviewer validate the design."
```

#### Pattern 2: Parallel Specialists
```
ui-engineer + api-designer + database-designer (simultaneously)

"Have the ui-engineer design the frontend while the api-designer 
creates the backend specification and the database-designer 
creates the schema—all working in parallel."
```

#### Pattern 3: Orchestrator with Routing
```
project-orchestrator → routes to specialists

"Use the project-orchestrator to analyze this task and route
to the appropriate specialists based on complexity."
```

### TDD with Subagents

From the Claude-Flow framework:

```yaml
# TDD workflow with specialized agents
test_designer:
  role: Test Specification Designer
  responsibilities:
    - Design comprehensive test suites
    - Identify edge cases
    - Create test data

red_phase_agent:
  role: Failing Test Creator
  responsibilities:
    - Write failing tests defining expected behavior
    - Ensure tests fail for right reasons

green_phase_agent:
  role: Minimal Implementation Creator
  responsibilities:
    - Write minimal code to pass tests
    - Avoid over-engineering

refactor_agent:
  role: Code Quality Improver
  responsibilities:
    - Clean code improvements
    - Apply design patterns
```

### Best Practices

**Context Isolation:**
- Let the orchestrator maintain the global plan
- Each subagent handles only its domain
- Pass minimal context between agents

**Tool Minimalism:**
- Grant only essential tool access per subagent
- Security agents: Read, Grep only (no file modification)
- Implementation agents: Full tool access

**Error Handling:**
- Define fallback behaviors
- Log subagent failures for debugging
- Escalate to human when confidence is low

---

## Part 11: CI/CD Automation

### Headless Mode Fundamentals

```bash
# Basic headless execution
claude -p "Your prompt here" --output-format json

# With tool restrictions
claude -p "Review code for issues" \
  --allowedTools "Read,Grep" \
  --permission-mode acceptEdits

# Streaming output
claude -p "Analyze codebase" --output-format stream-json

# With system prompt extension
claude -p "Fix the bug" \
  --append-system-prompt "Focus on security implications"
```

### GitHub Actions Integration

```yaml
name: AI-Assisted PR Review

on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

jobs:
  claude-review:
    runs-on: ubuntu-latest
    if: >
      github.event_name == 'pull_request' || 
      (github.event_name == 'issue_comment' && 
       contains(github.event.comment.body, '@claude'))
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Claude Code
        run: |
          npm install -g @anthropic-ai/claude-code
          echo "$HOME/.claude/bin" >> $GITHUB_PATH
      
      - name: Run Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Get changed files
          CHANGED_FILES=$(git diff --name-only ${{ github.event.pull_request.base.sha }})
          
          # Run security analysis
          echo "$CHANGED_FILES" | xargs -I {} \
            claude -p "Analyze {} for security issues" \
            --allowedTools "Read,Grep" \
            --output-format json >> security-results.json
          
          # Run code quality check
          claude -p "Review these changes for code quality:
            $(git diff --stat)" \
            --output-format json > quality-results.json
```

### GitLab CI Integration

```yaml
# .gitlab-ci.yml
stages:
  - analysis
  - report

claude-analysis:
  stage: analysis
  image: node:20
  before_script:
    - npm install -g @anthropic-ai/claude-code
  script:
    - claude -p "Analyze codebase for maintainability" 
        --output-format json > maintainability.json
    - claude -p "Check for performance bottlenecks" 
        --output-format json > performance.json
  artifacts:
    paths:
      - "*.json"
    expire_in: 1 week

generate-report:
  stage: report
  needs: [claude-analysis]
  script:
    - claude -p "Create summary report from analysis files"
        --input-files maintainability.json,performance.json
        --output-format html > final_report.html
  artifacts:
    paths:
      - final_report.html
```

### Pre-Commit Hook Integration

```bash
#!/bin/bash
# .git/hooks/pre-commit

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Run Claude Code security check
echo "$STAGED_FILES" | xargs claude -p \
  "Check these files for security issues. 
   Return JSON with 'issues' array (empty if none)" \
  --allowedTools "Read" \
  --output-format json > /tmp/security-check.json

# Check for issues
if jq -e '.issues | length > 0' /tmp/security-check.json > /dev/null; then
  echo "❌ Security issues found:"
  jq -r '.issues[]' /tmp/security-check.json
  exit 1
fi

echo "✅ Security check passed"
```

### Fan-Out Pattern for Large Migrations

```bash
#!/bin/bash
# large-migration.sh

MIGRATION_RULE="Convert class-based components to functional hooks"

# Step 1: Generate file list
claude -p "List all React class components that need migration" \
  --allowedTools "Read,Glob,Grep" > migration-list.txt

# Step 2: Process in parallel batches
cat migration-list.txt | xargs -P 4 -I {} bash -c '
  echo "Processing: {}"
  claude -p "'"$MIGRATION_RULE"' in file {}" \
    --allowedTools "Edit" \
    --permission-mode acceptEdits
  git add "{}"
  git commit -m "refactor: migrate {} to functional component"
'

echo "✅ Migration complete"
```

---

## Part 12: Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `/clear` | Clear conversation context |
| `/compact` | Summarize and compress context |
| `/context` | View context usage breakdown |
| `/resume` | Resume previous session |
| `/continue` | Continue most recent session |
| `/model` | Switch AI model |
| `/config` | View/edit configuration |
| `/mcp` | Manage MCP servers |
| `/hooks` | Manage hooks |
| `/agents` | Manage custom agents |
| `/rewind` | Restore previous checkpoint |
| `/doctor` | Debug configuration issues |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Shift+Tab** | Cycle permission modes |
| **Tab** | Toggle extended thinking |
| **Esc Esc** | Rewind to previous checkpoint |
| **Ctrl+C** | Cancel current generation |
| **Ctrl+R** | Search prompt history |
| **Ctrl+L** | Clear terminal screen |
| **Ctrl+D** | Exit session |

### Permission Modes

| Mode | Description |
|------|-------------|
| Normal | Approve each action |
| Auto-Accept (`⏵⏵`) | Accept edits automatically |
| Plan (`⏸`) | Read-only exploration |

### Extended Thinking

| Method | Description |
|--------|-------------|
| **Tab** | Primary toggle - press during session |
| **Sticky state** | Persists across sessions |
| **MAX_THINKING_TOKENS** | Environment variable for budget |
| **Natural language** | "think carefully", "analyze deeply" (supplementary) |

**Note:** The tiered keyword system (think < think hard < ultrathink) with specific token budgets documented in early 2025 is not in current official docs. Use Tab toggle as primary mechanism.

### Phase Checklist

#### Phase 1: Ideation
- [ ] Requirements documented
- [ ] Constraints identified
- [ ] Questions logged
- [ ] CLAUDE.md updated

#### Phase 2: Design
- [ ] Architecture documented
- [ ] ADRs created
- [ ] APIs specified
- [ ] Data models defined

#### Phase 3: Implementation
- [ ] Tests written first
- [ ] Tests verify failure
- [ ] Implementation passes tests
- [ ] Code reviewed
- [ ] Committed with messages

#### Phase 4: Quality
- [ ] All tests pass
- [ ] Coverage adequate
- [ ] Edge cases covered
- [ ] Security reviewed

#### Phase 5: Deploy
- [ ] CI/CD configured
- [ ] Monitoring setup
- [ ] Runbooks created
- [ ] Successfully deployed

---

## Part 13: References

### Official Anthropic Sources

1. **Claude Code Best Practices** (Anthropic Engineering)
   - https://www.anthropic.com/engineering/claude-code-best-practices
   - Authoritative guide including TDD workflow, headless mode, and parallel development

2. **Building Agents with Claude Agent SDK** (Anthropic Engineering)
   - https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
   - Subagent orchestration, tool design, best practices

3. **Claude Code Documentation**
   - https://code.claude.com/docs
   - Official documentation for all features

4. **Extended Thinking Documentation**
   - https://docs.claude.com/en/docs/build-with-claude/extended-thinking
   - Thinking budgets, interleaved thinking, best practices

5. **Claude Code Headless Mode**
   - https://code.claude.com/docs/en/headless
   - CI/CD integration, automation patterns

6. **Common Workflows**
   - https://code.claude.com/docs/en/common-workflows
   - Plan mode, test generation, extended thinking usage

7. **Hooks Reference**
   - https://code.claude.com/docs/en/hooks
   - Hook types, configuration, security considerations

8. **Subagents Documentation**
   - https://code.claude.com/docs/en/sub-agents
   - Custom agents, context isolation, tool configuration

9. **Context Management**
   - https://www.claude.com/blog/context-management
   - Context editing, memory tool, automatic management

10. **Enabling Claude Code to Work More Autonomously** (Anthropic News)
    - https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously
    - Checkpoints, rewind, VS Code extension, background tasks

### Community Resources

11. **ClaudeLog** - Comprehensive Claude Code documentation
    - https://claudelog.com/
    - Changelog, mechanics guides, FAQs

12. **TDD Guard** - Automated TDD enforcement
    - https://github.com/nizos/tdd-guard
    - Hooks-based TDD workflow automation

13. **Claude-Flow** - Agent orchestration framework
    - https://github.com/ruvnet/claude-flow
    - Multi-agent workflows, TDD templates

14. **Awesome Claude Code** - Curated resources
    - https://github.com/hesreallyhim/awesome-claude-code
    - Commands, workflows, tools

15. **Harper Reed's Workflow** - TDD advocate patterns
    - https://harper.blog/2025/05/08/basic-claude-code/
    - spec.md + prompt_plan.md workflow

16. **Context Management Guide** - MCPcat
    - https://mcpcat.io/guides/managing-claude-code-context/
    - Practical context strategies

### Tutorial Articles

17. **Claude Code Complete Guide** - Sid Bharath
    - https://www.siddharthbharath.com/claude-code-the-complete-guide/
    - End-to-end tutorial with examples

18. **How I Use Every Claude Code Feature** - Shrivu Shankar
    - https://blog.sshh.io/p/how-i-use-every-claude-code-feature
    - Advanced patterns, subagent insights

19. **Claude Code Subagents for Parallelization** - Zach Wills
    - https://zachwills.net/how-to-use-claude-code-subagents-to-parallelize-development/
    - Context isolation, orchestration patterns

20. **TDD with Claude Code** - Medium/Craig Tait
    - https://medium.com/@taitcraigd/tdd-with-claude-code-model-context-protocol-fmp-and-agents
    - MCP integration, CI/CD workflow

21. **Custom TDD Workflow** - AlexOP.dev
    - https://alexop.dev/posts/custom-tdd-workflow-claude-code-vue/
    - Skills-based TDD enforcement with subagents

22. **My Claude Code Workflow** - Zhu Liang
    - https://thegroundtruth.substack.com/p/my-claude-code-workflow-and-personal-tips
    - Roadmap + task files, personal tips

### Framework Documentation

23. **Claude-Flow Wiki** - TDD Templates
    - https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-TDD
    - Parallel TDD agents, phase gates

24. **Developer Toolkit** - PRD→Plan→Todo
    - https://developertoolkit.ai/en/claude-code/quick-start/prd-workflow/
    - Requirements to code workflow

25. **Claude Agent SDK Best Practices** - Skywork
    - https://skywork.ai/blog/claude-agent-sdk-best-practices-ai-agents-2025/
    - Orchestration, permissions, observability

### CI/CD Resources

26. **CI/CD Integration Guide** - Skywork
    - https://skywork.ai/blog/how-to-integrate-claude-code-ci-cd-guide-2025/
    - GitHub Actions, GitLab CI, safety tips

27. **Headless Mode Automation** - ClaudeCode101
    - https://www.claudecode101.com/en/tutorial/advanced/headless-mode
    - Practical automation examples

28. **Batch API Guide** - SmartScope
    - https://smartscope.blog/en/generative-ai/claude/claude-code-batch-processing/
    - Large-scale processing patterns

### Hooks & Automation

29. **GitButler Hooks Tutorial**
    - https://blog.gitbutler.com/automate-your-ai-workflows-with-claude-code-hooks
    - Practical hook implementation

30. **Hooks Mastery** - Disler
    - https://github.com/disler/claude-code-hooks-mastery
    - Lifecycle events with examples (note: official docs list 10 events)

31. **Hooks Deep Dive** - SmartScope
    - https://smartscope.blog/en/generative-ai/claude/claude-code-hooks-hands-on-implementation-deep-dive-2025/
    - Python/TypeScript configurations

### Plan Mode & Todo Management

32. **Plan Mode Best Practices** - Code Centre
    - https://cuong.io/blog/2025/07/15-claude-code-best-practices-plan-mode
    - Plan mode workflow, brainstorming patterns

33. **Claude Code as Project Manager** - Ben Newton
    - https://benenewton.com/blog/claude-code-roadmap-management
    - ROADMAP.md workflow, progress tracking

34. **ClaudeKit** - Workflow system
    - https://github.com/anthony-langham/claudeKit
    - Plan mode, slash commands, task management

35. **Claude Code Changelog** - ClaudeLog
    - https://claudelog.com/claude-code-changelog/
    - Complete version history

---

## Appendix A: CLAUDE.md Template for E2E Workflows

```markdown
# Project: [Name]

## Quick Reference
- Start: `npm run dev`
- Test: `npm test`
- Build: `npm run build`
- Deploy: `npm run deploy`

## Technology Stack
- Language: TypeScript 5.x
- Framework: Next.js 14
- Database: PostgreSQL 15
- ORM: Prisma
- Testing: Jest + React Testing Library

## Code Conventions
- Use functional components with hooks
- Prefer named exports
- Use absolute imports from `@/`
- All new code requires tests

## Testing Requirements
- TDD approach: write tests first
- Minimum 80% coverage for new code
- Integration tests for API endpoints
- E2E tests for critical user flows

## Do NOT
- Edit .env files directly
- Modify migrations without consultation
- Skip tests "for now"
- Use any in TypeScript

## Architecture
See docs/ARCHITECTURE.md for system overview.

## Current Sprint
See docs/sprint/current.md for active work.
```

---

## Appendix B: Troubleshooting Common Workflow Issues

### Issue: Claude Adds Features Not in Spec

**Symptoms:** Implementation includes unrequested functionality

**Solutions:**
1. Use explicit scope constraints in prompts
2. Reference spec file: "Implement ONLY what's in SPEC.md"
3. Use Plan Mode to review before implementation
4. Add to CLAUDE.md: "Do not add features unless explicitly requested"

### Issue: Tests Pass But Code Doesn't Work

**Symptoms:** Unit tests green but integration fails

**Solutions:**
1. Add integration tests before unit tests
2. Test with real dependencies, not mocks
3. Use visual target testing for UI
4. Implement contract tests for APIs

### Issue: Context Window Fills Up

**Symptoms:** Claude forgets earlier decisions, performance degrades

**Solutions:**
1. Use `/compact` at 70% capacity
2. Document decisions to files
3. Use subagents for research tasks
4. Clear between unrelated tasks
5. Start new session for new features

### Issue: Claude Makes Same Mistakes Repeatedly

**Symptoms:** Errors recur despite corrections

**Solutions:**
1. Add explicit rules to CLAUDE.md
2. Create custom slash command with correct approach
3. Use hooks to validate patterns
4. Document anti-patterns with examples

### Issue: Extended Thinking Takes Too Long

**Symptoms:** Long delays, potential timeouts

**Solutions:**
1. Lower thinking budget incrementally
2. Break task into smaller subproblems
3. Use batch processing for large budgets
4. Consider if extended thinking is needed

---

*This guide reflects verified practices as of December 2025. Claude Code evolves rapidly; always check official documentation for the latest features.*
