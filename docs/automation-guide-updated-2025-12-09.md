# Automation & CI/CD Guide

> **Last Updated:** December 9, 2025  
> **Claude Code Version:** v2.0+  
> **Action Version:** v1.0 (GA)  
> **Purpose:** GitHub Actions, headless mode, Claude Agent SDK integration

---

## What's New Since December 4, 2025

| Feature | Status | Details |
|---------|--------|---------|
| GitHub Action v1.0 GA | ✅ Released | Breaking changes from beta, unified configuration |
| `/security-review` command | ✅ Available | Automated vulnerability scanning (August 2025) |
| Microsoft Foundry support | ✅ New | Fourth cloud provider option |
| Structured outputs | ✅ New | JSON results as GitHub Action outputs |
| Progress tracking | ✅ New | Visual checkboxes that update dynamically |
| Claude Opus 4.5 | ✅ Available | Best for complex CI/CD tasks, architecture |
| Advanced Tool Use | ✅ Beta | Tool Search, Programmatic Calling, Examples |
| Client-side compaction | ✅ New | SDK auto-manages context in long agents |
| canUseTool callback | ✅ New | SDK tool confirmation automation |
| Parallel agent patterns | 🔥 Emerging | Git worktrees, Task tool, Verdent AI |

### Model Selection for Automation

| Model | Best For | Cost |
|-------|----------|------|
| Claude Haiku 4.5 | High-volume labeling, simple transformations | Lowest |
| Claude Sonnet 4.5 | 80% of CI/CD tasks, code review, default choice | Medium |
| Claude Opus 4.5 | Complex architecture, multi-hour tasks, when others fail | Highest |

**Tip:** Use `--model claude-opus-4-5-20251101` in `claude_args` for complex tasks:

```yaml
claude_args: |
  --model claude-opus-4-5-20251101
  --max-turns 20
```

---

## Table of Contents

