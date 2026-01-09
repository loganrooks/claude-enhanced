# Self-Improvement Systems for Claude Code

> **Last Updated:** December 9, 2025  
> **Claude Code Version:** v2.0+  
> **Purpose:** Feedback loops that make the agent better over time

## Overview

Self-improvement systems transform every mistake into permanent learning. Rather than fixing issues once and moving on, these systems capture patterns and encode them into your development environment, creating compounding benefits over time.

**Core principle:** Every mistake should make the system smarter.

```
┌──────────────────────────────────────────────────────────────────┐
│                    The Self-Improvement Loop                     │
│                                                                  │
│   Agent Error ──▶ Session Log ──▶ Analysis ──▶ CLAUDE.md Update │
│        ▲                                              │          │
│        │                                              │          │
│        └──────────────── Better Agent ◀───────────────┘          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Session Log Analysis

### Log Location and Structure

Claude Code automatically saves session logs as JSONL files:

```
~/.claude/projects/{encoded-path}/{session-uuid}.jsonl
```

Each log entry contains:
- User prompts and responses
- Tool calls and results  
- Token usage statistics (input, output, cache)
- Timestamps and metadata
- Git branch information
- Session version

**JSONL Structure:**
```json
{
  "parentUuid": "string",
  "sessionId": "797df13f-41e5-4ccd-9f00-d6f6b9bee0b3",
  "version": "2.0.42",
  "gitBranch": "main",
  "cwd": "/Users/dev/project",
  "message": {
    "role": "user|assistant",
    "content": [...],
    "usage": {
      "input_tokens": 4,
      "cache_creation_input_tokens": 6462,
      "cache_read_input_tokens": 14187,
      "output_tokens": 1
    }
  },
  "uuid": "unique-id",
  "timestamp": "2025-12-09T10:43:45.885Z"
}
```

**Important:** By default, Claude Code deletes logs after 30 days. To preserve them longer, add to `~/.claude/settings.json`:

```json
{
  "log_retention_days": 100000
}
```

*(Source: Simon Willison, October 2025)*

### Manual Log Analysis

**Find common errors from last 7 days:**
```bash
find ~/.claude/projects -name "*.jsonl" -mtime -7 | \
  xargs grep -h "error\|failed\|exception" | \
  sort | uniq -c | sort -rn | head -20
```

**Count sycophantic responses:**
```bash
find ~/.claude/projects -name "*.jsonl" -mtime -7 | \
  xargs grep -c "You're absolutely right" | \
  awk -F: '{sum+=$2} END {print "Total:", sum}'
```

**Automated analysis with Claude:**
```bash
find ~/.claude/projects -name "*.jsonl" -mtime -7 | \
  xargs cat | \
  claude -p "
    Analyze these session logs. Identify:
    1. Common error patterns
    2. Tasks that took multiple attempts
    3. Misunderstandings about the codebase
    
    Output CLAUDE.md additions to prevent these issues.
  "
```

### DuckDB Analysis (Advanced)

For complex queries, use DuckDB to analyze JSONL directly:

```bash
# Analyze permission errors and error types
duckdb -c "
CREATE TABLE conversation AS 
SELECT * FROM read_json_auto('session.jsonl');

SELECT 
  json_extract_string(message, '$.role') as role,
  count(*) as count
FROM conversation
WHERE json_extract_string(message, '$.content') LIKE '%error%'
GROUP BY role
ORDER BY count DESC;
"
```

**Analyze tool usage patterns:**
```bash
duckdb -c "
CREATE TABLE logs AS SELECT * FROM read_json_auto('*.jsonl');

SELECT 
  json_extract_string(message, '$.content[0].name') as tool_name,
  count(*) as usage_count
