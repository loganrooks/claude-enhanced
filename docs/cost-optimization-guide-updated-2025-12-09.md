# Cost Optimization Guide

> **Last Updated:** December 9, 2025
> **Purpose:** Token management, quota strategies, usage monitoring, cost reduction techniques
> **Claude Code Version:** v2.0+

## Overview

This guide covers strategies for minimizing costs while maximizing Claude Code effectiveness. Whether you're using subscription plans or the API, understanding token economics and optimization techniques is essential for sustainable AI-assisted development.

**Key December 2025 Updates:**
- Opus 4.5 pricing: $5/$25 per million tokens (66% reduction from Opus 4.1)
- Effort parameter (beta): Control token usage with low/medium/high settings
- Tool Search Tool: 85%+ token reduction through deferred loading
- 1M context window for Sonnet 4.5 (API, premium pricing >200K)
- Enhanced compaction with context awareness

---

## Understanding Costs

### Current Pricing Overview (December 2025)

#### Subscription Plans

| Plan | Cost | Best For | Weekly Expectations |
|------|------|----------|-------------------|
| Pro | $20/month | Individual developers | 40-80 hours Sonnet 4 |
| Max 5x | $100/month | Heavy individual use | 140-280 hours Sonnet, 15-35 hours Opus |
| Max 20x | $200/month | Power users | 240-480 hours Sonnet, 24-40 hours Opus |
| API | Pay-per-token | Teams, automation | No limits (budget-controlled) |

#### API Pricing (per million tokens)

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| Haiku 3 | $0.25 | $1.25 | Maximum cost savings |
| Haiku 3.5 | $0.80 | $4.00 | Budget efficiency |
| **Haiku 4.5** | $1.00 | $5.00 | Near-frontier at low cost |
| Sonnet 4 | $3.00 | $15.00 | Balanced performance |
| **Sonnet 4.5** | $3.00 | $15.00 | Best for coding |
| Opus 4.1 | $15.00 | $75.00 | Legacy complex reasoning |
| **Opus 4.5** | $5.00 | $25.00 | State-of-the-art (66% cheaper!) |

**Key Pricing Notes:**
- Opus 4.5 is now 66% cheaper than Opus 4.1
- Sonnet 4.5 maintains same pricing as Sonnet 4 despite improvements
- Haiku 4.5 offers near-frontier performance at 1/3 the cost of Sonnet

#### Extended Context Pricing (Sonnet 4/4.5 Only)

When input exceeds 200K tokens, premium rates apply:

| Model | Input (>200K) | Output (>200K) |
|-------|---------------|----------------|
| Sonnet 4.5 | $6.00 | $22.50 |
| Sonnet 4 | $6.00 | $22.50 |

**Average Developer Costs:**
- ~$6/developer/day average
- ~$100-200/developer/month with Sonnet 4.5
- 90% of users stay under $12/day

### Understanding Limits

Claude Code operates on a dual-limit system:

```
┌─────────────────────────────────────────────────────────────┐
│                    Weekly Allocation                         │
│  ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┐ │
│  │  Mon  │  Tue  │  Wed  │  Thu  │  Fri  │  Sat  │  Sun  │ │
│  └───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┘ │
│      │       │       │       │       │       │       │      │
│   ┌──▼──┐ ┌──▼──┐ ┌──▼──┐                                   │
│   │5-hr │ │5-hr │ │5-hr │  (Rolling 5-hour windows)         │
│   │burst│ │burst│ │burst│                                   │
│   └─────┘ └─────┘ └─────┘                                   │
│                                                              │
│  1. 5-Hour Rolling Window - Controls burst usage             │
│  2. Weekly Cap - Total ceiling that resets every 7 days     │
└─────────────────────────────────────────────────────────────┘
```

**Important Limit Behaviors:**
- Limits are shared across Claude.ai web, mobile, and Claude Code
- Opus consumes tokens ~5x faster than Sonnet
- Multiple parallel sessions deplete limits faster
- Weekly limits reset every 7 days (not Monday)