1. [Headless Mode](#headless-mode)
2. [GitHub Actions Integration](#github-actions-integration)
3. [Automated Security Reviews](#automated-security-reviews)
4. [Claude Agent SDK](#claude-agent-sdk)
5. [Advanced Tool Use (API)](#advanced-tool-use-api)
6. [Parallel Agent Patterns](#parallel-agent-patterns)
7. [CI/CD Workflow Patterns](#cicd-workflow-patterns)
8. [Self-Improving CI/CD](#self-improving-cicd)
9. [Security Considerations](#security-considerations)
10. [Monitoring & Observability](#monitoring--observability)
11. [Troubleshooting](#troubleshooting)
12. [References](#references)

---

## Headless Mode

Run Claude Code non-interactively for automation, CI/CD pipelines, and scripting.

### Basic Usage

```bash
# Basic headless execution
claude -p "your prompt here" --output-format stream-json

# With tool restrictions and permission mode
claude -p "Stage my changes and write commits" \
  --allowedTools "Bash,Read" \
  --permission-mode acceptEdits

# With custom system prompt
claude -p "Review security" \
  --append-system-prompt "Focus only on OWASP Top 10"
```

### Key Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `-p "prompt"` | Run in headless mode with prompt | `-p "Fix linting errors"` |
| `--output-format` | Output format: `json`, `stream-json`, `text` | `--output-format json` |
| `--allowedTools` | Restrict available tools | `--allowedTools "Read,Write,Bash"` |
| `--denyTools` | Block specific tools | `--denyTools "Bash(rm:*)"` |
| `--permission-mode` | Permission handling | `acceptEdits`, `manual`, `acceptAll` |
| `--max-turns` | Limit conversation turns | `--max-turns 10` |
| `--timeout-minutes` | Set execution timeout | `--timeout-minutes 30` |
| `--append-system-prompt` | Add custom instructions | `--append-system-prompt "Be concise"` |
| `--mcp-config` | MCP server configuration | `--mcp-config monitoring.json` |
| `--verbose` | Debug output (disable in production) | `--verbose` |

### Multi-Turn Conversations

```bash
# Continue the most recent conversation
claude --continue "Now refactor this for better performance"

# Resume a specific session by ID
claude --resume 550e8400-e29b-41d4-a716-446655440000 "Update the tests"

# Resume in non-interactive mode
claude --continue -p "Add error handling" --output-format stream-json
```

### Extended Thinking in Automation

Thinking keywords work in headless mode to allocate thinking budget:

| Keyword | Token Budget | Use Case |
|---------|--------------|----------|
| "think" | ~4,000 | Routine tasks, simple fixes |
| "think hard" / "megathink" | ~10,000 | API design, architecture decisions |
| "think harder" / "ultrathink" | ~31,999 | Complex refactors, novel problems |

```bash
# Basic thinking in automation
claude -p "think about this refactoring plan, then implement it" \
  --output-format json

# Maximum thinking for complex tasks
claude -p "ultrathink: Design a scalable authentication system" \
  --allowedTools Read Write \
  --max-turns 15
```

**Note:** These keywords are Claude Code-specific features (not general Claude API). In interactive mode, use Tab to toggle thinking on/off.

### Streaming JSON Input/Output

```bash
# Stream JSON input for complex automation
echo '{"type":"user","message":{"role":"user","content":[{"type":"text","text":"Explain this code"}]}}' | \
  claude -p --output-format=stream-json --input-format=stream-json --verbose
```

### Batch Processing Examples

```bash
#!/bin/bash
# Batch file review
for file in src/*.py; do
  claude -p "Review $file for security issues. Output JSON with findings." \
    --output-format stream-json \
    --allowedTools Read \
    >> reviews.jsonl
done
```

```bash
#!/bin/bash
# Parallel migration with fan-out
# Generate task list
claude -p "List all React components that need migration" \
  --output-format stream-json > tasks.json

# Fan out with parallel execution
jq -r '.[]' tasks.json | xargs -P 10 -I {} \
  claude -p "Migrate {} from React class to hooks. Return OK or FAIL." \
    --allowedTools Edit \
    --max-turns 5
```

### Pipeline Integration

```bash
# Pipe data for analysis
cat build-error.txt | claude -p 'Concisely explain the root cause of this build error' > output.txt

# Chain with other tools
git diff | claude -p "Review these changes for bugs" --output-format json | jq '.issues'

# Process error logs
cat error.log | claude -p "Categorize and summarize these errors" --output-format json
```

---

## GitHub Actions Integration

### Action v1.0 GA (August 2025)

The official `anthropics/claude-code-action@v1` is now Generally Available with significant improvements:

**Key Features:**
- 🎯 **Intelligent Mode Detection**: Automatically selects execution mode based on context
- 📊 **Structured Outputs**: JSON results become GitHub Action outputs
- 📋 **Progress Tracking**: Visual checkboxes that update dynamically
- ⚙️ **Unified Configuration**: Single `prompt` and `claude_args` inputs
- 🏃 **Runs on Your Infrastructure**: Executes on your GitHub runner

**Supported Providers:**
- Anthropic Direct API (default)
- Amazon Bedrock (OIDC authentication)
- Google Vertex AI (OIDC authentication)
- Microsoft Foundry (new in late 2025)

### Quick Setup

The easiest setup is through Claude Code terminal:

```bash
# In Claude Code terminal
/install-github-app

# Follow prompts to authorize and configure
```

### Basic Workflow

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # Optional: Claude responds to @claude mentions by default
```

### Migration from Beta to v1.0

**Breaking Changes:**

| Old (Beta) | New (v1.0) |
|------------|------------|
| `mode: "tag"` | Automatic detection |
| `direct_prompt` | `prompt` |
| `override_prompt` | `prompt` |
| `custom_instructions` | `claude_args: "--system-prompt ..."` |
| `max_turns: "10"` | `claude_args: "--max-turns 10"` |
| `model: "..."` | `claude_args: "--model ..."` |

**Before (Beta):**
```yaml
- uses: anthropics/claude-code-action@beta
  with:
    mode: "tag"
    direct_prompt: "Review this PR for security issues"
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    custom_instructions: "Follow our coding standards"
    max_turns: "10"
    model: "claude-sonnet-4-5-20250929"
```

**After (v1.0 GA):**
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    prompt: "Review this PR for security issues"
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    claude_args: |
      --system-prompt "Follow our coding standards"
      --max-turns 10
      --model claude-sonnet-4-5-20250929
```

### Input Parameters

| Input | Required | Description |
|-------|----------|-------------|
| `anthropic_api_key` | Yes* | API key for Anthropic direct API |
| `prompt` | No | Instructions for Claude (optional for @claude mentions) |
| `claude_args` | No | Any Claude Code CLI arguments |

*Required for Anthropic API; not needed for Bedrock/Vertex with OIDC.

### Common `claude_args` Options

```yaml
claude_args: |
  --max-turns 5                           # Limit conversation turns
  --model claude-sonnet-4-5-20250929      # Specify model
  --model claude-opus-4-5-20251101        # Use Opus for complex tasks
  --system-prompt "Your instructions"     # Custom system prompt
  --mcp-config /path/to/config.json       # MCP server configuration
  --timeout-minutes 30                    # Execution timeout
```

### Slash Commands

Built-in slash commands for common tasks:

```yaml
# Code review
prompt: "/review"

# Security-focused review
prompt: "/security-review"

# Fix issues
prompt: "/fix"
```

### Cloud Provider Setup

#### Amazon Bedrock

```yaml
jobs:
  claude:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for OIDC
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-west-2
      
      - uses: anthropics/claude-code-action@v1
        with:
          use_bedrock: "true"
          prompt: "Review this PR"
          claude_args: "--model anthropic.claude-3-7-sonnet-20250219-v1:0"
```

#### Google Vertex AI

```yaml
jobs:
  claude:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for OIDC
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}
      
      - uses: anthropics/claude-code-action@v1
        with:
          use_vertex: "true"
          prompt: "Review this PR"
```

### Trigger Patterns

```yaml
# @claude mentions in comments
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

# Automatic PR review
on:
  pull_request:
    types: [opened, synchronize]

# Scheduled tasks
on:
  schedule:
    - cron: "0 9 * * *"  # Daily at 9 AM

# Issue assignment to Claude
on:
  issues:
    types: [assigned]
```

---

## Automated Security Reviews

Released August 6, 2025, these features integrate security analysis directly into development workflows.

### `/security-review` Command

Run ad-hoc security analysis from your terminal:

```bash
# In any project directory
/security-review
```

**What it checks:**
- SQL injection risks
- Cross-site scripting (XSS) vulnerabilities
- Authentication and authorization flaws
- Insecure data handling
- Dependency vulnerabilities
- SSRF (Server-Side Request Forgery)
- DNS rebinding vulnerabilities
- Remote code execution patterns

### Customizing Security Review

Copy and customize the command:

```bash
# Copy default command
cp /path/to/security-review.md .claude/commands/

# Edit to add organization-specific rules
```

Example customization in `.claude/commands/security-review.md`:

```markdown
Review the codebase for security vulnerabilities.

## Additional Checks
- Verify all API endpoints require authentication
- Check for hardcoded secrets in configuration
- Validate input sanitization on all user inputs
- Review database query construction for injection risks

## False Positive Filters
- Ignore test files in `__tests__/` directory
- Skip mock data in `fixtures/` directory

$ARGUMENTS
```

### GitHub Action for Security Reviews

```yaml
# .github/workflows/security-review.yml
name: Security Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/security-review"
          claude_args: "--max-turns 10"
```

### Dedicated Security Review Action

For more comprehensive security scanning:

```yaml
# .github/workflows/security-scan.yml
name: Claude Security Scan

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: anthropics/claude-code-security-review@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # Uses Claude Opus 4.1 by default
```

**Features:**
- AI-powered semantic analysis (not just pattern matching)
- Diff-aware scanning (only analyzes changed files in PRs)
- Contextual understanding across files
- Advanced false positive filtering
- Inline PR comments with remediation guidance

---

## Claude Agent SDK

The Claude Code SDK was **renamed to Claude Agent SDK** in late 2025 to reflect its broader capabilities beyond coding.

### Key Changes from Claude Code SDK

| Aspect | Claude Code SDK (Old) | Claude Agent SDK (New) |
|--------|----------------------|------------------------|
| Default system prompt | Included | **None** - must provide explicitly |
| Local config loading | Automatic | **Manual opt-in** required |
| Configuration | Implicit | **Explicit** configuration |
| Use case | Coding-focused | General-purpose agents |

### Installation

```bash
# TypeScript/JavaScript
npm install @anthropic-ai/claude-agent-sdk

# Python
pip install claude-agent-sdk
```

### Basic Agent (TypeScript)

```typescript
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  systemPrompt: `You are a code review agent.
    Review code for security issues.
    Always explain your findings.`,
  tools: ['Read', 'Write', 'Bash'],
});

const result = await agent.run({
  prompt: "Review src/auth.py for security issues",
});

console.log(result);
```

### Python Agent Example

```python
from claude_agent_sdk import Agent, ClaudeCodeOptions

# Configure options
options = ClaudeCodeOptions(
    system_prompt="You are a Python code reviewer focused on security",
    cwd="/path/to/project",
    allowed_tools=["Read", "Grep"],
    permission_mode="manual",
    max_turns=5
)

# Run agent
async for msg in query("Review main.py for security issues", options=options):
    for block in msg.content:
        if block.type == "text":
            print(block.text)
```

### Subagent Pattern

Define specialized agents in `.claude/agents/`:

```yaml
# .claude/agents/sql-expert.md
---
name: sql-expert
description: Analyzes and optimizes SQL queries
allowed_tools: ["Read", "Grep"]
model: claude-sonnet-4-5-20250929
---

You are an SQL optimization expert.
Focus on query performance and security.
Never suggest changes that could cause data loss.
```

The main agent automatically delegates SQL-related tasks to this subagent.

### Hook Integration

```typescript
import { PreToolUseHook } from '@anthropic-ai/claude-agent-sdk';

// Safety hook to block dangerous commands
async function bashSafetyHook(event) {
  if (event.arguments?.command?.includes("rm -rf")) {
    return { error: "Dangerous command blocked" };
  }
  return null;
}

const agent = new Agent({
  systemPrompt: "...",
  tools: ['Read', 'Write', 'Bash'],
  hooks: [PreToolUseHook(bashSafetyHook, { toolName: "Bash" })]
});
```

### Executor-Evaluator Pattern

```typescript
const executor = new Agent({
  tools: ['Read', 'Write'],
  systemPrompt: "Implement the feature as specified.",
});

const evaluator = new Agent({
  tools: ['Read'],
  systemPrompt: "Review the implementation for issues. Be strict.",
});

// Run executor
const implementation = await executor.run({ prompt: task });

// Review with evaluator
const review = await evaluator.run({
  prompt: `Review this implementation: ${implementation.result}`,
});

// Iterate if needed
if (review.hasIssues) {
  await executor.run({ prompt: `Fix these issues: ${review.issues}` });
}
```

### Verification Pattern

```typescript
const agent = new Agent({
  tools: ['Read', 'Write', 'Bash'],
  systemPrompt: `After making changes:
    1. Run linters
    2. Run tests
    3. If any fail, fix and retry
    4. Only report success after ALL verification passes`,
});
```

### Tool Confirmation Callback (New)

Use `canUseTool` for automated permission decisions:

```typescript
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  systemPrompt: "...",
  tools: ['Read', 'Write', 'Bash'],
  canUseTool: async (toolName, args) => {
    // Auto-approve read operations
    if (toolName === 'Read') return true;
    
    // Block dangerous commands
    if (toolName === 'Bash' && args.command?.includes('rm -rf')) {
      return { error: "Destructive command blocked" };
    }
    
    // Require approval for writes
    if (toolName === 'Write') {
      console.log(`Approve write to ${args.path}? [y/n]`);
      // ... approval logic
    }
    
    return true;
  }
});
```

### Client-Side Compaction (New)

Automatically manage context in long-running agents:

```typescript
import { Agent } from '@anthropic-ai/claude-agent-sdk';

const agent = new Agent({
  systemPrompt: "Long-running analysis agent",
  tools: ['Read', 'Bash'],
  // Enable automatic context summarization
  compaction: {
    enabled: true,
    threshold: 100000,  // Compact when context exceeds 100k tokens
  }
});

// Agent automatically summarizes earlier conversation when limit approached
```

```python
# Python SDK with compaction
from claude_agent_sdk import Agent, ClaudeCodeOptions

options = ClaudeCodeOptions(
    system_prompt="Long-running agent",
    compaction={"enabled": True, "threshold": 100000}
)
```

---

## Advanced Tool Use (API)

For building sophisticated automation pipelines, leverage the new Advanced Tool Use features (November 2025):

### Tool Search Tool

Enable dynamic tool discovery from large catalogs:

```python
import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    betas=["advanced-tool-use-2025-11-20"],
    model="claude-sonnet-4-5-20250929",
    max_tokens=4096,
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        # Your tools with defer_loading=True for on-demand loading
        {
            "name": "database_query",
            "description": "Execute database queries",
            "defer_loading": True,  # Don't load until needed
            # ... tool definition
        }
    ],
    messages=[{"role": "user", "content": "Analyze database performance"}]
)
```

**Benefits:**
- **85% context savings** on tool-heavy workflows
- Scales to hundreds or thousands of tools
- Claude discovers relevant tools on-demand

### Programmatic Tool Calling

Execute tools within code execution for reduced latency:

```python
response = client.beta.messages.create(
    betas=["advanced-tool-use-2025-11-20"],
    model="claude-sonnet-4-5-20250929",
    max_tokens=4096,
    tools=[
        {
            "type": "code_execution_20250825",
            "name": "code_execution"
        },
        {
            "name": "file_read",
            "allowed_callers": ["code_execution"],  # Can be called from code
            # ... tool definition
        }
    ],
    messages=[{"role": "user", "content": "Analyze all Python files"}]
)
```

**Benefits:**
- **98.7% token reduction** on multi-tool workflows
- Loop through files without back-and-forth API calls
- Complex data transformations in single execution

### Tool Use Examples

Improve tool invocation accuracy with examples:

```python
tools = [
    {
        "name": "search_documents",
        "description": "Search company documents",
        "input_schema": {...},
        "input_examples": [
            {
                "description": "Search for Q3 reports",
                "input": {"query": "Q3 2025 financial report", "limit": 10}
            },
            {
                "description": "Find documents by author",
                "input": {"query": "author:jane.doe", "limit": 5}
            }
        ]
    }
]
```

**Benefits:**
- **72% → 90% accuracy** on ambiguous tool invocations
- Claude learns correct parameter patterns
- Reduces failed tool calls in automation

---

## Parallel Agent Patterns

Community-driven patterns for running multiple Claude instances simultaneously.

### Built-in Task Tool (Subagents)

Claude Code includes native parallel execution via the Task tool:

```markdown
# CLAUDE.md instruction for parallel tasks
## Parallel Processing

For large tasks, use the Task tool to delegate to subagents:
- Launch parallel Tasks immediately for feature implementations
- Each Task agent has its own context window (prevents pollution)
- Parallelism capped at 10 concurrent tasks
- Balance token costs vs performance gains

### 7-Parallel-Task Method
1. **Routing:** Route requests to appropriate directories
2. **Frontend:** UI components and styling
3. **Backend:** API logic and business rules  
4. **Validation:** Type definitions and form schemas
5. **Infrastructure:** Database and config files
6. **Utilities:** Shared utilities and helpers
7. **Remaining:** package.json, docs, configuration
```

**Example prompt for parallel execution:**

```
Explore the codebase using 4 tasks in parallel. 
Each agent should explore different directories:
- Task 1: src/frontend
- Task 2: src/backend  
- Task 3: src/utils
- Task 4: tests/
```

**Key insights:**
- Subagents run in batches (waits for batch completion before next batch)
- Each subagent has independent context window
- Use for read-heavy operations (search, analysis, file exploration)
- Write operations should be serialized to avoid conflicts

### Git Worktrees for Isolation

```bash
# Create worktrees for parallel agents
git worktree add ../agent-frontend feature/frontend
git worktree add ../agent-backend feature/backend
git worktree add ../agent-tests feature/tests

# Run agents in parallel
cd ../agent-frontend && claude -p "Implement React components" &
cd ../agent-backend && claude -p "Implement API endpoints" &
cd ../agent-tests && claude -p "Write integration tests" &

wait  # Wait for all agents to complete

# Merge results
git checkout main
git merge feature/frontend
git merge feature/backend
git merge feature/tests
```

### Orchestrator-Worker Pattern

```bash
#!/bin/bash
# orchestrate.sh

# Orchestrator generates plan
claude -p "Create a task list for implementing user authentication. 
Output JSON array of tasks." --output-format json > tasks.json

# Workers execute in parallel
for task in $(jq -r '.[]' tasks.json); do
  (
    worktree="work-$(echo $task | md5sum | cut -c1-8)"
    git worktree add "../$worktree" -b "task-$worktree"
    cd "../$worktree"
    claude -p "$task" --allowedTools Edit Bash --max-turns 10
    git add -A && git commit -m "Complete: $task"
  ) &
done

wait
echo "All tasks complete. Review and merge branches."
```

### Specialized Agent Roles

Define agents with specific responsibilities:

**Agent 1 - Architect:**
```markdown
<!-- .claude/agents/architect.md -->
---
name: architect
description: Research, planning, design documents
allowed_tools: ["Read", "Grep", "Write"]
---

You are the system architect.
- Analyze requirements and create design documents
- Define API contracts and data schemas
- Create implementation plans for builders
- Never write implementation code yourself
```

**Agent 2 - Builder:**
```markdown
<!-- .claude/agents/builder.md -->
---
name: builder  
description: Implements code based on architect plans
allowed_tools: ["Read", "Write", "Bash"]
---

You are the implementation specialist.
- Follow architect's design documents exactly
- Write clean, tested code
- Create unit tests for all new code
- Run tests after implementation
```

**Agent 3 - Reviewer:**
```markdown
<!-- .claude/agents/reviewer.md -->
---
name: reviewer
description: Code review and quality assurance
allowed_tools: ["Read", "Grep"]
---

You are the code reviewer.
- Review all changes for bugs and security issues
- Enforce coding standards
- Verify tests are comprehensive
- Block merges until issues are resolved
```

### Parallel Execution Tools

Several community tools support parallel agent workflows:

| Tool | Description |
|------|-------------|
| [Verdent AI](https://www.verdent.app/) | All-in-one platform with isolated git worktrees, visual orchestration |
| [Conductor](https://conductor.build) | macOS app for visual multi-agent orchestration |
| [Claude Squad](https://github.com/smol-ai/claude-squad) | Terminal-based parallel agent manager |
| [Claude Flow](https://github.com/ruvnet/claude-flow) | Agent orchestration with swarm patterns |
| [Container-Use MCP](https://github.com/anthropics/container-use) | Docker-based agent isolation |

**Verdent AI Features:**
- Isolated branches via git worktree (no merge conflicts)
- DiffLens for code change visibility
- Built-in Researcher and Verifier subagents
- VS Code extension
- Planning mode with visual logic diagrams
- Credit-based system (like flow credits)

### Best Practices for Parallel Agents

1. **Use Git worktrees** for file isolation
2. **Define clear interfaces** between agents before starting
3. **Limit max turns** to prevent runaway costs
4. **Review before merging** - always human-in-the-loop
5. **Reset context every ~20 iterations** - performance degrades beyond this
6. **Use shared memory files** for cross-agent knowledge

---

## CI/CD Workflow Patterns

### Pattern 1: Issue Labeling

```yaml
# .github/workflows/label-issues.yml
name: Auto-Label Issues

on:
  issues:
    types: [opened]

jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Analyze this issue and suggest appropriate labels.
            
            Title: ${{ github.event.issue.title }}
            Body: ${{ github.event.issue.body }}
            
            Available labels: bug, feature, docs, security, performance, question
            
            Output: JSON array of label names
          claude_args: "--output-format json --max-turns 3"
```

### Pattern 2: Automated Code Review

```yaml
# .github/workflows/code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Review this PR for:
            - Security vulnerabilities
            - Performance issues
            - Code quality and maintainability
            - Missing tests
            - Documentation gaps
            
            Format findings as:
            [SEVERITY: HIGH/MEDIUM/LOW] Description
          claude_args: "--max-turns 5"
```

### Pattern 3: Auto-Fix Failing Tests

```yaml
# .github/workflows/auto-fix.yml
name: Auto-Fix Tests

on:
  push:
    branches: [main]

jobs:
  test-and-fix:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Tests
        id: tests
        continue-on-error: true
        run: npm test 2>&1 | tee test-output.txt
      
      - name: Fix Failures
        if: steps.tests.outcome == 'failure'
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            These tests are failing:
            $(cat test-output.txt)
            
            Fix the issues, run tests to verify, and commit.
          claude_args: "--allowedTools Edit Bash --max-turns 10"
      
      - name: Create PR
        if: steps.tests.outcome == 'failure'
        run: |
          git checkout -b fix/auto-fix-${{ github.sha }}
          git add -A
          git commit -m "fix: auto-fix failing tests"
          git push origin HEAD
          gh pr create --title "Auto-fix: Failing tests" \
            --body "Automated fix from CI"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Pattern 4: Daily Maintenance

```yaml
# .github/workflows/daily-maintenance.yml
name: Daily Maintenance

on:
  schedule:
    - cron: "0 9 * * *"  # 9 AM UTC daily

jobs:
  maintain:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Perform daily maintenance:
            1. Check for outdated dependencies
            2. Review TODOs and FIXMEs
            3. Update documentation if needed
            4. Generate summary report
          claude_args: |
            --model claude-opus-4-5-20251101
            --max-turns 15
```

### Pattern 5: Framework Migration

```yaml
# .github/workflows/migrate.yml
name: Framework Migration

on:
  workflow_dispatch:
    inputs:
      from:
        description: 'Source framework'
        required: true
      to:
        description: 'Target framework'
        required: true

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate Migration Plan
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Create a migration plan from ${{ inputs.from }} to ${{ inputs.to }}.
            Analyze the codebase and output JSON list of files to migrate.
          claude_args: "--output-format json"
      
      - name: Execute Migration
        run: |
          for file in $(jq -r '.[]' plan.json); do
            claude -p "Migrate $file from ${{ inputs.from }} to ${{ inputs.to }}. Return OK or FAIL." \
              --allowedTools Edit Bash \
              --max-turns 5
          done
```

---

## Self-Improving CI/CD

Feed CI logs back into your system to continuously improve agent behavior.

### Weekly Learning Workflow

```yaml
# .github/workflows/self-improve.yml
name: Self-Improve

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  improve:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Collect Agent Logs
        run: |
          # Get logs from past week
          gh run list --json conclusion,headBranch,createdAt,databaseId \
            --jq '[.[] | select(.createdAt > (now - 604800 | todate))]' > runs.json
          
          # Download logs
          for id in $(jq -r '.[].databaseId' runs.json); do
            gh run view $id --log >> all-logs.txt 2>/dev/null || true
          done
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Analyze and Improve
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Analyze these CI logs for patterns:
            $(tail -10000 all-logs.txt)
            
            Identify:
            1. Common failures and their root causes
            2. Slow steps that could be optimized
            3. Agent mistakes and anti-patterns
            4. Missing rules that could prevent issues
            
            Output CLAUDE.md additions to prevent future issues.
          claude_args: "--allowedTools Read Write --max-turns 10"
      
      - name: Create Improvement PR
        run: |
          if git diff --quiet CLAUDE.md; then
            echo "No changes to CLAUDE.md"
            exit 0
          fi
          git checkout -b improve/ci-learnings-$(date +%Y%m%d)
          git add CLAUDE.md
          git commit -m "chore: CI learnings from past week"
          git push origin HEAD
          gh pr create --title "CI Improvement: Weekly learnings" \
            --body "Automated improvements based on CI log analysis"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Reflection Prompt Pattern

Add to your CLAUDE.md:

```markdown
## Error Handling

When you make a mistake:
1. Stop and analyze the root cause
2. Propose a CLAUDE.md rule to prevent recurrence
3. Add the rule before continuing

When I point out an error:
- Acknowledge the issue
- Analyze what went wrong
- Suggest a specific prevention rule
```

---

## Security Considerations

### API Key Management

```yaml
# Always use GitHub Secrets
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

# For cloud providers, use OIDC (no stored credentials)
permissions:
  id-token: write  # Required for OIDC
```

### Least Privilege Permissions

```yaml
# Start with minimal permissions
permissions:
  contents: read        # Read code
  pull-requests: write  # Post comments

# Only add write permissions when needed
permissions:
  contents: write       # Push commits (if needed)
```

### Tool Restrictions

```bash
# Restrict tools in CI
claude -p "..." \
  --allowedTools Read Write \
  --denyTools "Bash(rm:*)" "Bash(sudo:*)" "Bash(curl:*)"
```

### Sandboxing in CI

```yaml
# Run in isolated container
jobs:
  agent:
    runs-on: ubuntu-latest
    container:
      image: node:20-alpine
      options: --read-only --tmpfs /tmp
```

### Branch Protection

Always require:
- Human approval before merge
- Status checks to pass
- Code owner review for sensitive files

### Commit Signing

```yaml
# Sign commits made by Claude
- name: Configure Git
  run: |
    git config --global user.email "claude-bot@example.com"
    git config --global user.name "Claude Bot"
    git config --global commit.gpgsign true
```

---

## Monitoring & Observability

### Log Agent Activity

```yaml
- name: Run Agent
  run: |
    claude -p "..." \
      --output-format stream-json 2>&1 | \
      tee agent-log.jsonl
      
- name: Upload Logs
  uses: actions/upload-artifact@v4
  with:
    name: agent-logs-${{ github.run_id }}
    path: agent-log.jsonl
    retention-days: 30
```

### Track Metrics

| Metric | Purpose | How to Track |
|--------|---------|--------------|
| Token usage | Cost control | Parse `--output-format json` |
| Success/failure rate | Quality | GitHub Actions status |
| Time per task | Performance | Workflow duration |
| Retry count | Reliability | Log analysis |
| Tool usage | Optimization | Agent logs |

### Cost Monitoring Workflow

```yaml
# .github/workflows/cost-report.yml
name: Claude Cost Report

on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly Monday 9am

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - name: Collect Usage Data
        run: |
          # Aggregate token usage from logs
          # Send to monitoring system
          echo "Weekly cost report"
```

### Custom Slash Command for Efficiency

```markdown
<!-- .claude/commands/efficient.md -->
Complete this task using MINIMAL tokens:
1. Read only essential files
2. Make batched changes
3. Skip unnecessary explanations
4. Output concise results

$ARGUMENTS
```

---

## Troubleshooting

### Common Issues

**Issue: Action not triggering on @claude mention**

```yaml
# Ensure correct workflow triggers
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

# Check permissions
permissions:
  issues: write
  pull-requests: write
```

**Issue: "Permission denied" posting comments**

```yaml
# Add required permissions
permissions:
  pull-requests: write
  issues: write
```

**Issue: API key not found**

1. Verify secret name matches: `ANTHROPIC_API_KEY`
2. Check secret is set at correct scope (repo or org)
3. Ensure workflow has access to secrets

**Issue: Headless mode prompts for login**

```yaml
# Ensure API key is set
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

# Or use SDK for pure automation
```

**Issue: Agent runs too long**

```yaml
# Set limits
claude_args: |
  --max-turns 10
  --timeout-minutes 15
```

**Issue: File conflicts in parallel agents**

- Use Git worktrees for isolation
- Define clear interfaces before starting
- Have orchestrator verify before merge

### Debugging

```bash
# Enable verbose output
claude -p "..." --verbose

# Check Claude Code version
claude --version

# Run diagnostics
claude doctor
```

---

## References

### Official Anthropic

- [Claude Code GitHub Actions Docs](https://docs.claude.com/en/docs/claude-code/github-actions)
- [Headless Mode Reference](https://docs.claude.com/en/docs/claude-code/headless)
- [Claude Agent SDK Guide](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Automated Security Reviews](https://www.anthropic.com/news/automate-security-reviews-with-claude-code) (August 6, 2025)
- [Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use) (November 2025)
- [Subagents Documentation](https://code.claude.com/docs/en/sub-agents)

### GitHub Repositories

- [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) - Official GitHub Action
- [anthropics/claude-code-base-action](https://github.com/anthropics/claude-code-base-action) - Base action for custom workflows
- [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) - Security review action

### Community Resources

- [Simon Willison: Parallel Coding Agents](https://simonwillison.net/2025/Oct/5/parallel-coding-agents/)
- [Claude Code Subagent Patterns](https://zachwills.net/how-to-use-claude-code-subagents-to-parallelize-development/)
- [Multi-Agent Orchestration Guide](https://dev.to/bredmond1019/multi-agent-orchestration-running-10-claude-instances-in-parallel-part-3-29da)
- [AI Native Dev: Parallelizing Agents](https://ainativedev.io/news/how-to-parallelize-ai-coding-agents)
- [Git Worktrees + Claude Code Guide](https://www.blockhead.consulting/blog/Git_Worktrees_for_AI_Agents)
- [How Incident.io Uses Git Worktrees](https://incident.io/blog/shipping-faster-with-claude-code-and-git-worktrees)
- [Task Tool Deep Dive](https://claudelog.com/mechanics/task-agent-tools/)

### Third-Party Tools

- [Verdent AI](https://www.verdent.app/) - Parallel agent orchestration with git worktrees
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) - 100+ production-ready subagents

### Security Resources

- [StepSecurity: Securing Claude Code in GitHub Actions](https://www.stepsecurity.io/blog/anthropics-claude-code-action-security-how-to-secure-claude-code-in-github-actions-with-harden-runner)
- [Security Guide (this ecosystem)](./security-guide-updated-2025-12-09.md)

---

## Changelog

### December 9, 2025 (Updated)

- Added **Advanced Tool Use** section (Tool Search, Programmatic Calling, Examples)
- Added **Extended Thinking in Automation** with keyword reference
- Added **Task Tool (Subagents)** section for native parallel execution
- Added **canUseTool callback** for SDK tool confirmation
- Added **Client-side compaction** for long-running agents
- Added **Claude Opus 4.5** model recommendations
- Added **Verdent AI** to parallel execution tools
- Added **7-Parallel-Task Method** pattern
- Updated references with git worktrees guides and third-party tools
- Added GitHub Action v1.0 GA migration guide
- Added `/security-review` command documentation
- Added Microsoft Foundry as fourth cloud provider
- Added structured outputs and progress tracking
- Expanded parallel agent patterns
- Added Claude Agent SDK rename and migration notes
- Added comprehensive CI/CD workflow patterns
- Added self-improving CI/CD workflow
- Updated security considerations
- Added troubleshooting section

### December 4, 2025

- Initial guide version

---

*This guide covers automation and CI/CD patterns. For security best practices, see [security-guide](./security-guide-updated-2025-12-09.md). For configuration, see [config-guide](./config-guide-updated.md).*