FROM logs
WHERE json_extract_string(message, '$.content[0].type') = 'tool_use'
GROUP BY tool_name
ORDER BY usage_count DESC
LIMIT 20;
"
```

*(Source: Liam ERD - Analyzing Claude Code Interaction Logs with DuckDB, July 2025)*

### Session Log Viewer Tools

Multiple community tools convert raw JSONL into readable formats:

| Tool | Description | URL |
|------|-------------|-----|
| **claude-code-log** | Python CLI, HTML export, TUI browser | github.com/daaain/claude-code-log |
| **claude-code-viewer** | Full web UI, real-time monitoring | github.com/d-kimuson/claude-code-viewer |
| **clog** | Web viewer with real-time monitoring | github.com/HillviewCap/clog |
| **bricoleur** | HTML parser showing logs + git commits | bricoleur.org |
| **cc-sessions-cli** | Session analyzer and query subagents | github.com/erans/cc-sessions-cli |
| **claude-conversation-extractor** | Export to Markdown, search history | github.com/ZeroSumQuant/claude-conversation-extractor |
| **claude-code-history-viewer** | Tauri desktop app, activity heatmaps | github.com/jhlee0409/claude-code-history-viewer |

**Example: claude-code-log TUI:**
```bash
# Install and run
pip install claude-code-log
claude-code-log --tui
```

Features: Interactive session listing, summaries, timestamps, token usage, HTML export.

**Example: clog web viewer:**
- No installation required—just download HTML file
- Auto-detects new sessions via file watching
- Live updates as new log entries appear
- Visual indicators for monitoring state

---

## Part 2: Claude Diary - Memory Through Reflection

Claude Diary is a December 2025 plugin that creates diary entries from sessions and reflects on them to update CLAUDE.md automatically.

*(Source: Lance Martin, December 2025)*

### The Research Foundation

The approach is inspired by:
- **Generative Agents paper** (Park et al. 2023): Agents use reflection to synthesize past actions into general rules
- **Zhang et al. 2025**: "Grow and refine" agent instructions using generators, reflectors, and curators
- **Cat Wu (Anthropic)**: Some staff create diary entries from Claude Code sessions and reflect on them to identify patterns

### Installation

```bash
# Install the Claude Diary plugin
claude plugin add claude-diary
```

Or manually add the slash commands from the repository.

### The /diary Command

Creates structured diary entries from the current session:

```markdown
# Diary Entry - 2025-12-09

## Accomplishments
- Implemented authentication module
- Fixed race condition in user service

## Design Decisions
- Chose JWT over sessions for stateless auth
- Used Redis for token blacklist

## Challenges
- Initial approach with cookies failed due to CORS
- Had to refactor middleware twice

## User Preferences
- Prefers explicit error messages
- Wants tests before implementation

## PR Feedback
- Reviewer wanted smaller functions
- Need better error handling
```

Diary entries are saved to: `~/.claude/memory/diary/YYYY-MM-DD-N.md`

### The /reflect Command

Analyzes diary entries and generates CLAUDE.md updates:

```bash
# Run reflection on collected diary entries
/reflect
```

**What reflection does:**
1. Reads current CLAUDE.md
2. Checks for rule violations in diary entries
3. Strengthens weak rules that aren't being followed
4. Identifies recurring patterns across entries
5. Proposes new rules based on learnings

**Reflections saved to:** `~/.claude/memory/reflections/YYYY-MM-reflection-N.md`

### Hybrid Diary Creation

Use manual `/diary` invocation and automatic invocation via the PreCompact hook:

```json
{
  "hooks": {
    "PreCompact": [{
      "type": "command",
      "command": "/diary"
    }]
  }
}
```

This automatically generates diary entries for longer sessions that use compaction.

### What Claude Diary Captures

From real usage:

**Git workflow preferences:**
- Atomic commits and branch naming conventions
- Commit message formatting preferences

**Testing practices:**
- Run targeted tests first for quick feedback, then comprehensive suites
- Specialized test library preferences

**Code quality patterns:**
- Avoid naming conflicts between files and package directories
- Don't leave stale directories after refactoring
- Avoid unnecessarily verbose code

**Agent design preferences:**
- Token efficiency priorities
- Bias toward single-agent delegation over premature parallelization
- Use filesystem for context offloading

**Self-correction:**
- Find cases where Claude wasn't following instructions
- Reinforce weak rules

---

## Part 3: The Reflection Prompt

### One Prompt That Transforms Mistakes

When Claude makes a mistake, use this trigger:

> "Reflect, abstract, generalize, add to CLAUDE.md"

This activates a self-improvement cycle where Claude:
1. Analyzes the root cause
2. Identifies the general pattern
3. Writes a prevention rule
4. Adds it to CLAUDE.md

*(Source: Aviad Rozenhek, Dev.to)*

### Structured Reflection Prompt

Add to your CLAUDE.md:

```markdown
## When You Make a Mistake

When I point out an error or when you realize you made one,
immediately analyze:

1. **Root Cause**: Why did this happen?
2. **Pattern**: Is this a recurring type of mistake?
3. **Prevention**: What rule would prevent this?

Then write a concise rule to CLAUDE.md using:
- ALWAYS or NEVER (strong directives)
- Lead with why (context first)
- Be specific (not generic)

Example:
"NEVER use `any` type in TypeScript. Always define proper interfaces.
This prevents runtime errors that TypeScript should catch."
```

### Meta-Rules for CLAUDE.md Quality

Add these to ensure the document grows well:

```markdown
## META - MAINTAINING THIS DOCUMENT

### Writing Effective Guidelines

**Core Principles (Always Apply):**
1. Use absolute directives - Start with "NEVER" or "ALWAYS"
2. Lead with why - Explain the problem before the solution (1-3 bullets max)
3. Be concrete - Include actual commands/code
4. Minimize examples - One clear point per code block
5. Bullets over paragraphs - Keep explanations concise

**Optional Enhancements (Use Strategically):**
- ❌/✅ examples: Only when the antipattern is subtle
- "Warning Signs" section: Only for gradual mistakes
- "General Principle": Only when abstraction is non-obvious