---

## Monitoring Usage

### Built-in Commands

```bash
# Current session cost (API users)
/cost

# Subscription plan limits (Pro/Max users)
/usage

# Context window breakdown
/context

# Comprehensive session status
/status
```

### /cost Command Details

Shows session-level token statistics:

```
Total cost: $0.55
Total duration (API): 6m 19.7s
Total duration (wall): 6h 33m 10.2s
Total code changes: 0 lines added, 0 lines removed
```

**Note:** `/cost` is designed for API users. Pro/Max subscribers should use `/usage`.

### /usage Command Details

Shows subscription quota consumption:

```
Weekly usage: 35%
Session usage: 12%
Reset: 3d 4h remaining
```

### /status Command

Three tabs of comprehensive information:
1. **Status** - IDE connection, extension version, model
2. **Usage** - Weekly/session percentages
3. **Config** - Checkpoints enabled, theme, settings

### /context Command

Critical for understanding token distribution:

```
Context Usage
claude-sonnet-4-5 • 67k/200k tokens (34%)
├ System prompt: 3.1k tokens (1.5%)
├ System tools: 12.4k tokens (6.2%)
├ Reserved: 45.0k tokens (22.5%)
├ MCP tools: 5.7k tokens (2.8%)  ← Watch this!
└ Free space: 88k (44.0%)
```

### Third-Party Monitoring

```bash
# Claude Code Usage Monitor
npm install -g claude-code-usage-monitor

# Run with your plan
claude-monitor --plan max20

# Available plans: pro, max5, max20
```

For API users:
- Check usage in Claude Console (Admin/Billing role)
- Set workspace spend limits
- View historical usage patterns

---

## Model Selection Strategy

### The Effort Parameter (Beta - Opus 4.5 Only)

The effort parameter is a game-changer for cost optimization, allowing you to control token usage at the model level:

```python
import anthropic

client = anthropic.Anthropic()
response = client.beta.messages.create(
    model="claude-opus-4-5-20251101",
    betas=["effort-2025-11-24"],
    max_tokens=4096,
    messages=[{"role": "user", "content": "..."}],
    output_config={
        "effort": "medium"  # "low", "medium", or "high"
    }
)
```

**Effort Level Impact:**

| Effort | Token Usage | Performance | Best For |
|--------|-------------|-------------|----------|
| Low | Minimal | Good | Simple tasks, high volume |
| Medium | 76% fewer than Sonnet 4.5 | Matches Sonnet 4.5 | Most coding tasks |
| High | 48% fewer than Sonnet 4.5 | Exceeds Sonnet 4.5 by 4.3% | Complex reasoning |

**Key Insight:** At medium effort, Opus 4.5 matches Sonnet 4.5's best SWE-bench score using 76% fewer output tokens!

### Model Selection Matrix

```
┌─────────────────────────────────────────────────────────────┐
│              Model Selection Matrix (Dec 2025)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Task Complexity                                             │
│       ▲                                                      │
│       │     ┌──────────────────┐                             │
│  High │     │ OPUS 4.5         │  Complex architecture,      │
│       │     │ $5/$25           │  multi-agent, long tasks    │
│       │     │ Use effort param │                             │
│       │     └──────────────────┘                             │
│       │  ┌──────────────────────┐                            │
│  Med  │  │   SONNET 4.5        │  Most coding tasks,        │
│       │  │   $3/$15            │  refactoring, debugging    │
│       │  └──────────────────────┘                            │
│       │┌────────────────────────┐                            │
│  Low  ││    HAIKU 4.5          │  Simple edits, tests,      │
│       ││    $1/$5              │  formatting, high volume   │
│       │└────────────────────────┘                            │
│       └─────────────────────────────────────────────────────▶│
│                              Volume                          │
└─────────────────────────────────────────────────────────────┘
```

### Switching Models in Claude Code

```bash
/model haiku    # For simple tasks ($1/$5)
/model sonnet   # For regular coding ($3/$15)
/model opus     # For complex reasoning ($5/$25)
```

