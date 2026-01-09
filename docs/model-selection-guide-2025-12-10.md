# Model Selection Guide for Claude Code

> **Last Updated:** December 10, 2025  
> **Verified Against:** Claude Code v2.0+, Opus 4.5, Sonnet 4.5, Haiku 4.5  
> **Primary Sources:**  
> - [Anthropic: Introducing Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) - November 24, 2025
> - [Anthropic: Introducing Claude Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5) - October 15, 2025
> - [Claude Docs: What's New in Claude 4.5](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-5)
> - [Claude Code Docs: Model Configuration](https://code.claude.com/docs/en/model-config)
> - [Claude Docs: Effort Parameter](https://platform.claude.com/docs/en/build-with-claude/effort)
> - Community sources: Simon Willison, Steve Kinney, Caylent, CodeGPT

---

## Overview

Claude Code offers three models optimized for different use cases. Choosing the right model for each task optimizes both cost and quality—but the right choice depends heavily on your plan and budget.

**Important:** If you're on Max 5x or Max 20x with comfortable Opus headroom, much of the cost optimization advice in this guide doesn't apply to you. See [Advice by Plan & Budget](#advice-by-plan--budget) for context-appropriate guidance.

**The Simple Rules:**

For **Max users with Opus headroom:**
> Just use Opus. It's the best model, you're paying for it, and the cognitive overhead of switching isn't worth it. Switch to Haiku only when you need speed.

For **everyone else:**
> If you spend more than 5 seconds thinking about which model to use: Use Opus for complex design/research, Sonnet for everything else.
> — Steve Kinney, AI Development Course

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Model Selection at a Glance                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Your Context            Default Model    Why                       │
│  ────────────────────────────────────────────────────────────────   │
│                                                                     │
│  Max plan, Opus headroom  Opus 4.5        Best model, flat fee     │
│                                                                     │
│  Pro or hitting limits    Sonnet 4.5      Best balance             │
│                                                                     │
│  API / pay-per-token      Sonnet 4.5      Best value               │
│  (cost-sensitive)         (Haiku for volume)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Model Comparison](#model-comparison)
2. [Advice by Plan & Budget](#advice-by-plan--budget)
3. [When to Use Each Model](#when-to-use-each-model)
4. [Decision Framework](#decision-framework)
5. [Cost Analysis](#cost-analysis)
6. [The Effort Parameter (Opus 4.5)](#the-effort-parameter-opus-45)
7. [Model Switching in Claude Code](#model-switching-in-claude-code)
8. [Multi-Model Workflows](#multi-model-workflows)
9. [Subscription vs. API Considerations](#subscription-vs-api-considerations)
10. [Quick Reference](#quick-reference)
11. [References](#references)

---

## Model Comparison

### Current Claude 4.5 Family (December 2025)

| Attribute | Haiku 4.5 | Sonnet 4.5 | Opus 4.5 |
|-----------|-----------|------------|----------|
| **Release Date** | October 15, 2025 | September 29, 2025 | November 24, 2025 |
| **Position** | Fast & efficient | Balanced workhorse | Maximum capability |
| **Context Window** | 200K tokens | 200K (1M beta) | 200K tokens |
| **Max Output** | 64K tokens | 64K tokens | 64K tokens |
| **Knowledge Cutoff** | February 2025 | January 2025 | March 2025 |
| **API Pricing (Input)** | $1/M tokens | $3/M tokens | $5/M tokens |
| **API Pricing (Output)** | $5/M tokens | $15/M tokens | $25/M tokens |
| **SWE-bench Verified** | 73.3% | 77.2% | 80%+ |
| **Speed** | Fastest (2-5x Sonnet) | Medium | Slowest |
| **Extended Thinking** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Computer Use** | ✅ Yes | ✅ Yes | ✅ Enhanced (zoom) |
| **Context Awareness** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Effort Parameter** | ❌ No | ❌ No | ✅ Yes (unique) |
| **Safety Level** | ASL-2 | ASL-3 | ASL-3 |

### Model Strings

```bash
# Full model names for API/CLI
claude-haiku-4-5-20251001
claude-sonnet-4-5-20250929
claude-opus-4-5-20251101

# Aliases in Claude Code
haiku
sonnet
opus
```

---

## Advice by Plan & Budget

**The guidance in this document changes significantly based on your plan.** Someone paying per-token via API has very different incentives than someone on Max 20x with generous Opus limits.

### If You're on Max 5x or Max 20x: Just Use Opus

If you're paying $100-200/month and have comfortable Opus headroom, the cost optimization advice above largely doesn't apply to you. Your calculus is simpler:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Max Plan Decision Tree                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Are you hitting your Opus limits?                                  │
│         │                                                           │
│         ├─► NO ──────────────► Just use Opus for everything        │
│         │                      It's the best model, you're          │
│         │                      paying for it, why not?              │
│         │                                                           │
│         └─► YES ─────────────► Then consider:                       │
│                                • Sonnet for routine tasks           │
│                                • Haiku for speed-critical work      │
│                                • opusplan for auto-switching        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Why this makes sense:**
- You're paying a flat monthly fee regardless of which model you use
- Opus is strictly better than Sonnet at everything (just slower)
- The cognitive overhead of "which model should I use?" has a cost too
- If you're not hitting limits, model switching is just friction

**When Max users might still switch:**

| Reason | Switch To | Why |
|--------|-----------|-----|
| Need faster responses | Haiku | 2-5x faster than Opus |
| Approaching weekly limit | Sonnet | Preserve Opus for important work |
| Parallel subagents | Haiku | Speed matters more than depth for workers |
| Simple formatting tasks | Haiku | Why wait for Opus on trivial work? |

### If You're on Pro ($20/month): Be Strategic

Pro users have limited Opus access. Your approach:

```
Default: Sonnet 4.5
Escalate to Opus: Only for complex architecture, hard bugs, final reviews
Use Haiku: For speed-critical or simple tasks
```

**Weekly budget strategy:**
- Save Opus tokens for when you're genuinely stuck
- Use Sonnet for 90% of work
- Monitor with `/usage` to avoid running dry

### If You're on API (Pay-per-token): Optimize Aggressively

This is where all the cost optimization advice applies. Every token costs money, so:

```
Default: Sonnet 4.5 (best value)
Use Haiku: High-volume, parallel work, simple tasks (3x savings)
Use Opus: Only when Sonnet fails or for critical code (but leverage effort=medium)
```

**The effort parameter is your friend:**
- Opus at medium effort ≈ Sonnet quality at ~40% higher cost (not 67%)
- This makes Opus viable for more tasks than raw pricing suggests

### If You're on Enterprise/Team Plans

Consult your organization's usage policies. Many enterprises:
- Set default models via MDM
- Have budget allocations per team
- May restrict Opus to certain use cases

Check with your admin before defaulting to Opus.

### Summary: Context-Appropriate Defaults

| Your Situation | Default Model | Switch When |
|----------------|---------------|-------------|
| Max 20x, not hitting limits | **Opus** | Need speed (→Haiku) |
| Max 5x, comfortable headroom | **Opus** | Approaching limits (→Sonnet) |
| Max, frequently hitting limits | **Sonnet** | Complex tasks (→Opus), speed (→Haiku) |
| Pro | **Sonnet** | Stuck or critical (→Opus), speed (→Haiku) |
| API, budget-conscious | **Sonnet** | Volume (→Haiku), complexity (→Opus w/ effort) |
| API, quality-focused | **Opus medium** | Speed (→Haiku) |

---

## When to Use Each Model

### Haiku 4.5: Speed & Efficiency

**Best for:**
- UI scaffolding and prototypes
- Simple file operations and formatting
- High-volume, repetitive tasks
- Real-time/low-latency requirements
- Parallel execution (subagent workers)
- Personal/throwaway code
- Text summarization
- Basic classification tasks

**Characteristics:**
- 90% of Sonnet 4.5's coding performance
- 2-5x faster than Sonnet
- 1/3 the cost of Sonnet
- First Haiku with extended thinking
- "Speed demon" and "unbeatable for UI work" (community consensus)

**Limitations:**
- "Loses track fast in longer sessions" (community reports)
- Not suitable for deep, logical builds requiring sustained context
- Less reliable on complex multi-step reasoning

**Ideal prompt patterns:**
```
"Scaffold a basic React component for [X]"
"Format this code according to our style guide"
"Generate unit tests for these simple functions"
"Summarize this file's purpose"
```

### Sonnet 4.5: The Default Choice

**Best for:**
- 80% of all development tasks
- Standard feature implementation
- Code review and debugging
- Agentic workflows
- CI/CD automation
- Complex but not "hard" problems
- Production code (with review)
- Frontend and UI development ("pixel-perfect layouts")

**Characteristics:**
- Best coding model at its price point
- Strong agentic capabilities
- 1M token context window (beta)
- Concise, direct communication style
- Excellent first-try quality

**When to upgrade to Opus:**
- Sonnet gets stuck or loops
- Architecture decisions needed
- Complex async/concurrency issues
- Security-critical code
- When accuracy justifies 2x cost

**Ideal prompt patterns:**
```
"Implement user authentication with OAuth"
"Refactor this module to use async/await"
"Debug why this test is failing intermittently"
"Create a PR with comprehensive description"
```

### Opus 4.5: Maximum Capability

**Best for:**
- Complex architecture decisions
- Multi-system integration
- Deep debugging (catches bugs others miss)
- Security-critical code
- Final review before merge
- Research and advanced analysis
- Multi-hour agentic tasks
- When Sonnet fails or loops
- Novel problem-solving
- Complex async/concurrency issues
- Memory management and resource leaks

**Characteristics:**
- State-of-the-art coding (80%+ SWE-bench)
- Best prompt injection resistance
- "Gets it" without hand-holding (internal tester feedback)
- Effort parameter for cost control
- Fewer correction cycles needed
- 66% cheaper than Opus 4.1

**When Opus shines (community reports):**
> "Catches 'rebuild issues, missing disposes, and async bugs' that both Haiku 4.5 and Sonnet 4.5 completely skipped."

> "Tasks that were near-impossible for Sonnet 4.5 just a few weeks ago are now within reach."

**Ideal prompt patterns:**
```
"Architect a scalable solution for [complex requirement]"
"Review this PR for security vulnerabilities and edge cases"
"Debug this race condition in our distributed system"
"Analyze tradeoffs between these three approaches"
```

---

## Decision Framework

### The Quick Decision Tree

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Model Selection Decision Tree                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  START: What kind of task?                                          │
│         │                                                           │
│         ├─► Simple/routine/high-volume ──────────► HAIKU 4.5       │
│         │   • Formatting, scaffolding                               │
│         │   • Summarization                                         │
│         │   • Basic file operations                                 │
│         │                                                           │
│         ├─► Standard development ─────────────────► SONNET 4.5     │
│         │   • Feature implementation                (DEFAULT)       │
│         │   • Code review                                           │
│         │   • Debugging                                             │
│         │   • CI/CD tasks                                           │
│         │                                                           │
│         └─► Complex/critical/stuck ──────────────► OPUS 4.5        │
│             • Architecture decisions                                │
│             • Security-critical                                     │
│             • Sonnet failed/looped                                  │
│             • Final review                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Task-Based Selection Matrix

| Task Category | Haiku | Sonnet | Opus | Notes |
|--------------|-------|--------|------|-------|
| **UI/Frontend** | ✅ Scaffolding | ✅ Full implementation | ⚪ Overkill | Haiku for speed, Sonnet for quality |
| **Backend Logic** | ⚪ Simple only | ✅ Standard | ✅ Complex | Escalate based on complexity |
| **API Integration** | ⚪ | ✅ | ✅ | Sonnet handles most cases |
| **Database Work** | ⚪ | ✅ | ✅ | Opus for schema design |
| **Authentication** | ❌ | ✅ | ✅ | Never use Haiku for auth |
| **Security Review** | ❌ | ✅ | ✅✅ | Opus catches more |
| **Architecture** | ❌ | ⚪ | ✅✅ | Opus excels here |
| **Code Review** | ⚪ Basic | ✅ Standard | ✅✅ Final | Tiered approach works well |
| **Debugging** | ⚪ Simple | ✅ Most bugs | ✅✅ Hard bugs | Escalate when stuck |
| **Refactoring** | ⚪ Small | ✅ Medium | ✅ Large/cross-system |
| **Test Generation** | ✅ Unit | ✅ Integration | ⚪ | Haiku fine for simple tests |
| **Documentation** | ✅ | ✅ | ⚪ | Sonnet usually sufficient |
| **Summarization** | ✅✅ | ⚪ | ❌ | Haiku's sweet spot |

Legend: ✅✅ Excellent | ✅ Good | ⚪ Capable but not optimal | ❌ Avoid

### Escalation Triggers: When to Upgrade

**Upgrade from Haiku to Sonnet when:**
- Adding authentication
- Connecting to a database  
- Handling user input
- Going to production
- Others will use the code
- Security matters
- Performance matters

**Upgrade from Sonnet to Opus when:**
- Sonnet gets stuck or loops on a problem
- Making architectural decisions
- Working with complex async/concurrency
- Reviewing security-critical code
- Performing final review before merge
- Debugging issues that Sonnet can't resolve
- Tasks requiring deep, multi-step reasoning

---

## Cost Analysis

### Pricing Overview (December 2025)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Cost per Million Tokens                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Model          Input        Output       Relative Cost             │
│  ─────────────────────────────────────────────────────────────────  │
│  Haiku 4.5      $1           $5           1x (baseline)             │
│  Sonnet 4.5     $3           $15          3x                        │
│  Opus 4.5       $5           $25          5x                        │
│                                                                     │
│  Extended Context (>200K, Sonnet only):                             │
│  Sonnet 4.5     $6           $22.50       ~1.5x premium             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Real-World Cost Scenarios

**Scenario 1: High-volume automation (1M input, 200K output daily)**
| Model | Daily Cost | Monthly Cost |
|-------|------------|--------------|
| Haiku | $2 | $60 |
| Sonnet | $6 | $180 |
| Opus | $10 | $300 |

**Scenario 2: Standard development session (~50K input, 20K output)**
| Model | Per Session | 20 sessions/month |
|-------|-------------|-------------------|
| Haiku | $0.15 | $3 |
| Sonnet | $0.45 | $9 |
| Opus | $0.75 | $15 |

### Cost Optimization Strategies

1. **Default to Sonnet, escalate to Opus only when needed**
   - Most tasks don't need Opus
   - Opus at "medium effort" matches Sonnet quality with fewer tokens

2. **Use Haiku for parallel workers**
   - Sonnet plans, Haiku executes in parallel
   - 3x cost savings on execution phase

3. **Leverage Opus effort parameter**
   - Medium effort: 76% fewer tokens, same quality as Sonnet
   - Use high effort only for complex analysis

4. **Use the `opusplan` alias** (Max users)
   - Opus for planning, auto-switches to Sonnet for execution

---

## The Effort Parameter (Opus 4.5)

### What It Is

The effort parameter is **unique to Opus 4.5** and controls how many tokens Claude uses when responding. It affects:
- Text responses
- Tool calls
- Extended thinking

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Effort Parameter Comparison                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Level     Token Usage    Speed      Quality        Best For        │
│  ─────────────────────────────────────────────────────────────────  │
│  Low       Minimal        Fastest    Good           Simple tasks,   │
│                                                     quick lookups   │
│                                                                     │
│  Medium    Balanced       Medium     Very Good      Most production │
│            (76% less                 (≈ Sonnet)     use cases       │
│            than high)                                               │
│                                                                     │
│  High      Maximum        Slowest    Best           Complex analysis│
│            (default)                 (+4.3% vs      critical tasks  │
│                                      Sonnet)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance vs. Sonnet 4.5

| Setting | SWE-bench Performance | Token Usage vs. Sonnet |
|---------|----------------------|------------------------|
| Medium | Same as Sonnet 4.5 | 76% fewer tokens |
| High | +4.3% above Sonnet | 48% fewer tokens |

**Key insight:** Opus at medium effort gives you Sonnet-level quality with dramatically fewer tokens. Opus at high effort exceeds Sonnet while still being more token-efficient.

### API Usage

```python
import anthropic

client = anthropic.Anthropic()
response = client.beta.messages.create(
    model="claude-opus-4-5-20251101",
    betas=["effort-2025-11-24"],
    max_tokens=4096,
    messages=[{"role": "user", "content": "Analyze this architecture..."}],
    output_config={
        "effort": "medium"  # "low", "medium", or "high"
    }
)
```

### When to Use Each Level

| Effort | Use Case |
|--------|----------|
| **Low** | Simple classification, quick lookups, high-volume automation |
| **Medium** | Most production tasks, balanced speed/quality |
| **High** | Complex reasoning, critical code, architecture decisions |

**Note:** As of December 2025, the effort parameter is not yet exposed in Claude Code CLI (see [GitHub issue #12376](https://github.com/anthropics/claude-code/issues/12376)). It's available via API only.

---

## Model Switching in Claude Code

### Methods (Priority Order)

1. **During session:** `/model <alias|name>`
2. **At startup:** `claude --model <alias|name>`
3. **Environment variable:** `ANTHROPIC_MODEL=<alias|name>`
4. **Settings file:** Configure `model` field

### Quick Commands

```bash
# Start with specific model
claude --model opus
claude --model sonnet
claude --model haiku

# Switch during session
/model opus
/model sonnet  
/model haiku

# Check current model
/model
/status
```

### Using Full Model Names

```bash
# When you need specific versions
/model claude-opus-4-5-20251101
/model claude-sonnet-4-5-20250929
/model claude-haiku-4-5-20251001

# Enable 1M context (Sonnet only, API)
/model anthropic.claude-sonnet-4-5-20250929-v1:0[1m]
```

### The `opusplan` Alias

For Max users, `opusplan` provides automatic model switching:
- **Plan mode:** Uses Opus for complex reasoning
- **Execution mode:** Switches to Sonnet for implementation

```bash
claude --model opusplan
```

---

## Multi-Model Workflows

### The Orchestration Pattern

Anthropic explicitly designed the model family for orchestration:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Multi-Model Orchestration                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. PLAN (Opus/Sonnet)                                              │
│     │                                                               │
│     │  "Break this feature into subtasks"                           │
│     │                                                               │
│     ▼                                                               │
│  2. EXECUTE (Haiku, parallel)                                       │
│     │                                                               │
│     ├──► Haiku: Component A                                         │
│     ├──► Haiku: Component B                                         │
│     └──► Haiku: Component C                                         │
│     │                                                               │
│     ▼                                                               │
│  3. INTEGRATE (Sonnet)                                              │
│     │                                                               │
│     │  Combine results, resolve conflicts                           │
│     │                                                               │
│     ▼                                                               │
│  4. REVIEW (Opus)                                                   │
│     │                                                               │
│     │  Final check for bugs, security issues                        │
│     │                                                               │
│     ▼                                                               │
│  DONE                                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Example: Feature Development

```markdown
## Phase 1: Planning (Opus or Sonnet)
/model opus
"Analyze this feature request and break it into subtasks.
Consider edge cases and integration points."

## Phase 2: Implementation (Sonnet)
/model sonnet
"Implement subtask 1: Create the data model"
"Implement subtask 2: Add API endpoints"
"Implement subtask 3: Build the UI components"

## Phase 3: Testing (Haiku for speed)
/model haiku
"Generate unit tests for these new functions"
"Generate integration test scaffolding"

## Phase 4: Final Review (Opus)
/model opus
"Review this PR for security issues, race conditions, 
and anything Sonnet might have missed"
```

### Example: Code Review Pipeline

```markdown
## Quick scan (Haiku) - Fast triage
/model haiku
"Scan this diff for obvious issues: syntax errors, 
missing imports, formatting problems"

## Standard review (Sonnet) - Normal review
/model sonnet
"Review this code for logic errors, edge cases, 
and adherence to our patterns"

## Deep review (Opus) - Critical code only
/model opus
"This is security-critical code. Review for:
- Authentication/authorization bypasses
- Injection vulnerabilities
- Race conditions
- Resource leaks"
```

---

## Subscription vs. API Considerations

### Subscription Plans (Claude.ai / Claude Code)

| Plan | Monthly | Opus Access | Best For |
|------|---------|-------------|----------|
| Pro | $20 | Limited | Individual devs, light use |
| Max 5x | $100 | Moderate | Heavy individual use |
| Max 20x | $200 | Generous | Power users |

**Key behaviors:**
- Limits shared across Claude.ai web, mobile, and Claude Code
- Opus consumes tokens ~5x faster than Sonnet
- Weekly limits reset every 7 days (not Monday)
- Auto-fallback to Sonnet when Opus limit hit (Max users)

### API (Pay-per-token)

| Model | Input/M | Output/M | Best For |
|-------|---------|----------|----------|
| Haiku 4.5 | $1 | $5 | High-volume automation |
| Sonnet 4.5 | $3 | $15 | Standard development |
| Opus 4.5 | $5 | $25 | Complex tasks |

**Advantages:**
- No usage limits (budget-controlled)
- Full control over model selection
- Effort parameter available (Opus)
- Batch processing discounts (50% on output)

---

## Quick Reference

### The 10-Second Guide by Context

```
MAX USERS (not hitting limits):
└── Just use Opus. Switch to Haiku for speed.

PRO USERS / HITTING LIMITS:
├── Default: Sonnet
├── Escalate: Opus for hard problems
└── Speed: Haiku

API USERS (pay-per-token):
├── Volume: Haiku ($1/$5)
├── Standard: Sonnet ($3/$15)
└── Complex: Opus medium effort ($5/$25, but efficient)
```

### The 30-Second Model Guide

```
HAIKU 4.5 ($1/$5)
├── Speed demon, 90% of Sonnet quality
├── Use for: scaffolding, formatting, parallel workers, speed
└── Avoid for: auth, security, complex logic, long sessions

SONNET 4.5 ($3/$15)
├── Best balance of cost/quality/speed
├── Use for: 80% of development tasks
└── Upgrade to Opus when: stuck, security-critical, architecture

OPUS 4.5 ($5/$25)
├── Maximum capability, catches what others miss
├── Use for: everything (if Max), or complex tasks (if cost-sensitive)
└── Use effort=medium for Sonnet quality, fewer tokens
```

### Model Selection Cheatsheet

| If you... | Use |
|-----------|-----|
| Have Max plan with Opus headroom | **Opus** (for everything) |
| Need fastest response | Haiku |
| Need cheapest option (API) | Haiku |
| Are on Pro or cost-sensitive | Sonnet (default) |
| Want best coding performance | Opus (high effort) |
| Want Sonnet quality, fewer tokens | Opus (medium effort) |
| Are doing final review before merge | Opus |
| Are making architecture decisions | Opus |
| Need parallel subagent workers | Haiku |
| Are doing UI scaffolding | Haiku |
| Are doing production feature work | Sonnet or Opus |
| Are writing security-critical code | Sonnet or Opus |
| Are stuck with Sonnet | Opus |

### CLI Quick Reference

```bash
# Start with model
claude --model haiku|sonnet|opus

# Switch mid-session  
/model haiku|sonnet|opus

# Check current
/model
/status

# Max users: auto-switching
claude --model opusplan
```

---

## References

### Official Sources
1. [Anthropic: Introducing Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) - November 24, 2025
2. [Anthropic: Introducing Claude Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5) - October 15, 2025
3. [Claude Docs: What's New in Claude 4.5](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-5)
4. [Claude Code Docs: Model Configuration](https://code.claude.com/docs/en/model-config)
5. [Claude Docs: Effort Parameter](https://platform.claude.com/docs/en/build-with-claude/effort)

### Community Sources
6. [Simon Willison: Claude Opus 4.5](https://simonwillison.net/2025/Nov/24/claude-opus/) - November 24, 2025
7. [Steve Kinney: Claude Code Model Selection](https://stevekinney.com/courses/ai-development/claude-code-model-selection)
8. [Caylent: Claude Haiku 4.5 Deep Dive](https://caylent.com/blog/claude-haiku-4-5-deep-dive-cost-capabilities-and-the-multi-agent-opportunity) - October 15, 2025
9. [CodeGPT: Anthropic Claude Models Complete Guide](https://www.codegpt.co/blog/anthropic-claude-models-complete-guide)
10. [GitHub Issue #12376: Effort parameter in Claude Code](https://github.com/anthropics/claude-code/issues/12376)

### Related Project Guides
- [Cost Optimization Guide](./cost-optimization-guide-updated-2025-12-09.md) - Detailed token management
- [Automation Guide](./automation-guide-updated-2025-12-09.md) - CI/CD model selection
- [E2E Workflows Guide](./e2e-workflows-guide-updated-2025-12-10.md) - Multi-model workflows