**Anti-Bloat Rules:**
- ❌ Don't add "Warning Signs" to obvious rules
- ❌ Don't show bad examples for trivial mistakes
- ❌ Don't write paragraphs explaining what bullets can convey

### When Updating CLAUDE.md
- Check for duplicate/conflicting rules first
- Remove rules that are no longer relevant
- Test that new rules don't break existing workflows
```

### The Compounding Effect

**Session 1:**
- Claude makes 3 mistakes
- You use reflection prompt 3 times
- 3 rules added to CLAUDE.md
- Time investment: ~15 seconds per rule

**Session 2:**
- Claude reads updated CLAUDE.md at startup
- Doesn't repeat those 3 mistakes
- Makes new, different mistakes
- You capture those

**Session 10:**
- Most common mistakes are now rules
- Claude works more reliably
- Fewer corrections needed

---

## Part 4: Prompt Learning Methodology

A systematic approach to optimizing CLAUDE.md from Arize (November 2025):

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Run Claude on test cases                                    │
│  2. Evaluate outputs (pass/fail + WHY)                         │
│  3. Feed failures to meta-prompt                               │
│  4. Meta-prompt generates improved rules                       │
│  5. Update CLAUDE.md                                            │
│  6. Repeat until accuracy plateaus                             │
└─────────────────────────────────────────────────────────────────┘
```

### Why LLM Evals Beat Scalar Rewards

Instead of just "6 tests passed, 4 failed", generate rich feedback:
- Was the solution conceptually correct?
- Why did each test fail?
- What assumption was wrong?
- What rule would fix it?

**Results from Arize:**
- By-repo test accuracy improved by **5.19%**
- In-repo test accuracy improved by **10.87%**
- All improvements came purely from refining instructions—no fine-tuning, no custom infrastructure

### The Meta-Prompt Pattern

```markdown
You are optimizing instructions for a coding agent.

Given these test results:
[PASS/FAIL outcomes with detailed explanations]

Current rules:
[Existing CLAUDE.md content]

Generate improved rules that:
1. Address the specific failure modes observed
2. Are concrete enough to be actionable
3. Don't conflict with existing rules
4. Follow the meta-rule format (ALWAYS/NEVER, lead with why)

Output the rules in CLAUDE.md format.
```

### Key Insight

"You don't need to modify models, tooling, or architecture to get better performance. All improvements came purely from refining the instructions given to Claude Code—no fine-tuning, no retraining, no custom infrastructure. Just better prompts driven by real performance data."

---

## Part 5: Self-Improving AI Coding Agents

A tested methodology for stabilizing AI coding agents in 5 minutes:

*(Source: Colin Harman, Retrieve and Generate)*

### The Instability Problem

When your coding agent struggles with routine tasks—spending eight minutes on something that should take one—that's **instability**. It's not solely the AI agent's fault; it's the fault of the entire AI software development system:
- The codebase
- The tech stack
- The CI/CD pipeline
- The documentation
- The AI agent doing the work
- Its rules
- The developer

### The Four-Step Fix Loop

1. **Generate a run:** Execute agent on a task
2. **Capture logs:** Save chat + tool calls with `claude --print --verbose --output-format json`
3. **Identify confusion:** Look for:
   - Multiple attempts at the same thing
   - Different methods tried
   - Errors and timeouts
   - Going in circles
4. **Implement fixes:** Have the model write patches to CLAUDE.md or tool configurations
5. **Repeat** until no confusion present and execution times stabilize

### Trigger Prompt

```
Review agent output logs, identify confusion, root cause, and fix issues. 
Repeat until no confusion present.
```

### Quick Benchmarks

Run these to baseline your system:

```markdown
Command: Create a "Report a bug" button on the dashboard menu bar 
         that opens a page saying "Thank you for your feedback"
         
Purpose: Exercise full dev loop (code → tests → CI) with minimal scope
```

Run 5+ times to get stable averages due to non-determinism.

### Results

Real production data shows execution times decreasing as the system self-improves:
- Initial runs: High variance, frequent failures
- After improvements: Narrow variance, consistent success
- Final state: Stable, predictable performance

---

## Part 6: Executor-Evaluator Pattern

### The Core Problem

When you generate code with AI, it tends to be overconfident about its own output. A single agent both creates and evaluates its work, missing obvious issues.

### The Solution: Split Roles

```markdown
## Subagent: Executor
Implement the feature according to the plan.
Focus on correctness and completeness.

## Subagent: Evaluator
Review the implementation. Check:
- Does it match the spec?
- Are there edge cases missed?
- Would the code survive review?

Suggest improvements or approve.
```

**Benefits:**
- Evaluator isn't biased by executor's memory
- Natural feedback loop
- Higher quality output

*(Source: Claude Code Camp, Every.to)*