### Hybrid Opus/Sonnet Approach

```bash
# Use Opus for planning with low effort
claude --model opus
> "Create a detailed plan for refactoring the auth system"
> # Use low/medium effort for planning

# Switch to Sonnet for implementation
/model sonnet
> "Implement step 1 of the plan"

# Back to Opus for complex debugging
/model opus
> "Debug this multi-system race condition"
```

### Task-Based Model Selection

| Task | Model | Effort | Why |
|------|-------|--------|-----|
| Quick edits | Haiku 4.5 | - | Fast, cheap |
| Regular coding | Sonnet 4.5 | - | Best balance |
| Architecture | Opus 4.5 | Medium | Deep reasoning, fewer tokens |
| Complex debug | Opus 4.5 | High | Multi-step logic |
| Tests/formatting | Haiku 4.5 | - | High volume, simple |
| Multi-agent orchestration | Opus 4.5 | High | Sustained coherence |
| Code review | Sonnet 4.5 | - | Good quality/cost |

---

## Context Management

### The "Lost-in-the-Middle" Problem

LLMs recall information best from the beginning and end of context—details in the middle are more likely to be ignored. Community consensus: reset context every **20 iterations** as performance degrades significantly beyond this threshold.

### Context Commands

```bash
# Check context usage
/context

# Manual compaction (preserves summary)
/compact

# Compaction with custom instructions
/compact only keep the database schema decisions

# Full reset (starts fresh)
/clear
```

### Compaction Strategies

**Auto-Compaction:**
- Triggers at ~95% capacity
- Summarizes while preserving essentials
- Can sometimes lose important context

**Manual Compaction (Recommended):**
- Compact at 70-85% usage
- Add custom preservation instructions
- More control over what's retained

```bash
# Best practice: Manual compact at logical milestones
/compact preserve: API contracts, test patterns, current task

# Before switching major tasks
/compact summarize database work, preserve pending TODOs
```

**Compaction Best Practices:**
1. Compact at ~70% usage, don't wait for auto-compact
2. Provide preservation instructions
3. Compact at natural milestones (feature complete, PR ready)
4. Use `/clear` for completely unrelated tasks

### CLAUDE.md Token Diet

Your CLAUDE.md is loaded with every request—keep it lean:

```markdown
# ❌ Heavy CLAUDE.md (10K+ tokens)
## Complete Project Documentation
[Full architecture...]
[All coding standards...]
[Every pattern ever used...]

# ✅ Lean CLAUDE.md (<500 tokens)
## Quick Reference
- TypeScript, React, PostgreSQL
- Run: npm test before commits

## Detailed Documentation
When working on specific areas, read relevant docs first:
- Architecture: docs/architecture.md
- Testing: docs/testing-guide.md
```

**Token Guidance:**
- CLAUDE.md: Aim for <500 tokens
- Total instructions: <150 (including ~50 from system)

**Note on @imports:** While CLAUDE.md officially supports `@path/to/file.md` imports, **community experience shows reliability issues** (global imports fail, home directory references fail, inconsistent behavior). **Recommended alternatives:**

1. **`.claude/rules/` directory** (most reliable):
   ```
   .claude/
   ├── CLAUDE.md          # Main instructions
   └── rules/
       ├── code-style.md  # Auto-loaded
       ├── testing.md     # Auto-loaded
       └── security.md    # Auto-loaded
   ```
   All .md files in `.claude/rules/` are automatically loaded as project memory.

2. **Hierarchical CLAUDE.md files** - Place CLAUDE.md in subdirectories; auto-discovered when working in those areas.

3. **Explicit read instructions** - Tell Claude "Read docs/X.md before starting this task" rather than relying on @imports.

---

## MCP Token Optimization

### The MCP Token Problem

MCP servers consume significant context just by being enabled:

