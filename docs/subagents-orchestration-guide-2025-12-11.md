# Claude Code Subagents & Multi-Agent Orchestration Guide

**Updated:** December 11, 2025  
**Version:** 1.0  
**Verified Against:** Claude Code v2.0+, Sonnet 4.5, Opus 4.5

---

## Table of Contents

1. [Introduction: The Multi-Agent Mental Model](#introduction-the-multi-agent-mental-model)
2. [Built-in Subagents](#built-in-subagents)
3. [Custom Agents](#custom-agents)
4. [Agent Configuration Reference](#agent-configuration-reference)
5. [Parallel Development with Worktrees](#parallel-development-with-worktrees)
6. [Pipeline Patterns](#pipeline-patterns)
7. [Known Issues & Mitigations](#known-issues--mitigations)
8. [Best Practices](#best-practices)
9. [Quick Reference](#quick-reference)
10. [Sources](#sources)

---

## Introduction: The Multi-Agent Mental Model

### What Are Subagents?

Subagents are specialized AI assistants within Claude Code that operate **independently** with their own:

- **System prompt** — Custom instructions defining their role
- **Tool permissions** — Granular control over what they can do
- **Context window** — Isolated from the main conversation

Think of them as team members with specific expertise. Instead of one generalist handling everything, you delegate to specialists.

### Why Use Subagents?

| Benefit | How It Helps |
|---------|--------------|
| **Context isolation** | Long analysis doesn't pollute main conversation |
| **Specialization** | Focused prompts perform better than general ones |
| **Parallelization** | Multiple agents work simultaneously |
| **Reliability** | Narrow scope = fewer errors |
| **Cost efficiency** | Haiku subagents are 3x cheaper than Sonnet |

### The Agent Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN AGENT (Orchestrator)                 │
│  - Receives user prompts                                     │
│  - Coordinates workflow                                      │
│  - Delegates to specialists                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   EXPLORE   │  │    PLAN     │  │   CUSTOM    │
│  (Built-in) │  │  (Built-in) │  │   AGENTS    │
│             │  │             │  │             │
│ Read-only   │  │ Planning    │  │ Your        │
│ codebase    │  │ research    │  │ specialists │
│ search      │  │ in plan     │  │             │
│             │  │ mode        │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Key limitation:** Subagents cannot spawn other subagents (no infinite nesting).

---

## Built-in Subagents

Claude Code includes two specialized built-in subagents that activate automatically.

### Explore Subagent

**Purpose:** Fast, lightweight codebase search and analysis.

**Key characteristics:**
- Uses **Haiku 4.5** by default (fast, cheap)
- **Read-only** — cannot modify files
- Optimized for rapid file discovery

**Available tools:**
- `Read` — View file contents
- `Grep` — Search patterns
- `Glob` — Find files by pattern
- `Bash` — Read-only commands only (`ls`, `git status`, `git log`, `git diff`, `find`, `cat`, `head`, `tail`)

**When Claude uses it:**
Claude automatically delegates to Explore when it needs to search or understand code without making changes. This prevents exploration results from bloating the main conversation.

**Thoroughness levels:**
When invoking Explore, Claude specifies:
- **Quick** — Fast searches, minimal exploration. Good for targeted lookups.
- **Medium** — Balanced speed and thoroughness.
- **Very thorough** — Comprehensive analysis across multiple locations.

**Example scenarios:**
```
User: "Where are errors from the client handled?"
→ Claude invokes Explore to search for error handling patterns

User: "Find all authentication-related code"
→ Explore searches with "very thorough" for comprehensive results
```

### Plan Subagent

**Purpose:** Dedicated research during plan mode.

**When it's used:**
Only active in **plan mode** (triggered by `shift+tab` or when you ask Claude to plan). When Claude needs to understand your codebase to create a plan, it delegates research to the Plan subagent.

**Why it exists:**
Prevents infinite nesting — the Plan subagent gathers context without spawning additional subagents.

**Example:**
```
User: [In plan mode] "Help me refactor the authentication module"

Claude: "Let me research your authentication implementation first..."
[Internally invokes Plan subagent to explore auth-related files]
[Plan subagent searches codebase and returns findings]
Claude: "Based on my research, here's my proposed plan..."
```

---

## Custom Agents

Custom agents are your own specialized subagents. Unlike built-in agents, they:

- Have **custom system prompts** you define
- Can use **any tools** you permit
- Are **automatically invoked** based on task description
- Live in `.claude/agents/` (project) or `~/.claude/agents/` (global)

### Creating Custom Agents

**Method 1: Using /agents command (Recommended)**

```bash
/agents
```

This opens an interactive wizard:

1. **Choose location:**
   - Project (`.claude/agents/`) — for this repo only
   - Personal (`~/.claude/agents/`) — available everywhere

2. **Choose creation method:**
   - Generate with Claude (recommended) — Claude creates the agent definition
   - Manual configuration — you write everything

3. **Describe the agent's purpose:**
   ```
   A code reviewer that checks for security vulnerabilities, 
   performance issues, and style consistency
   ```

4. **Select tools:** 
   - Inherit all (default)
   - Or select specific tools

5. **Choose background color:**
   Visual indicator when this agent is active

**Method 2: Manual Creation**

```bash
mkdir -p .claude/agents

cat > .claude/agents/security-reviewer.md << 'EOF'
---
name: security-reviewer
description: Use this agent to review code for security vulnerabilities, injection risks, and authentication issues
tools: Read, Grep, Glob
model: sonnet
---

You are a senior security engineer specializing in application security.

## Your Responsibilities
- Identify injection vulnerabilities (SQL, XSS, command injection)
- Review authentication and authorization logic
- Check for sensitive data exposure
- Analyze cryptographic implementations
- Identify insecure dependencies

## Review Process
1. Understand the code's purpose and data flow
2. Identify trust boundaries
3. Check input validation at each boundary
4. Review output encoding
5. Analyze error handling for information leakage

## Output Format
For each finding:
- **Severity:** Critical/High/Medium/Low
- **Location:** File and line number
- **Issue:** Description of the vulnerability
- **Recommendation:** Specific fix

If no issues found, explicitly state "No security issues identified" with reasoning.
EOF
```

### Agent File Structure

```yaml
---
name: agent-name                    # Required: unique identifier
description: When to use this agent # Required: triggers auto-delegation
tools: Read, Write, Bash            # Optional: comma-separated list
model: sonnet                       # Optional: sonnet, opus, haiku, or 'inherit'
permissionMode: default             # Optional: permission handling
skills: skill1, skill2              # Optional: auto-load specific skills
color: blue                         # Optional: visual indicator
---

Your system prompt goes here.

This can be multiple paragraphs with:
- Specific instructions
- Examples
- Constraints
- Output formats
```

### Tool Configuration

**Option 1: Inherit all tools (default)**
```yaml
---
name: my-agent
description: General purpose helper
# tools field omitted = inherits ALL tools including MCP
---
```

**Option 2: Specific tools only**
```yaml
---
name: code-reviewer
description: Review code for quality issues
tools: Read, Grep, Glob
---
```

**Available built-in tools:**
- `Read` — Read file contents
- `Write` — Create/overwrite files
- `Edit` — Modify existing files
- `MultiEdit` — Multiple edits in one operation
- `Bash` — Execute shell commands
- `Grep` — Search with regex
- `Glob` — Find files by pattern
- `LS` — List directory contents
- `WebFetch` — Fetch web content
- `WebSearch` — Search the web
- `Task` — Spawn subagents (main agent only)

**Tool categories by agent type:**

| Agent Role | Recommended Tools |
|------------|-------------------|
| Read-only (reviewers, auditors) | `Read`, `Grep`, `Glob` |
| Research (analysts) | `Read`, `Grep`, `Glob`, `WebFetch`, `WebSearch` |
| Implementers (developers) | `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep` |
| Test runners | `Read`, `Bash`, `Grep` |

### Model Selection

```yaml
model: sonnet    # Claude Sonnet 4.5 (default for subagents)
model: opus      # Claude Opus 4.5 (most capable, highest cost)
model: haiku     # Claude Haiku 4.5 (fastest, cheapest)
model: inherit   # Use same model as main conversation
```

**Cost-performance tradeoffs:**

| Model | Best For | Relative Cost |
|-------|----------|---------------|
| Haiku 4.5 | Exploration, simple tasks, high-volume | 1x ($1/$5 per M tokens) |
| Sonnet 4.5 | General development, orchestration | 3x ($3/$15 per M tokens) |
| Opus 4.5 | Complex reasoning, architecture | 5x ($15/$75 per M tokens) |

**Strategy:** Use Haiku for lightweight agents (explore, lint, format), Sonnet for implementation, Opus for architectural decisions.

### Invoking Custom Agents

**Automatic invocation (preferred):**
Claude analyzes your request and delegates to matching agents based on their `description` field.

```
User: "Review the authentication module for security issues"
→ Claude automatically invokes security-reviewer agent
```

**Explicit invocation:**
```
User: "Use the security-reviewer agent to analyze auth.py"
```

```
User: "Have the code-formatter agent clean up the src/ directory"
```

---

## Agent Configuration Reference

### Complete YAML Frontmatter Options

```yaml
---
# Required fields
name: agent-identifier          # Unique name, used for invocation
description: |                  # When this agent should be used
  Use this agent when you need to [specific task].
  Examples of when to invoke:
  - [scenario 1]
  - [scenario 2]

# Optional fields
tools: Read, Write, Bash        # Comma-separated tool list
model: sonnet                   # Model: sonnet, opus, haiku, inherit
permissionMode: default         # How permissions are handled
skills: python, testing         # Skills to auto-load
color: blue                     # Background color in UI
---
```

### Permission Modes

| Mode | Behavior |
|------|----------|
| `default` | Inherits permission settings from main session |
| `bypassPermissions` | Skips permission prompts (use carefully) |

### Agent Discovery

Claude discovers agents by:

1. Scanning `.claude/agents/` in current project
2. Scanning `~/.claude/agents/` for global agents
3. Parsing Markdown files with YAML frontmatter
4. Hot-reloading when files change

**Precedence:** Project agents override global agents with the same name.

---

## Parallel Development with Worktrees

Running multiple Claude instances simultaneously requires **workspace isolation** to prevent conflicts.

### The Problem

```
Terminal 1: Claude edits auth.py line 50
Terminal 2: Claude edits auth.py line 52
→ Conflicts, corruption, chaos
```

### The Solution: Git Worktrees

Git worktrees create multiple working directories from a single repository, each with its own:
- Checked-out branch
- File state
- Index

```bash
# From your main repo
git worktree add ../project-feature-a -b feature-a
git worktree add ../project-feature-b -b feature-b
git worktree add ../project-hotfix hotfix/123
```

Now you have three sibling folders sharing the same `.git` history but with isolated files.

### Parallel Claude Sessions

**Terminal 1:**
```bash
cd ../project-feature-a
claude
# Work on feature A
```

**Terminal 2:**
```bash
cd ../project-feature-b
claude
# Work on feature B simultaneously
```

**Terminal 3:**
```bash
cd ../project-hotfix
claude
# Fix urgent bug in parallel
```

### When to Use Parallel Agents

| Scenario | Parallel Benefit |
|----------|------------------|
| Independent features | No file overlap, merge later |
| Multiple implementations | Compare approaches, pick best |
| Writer + Reviewer | One writes, another reviews |
| Tests + Implementation | TDD with separate contexts |
| Frontend + Backend | Different codebases, same project |

### Parallel Workflow Patterns

**Pattern 1: Multiple Implementations**

Generate N versions of the same feature, pick the best:

```bash
# Create worktrees
git worktree add ../impl-v1 -b feature/impl-v1
git worktree add ../impl-v2 -b feature/impl-v2
git worktree add ../impl-v3 -b feature/impl-v3

# Launch Claude in each with same prompt
cd ../impl-v1 && claude -p "Implement user authentication with JWT"
cd ../impl-v2 && claude -p "Implement user authentication with JWT"
cd ../impl-v3 && claude -p "Implement user authentication with JWT"

# Compare results, merge best approach
```

**Pattern 2: Aspect-Based Parallelism**

Different agents handle different aspects:

```bash
git worktree add ../auth-frontend -b auth/frontend
git worktree add ../auth-backend -b auth/backend
git worktree add ../auth-tests -b auth/tests

cd ../auth-frontend && claude -p "Build React authentication UI" &
cd ../auth-backend && claude -p "Implement JWT authentication API" &
cd ../auth-tests && claude -p "Write comprehensive auth tests" &
```

**Pattern 3: Writer + Reviewer**

```bash
# Terminal 1: Writer
cd ../feature-branch
claude
# "Implement the payment processing module"

# Terminal 2: Reviewer (watches for changes)
cd ../feature-branch
claude
# "Review the payment code for security issues as files change"
```

### Worktree Management

```bash
# List all worktrees
git worktree list

# Remove a worktree when done
git worktree remove ../project-feature-a

# Prune stale worktrees
git worktree prune
```

### Worktree Limitations

| Issue | Mitigation |
|-------|------------|
| Branch locking (can't checkout same branch twice) | Create new branches for each worktree |
| Per-tree setup needed (node_modules, venv) | Script setup or share via symlinks |
| Increased token costs | Budget accordingly, use Haiku where possible |
| Cognitive overhead of multiple sessions | Limit to 3-5 parallel agents |

### Advanced: Automated Worktree Commands

Create a custom slash command for worktree setup:

```markdown
# .claude/commands/parallel-setup.md

## Variables
FEATURE_NAME: $ARGUMENTS
NUM_INSTANCES: 3

## Instructions
Create parallel development environment:

1. Create worktrees:
   ```bash
   mkdir -p trees
   for i in $(seq 1 $NUM_INSTANCES); do
     git worktree add trees/${FEATURE_NAME}-$i -b ${FEATURE_NAME}-$i
   done
   ```

2. List created worktrees:
   ```bash
   git worktree list
   ```

3. Provide instructions for launching Claude in each.
```

Usage: `/parallel-setup user-authentication`

---

## Pipeline Patterns

Structured multi-agent workflows for complex projects.

### Pattern 1: PM → Architect → Implementer

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PM-SPEC    │────▶│  ARCHITECT   │────▶│ IMPLEMENTER  │
│              │     │              │     │              │
│ - Read PRD   │     │ - Validate   │     │ - Write code │
│ - Clarify    │     │ - Design ADR │     │ - Write tests│
│ - Write spec │     │ - Set status │     │ - Update docs│
└──────────────┘     └──────────────┘     └──────────────┘
     tools:               tools:               tools:
   Read, Grep           Read, Grep         Read, Write,
                                           Edit, Bash
```

**Agent definitions:**

```markdown
# .claude/agents/pm-spec.md
---
name: pm-spec
description: Use for analyzing requirements and writing specifications
tools: Read, Grep, Glob
model: sonnet
---

You are a product manager creating technical specifications.

## Process
1. Read the enhancement request or PRD
2. Ask clarifying questions if needed
3. Write a detailed specification in /docs/specs/
4. Set status: READY_FOR_ARCHITECT

## Output
Create spec file with:
- User stories
- Acceptance criteria
- Technical requirements
- Dependencies
```

```markdown
# .claude/agents/architect.md
---
name: architect
description: Use for architecture review and design decisions
tools: Read, Grep, Glob
model: opus
---

You are a senior architect reviewing designs.

## Process
1. Read the specification from PM
2. Validate against platform constraints
3. Consider performance, cost, scalability
4. Write Architecture Decision Record (ADR)
5. Set status: READY_FOR_BUILD

## Output
Create ADR in /docs/adr/ with:
- Context and problem
- Decision
- Consequences
- Alternatives considered
```

```markdown
# .claude/agents/implementer.md
---
name: implementer
description: Use for implementing features with tests
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

You are a senior developer implementing features.

## Process
1. Read the spec and ADR
2. Write tests first (TDD)
3. Implement to pass tests
4. Update documentation
5. Set status: READY_FOR_REVIEW
```

### Pattern 2: TDD Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ TEST-WRITER  │────▶│   CODER      │────▶│  REVIEWER    │
│              │     │              │     │              │
│ Write failing│     │ Implement to │     │ Check quality│
│ tests first  │     │ pass tests   │     │ and coverage │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Pattern 3: Hub-and-Spoke Orchestration

Central orchestrator routes to specialists:

```
                    ┌──────────────┐
                    │ ORCHESTRATOR │
                    │  (hub)       │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   FRONTEND   │  │   BACKEND    │  │   TESTING    │
│  specialist  │  │  specialist  │  │  specialist  │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Benefits:**
- Prevents agents from self-selecting incorrectly
- Central routing based on task analysis
- Clear handoff protocols

### Handoff Contracts

Ensure context preservation between agents:

```markdown
## HANDOFF CONTRACT

### From: pm-spec
### To: architect

### Context Passed:
- Specification file path: /docs/specs/feature-x.md
- User stories: [summary]
- Key constraints: [list]

### Expected Action:
- Review specification
- Create ADR
- Set status to READY_FOR_BUILD or NEEDS_REVISION

### Success Criteria:
- ADR created in /docs/adr/
- All acceptance criteria addressed
- Performance requirements documented
```

---

## Known Issues & Mitigations

### Issue: Subagents Not Recognized After Update

**Context:** After certain Claude Code updates (notably v1.0.62), subagents may not appear in `/agents` menu.

**Root Cause:** Parser changes or file format expectations.

**Mitigation:**
1. Verify YAML frontmatter syntax is valid
2. Check file location (`.claude/agents/` or `~/.claude/agents/`)
3. Try regenerating with `/agents` command
4. If persistent, temporarily downgrade: `npm install -g @anthropic-ai/claude-code@1.0.61`

**Reference:** [GitHub Issue #4706](https://github.com/anthropics/claude-code/issues/4706)

### Issue: Subagent File Writes Don't Persist

**Context:** Subagents report successful file creation but files don't appear on filesystem.

**Root Cause:** Subagents may operate in isolated/sandboxed contexts where Write tool reports success but changes don't persist.

**Mitigations:**
1. Use subagents primarily for **read-only** analysis
2. Have subagents return recommendations, main agent does writes
3. Verify file existence after subagent completes
4. For critical writes, use main agent with explicit file operations

**Reference:** [GitHub Issue #4462](https://github.com/anthropics/claude-code/issues/4462)

### Issue: Subagent Resume Missing Context

**Context:** When resuming a subagent via agentId, it lacks context from previous user prompts.

**Root Cause:** Agent transcripts store assistant responses and tool results but not user prompts that initiated interactions.

**Mitigations:**
1. Include all necessary context in the resume prompt
2. Have agents summarize key information in their responses (so it's in transcript)
3. Use explicit handoff files instead of resume for complex workflows

**Reference:** [GitHub Issue #11712](https://github.com/anthropics/claude-code/issues/11712)

### Issue: Subagents Modify Code in Plan Mode

**Context:** Subagents spawned during plan mode sometimes make actual code changes instead of just planning.

**Root Cause:** Subagent doesn't inherit plan mode restrictions from parent.

**Mitigations:**
1. Explicitly restrict tools for planning agents: `tools: Read, Grep, Glob`
2. Include clear instructions: "Do NOT modify any files. Analysis only."
3. Use dedicated read-only agents for planning research

**Reference:** [GitHub Issue #2073](https://github.com/anthropics/claude-code/issues/2073)

### Issue: No Nested Subagents

**Context:** Subagents cannot spawn other subagents, limiting hierarchical workflows.

**Root Cause:** Intentional design to prevent infinite recursion and resource exhaustion.

**Mitigations:**
1. Design flatter agent hierarchies
2. Use worktrees for parallel work instead of nested agents
3. Have orchestrator manage all delegations directly
4. For complex workflows, use sequential handoffs instead of nesting

**Reference:** [GitHub Issue #4182](https://github.com/anthropics/claude-code/issues/4182)

### Issue: Subagents Start with No Context

**Context:** Subagents begin with empty context, requiring redundant information gathering.

**Root Cause:** Context isolation is "all or nothing" — subagent doesn't inherit parent context.

**Mitigations:**
1. Pass explicit context in invocation prompt:
   ```
   Use the code-reviewer agent to review auth.py. 
   Context: We're implementing OAuth2 with JWT tokens. 
   Focus on token validation and refresh logic.
   ```
2. Reference specific files the agent should read first
3. Create summary documents that agents can load

**Reference:** [GitHub Issue #4908](https://github.com/anthropics/claude-code/issues/4908)

### Issue: Agents "Forget" to Use Subagents Mid-Session

**Context:** Claude actively uses custom agents early in session but stops delegating as conversation grows.

**Root Cause:** As context fills, MCP tool and agent descriptions get deprioritized. This affects ALL MCP tools, not just agents.

**Mitigations:**
1. Shorter sessions with clear handoffs
2. Explicit reminders: "Remember to use the security-reviewer for any auth changes"
3. SessionStart hook to reinject agent awareness:
   ```bash
   # .claude/hooks/session-start.sh
   echo "Available specialist agents: security-reviewer, test-runner, code-formatter"
   echo "Delegate security reviews to security-reviewer agent"
   ```
4. Periodic `/compact` to refresh context priorities

---

## Best Practices

### Agent Design

1. **Single responsibility** — Each agent does one thing well
2. **Detailed descriptions** — Clear triggers for auto-delegation
3. **Minimal tools** — Grant only what's necessary
4. **Explicit output formats** — Define expected deliverables
5. **Version control agents** — Check `.claude/agents/` into git

### Prompt Engineering for Agents

```markdown
# Good agent prompt structure

## Role
You are a [specific role] with expertise in [domains].

## Responsibilities
- [Specific task 1]
- [Specific task 2]
- [Specific task 3]

## Process
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Constraints
- [What NOT to do]
- [Boundaries]

## Output Format
[Exactly what to produce]
```

### Cost Management

1. Use **Haiku** for exploration, formatting, simple checks
2. Use **Sonnet** for implementation, general tasks
3. Use **Opus** sparingly for architecture, complex decisions
4. Monitor with `/cost` command
5. Limit parallel instances (3-5 is usually optimal)

### Team Collaboration

1. **Project agents** (`.claude/agents/`) — Shared via git
2. **Personal agents** (`~/.claude/agents/`) — Individual preferences
3. Document agent purposes in README
4. Review agent changes in PRs like code

---

## Quick Reference

### Commands

| Command | Purpose |
|---------|---------|
| `/agents` | Manage custom agents (create, edit, delete) |
| `/agents list` | Show all available agents |

### Agent Invocation

```
# Automatic (based on description match)
"Review this code for security issues"

# Explicit
"Use the security-reviewer agent to analyze auth.py"
"Have the test-runner agent execute the test suite"
```

### File Locations

| Location | Scope |
|----------|-------|
| `.claude/agents/` | Project-specific (checked into git) |
| `~/.claude/agents/` | Global (available everywhere) |

### Minimal Agent Template

```yaml
---
name: my-agent
description: Use when [specific trigger condition]
tools: Read, Grep, Glob
---

You are a [role]. Your job is to [task].

Process:
1. [Step]
2. [Step]

Output: [Format]
```

### Worktree Quick Reference

```bash
# Create worktree
git worktree add ../feature-x -b feature/x

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../feature-x

# Launch Claude in worktree
cd ../feature-x && claude
```

### Decision Tree: When to Use What

```
Need isolated context for analysis?
├── Yes → Use subagent
│   └── Read-only? → Explore subagent or custom with Read tools
│   └── Needs writes? → Custom agent (but verify file persistence)
│
├── Need parallel development?
│   └── Yes → Git worktrees + separate Claude sessions
│
├── Planning complex task?
│   └── Yes → Plan mode (auto-uses Plan subagent)
│
└── Simple task?
    └── Main agent handles directly
```

---

## Sources

### Official Documentation
- [Claude Code - Subagents](https://docs.claude.com/en/docs/claude-code/sub-agents)
- [Claude Code - Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Anthropic - Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Anthropic - Building Agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

### Community Guides
- [ClaudeLog - Custom Agents](https://claudelog.com/mechanics/custom-agents/)
- [ClaudeLog - Sub-agents](https://claudelog.com/mechanics/sub-agents/)
- [PubNub - Best Practices for Claude Code Subagents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Simon Willison - Embracing the Parallel Coding Agent Lifestyle](https://simonwillison.net/2025/Oct/5/parallel-coding-agents/)
- [Steve Kinney - Git Worktrees for Parallel AI Development](https://stevekinney.com/courses/ai-development/git-worktrees)
- [Agent Interviews - Parallel AI Coding with Git Worktrees](https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/)
- [Aleksei Galanov - Efficient Claude Code: Context Parallelism & Sub-Agents](https://www.agalanov.com/notes/efficient-claude-code-context-parallelism-sub-agents/)
- [Medium - How Sub-Agents Work in Claude Code](https://medium.com/@kinjal01radadiya/how-sub-agents-work-in-claude-code-a-complete-guide-bafc66bbaf70)
- [DEV.to - Multi-Agent Orchestration](https://dev.to/bredmond1019/multi-agent-orchestration-running-10-claude-instances-in-parallel-part-3-29da)

### Agent Collections
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) — 100+ production-ready agents
- [wshobson/agents](https://github.com/wshobson/agents) — 91 agents with plugin system
- [iannuttall/claude-agents](https://github.com/iannuttall/claude-agents) — Custom subagent collection
- [vanzan01/claude-code-sub-agent-collective](https://github.com/vanzan01/claude-code-sub-agent-collective) — Hub-and-spoke architecture

### GitHub Issues (Known Problems)
- [#4706 - Subagents not recognized after update](https://github.com/anthropics/claude-code/issues/4706)
- [#4462 - Subagent file writes don't persist](https://github.com/anthropics/claude-code/issues/4462)
- [#11712 - Subagent resume missing context](https://github.com/anthropics/claude-code/issues/11712)
- [#2073 - Erratic subagent behavior in plan mode](https://github.com/anthropics/claude-code/issues/2073)
- [#4182 - Nested subagents not supported](https://github.com/anthropics/claude-code/issues/4182)
- [#4908 - Feature request: scoped context passing](https://github.com/anthropics/claude-code/issues/4908)

### Tools
- [Conductor](https://conductor.build) — macOS app for multi-agent orchestration with worktrees
- [Verdent AI](https://verdent.ai) — Isolated Git worktree management for parallel agents

---

## Changelog

### v1.0 (December 11, 2025)
- Initial release
- Built-in subagents (Explore, Plan)
- Custom agent creation and configuration
- Parallel development with worktrees
- Pipeline patterns (PM → Architect → Implementer)
- Known issues with mitigations
- Best practices and quick reference