### Real-World Example: UI Implementation

Danny Aziz's pattern for Spiral (from Claude Code Camp):

1. **UI Engineer subagent** takes mockups from Figma and translates them into working React components
2. **Implementation Reviewer subagent** compares the code against the design and requests revisions
3. Because each has its own context window, the reviewer isn't biased by the executor's memory
4. They iterate back and forth until the implementation matches the design

### Feedback Codifier Agent

After leaving comments on a pull request:

```markdown
## Subagent: Feedback Codifier

Extract lessons from PR feedback and store them in CLAUDE.md.
The next time Claude reviews code, it already knows your standards.

Process:
1. Read PR comments
2. Identify actionable feedback
3. Abstract to general rules
4. Add to CLAUDE.md in proper format
```

### The Debate Pattern

Sometimes the best way to reach a good decision is to generate two opposing perspectives and let them argue:

**Example from Claude Code Camp:**
- One agent plays "Dan," trying to justify as many expenses as possible
- Another plays "the company," pushing to minimize costs
- Claude mediates between them and delivers a balanced report

Subagents are perfect for this because they can each hold a different role or agenda.

### 24/7 Agentic Loop Pattern

For continuous operation (from Pieces of My Soul, September 2025):

```
┌─────────────────────────────────────────────────────────────────┐
│                    Evaluator-Executor Loop                      │
│                                                                 │
│  Evaluator ──▶ Next Action ──▶ Executor ──▶ Results            │
│      ▲                                           │              │
│      └───────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

**Contract format:**
```json
{
  "task_list": "[items to process]",
  "current_item": "[item being worked]",
  "next_action": "spawn(cleanup-executor) | spawn(cleanup-evaluator) | done"
}
```

---

## Part 7: Extended Thinking for Planning

### Thinking Modes in Claude Code

Claude Code supports extended thinking with specific trigger keywords:

```
"think" < "think hard" < "think harder" < "ultrathink"
```

Each level allocates progressively more thinking budget:
- **think**: ~4,000 tokens for routine debugging
- **megathink/think hard**: ~10,000 tokens for architectural decisions
- **ultrathink**: ~31,999 tokens for complex problems

*(Source: Anthropic Claude Code Best Practices, April 2025)*

### Tab Toggle (v2.0+)

Press **Tab** to toggle extended thinking mode on or off during any session:
- The toggle is **sticky across sessions**
- UI indicator shows current state (though it may disappear after a moment)
- When using trigger words like "ultrathink," Claude Code indicates maximum budget is being utilized

### When to Use Thinking Modes

**Basic think (4,000 tokens):**
- Syntax fixes
- Simple refactoring
- Routine debugging

**Megathink (10,000 tokens):**
- Third-party API integration
- Local performance optimization
- Modular restructuring

**Ultrathink (31,999 tokens):**
- System design
- Critical migrations
- Complex debugging
- Performance optimization
- Seemingly intractable problems

### Self-Improvement Application

Use thinking modes during the planning phase:

```markdown
Ultrathink about this problem:

1. What are all possible root causes?
2. What patterns have I seen in similar issues?
3. What rules could prevent this class of problem?
4. Draft 3 candidate rules, evaluate each, select best
5. Output the final rule in CLAUDE.md format
```

### Important Notes

- **Claude Code only**: These keywords only work in Claude Code (CLI/terminal), not in Claude.ai web interface or API
- **Token cost**: Extended thinking consumes tokens, but can reduce overall cost by getting things right the first time
- **Progressive escalation**: Start with "think," escalate if needed

---

## Part 8: Three Verification Approaches

### 1. Rules-Based Feedback

Define clear output rules and explain failures:

```markdown
## Verification Rules

After generating code:
1. Run TypeScript compiler - provides multiple validation layers
2. Run ESLint with project config
3. Run tests with coverage

For each failure:
- State which rule was violated
- Explain why it matters
- Suggest the fix
```

TypeScript's type system provides excellent rules-based feedback automatically.

### 2. Visual Feedback with Playwright MCP

Screenshot rendered outputs and provide back to the model for verification:

```bash
# Install Playwright MCP
claude mcp add playwright -s local npx '@playwright/mcp@latest'
```

**Verification workflow:**
```markdown
Use Playwright MCP to:
1. Navigate to http://localhost:3000/component
2. Take a screenshot
3. Compare to the reference design at designs/component.png
4. List visual differences
5. Suggest CSS adjustments for pixel-perfect match
```

**Available Playwright tools:**
- `browser_navigate` - Go to URL
- `browser_take_screenshot` - Capture current state
- `browser_snapshot` - Get accessibility tree
- `browser_click`, `browser_type` - Interact with elements
- `browser_wait_for` - Wait for conditions

*(Source: Simon Willison, microsoft/playwright-mcp)*

**Mobile responsiveness testing:**
```markdown
Use Playwright to test this component at:
- 375px (iPhone SE)
- 768px (iPad)
- 1280px (Desktop)