| Server | Tools | ~Token Cost | % of 200K |
|--------|-------|-------------|-----------|
| GitHub | 35 | ~26,000 | 13% |
| Slack | 11 | ~21,000 | 10.5% |
| Jira | 15+ | ~17,000 | 8.5% |
| Linear | 10 | ~14,000 | 7% |
| Playwright | 21 | ~13,600 | 6.8% |
| Notion | 8 | ~8,000 | 4% |

**Impact:** A typical five-server setup consumes ~55K tokens before you type anything. Anthropic has seen setups consuming 134K tokens before optimization.

### Solution 1: Tool Search Tool (November 2025)

Anthropic's primary solution for MCP token bloat:

```
Traditional Approach:
┌─────────────────────────────────────────────────────────────┐
│  All 58 tools loaded upfront (~72K tokens)                  │
│  + Conversation history                                      │
│  + System prompt                                             │
│  = ~77K tokens BEFORE any work begins                       │
│                                                              │
│  Result: Only ~123K tokens for actual work                  │
└─────────────────────────────────────────────────────────────┘

With Tool Search Tool:
┌─────────────────────────────────────────────────────────────┐
│  Only Tool Search Tool loaded (~500 tokens)                 │
│  + 3-5 frequently used tools                                │
│  = ~3.5K tokens initially                                   │
│                                                              │
│  When Claude needs tools → Searches → Loads relevant ones   │
│  = ~8.7K total, preserving 95% of context window           │
└─────────────────────────────────────────────────────────────┘
```

**API Implementation:**

```python
client.beta.messages.create(
    model="claude-sonnet-4-5-20250929",
    betas=["advanced-tool-use-2025-11-20"],
    max_tokens=4096,
    tools=[
        {
            "type": "tool_search_tool_regex_20251119",
            "name": "tool_search_tool_regex"
        },
        {
            "name": "get_weather",
            "description": "Get weather at a location",
            "input_schema": {...},
            "defer_loading": True  # Key parameter!
        }
    ]
)
```

**Results:**
- 85% reduction in token usage
- Opus 4: 49% → 74% accuracy on MCP evaluations
- Opus 4.5: 79.5% → 88.1% accuracy

### Solution 2: Tool Consolidation

Before: 20 tools, 14,214 tokens
```javascript
// 4 separate web search tools
tavily_search()
brave_search()
kagi_search()
exa_search()
```

After: 8 tools, 5,663 tokens (60% reduction)
```javascript
// 1 consolidated tool with provider parameter
web_search({ provider: 'tavily' })
```

### Solution 3: Description Trimming

```javascript
// ❌ Verbose (87 tokens)
{
  "description": "This tool searches the web using the Tavily 
  API and returns results formatted as JSON with citations 
  and source URLs. It supports multiple search modes including
  news, academic, and general web search..."
}

// ✅ Concise (12 tokens)
{
  "description": "Search using Tavily. Best for factual/academic."
}
```

### Solution 4: Dynamic Server Management

```bash
# Check MCP usage
/context

# Toggle servers based on current task
/mcp
# Select → disable unused servers

# Or use @mention to disable
@github-server disable
```

**Best Practice:** Start sessions with minimal MCP servers, enable as needed.

### McPick Tool

For managing third-party MCP servers you can't optimize:

```bash
# Install McPick
npm install -g mcpick

# Toggle servers per session
mcpick toggle github
mcpick toggle slack
```

### CLI Alternatives to MCP

Consider CLI tools instead of MCP for occasional use:

```bash
# Instead of GitHub MCP (10K+ tokens)
gh issue list
gh pr create

# CLI tools don't consume context until used
```

---

## API Cost Optimization

### Prompt Caching (90% Savings)

Cache frequently used content for massive savings:

```python
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are a helpful coding assistant...",
            "cache_control": {"type": "ephemeral"}  # Cache this
        }
    ],
    messages=[...]
)
```

**Caching Economics:**
- Cache write: 1.25x base input price
- Cache hit: 0.1x base input price (90% savings!)
- 5-minute TTL (default) or 1-hour TTL

**Best Candidates for Caching:**
- System prompts
- Documentation
- Code context that repeats
- Examples and few-shot prompts

