# Community Sources Appendix: Claude Code Best Practices
**Version:** 3.0  
**Last Updated:** December 9, 2025  
**Purpose:** Supplement official documentation with community-validated practices, highlighting areas of consensus, tension, and practical real-world experience.

---

## Changelog

### v3.0 (December 9, 2025)
**Major Expansion:**
- Added 15+ new high-quality community sources
- New section: MCP Token Optimization (Scott Spence's comprehensive guide)
- New section: Subagent Patterns & Best Practices (5 sources)
- New section: TDD Workflow Integration (4 sources)
- New section: Multi-Agent Orchestration patterns
- New section: GitHub Community Resources (awesome-claude-code ecosystem)
- Enhanced practical tips tables with new validated strategies
- Added source reliability tiers with specific criteria
- Added "Key Insight" callouts throughout

### v2.0 (December 9, 2025)
- Initial compilation from 7 primary sources
- Added tension analysis for 5 key areas
- Verified extended thinking behavior (binary toggle)
- Added anti-patterns section based on negative consensus
- Added key configuration examples from community

---

## Source Catalog

### Tier 1: High-Reliability Sources (Nov-Dec 2025)

| Source | Author | Date | Focus Area | Reliability |
|--------|--------|------|------------|-------------|
| [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature) | Shrivu Shankar | Nov 2, 2025 | Enterprise workflows, MCP philosophy | ⭐⭐⭐⭐⭐ |
| [Streamlining my user-level CLAUDE.md](https://www.dzombak.com/blog/2025/12/streamlining-my-user-level-claude-md/) | Chris Dzombak | Dec 2, 2025 | Minimal CLAUDE.md philosophy | ⭐⭐⭐⭐⭐ |
| [Claude Code Cheatsheet](https://apidog.com/blog/claude-code-cheatsheet/) | Ashley Goolam | Nov 20, 2025 | Comprehensive beginner guide | ⭐⭐⭐⭐ |
| [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) | Anthropic (Boris Cherny) | Apr 2025 (updated) | Official patterns, TDD | ⭐⭐⭐⭐⭐ |

### Tier 2: Detailed Practitioner Guides (Sept-Nov 2025)

| Source | Author | Date | Focus Area | Reliability |
|--------|--------|------|------------|-------------|
| [Claude Code is a Beast – 6 Months Tips](https://dev.to/diet-code103/claude-code-is-a-beast-tips-from-6-months-of-hardcore-use-572n) | Diet-Coder | Oct 29, 2025 | Skills auto-activation, hooks | ⭐⭐⭐⭐ |
| [Optimising MCP Server Context Usage](https://scottspence.com/posts/optimising-mcp-server-context-usage-in-claude-code) | Scott Spence | Sept 30, 2025 | MCP token optimization | ⭐⭐⭐⭐⭐ |
| [Token Efficiency with MCP](https://medium.com/@pierreyohann16/optimizing-token-efficiency-in-claude-code-workflows-managing-large-model-context-protocol-f41eafdab423) | Pierre-Emmanuel Féga | Oct 25, 2025 | MCP response analysis | ⭐⭐⭐⭐ |
| [rosmur/claudecode-best-practices](https://rosmur.github.io/claudecode-best-practices/) | Community synthesis | Nov 6, 2025 | 12-source synthesis | ⭐⭐⭐⭐ |
| [Claude Code 2.0 Best Practices](https://skywork.ai/blog/claude-code-2-0-best-practices-ai-coding-workflow-2025/) | Skywork | Sept 30, 2025 | v2.0 workflow adaptations | ⭐⭐⭐ |

### Tier 3: Specialized Topic Sources (July-Oct 2025)

| Source | Author | Date | Focus Area | Reliability |
|--------|--------|------|------------|-------------|
| [Basic Claude Code](https://harper.blog/2025/05/08/basic-claude-code/) | Harper Reed | May 2025 | TDD, spec-driven development | ⭐⭐⭐⭐ |
| [My Claude Code Workflow](https://thegroundtruth.substack.com/p/my-claude-code-workflow-and-personal-tips) | Zhu Liang | July 3, 2025 | ROADMAP.md, session management | ⭐⭐⭐⭐ |
| [10 Essential Claude Code Tips](https://blog.sixeyed.com/ten-tips-claude-code/) | Elton Stoneman | July 15, 2025 | Multi-instance, parallel dev | ⭐⭐⭐⭐ |
| [/context Visualizer Guide](https://www.vibesparking.com/en/blog/ai/claude-code/commands/2025-08-21-context-claude-code-context-tokens-visualizer/) | Vibe Sparking | Aug 21, 2025 | Context monitoring | ⭐⭐⭐⭐ |
| [TDD with Claude Code](https://stevekinney.com/courses/ai-development/test-driven-development-with-claude) | Steve Kinney | July 29, 2025 | TDD workflows | ⭐⭐⭐⭐ |
| [TDD Guard Blog](https://nizar.se/tdd-guard-for-claude-code/) | Nizar | Recent | TDD enforcement | ⭐⭐⭐⭐ |

### Tier 4: Subagent & Multi-Agent Sources

| Source | Author | Date | Focus Area | Reliability |
|--------|--------|------|------------|-------------|
| [Subagents and Task Delegation](https://dev.to/letanure/claude-code-part-6-subagents-and-task-delegation-k6f) | letanure | Aug 11, 2025 | Subagent basics | ⭐⭐⭐⭐ |
| [How Subagents Transformed My Workflow](https://medium.com/@benratcliffe_/how-claude-code-sub-agents-have-transformed-my-development-workflow-e5d8896abd6f) | Ben Ratcliffe | Aug 29, 2025 | Domain specialists | ⭐⭐⭐⭐ |
| [Subagent Tips](https://medium.com/@sampan090611/experiences-on-claude-codes-subagent-and-little-tips-for-using-claude-code-c4759cd375a7) | Pan Xinghan | Aug 7, 2025 | Proactive delegation | ⭐⭐⭐ |
| [Subagents: Stop Managing Chaos](https://medium.com/@pekastel/claude-code-subagents-stop-managing-chaos-start-leading-developers-dc32fc077d56) | Pablo Castillo | July 29, 2025 | Institutional knowledge | ⭐⭐⭐ |
| [Multi-Agent Orchestration](https://dev.to/bredmond1019/multi-agent-orchestration-running-10-claude-instances-in-parallel-part-3-29da) | Brandon Redmond | Aug 2, 2025 | Parallel agents | ⭐⭐⭐ |
| [How I Turned Claude Code into My Own Dev Team](https://medium.com/@cheemabyren/how-i-turned-claude-code-into-my-own-dev-team-with-subagents-bbbdf8a9aef8) | Byren Cheema | July 31, 2025 | Team orchestration | ⭐⭐⭐ |

### GitHub Community Resources

| Repository | Stars | Focus | URL |
|------------|-------|-------|-----|
| awesome-claude-code | 16.9k | Curated resources | [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) |
| claude-code-guide | - | Commands reference | [zebbern/claude-code-guide](https://github.com/zebbern/claude-code-guide) |
| claude-code-resources | - | Best practices | [Grayhat76/claude-code-resources](https://github.com/Grayhat76/claude-code-resources) |
| tdd-guard | - | TDD enforcement | [nizos/tdd-guard](https://github.com/nizos/tdd-guard) |
| claude-context | - | Code search MCP | [zilliztech/claude-context](https://github.com/zilliztech/claude-context) |
| claude-code-settings | - | Settings/agents | [feiskyer/claude-code-settings](https://github.com/feiskyer/claude-code-settings) |

---

## Areas of Strong Consensus (5+ Sources Agree)

### 1. CLAUDE.md is Essential
**Sources:** ALL surveyed sources  
**Consensus:** Every successful Claude Code user maintains a CLAUDE.md file at project root.

**Key Points:**
- Keep under ~200 lines [Dzombak Dec 2025, Shrivu Nov 2025]
- Document what Claude gets wrong, not everything [Shrivu Nov 2025]
- Use as "forcing function" to simplify tooling [Shrivu Nov 2025]
- Point to documentation files rather than embedding content [rosmur synthesis]

> **Key Insight (Shrivu Shankar):** "Treat your CLAUDE.md as a high-level, curated set of guardrails and pointers. Use it to guide where you need to invest in more AI (and human) friendly tools, rather than trying to make it a comprehensive manual."

### 2. Planning Before Coding is Non-Negotiable
**Sources:** Dzombak, Diet-Coder, rosmur synthesis, Anthropic official, Harper Reed  
**Consensus:** Complex features require explicit planning phase.

**Validated Workflow:**
1. Enter Planning Mode (Shift+Tab twice)
2. Let Claude research codebase
3. Review plan thoroughly
4. Document plan before implementing
5. Implement in phases, updating plan as needed

> **Key Insight (Diet-Coder):** "If you aren't at a minimum using planning mode before asking Claude to implement something, you're gonna have a bad time"

### 3. Context Management is the Primary Success Factor
**Sources:** Shrivu, Diet-Coder, rosmur synthesis, Scott Spence, Vibe Sparking  
**Consensus:** Context degradation is the primary failure mode.

**Validated Strategies:**
- Clear context at ~60k tokens or 30% capacity [rosmur synthesis]
- Use `/context` to monitor usage mid-session [Shrivu Nov 2025, Vibe Sparking Aug 2025]
- Avoid `/compact` - prefer `/clear` + restart [Shrivu Nov 2025]
- Document progress in external .md files before clearing
- Auto-compaction triggers around ~80% usage [Vibe Sparking]

> **Key Insight (Shrivu Shankar):** "The automatic compaction is opaque, error-prone, and not well-optimized"

### 4. Code Review is Critical
**Sources:** Dzombak, Diet-Coder, rosmur synthesis, Anthropic official  
**Consensus:** Human review of AI-generated code is essential.

> **Key Insight (Chris Dzombak):** "I believe I'm ultimately responsible for the code that goes into a PR with my name on it, regardless of how it was produced."

**Patterns:**
- Have Claude review its own code (surprisingly effective) [Dzombak]
- Use separate Claude instances for write/review [Diet-Coder, Anthropic]
- 2 human approvals for AI-initiated PRs [Shrivu Nov 2025]

### 5. Test-Driven Development is Highly Effective
**Sources:** Anthropic official, Harper Reed, Steve Kinney, TDD Guard, Nizar  
**Consensus:** TDD is the most effective counter to hallucination and scope drift.

> **Key Insight (Harper Reed):** "The robots LOVE TDD. Seriously. They eat it up. With TDD you have the robot friend build out the test, and the mock. Then your next prompt you build the mock to be real. And the robot just loves this. It is the most effective counter to hallucination and LLM scope drift I have found."

**TDD Workflow with Claude:**
1. Ask Claude to write tests based on expected input/output pairs
2. Be explicit that you're doing TDD (avoids mock implementations)
3. Tell Claude to run tests and confirm they fail
4. Ask Claude to commit the tests
5. Ask Claude to implement code to pass tests
6. Iterate until green

---

## NEW: MCP Token Optimization (Scott Spence's Guide)

### The Problem
Scott Spence discovered his MCP tools were consuming **66,000+ tokens** of context before starting any conversation - a third of Claude's 200k token window.

**Example from `/doctor` command:**
```
Context Usage Warnings
└ ⚠️ Large MCP tools context (~81,986 tokens > 25,000)
  └ MCP servers:
    └ mcp-omnisearch: 20 tools (~14,114 tokens)
    └ playwright: 21 tools (~13,647 tokens)
    └ mcp-sqlite-tools: 19 tools (~13,349 tokens)
```

### Solution: Tool Consolidation

**Before: 20 tools, 14,214 tokens**
```javascript
// 4 separate web search tools
tavily_search()
brave_search()
kagi_search()
exa_search()
```

**After: 8 tools, 5,663 tokens (60% reduction)**
```javascript
// 1 consolidated tool with provider parameter
web_search({ provider: 'tavily' })
web_search({ provider: 'brave' })
```

### Best Practices for MCP Token Efficiency

| Practice | Example |
|----------|---------|
| Consolidate related tools | Use parameters instead of separate tools |
| Trim descriptions | "Search using Tavily. Best for factual/academic." (12 tokens) vs verbose paragraph (87 tokens) |
| Simplify parameter names | `limit` not `max_results` or `count` |
| Use standard naming | `query`, `limit`, `provider` consistently |

### McPick Tool
Scott created [McPick](https://github.com/spences10/mcpick) for toggling MCP servers on/off per session - useful for third-party servers you can't optimize.

### /context Command Usage
```
> /context
  ⎿  Context Usage
     claude-sonnet-4-5 • 67k/200k tokens (34%)
     ⛁ System prompt: 3.1k tokens (1.5%)
     ⛁ System tools: 12.4k tokens (6.2%)
     ⛝ Reserved: 45.0k tokens (22.5%)
     ⛁ MCP tools: 5.7k tokens (2.8%)  ← After optimization
     ⛶ Free space: 88k (44.0%)
```

---

## NEW: Subagent Patterns & Best Practices

### When to Use Subagents
**Multiple sources agree on these use cases:**
- Complex tasks requiring 10-20+ minutes of autonomous work
- Domain-specific expertise (frontend, backend, security)
- Code review and quality assurance
- Research and codebase exploration

### Proactive Delegation (Pan Xinghan's Pattern)
Claude doesn't always use subagents proactively. Add to CLAUDE.md:

```markdown
## 👥 SUB-AGENT DELEGATION SYSTEM

**SMART DELEGATION: YOU HAVE SPECIALISTS AVAILABLE!**

### WORK BALANCE:
- **Simple Tasks (30%)**: Handle independently
- **Complex Tasks (70%)**: Delegate to specialists

**REMEMBER: You're a SMART MANAGER - delegate complex tasks!**
```

### Effective Subagent Configuration (Ben Ratcliffe)

```yaml
---
name: backend-architect
description: "Design APIs, microservice boundaries, and database schemas. MUST BE USED for architecture decisions."
tools: grep, view, edit
---

You are a senior backend architect specializing in distributed systems...
```

> **Key Insight (Ben Ratcliffe):** "Proactive phrases: Include 'MUST BE USED' or 'use PROACTIVELY' in agent descriptions to encourage automatic delegation."

### Subagent Anti-Patterns

| Anti-Pattern | Why It Fails | Source |
|--------------|--------------|--------|
| Automatic invocation expectation | Claude often handles directly without explicit prompt | Cheema |
| Complex multi-agent without orchestration | Debugging nightmare | rosmur |
| Gatekeeping context unnecessarily | Blocks useful information | Shrivu |

### Task(...) Clone Pattern (Shrivu Alternative)
Instead of custom subagents, use Claude's built-in Task(...) feature to spawn clones:

> **Key Insight (Shrivu):** "I find they are a powerful idea that, in practice, custom subagents create two new problems... My preferred alternative is to use Claude's built-in Task(...) feature to spawn clones of the general agent."

---

## Areas of Tension/Disagreement

### TENSION 1: Skills Implementation Strategy

**Position A: Heavy Custom Skills + Auto-Activation (Diet-Coder)**
- Create comprehensive skills (300-400 lines + resources)
- Build TypeScript hooks for automatic skill activation
- UserPromptSubmit hooks inject skill reminders

**Position B: Minimal Skills, Avoid Complexity (Shrivu)**
- Skills are the "right abstraction" but keep simple
- Prefer CLIs over complex tool systems
- Let Claude's built-in Task(...) handle delegation

**Reconciliation:** Start with Shrivu's minimal approach. Add Diet-Coder's hooks only if skills aren't activating.

---

### TENSION 2: Custom Subagents vs Clone Pattern

**Position A: Build Specialized Subagents (Diet-Coder, Community)**
- `code-architecture-reviewer`
- `build-error-resolver`
- Clear, specific roles

**Position B: Avoid Custom Subagents (Shrivu)**
- They gatekeep context
- They force human-defined workflows
- Use Task(...) to spawn clones instead

**Reconciliation:** Start with clone pattern. Add specialized subagents only for narrow, well-defined tasks.

---

### TENSION 3: Hook Complexity

**Position A: Comprehensive Hook System (Diet-Coder)**
- PostToolUse for edit tracking
- Stop hooks for build checking
- ⚠️ Prettier hook **DEPRECATED** (160k token drain discovered)

**Position B: Minimal Hooks (Shrivu)**
- Block-at-submit only (PreToolUse around git commit)
- Non-blocking hint hooks

> **Key Insight (Shrivu):** "We intentionally do not use 'block-at-write' hooks... Blocking an agent mid-plan confuses or even 'frustrates' it."

**Reconciliation:** Block at commit time, not write time. Avoid auto-formatting hooks.

---

### TENSION 4: MCP Usage Philosophy

**Position A: Minimal MCP, Gateway Model (Shrivu)**
> "If you're using more than 20k tokens of MCPs, you're crippling Claude."

MCP should be a "simple, secure gateway" providing:
- `download_raw_data(filters...)`
- `take_sensitive_gated_action(args...)`
- `execute_code_in_environment(code...)`

**Position B: Strategic MCP Usage (Community, Scott Spence)**
Essential MCPs from surveys:
- Filesystem MCP (file operations)
- Context7 (documentation lookup)
- Web search (Brave, Tavily)

**Reconciliation:** Both emphasize token efficiency. Use MCP only for: stateful environments, secure auth boundaries, simple data access. Otherwise: Build CLIs.

---

### TENSION 5: Extended Thinking Behavior

**⚠️ CRITICAL: OUTDATED INFORMATION IN CIRCULATION**

**Outdated Claim (April 2025, still circulating):**
> "These specific phrases are mapped directly to increasing levels of thinking budget: 'think' < 'think hard' < 'think harder' < 'ultrathink'"

**Current Reality (v2.0, October 2025+):**
- Extended thinking is **BINARY TOGGLE** - ON or OFF only
- Tab toggles thinking on/off (sticky)
- Keywords "think", "think hard", "ultrathink" ALL trigger same ON state
- No gradation between keywords

**Sources still propagating outdated info:**
- Original April 2025 Anthropic blog post
- Sid Bharath's guide
- Some community tutorials

**Recommendation:** Use Tab or any "think" keyword - all equivalent.

---

## Practical Tips Tables

### Context Management (Multi-Source Validated)

| Strategy | Source | Notes |
|----------|--------|-------|
| Clear at 60k tokens or 30% | rosmur synthesis | Before degradation |
| Use `/context` mid-session | Shrivu, Vibe Sparking | Visual monitoring |
| Avoid `/compact` | Shrivu | Prefer `/clear` |
| Document before clearing | Diet-Coder | External .md files |
| Use `/catchup` after clear | Shrivu, Diet-Coder | Restore context |
| Auto-compact at ~80% | Vibe Sparking | Community observed |

### CLAUDE.md Best Practices (Multi-Source Validated)

| Practice | Source | Notes |
|----------|--------|-------|
| Keep under 200 lines | Dzombak Dec 2025 | Token efficiency |
| Document what Claude gets wrong | Shrivu Nov 2025 | Focus on errors |
| Don't @-file docs | Shrivu Nov 2025 | Bloats context |
| Provide alternatives with "never" | Shrivu Nov 2025 | Explain what TO do |
| Use as forcing function | Shrivu Nov 2025 | Simplify tooling |
| Split by scope | Vibe Sparking | Project vs local CLAUDE.md |

### MCP Optimization (Scott Spence + Community)

| Strategy | Token Savings | Source |
|----------|---------------|--------|
| Consolidate similar tools | 60% | Scott Spence |
| Trim descriptions to 1 sentence | 75%+ per tool | Scott Spence |
| Use McPick to toggle servers | Variable | Scott Spence |
| Monitor with `/context` | - | Vibe Sparking |
| Set MAX_MCP_OUTPUT_TOKENS | - | Anthropic docs |
| Disable unused MCP servers | Variable | ClaudeLog |

### TDD Workflow (Multi-Source Validated)

| Step | Action | Source |
|------|--------|--------|
| 1 | Be explicit: "We're doing TDD" | Anthropic official |
| 2 | Write tests first (no implementation) | All TDD sources |
| 3 | Confirm tests fail | Anthropic, Steve Kinney |
| 4 | Commit failing tests | Anthropic official |
| 5 | Implement to pass tests | All |
| 6 | Use TDD Guard for enforcement | nizos/tdd-guard |

### Enterprise Patterns (Shrivu Nov 2025)

| Pattern | Description |
|---------|-------------|
| Token budget per tool docs | "Selling ad space" for tool documentation |
| 2 human approvals for AI PRs | Required for AI-initiated pull requests |
| GHA for "PR-from-anywhere" | Slack/Jira/CloudWatch → automated PR |
| Meta-analysis on session logs | Regular review of common errors |
| Usage-based pricing via API keys | Better than per-seat for variable usage |

---

## Anti-Patterns (Negative Consensus)

| Anti-Pattern | Why It Fails | Sources |
|--------------|--------------|---------|
| Heavy MCP usage (>20k tokens) | Cripples context window | Shrivu, Scott Spence |
| Auto-formatting hooks | Token drain from system-reminders | Diet-Coder update |
| Block-at-write hooks | Confuses agent mid-plan | Shrivu |
| Skipping planning | Jump to code = poor results | ALL sources |
| Assuming graduated thinking | Binary only (post-v2.0) | Verification |
| Long custom slash command lists | Defeats natural language purpose | Shrivu |
| RAG for code search | LLM search simpler/better | rosmur |
| Complex multi-agent without orchestration | Debugging nightmare | rosmur |
| Expecting automatic subagent invocation | Requires explicit prompts | Multiple Medium authors |
| Verbose MCP tool descriptions | Wastes context tokens | Scott Spence |
| Too many similar tools | LLM cognitive overload | Scott Spence |

---

## Key Community-Sourced Configurations

### Chris Dzombak's Streamlined CLAUDE.md (Dec 2025)

```markdown
# Development Guidelines

## Philosophy
### Core Beliefs
- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity
- **Single responsibility** per function/class
- **Avoid premature abstractions**
- **No clever tricks** - choose the boring solution

## Technical Standards
### Architecture Principles
- **Composition over inheritance** - Use dependency injection
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

### Error Handling
- **Fail fast** with descriptive messages
- **Include context** for debugging
- **Never** silently swallow exceptions

## Important Reminders
**NEVER**:
- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile

**ALWAYS**:
- Commit working code incrementally
- Update plan documentation as you go
- Stop after 3 failed attempts and reassess
```

### Diet-Coder's Dev Docs System (Oct 2025)

```markdown
### Starting Large Tasks

When exiting plan mode with an accepted plan:
1. **Create Task Directory**:
   mkdir -p ~/git/project/dev/active/[task-name]/

2. **Create Documents**:
   - `[task-name]-plan.md` - The accepted plan
   - `[task-name]-context.md` - Key files, decisions
   - `[task-name]-tasks.md` - Checklist of work

3. **Update Regularly**: Mark tasks complete immediately

### Continuing Tasks
- Check `/dev/active/` for existing tasks
- Read all three files before proceeding
```

### Harper Reed's Spec-Driven Pattern

```markdown
# Workflow
1. Use reasoning model (o1-pro/o3) to generate spec.md
2. Use reasoning model to generate prompt_plan.md
3. Save both to project root
4. Tell Claude to work through prompt_plan.md

# Continuation Prompt
1. Open @prompt_plan.md and identify incomplete prompts
2. For each incomplete prompt:
   - Verify if truly unfinished
   - Implement as described
   - Make sure tests pass
   - Commit with clear message
3. Mark as completed
```

### Zhu Liang's ROADMAP.md Pattern

```markdown
# Development Roadmap

## Overview
// High-level overview of the project

## Development Workflow
1. **Task Planning**
   - Study existing codebase and understand current state
   - Update ROADMAP.md to include new task
   - Priority tasks inserted after last completed task

2. **Implementation**
   - Agent reads all context before proceeding
   - Updates "Last Updated" timestamps
```

---

## Decision Framework: When Sources Conflict

**Hierarchy when community sources disagree:**

1. **Official Anthropic docs (current)** - Highest authority
2. **Sources from November-December 2025** - Most current practices
3. **Practical experience with token/context data** - Empirical validation
4. **Multiple community sources agreeing** - Wisdom of crowds
5. **Single source claims** - Verify before adopting

**Red flags for outdated information:**
- References to graduated thinking levels
- Pre-v2.0 mechanics (before October 2025)
- No verification against current docs
- Conflicts with recent GitHub issue discussions

---

## Source Reliability Criteria

### ⭐⭐⭐⭐⭐ High Reliability
- Source from Nov-Dec 2025
- Verified against official docs
- Includes specific version numbers
- Provides token/cost data
- Examples: Shrivu, Dzombak, Scott Spence

### ⭐⭐⭐⭐ Good Reliability
- Source from Aug-Oct 2025
- Detailed practical experience
- Some verification needed
- Examples: Diet-Coder, Zhu Liang, Harper Reed

### ⭐⭐⭐ Moderate Reliability
- Source from May-July 2025
- May have outdated mechanics
- Cross-reference required
- Examples: Earlier blog posts, some Medium articles

### ⭐⭐ Lower Reliability
- Pre-May 2025 sources
- Single Reddit posts without corroboration
- Sources citing graduated thinking scale
- No version context provided

---

## Key Themes Across All Reliable Sources

1. **Simplicity wins** - Minimal CLAUDE.md, focused hooks, simple tools
2. **Context is everything** - Aggressive clearing, external documentation
3. **Planning is non-negotiable** - Always plan before implementing
4. **Human oversight remains critical** - Review all AI-generated code
5. **Information currency matters** - Verify claims against recent sources
6. **TDD is highly effective** - Best counter to hallucination and scope drift
7. **MCP needs optimization** - Token efficiency is crucial
8. **Subagents require explicit direction** - Don't expect automatic delegation

---

## Quick Reference Links

### Official Resources
- [Claude Code Best Practices (Anthropic)](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [MCP Documentation](https://docs.claude.com/en/docs/claude-code/mcp)

### Essential Community Resources
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) - Curated resource collection
- [Scott Spence's MCP Optimization](https://scottspence.com/posts/optimising-mcp-server-context-usage-in-claude-code)
- [TDD Guard](https://github.com/nizos/tdd-guard) - TDD enforcement tool

### Usage Monitoring Tools
- ccusage - Token usage tracking
- McPick - MCP server toggling
- /context command - Built-in context visualization

---

## Conclusion

The Claude Code community has developed sophisticated practices through intensive real-world use. This appendix synthesizes **20+ sources** from **July-Dec 2025**, documenting areas of consensus, tension, and practical patterns.

**Start with:**
1. Minimal CLAUDE.md (Dzombak style)
2. Planning mode before implementation
3. TDD workflow (Harper Reed style)
4. Context monitoring with `/context`

**Add complexity only when needed:**
1. Skills auto-activation hooks (Diet-Coder)
2. Custom subagents for specific domains
3. MCP optimization (Scott Spence approach)

When in doubt, start simple and iterate based on your specific needs.

---

## Update Log

| Date | Version | Changes |
|------|---------|---------|
| Dec 9, 2025 | v3.0 | Major expansion: 15+ new sources, MCP optimization section, subagent patterns, TDD workflows, source reliability tiers |
| Dec 9, 2025 | v2.0 | Initial compilation, 7 sources, tension analysis, anti-patterns |