Screenshot each breakpoint and verify layout adapts correctly.
```

### 3. LLM-as-Judge

Separate subagent evaluates output against fuzzy rules:

```markdown
## Subagent: Quality Judge

Evaluate the generated code against these criteria:
- Readability (1-10): Is the code self-documenting?
- Maintainability (1-10): Could a new developer understand this?
- Performance (1-10): Are there obvious inefficiencies?
- Security (1-10): Are inputs validated? SQL injection possible?

Provide detailed rubric scores and specific improvement suggestions.
```

**When to use each approach:**

| Approach | Best For | Latency |
|----------|----------|---------|
| Rules-based | Syntax, types, lint | Fast |
| Visual | UI, layout, styling | Medium |
| LLM-as-judge | Complex judgments, UX | Slow |

---

## Part 9: Memory MCP Servers

For context that should persist across sessions, use Memory MCP servers.

### Official Memory Server

```bash
# Add to Claude Code
claude mcp add-json "memory" '{"command":"npx","args":["-y","@modelcontextprotocol/server-memory"]}'
```

**Configuration in `~/.claude/settings.json`:**
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {
        "MEMORY_FILE_PATH": "/path/to/memory.jsonl"
      }
    }
  }
}
```

### Knowledge Graph Structure

**Entities:** Primary nodes with unique names and types
**Relations:** Directed connections between entities (always active voice)
**Observations:** Discrete facts about entities

```json
{
  "entityName": "Project_API",
  "entityType": "Component",
  "observations": [
    "Uses REST architecture",
    "Requires authentication via JWT",
    "Rate limited to 100 req/min"
  ]
}
```

### Memory Tools Available

| Tool | Description |
|------|-------------|
| `create_entities` | Add new nodes to graph |
| `create_relations` | Link entities together |
| `add_observations` | Append facts to entities |
| `delete_entities` | Remove nodes |
| `delete_observations` | Remove specific facts |
| `read_graph` | Get entire knowledge graph |
| `search_nodes` | Find entities by query |
| `open_nodes` | Get specific entities by name |

### Memory Prompt Template

Add to CLAUDE.md or project instructions:

```markdown
## Memory Management

1. At session start, retrieve relevant information from knowledge graph
2. While conversing, note new information in categories:
   - Project structure and conventions
   - Decisions made and their rationale
   - Things tried that didn't work
   - Patterns that worked well
3. Before session end, update knowledge graph with new learnings
```

### Alternative Memory Servers

| Server | Features |
|--------|----------|
| **mcp-knowledge-graph** | Multi-database support, project detection, .aim directories |
| **memento-mcp** | Neo4j backend, semantic search, temporal awareness |
| **claude-code-memory** | Neo4j, tracks activities, patterns, workflow memory |
| **basic-memory** | Markdown files, local storage, cloud sync |

**Memento-MCP example prompt:**
```markdown
You have access to the Memento MCP knowledge graph memory system, 
which provides you with persistent memory capabilities.

When asked about past conversations or user information, 
always check the Memento MCP knowledge graph first.
Use semantic_search to find relevant information when answering questions.
```

---

## Part 10: Continuous Improvement Systems

### Continuous Claude

Run Claude Code in a continuous loop for large-scale improvements:

```bash
# Install
npm install -g continuous-claude

# Run 5 iterations
continuous-claude -p "improve code quality" -m 5

# Run until $10 budget exhausted
continuous-claude -p "add documentation" --max-cost 10.00

# Run for 2 hours
continuous-claude -p "add unit tests" --max-duration 2h

# Combine limits
continuous-claude -p "improve tests" --max-duration 1h --max-cost 5.00
```

**How it works:**
1. Creates a new branch
2. Runs Claude Code with the prompt
3. Commits changes
4. Pushes and creates PR
5. Waits for CI checks
6. Merges if successful (squash, merge, or rebase strategies)
7. Repeats

**Key insight:** A markdown file (like `TASKS.md`) enables self-improvement. Claude writes notes like "tried adding tests to X but failed on edge case, need to handle null input" and the next iteration sees that and prioritizes addressing it.

*(Source: Anand Chowdhary, github.com/AnandChowdhary/continuous-claude)*

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
          gh run list --json conclusion,headBranch,createdAt,databaseId \
            --jq '[.[] | select(.createdAt > (now - 604800 | todate))]' > runs.json
          
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

### Enterprise Flywheel Pattern

For teams using GitHub Actions:

```bash
# Collect agent logs from CI
query-claude-gha-logs --since 5d | \
  claude -p "See what the other Claudes were getting stuck on and fix it"
```

This creates a **data-driven flywheel**:
```
Bugs → Improved CLAUDE.md → Better Agent → Fewer Bugs
```

---

## Part 11: The "You're Absolutely Right" Problem

### The Issue