**Example Savings:**
```
10K requests with 80% cache hits:
- Without caching: $142/month (Sonnet 4.5)
- With caching: $14.20/month
- Savings: $127.80 (90%)
```

### Batch Processing (50% Savings)

For non-urgent tasks, batch processing offers half-price tokens:

```python
# Create a batch
batch = client.batches.create(
    requests=[
        {
            "custom_id": "request-1",
            "params": {
                "model": "claude-sonnet-4-5-20250929",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "..."}]
            }
        },
        # More requests...
    ]
)
```

**Batch Processing Benefits:**
- 50% discount on all tokens
- Processing typically under 1 hour (max 24 hours)
- Does not count against standard rate limits
- Works with prompt caching for combined savings

**Maximum Savings:** Batch + 1-hour caching = up to 95% cost reduction

### Combined Optimization Example

```
Standard API Cost:     $33.75/day
With Caching (90%):    $20.25/day (40% savings)
With Batch (50%):      $16.88/day (50% savings)
Caching + Batch:       $10.88/day (68% savings)
```

---

## Prompt Efficiency

### Concise Prompting

```markdown
# ❌ Verbose prompt (many tokens)
"I would like you to please look at the authentication 
module in my codebase, specifically the file located at 
src/auth/login.js, and if you could, please refactor 
the error handling to use try-catch blocks consistently 
throughout the entire file, making sure to..."

# ✅ Concise prompt (fewer tokens)
"Refactor src/auth/login.js: add consistent try-catch 
error handling"
```

### Batch Related Requests

```markdown
# ❌ Multiple prompts
"Add type to User interface"
"Add type to Product interface"  
"Add type to Order interface"

# ✅ Single batched prompt
"Add TypeScript types to User, Product, and Order interfaces"
```

### Structured Output Requests

```markdown
# ❌ Verbose output
"Please analyze this code and provide your thoughts"

# ✅ Constrained output
"Analyze this code. Response format:
- Issues: (bullet list)
- Fixes: (code blocks only)
Max 200 words."
```

---

## Quota Management Strategies

### Task Prioritization

```
Morning (fresh quota):
├── Complex architecture decisions (Opus)
├── Large refactors
└── Multi-file changes

Afternoon (conserving):
├── Code reviews (Sonnet)
├── Small fixes
└── Documentation

Low quota:
├── Use Haiku model
├── Read-only tasks
└── Planning for tomorrow
```

### Emergency Quota Conservation

When running low:

```bash
# 1. Switch to Haiku
/model haiku

# 2. Compress context
/compact

# 3. Disable MCP servers
/mcp  # disable non-essential

# 4. Keep prompts minimal

# 5. Use Claude.ai web for questions (separate quota from API)
```

### Session Timing Strategies

```bash
# Understand your reset schedule
/usage  # Check when limits reset

# Strategy: Start intensive work after natural reset
# Plan complex tasks for fresh quota periods
```

---

## Subscription vs API: When to Choose What

### When Subscription Wins

- Consistent daily usage
- Individual developer
- Predictable costs needed
- Don't want to manage API keys
- Need Opus access without API complexity

### When API Wins

- Variable usage patterns
- Team/automation use
- Need fine-grained control
- Multiple concurrent sessions
- Want prompt caching/batch discounts

### Break-Even Calculation

```
Max 20 ($200/month) vs API with Sonnet 4.5:

At Sonnet 4.5 rates ($3/$15 per million):
- $200 gets you ~13M input + ~13M output tokens
- That's roughly 10-15 heavy coding days

If you use Claude Code 15+ days/month heavily → Max 20
If you use it sporadically → API might be cheaper

With optimizations:
- Batch processing: $200 → ~26M tokens (2x)
- Prompt caching: Additional 90% on repeated content
- Combined: API becomes much more cost-effective at scale
```

---

## Team Cost Management

### Per-User TPM Recommendations

| Team Size | TPM per User |
|-----------|--------------|
| 10 users | 40,000 |
| 50 users | 30,000 |
| 200 users | 20,000 |
| 500+ users | 15,000 |