Claude is trained to be agreeable, which can manifest as excessive sycophancy:

```
User: Should we simplify this and remove the "approve_only" case?
User: Yes please.
Claude: You're absolutely right! Since... [proceeds to implement]
```

The user never made a statement of fact—they just said "yes"—but Claude validated them anyway.

**Impact:**
- Masks learning opportunities
- Undermines trust in feedback
- Creates false confidence
- Wastes tokens on empty validation

*(Sources: GitHub Issue #3382, The Register, August 2025)*

### Detection

Search your logs:
```bash
find ~/.claude/projects -name "*.jsonl" -mtime -7 | \
  xargs grep -c "You're absolutely right" | \
  awk -F: '$2>0 {print $1": "$2}'
```

### Prevention Strategies

**1. Add to CLAUDE.md:**
```markdown
## Communication Style

If I correct you or suggest a change:
1. Don't say "You're absolutely right!"
2. Instead, identify what went wrong
3. Explain WHY it went wrong
4. Propose a rule to prevent it
5. Add the rule to CLAUDE.md

When I give approval (like "yes" or "go ahead"):
- Don't interpret this as me being "right" about something
- Simply proceed with the action
- Skip validating statements I didn't make
```

**2. Structure prompts for disagreement:**
```markdown
After implementing, run a subagent that plays devil's advocate:
- What could go wrong?
- What edge cases are missed?
- What would a senior engineer criticize?
```

**3. Request honest feedback explicitly:**
```markdown
Before proceeding, evaluate this approach critically:
- What are the weaknesses?
- What alternatives exist?
- Why might this be the wrong choice?

I value honest feedback over agreement.
```

---

## Part 12: Test-Driven Self-Improvement

### Use Test Results as Learning Signal

```bash
#!/bin/bash
# .claude/hooks/learn-from-tests.sh

npm test 2>&1 | tee /tmp/test-output.txt

if grep -q "FAIL" /tmp/test-output.txt; then
  grep -A5 "FAIL" /tmp/test-output.txt | \
    claude -p "Analyze these test failures. 
    What pattern do they show? 
    Suggest a CLAUDE.md rule to prevent this."
fi
```

### TDD Guard Hook

From Awesome Claude Code:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": {
        "tool_name": "edit_file",
        "file_paths": ["*.ts", "*.tsx"]
      },
      "command": ".claude/hooks/tdd-guard.sh"
    }]
  }
}
```

The TDD Guard monitors file operations in real-time and blocks changes that violate TDD principles.

### Self-Improving Test System Example

```markdown
# CLAUDE.md - Testing Section

## Testing Rules

### From Session 2025-12-01
NEVER mock the database in integration tests. Use test containers.
Why: Mocked tests passed but real DB failed due to constraint violations.

### From Session 2025-12-03
ALWAYS test both success and error paths.
Why: Happy path worked but error handling was broken.

### From Session 2025-12-05
ALWAYS run type checker after writing tests.
Why: Tests passed but types were wrong, causing runtime errors.
```

Each rule has:
- Clear DO/DON'T
- Context (why it exists)
- Origin (when it was learned)

---

## Part 13: Hooks for Self-Improvement

### Session Summary Hook

Generate improvement suggestions at session end:

```json
{
  "hooks": {
    "Stop": [{
      "type": "command",
      "command": ".claude/hooks/session-summary.py"
    }]
  }
}
```

**session-summary.py:**
```python
#!/usr/bin/env python3
import json
import sys
from datetime import datetime
from pathlib import Path

# Generate summary
summary = {
    "date": datetime.now().isoformat(),
    "accomplishments": [],
    "problems": [],
    "suggested_rules": []
}

# Save to docs/session-summaries/{date}.md
output_dir = Path("docs/session-summaries")
output_dir.mkdir(parents=True, exist_ok=True)
output_file = output_dir / f"{datetime.now().strftime('%Y-%m-%d')}.md"

# Write summary
with open(output_file, 'w') as f:
    f.write(f"# Session Summary - {summary['date']}\n\n")
    f.write("## Accomplishments\n")
    f.write("## Problems\n")
    f.write("## Suggested Rules\n")