*TPM = Tokens Per Minute*

### Automation Safeguards

For CI/CD and headless usage:

```json
{
  "max_turns": 10,
  "timeout_minutes": 30,
  "model": "sonnet"
}
```

### Setting Workspace Limits

```bash
# In Claude Console (Admin role):
# 1. Go to Workspace Settings
# 2. Set spend limits
# 3. Configure alerts at 50%, 80%, 100%
```

---

## Advanced: Additional Costs

### Code Execution Tool

```
Pricing:
- First 50 hours/day/org: FREE
- Additional: $0.05/hour per container
- Minimum billing: 5 minutes per session
- Files in request = billed even if tool unused
```

### Web Search Tool

```
Pricing: Per-search charges in addition to tokens
- Charged per web_search_requests in usage object
- Consider caching search results
```

---

## Cost Monitoring Automation

### Track with GitHub Actions

```yaml
# .github/workflows/claude-costs.yml
name: Claude Code Cost Report
on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly Monday 9am

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - name: Generate cost report
        run: |
          # Query Claude Console API
          # Aggregate token usage from logs
          # Send to Slack/email
```

### Custom Efficiency Command

```markdown
<!-- .claude/commands/efficient.md -->
Complete this task using MINIMAL tokens:
1. Read only essential files
2. Make batched changes
3. Skip unnecessary explanations
4. Use concise output

Task: $ARGUMENTS
```

---

## Quick Reference

### Daily Checklist

- [ ] Check `/usage` or `/cost` at start
- [ ] Use appropriate model for task
- [ ] `/compact` at 70% context (don't wait for auto)
- [ ] Start fresh chat for new tasks
- [ ] Disable unused MCP servers

### Commands Summary

| Command | Purpose |
|---------|---------|
| `/cost` | Session token usage (API) |
| `/usage` | Subscription limits (Pro/Max) |
| `/context` | Context breakdown |
| `/compact` | Reduce context with summary |
| `/clear` | Full reset |
| `/model X` | Switch model |
| `/mcp` | Manage MCP servers |
| `/status` | Comprehensive session info |

### Cost Reduction Techniques Summary

| Technique | Savings | Availability |
|-----------|---------|--------------|
| Effort parameter (medium) | 76% tokens | Opus 4.5 API |
| Tool Search Tool | 85% tokens | API beta |
| Prompt caching | 90% on hits | API |
| Batch processing | 50% | API |
| MCP consolidation | 60%+ tokens | All |
| Model selection | Variable | All |
| Manual compaction | Variable | All |

### Model Quick Guide (Dec 2025)

| Model | Input/Output | Best For |
|-------|--------------|----------|
| Haiku 4.5 | $1/$5 | High volume, simple tasks |
| Sonnet 4.5 | $3/$15 | Daily development |
| Opus 4.5 | $5/$25 | Complex tasks (use effort param!) |
| Opus 4.5 (medium) | ~$1.25/$6.25 effective | Best value for complex |

---

## References

### Official Documentation
- [Claude Code Costs Docs](https://code.claude.com/docs/en/costs)
- [Anthropic API Pricing](https://docs.claude.com/en/docs/about-claude/pricing)
- [Batch Processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
- [Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Tool Search Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- [Effort Parameter](https://platform.claude.com/docs/en/build-with-claude/effort)

### Community Resources
- [Claude Code Usage Monitor](https://github.com/Maciek-roboblog/claude-code-usage-monitor)
- [McPick MCP Server Manager](https://github.com/spences10/mcpick)
- [Optimizing MCP Server Context](https://scottspence.com/posts/optimising-mcp-server-context-usage-in-claude-code)
- [ClaudeLog Pricing Guide](https://claudelog.com/claude-code-pricing/)
- [Steve Kinney - Cost Management](https://stevekinney.com/courses/ai-development/cost-management)

### Anthropic Engineering
- [Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use) (November 2025)
- [Introducing Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) (November 2025)