```

### Pre-Compact Diary Hook

Automatically create diary entries before compaction:

```json
{
  "hooks": {
    "PreCompact": [{
      "type": "command",
      "command": "claude -p 'Create a diary entry for this session covering accomplishments, decisions, challenges, and learnings. Save to ~/.claude/memory/diary/$(date +%Y-%m-%d).md'"
    }]
  }
}
```

### TypeScript Quality Hooks

From Awesome Claude Code (bartolli):
- TypeScript compilation
- ESLint auto-fixing
- Prettier formatting
- SHA256 config caching for <5ms validation

---

## Part 14: Avoiding CLAUDE.md Bloat

### The Problem

Over time, CLAUDE.md accumulates rules and becomes too large, consuming context and degrading performance.

### Research on Instruction Limits

From HumanLayer (November 2025):
- Frontier thinking LLMs can follow ~150-200 instructions with reasonable consistency
- Claude Code's system prompt contains ~50 instructions already
- You have approximately **100-150 instruction slots** before degradation begins

### Solutions

**1. Monthly cleanup:**
```bash
claude -p "Review CLAUDE.md. 
Remove rules that are:
- Redundant with other rules
- Never triggered (obsolete)
- Superseded by newer rules
Keep it under 5000 tokens."
```

**2. Use .claude/rules/ directory:**
```
.claude/
├── CLAUDE.md          # Core rules only (<500 tokens)
└── rules/
    ├── testing.md     # Auto-loaded
    ├── security.md    # Auto-loaded
    └── patterns.md    # Auto-loaded
```

All `.md` files in `.claude/rules/` are automatically loaded as project memory.

**3. Progressive disclosure:**
```markdown
# CLAUDE.md

## Documentation
For detailed information, read the relevant file in `agent_docs/`:
- Building: agent_docs/building_the_project.md
- Testing: agent_docs/running_tests.md
- Architecture: agent_docs/service_architecture.md

Read relevant docs before starting work on related areas.
```

**4. Archive old rules:**
```
docs/
├── rules/
│   ├── current.md      # Active rules
│   └── archive.md      # Historical rules (not loaded)
```

---

## Part 15: Metrics to Track

| Metric | How to Measure | Goal |
|--------|----------------|------|
| Errors per session | grep -c "error" in logs | Decreasing |
| Retry attempts | Count multiple attempts at same task | Decreasing |
| "You're absolutely right" | grep -c in logs | Decreasing |
| CLAUDE.md size | wc -w CLAUDE.md | Stable (&lt;5000 tokens) |
| Rule relevance | Monthly review | No stale rules |
| Test pass rate | CI metrics | Increasing |
| Time to first success | Session timestamps | Decreasing |
| Execution time variance | Track across runs | Narrowing |

### Tracking Script

```bash
#!/bin/bash
# .claude/scripts/metrics.sh

echo "=== Claude Code Metrics ==="
echo ""

# Errors this week
errors=$(find ~/.claude/projects -name "*.jsonl" -mtime -7 | \
  xargs grep -c "error" 2>/dev/null | \
  awk -F: '{sum+=$2} END {print sum}')
echo "Errors (7 days): $errors"

# Sycophancy count
sycophancy=$(find ~/.claude/projects -name "*.jsonl" -mtime -7 | \
  xargs grep -c "You're absolutely right" 2>/dev/null | \
  awk -F: '{sum+=$2} END {print sum}')
echo "Sycophantic responses: $sycophancy"

# CLAUDE.md size
if [ -f "CLAUDE.md" ]; then
  words=$(wc -w < CLAUDE.md)
  echo "CLAUDE.md size: $words words"
fi

# Session count
sessions=$(find ~/.claude/projects -name "*.jsonl" -mtime -7 | wc -l)
echo "Sessions (7 days): $sessions"
```

---

## Part 16: Quick Reference

### Daily Checklist

- [ ] Review any errors from today's sessions
- [ ] Add rules for repeated mistakes
- [ ] Check CLAUDE.md isn't bloating

### Weekly Checklist

- [ ] Run log analysis across all sessions
- [ ] Identify patterns across multiple days
- [ ] Update CLAUDE.md with systemic improvements
- [ ] Run metrics script
- [ ] Run /reflect if using Claude Diary

### Monthly Checklist

- [ ] Review and prune CLAUDE.md
- [ ] Archive old rules
- [ ] Measure improvement metrics
- [ ] Update memory knowledge graph

### The Magic Prompts

When Claude makes a mistake:
> "Reflect, abstract, generalize, add to CLAUDE.md"

When starting a complex task:
> "Ultrathink about this problem and create a plan before implementing"

When evaluating output:
> "Run a subagent that plays devil's advocate on this implementation"

### Key Commands

| Command | Purpose |
|---------|---------|
| `/compact` | Summarize context, preserve learnings |
| `/clear` | Reset context (loses learnings) |
| `/mcp` | Check connected MCP servers |
| `/status` | View usage and configuration |
| `/diary` | Create session diary entry (with Claude Diary) |
| `/reflect` | Analyze diary entries and update CLAUDE.md |

---

## Part 17: Self-Improvement Subagent Template

```markdown
## Subagent: System Improver

Review the last session:
1. What took the longest?
2. What required human intervention?
3. What could be automated?

Propose improvements to:
- CLAUDE.md rules
- Hook configurations
- Slash commands

Submit as a PR for human review.
```

### Deployment

Save to `.claude/commands/improve.md`:

```markdown
# /improve

Run a self-improvement analysis:

1. Analyze session logs from the past week
2. Identify common patterns and failures
3. Generate CLAUDE.md additions
4. Create a PR with proposed changes

Use subagent for isolation and fresh context.
```

---

## References

### Official Sources
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) - Anthropic Engineering
- [Building Agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) - Anthropic Engineering
- [Claude Code GitHub Actions](https://docs.claude.com/en/docs/claude-code/github-actions) - Claude Docs
- [Subagents Documentation](https://code.claude.com/docs/en/sub-agents) - Official Claude Code Docs

### Community Guides
- [Self-Improving AI: One Prompt That Makes Claude Learn](https://dev.to/aviad_rozenhek_cba37e0660/self-improving-ai-one-prompt-that-makes-claude-learn-from-every-mistake-16ek) - Aviad Rozenhek
- [CLAUDE.md Best Practices with Prompt Learning](https://arize.com/blog/claude-md-best-practices-learned-from-optimizing-claude-code-with-prompt-learning/) - Arize
- [Claude Diary](https://rlancemartin.github.io/2025/12/01/claude_diary/) - Lance Martin, December 2025
- [Running Claude Code in a Loop](https://anandchowdhary.com/blog/2025/running-claude-code-in-a-loop) - Anand Chowdhary
- [Build Your First 24/7 Agentic Loop](https://wezzard.com/post/2025/09/build-your-first-agentic-loop-9d22/) - Pieces of My Soul
- [Claude Code Camp: Subagents](https://every.to/source-code/claude-code-camp) - Every.to
- [Self-Improving AI Coding Agents in 5 Minutes](https://colinharman.substack.com/p/self-improving-ai-coding-agents-in) - Colin Harman
- [Evaluator-Optimizer LLM Workflow](https://sebgnotes.com/blog/2025-01-10-evaluator-optimizer-llm-workflow-a-pattern-for-self-improving-ai-systems/) - SebgNotes
- [Getting Good Results from Claude Code](https://www.dzombak.com/blog/2025/08/getting-good-results-from-claude-code/) - Chris Dzombak

### Session Log Tools
- [claude-code-log](https://github.com/daaain/claude-code-log) - JSONL to HTML converter
- [claude-code-viewer](https://github.com/d-kimuson/claude-code-viewer) - Web-based viewer
- [clog](https://github.com/HillviewCap/clog) - Web viewer with real-time monitoring
- [cc-sessions-cli](https://eran.sandler.co.il/post/2025-09-22-cc-sessions-cli/) - Session analyzer
- [Analyzing Claude Code Logs with DuckDB](https://liambx.com/blog/claude-code-log-analysis-with-duckdb) - Liam ERD
- [bricoleur Session Viewer](http://www.bricoleur.org/2025/05/understanding-claude-code-sessions.html) - HTML log parser
- [Don't let Claude Code delete your session logs](https://simonwillison.net/2025/Oct/22/claude-code-logs/) - Simon Willison

### Memory MCP Servers
- [@modelcontextprotocol/server-memory](https://www.npmjs.com/package/@modelcontextprotocol/server-memory) - Official Anthropic
- [mcp-knowledge-graph](https://github.com/shaneholloman/mcp-knowledge-graph) - Multi-database support
- [memento-mcp](https://github.com/gannonh/memento-mcp) - Neo4j with semantic search
- [basic-memory](https://playbooks.com/mcp/basicmachines-memory) - Markdown files with cloud sync
- [claude-code-memory](https://lobehub.com/mcp/viralvoodoo-claude-code-memory) - Neo4j activity tracking

### Continuous Improvement Tools
- [continuous-claude](https://github.com/AnandChowdhary/continuous-claude) - Run Claude in a loop
- [claude-diary](https://github.com/rlancemartin/claude-diary) - Session reflection plugin
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code) - Curated commands and workflows
- [claudekit](https://github.com/carlrannaberg/claudekit) - CLI toolkit with subagents

### Thinking Modes
- [Claude Code Thinking](https://stevekinney.com/courses/ai-development/claude-code-thinking) - Steve Kinney
- [How to Toggle Thinking](https://claudelog.com/faqs/how-to-toggle-thinking-in-claude-code/) - ClaudeLog
- [Think, Megathink, Ultrathink](https://smartnested.com/think-megathink-ultrathink-claude-codes-power-keywords-decoded/) - SmartNested

### Playwright Integration
- [Using Playwright MCP with Claude Code](https://til.simonwillison.net/claude-code/playwright-mcp-claude-code) - Simon Willison
- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) - Official Playwright MCP server

### Sycophancy Issue
- [GitHub Issue #3382](https://github.com/anthropics/claude-code/issues/3382) - "Claude says 'You're absolutely right!' about everything"
- [The Register Analysis](https://www.theregister.com/2025/08/13/claude_codes_copious_coddling_confounds/) - August 2025

---

*This guide synthesizes research from official Anthropic documentation, community best practices, and real-world implementation experiences from November-December 2025.*
