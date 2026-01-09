# CLAUDE.md Best Practices (Updated Guide)

> **Last Updated:** December 9, 2025  
> **Primary Sources:**  
> - Anthropic Engineering Blog (April 18, 2025) - Original best practices
> - Claude Product Blog (November 25, 2025) - Updated CLAUDE.md guidance
> - HumanLayer Research (November 25, 2025) - System-reminder discovery
> - Claude Code v2.0 Release (October 2025) - Thinking mode changes
> **Status:** Verified against official sources December 2025

## Source Attribution Corrections

**IMPORTANT:** The previous version of this guide incorrectly stated the Anthropic best practices blog was from "November 25, 2025." The actual dates are:

| Source | Actual Date | Content |
|--------|-------------|---------|
| [Anthropic Engineering Blog](https://www.anthropic.com/engineering/claude-code-best-practices) | **April 18, 2025** | Original Claude Code best practices |
| [Claude Product Blog](https://claude.com/blog/using-claude-md-files) | **November 25, 2025** | Updated CLAUDE.md-specific guidance |
| [HumanLayer Research](https://www.humanlayer.dev/blog/writing-a-good-claude-md) | **November 25, 2025** | System-reminder discovery |

---

## What is CLAUDE.md?

CLAUDE.md is a special configuration file that Claude Code **automatically incorporates into every conversation**. It provides persistent context about your project:

- **Onboarding documentation** for your AI pair programmer
- **Project memory** that persists across sessions
- **Constraint engine** that shapes Claude's behavior
- **Team knowledge base** shared via version control

### Why It Matters

From the November 2025 Claude blog:
> "If you use AI coding agents, you face the same challenge: how do you give them enough context to understand your architecture, conventions, and workflows without repeating yourself? CLAUDE.md files solve this by giving Claude persistent context about your project."

---

## Critical Discovery: The System Reminder

**Research from HumanLayer (November 25, 2025):** By proxying Claude Code's API calls, researchers discovered that Claude Code injects a system reminder with your CLAUDE.md:

```xml
<system-reminder>
IMPORTANT: this context may or may not be relevant to your tasks. 
You should not respond to this context unless it is highly relevant to your task.
</system-reminder>
```

### Key Implications

| Finding | Impact |
|---------|--------|
| Claude evaluates CLAUDE.md relevance | Non-universal instructions get ignored |
| More instructions = more ignored | Bloated files underperform |
| This is intentional design | To filter "hotfix" accumulation |
| Less is genuinely more | Focused content wins |

**Why Anthropic Added This:**
> "Most CLAUDE.md files we come across include a bunch of instructions in the file that aren't broadly applicable. Many users treat the file as a way to add 'hotfixes' to behavior they didn't like by appending lots of instructions that weren't necessarily broadly applicable." — HumanLayer

### Instruction Limits Research

HumanLayer cites research indicating:
- **Frontier thinking LLMs can follow ~150-200 instructions** with reasonable consistency
- **Claude Code's system prompt contains ~50 instructions** already
- Smaller models exhibit exponential decay in instruction-following as instruction count increases
- Larger frontier models exhibit linear decay

**Critical Insight:** Your CLAUDE.md has approximately **100-150 instruction slots** before degradation begins.

---

## File Locations & Hierarchy

### Priority Order (Highest → Lowest)

```
1. CLAUDE.local.md (Project)
   └─ Personal overrides, gitignored

2. CLAUDE.md (Project Root)
   └─ Team-shared, version controlled

3. Parent Directory CLAUDE.md files
   └─ Monorepo root configs

4. Child Directory CLAUDE.md files
   └─ Loaded on-demand when working in subdirectories

5. ~/.claude/CLAUDE.md (User Global)
   └─ Applies to all projects
```

### Location Guidelines

| Location | Scope | Version Control | Use Case |
|----------|-------|-----------------|----------|
| `./CLAUDE.md` | Project | ✅ Recommended | Main project config |
| `./CLAUDE.local.md` | Personal | ❌ Gitignored | Personal preferences |
| `~/.claude/CLAUDE.md` | Global | N/A | Cross-project defaults |
| Parent dirs | Hierarchical | ✅ Yes | Monorepo shared context |
| Child dirs | On-demand | ✅ Yes | Subdirectory-specific |

---

## The Three Pillars: WHAT, WHY, HOW

From HumanLayer's November 2025 research:

### WHAT - Give Claude a Map
- Tech stack and key versions
- Project structure and key directories
- Module relationships (especially in monorepos)

### WHY - Explain Purpose
- Purpose of the project
- Function of different components
- Domain context that aids understanding

### HOW - Working Instructions
- Build and test commands
- Package manager preferences (bun vs npm, etc.)
- Verification procedures

---

## Progressive Disclosure Strategy

**Key Principle:** Don't put everything in CLAUDE.md. Instead, tell Claude *how to find* information.

### Implementation

Create a documentation structure:
```
agent_docs/
  ├── building_the_project.md
  ├── running_tests.md
  ├── code_conventions.md
  ├── service_architecture.md
  ├── database_schema.md
  └── service_communication_patterns.md
```

Then in CLAUDE.md, reference these files:
```markdown
## Documentation
For detailed information, read the relevant file in `agent_docs/`:
- Building: agent_docs/building_the_project.md
- Testing: agent_docs/running_tests.md
- Architecture: agent_docs/service_architecture.md

Read relevant docs before starting work on related areas.
```

**Key Insight:** "Prefer pointers to copies. Don't include code snippets in these files if possible—they will become out-of-date quickly. Instead, include `file:line` references to point Claude to the authoritative context." — HumanLayer

---

## Using /init

The `/init` command analyzes your project and generates a starter CLAUDE.md.

### How to Use
```bash
cd your-project
claude
/init
```

### Important Guidance (November 2025)

From the official Claude blog:
> "Think of /init as a starting point, not a finished product. The generated CLAUDE.md captures obvious patterns but may miss nuances specific to your workflow."

**HumanLayer strongly recommends against auto-generation:**
> "Because CLAUDE.md goes into every single session with Claude code, it is one of the highest leverage points of the harness—for better or for worse, depending on how you use it... we think you should spend some time thinking very carefully about every single line that goes into it."

### After Running /init

1. Review generated content for accuracy
2. Add workflow instructions Claude couldn't infer
3. Remove generic guidance that doesn't apply
4. Commit to version control

---

## Extended Thinking: What Changed in v2.0

### CRITICAL UPDATE (October 2025)

**Claude Code v2.0 deprecated the multi-tier thinking keyword system.** The previous system:
- "think" → 4,000 tokens
- "think hard" / "megathink" → 10,000 tokens  
- "think harder" / "ultrathink" → 31,999 tokens

**Current System (v2.0+):**
- **Tab key** toggles thinking mode on/off (binary)
- **"ultrathink"** keyword still works (retained for backward compatibility)
- Other keywords ("think hard", "megathink") appear deprecated

### Configuration Options

```json
// ~/.claude/settings.json
{
  "alwaysThinkingEnabled": true  // Undocumented but functional
}
```

Or set environment variable:
```bash
MAX_THINKING_TOKENS=31999
```

### Practical Guidance

| Task Type | Thinking Mode |
|-----------|---------------|
| Simple questions | Off (Tab to disable) |
| Code exploration | Off |
| Planning & architecture | On + "ultrathink" |
| Debugging complex issues | On |
| Quick edits | Off |

---

## What TO Include

### Universally Applicable Content

```markdown
# Project Context

## About This Project
FastAPI REST API for user authentication. SQLAlchemy + Pydantic.

## Key Directories
- `app/models/` - database models
- `app/api/` - route handlers
- `app/core/` - configuration

## Standards
- Type hints required on all functions
- pytest for testing
- PEP 8 with 100 char lines

## Commands
uvicorn app.main:app --reload  # dev
pytest tests/ -v               # test
```

### Workflow Instructions

```markdown
## Standard Workflow
1. Before modifying code: understand current state first
2. Create a plan before implementation
3. Identify what information is missing
4. Define how to test changes

## Before Coding in: X, Y, Z
- Consider impact on: A, B, C
- Create implementation plan
- Create test plan
```

---

## What NOT to Include

### Code Style Guidelines
> "Never send an LLM to do a linter's job. LLMs are comparably expensive and incredibly slow compared to traditional linters and formatters. We think you should always use deterministic tools whenever you can." — HumanLayer

**Better approach:** Set up a Claude Code Stop hook that runs your formatter/linter.

### Non-Universal Instructions
- Task-specific directions (use progressive disclosure)
- Instructions for specific scenarios
- "Hotfixes" for one-time issues

### Sensitive Information
- API keys or credentials
- Database connection strings
- Security vulnerability details

---

## The # Key: Live Memory

Press `#` during a session to give Claude an instruction it will automatically incorporate into the relevant CLAUDE.md.

**Use for:**
- Commands you find yourself repeating
- Style guidelines discovered during work
- Patterns that should persist

**Workflow:**
1. Notice you're repeating an instruction
2. Press `#` and type the instruction
3. Claude adds it to CLAUDE.md
4. Include CLAUDE.md changes in commits

---

## Recommended File Length

**Community consensus (November 2025):** Less than 300 lines, shorter is better.

**HumanLayer's example:** Their root CLAUDE.md is less than 60 lines.

### Why Shorter is Better

1. **System-reminder causes ignore behavior** for non-relevant content
2. **Instruction limits** (~150-200 max for frontier models, minus ~50 for system prompt)
3. **Token cost** - CLAUDE.md goes into every request
4. **Focus** - Universally applicable > comprehensive

---

## Template: Minimal Effective CLAUDE.md

```markdown
# Project: [Name]

## About
[2-3 sentence description of what this project does]

## Stack
- [Language/Framework]
- [Key libraries]
- [Database if applicable]

## Structure
- `src/` - [purpose]
- `tests/` - [purpose]
- `docs/` - [purpose]

## Commands
```bash
[build command]
[test command]
[lint command]
```

## Workflow
1. Understand before modifying
2. Plan before coding
3. Test after implementing

## Notes
[Any critical gotchas or non-obvious behaviors]
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Better Approach |
|--------------|--------------|-----------------|
| Exhaustive style guides | Ignored; expensive | Use linters |
| Task-specific instructions | Non-universal = ignored | Progressive disclosure |
| Long narrative explanations | Token waste | Short bullet points |
| Auto-generated without review | Missing nuance | Manual curation |
| Accumulated "hotfixes" | Bloat; contradictions | Periodic cleanup |
| Code snippets | Become outdated | File:line references |
| Repeated emphasis (IMPORTANT!!!) | Doesn't help | Clear, direct language |

---

## Maintenance & Evolution

### Periodic Review

1. **Weekly:** Add patterns discovered via `#` key
2. **Monthly:** Remove instructions that aren't universal
3. **Per-release:** Update commands, structure references

### Evolution Signs

**Add to CLAUDE.md when:**
- You repeat the same instruction 3+ times
- Multiple team members need the same context
- A pattern is universally applicable

**Remove from CLAUDE.md when:**
- An instruction is task-specific
- Something is better handled by tooling
- A "hotfix" is no longer needed

---

## Quick Reference

### Commands
| Command | Purpose |
|---------|---------|
| `/init` | Generate starter CLAUDE.md |
| `#` key | Add instruction to CLAUDE.md |
| `/clear` | Reset context (preserves CLAUDE.md) |
| Tab | Toggle thinking mode (v2.0+) |

### Token Guidance
- CLAUDE.md: Aim for <500 tokens
- Total instructions: <150 (including ~50 from system)
- Extended thinking budget: 31,999 tokens max (ultrathink)

### Key Principles
1. **Less is more** - Fewer, universal instructions win
2. **Progressive disclosure** - Point to docs, don't include them
3. **System-reminder aware** - Non-relevant content gets ignored
4. **Linters > LLMs** - Use deterministic tools for style
5. **Evolve deliberately** - Curate, don't accumulate

---

## References

### Official Anthropic Sources
- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices) (April 18, 2025)
- [Using CLAUDE.md files: Customizing Claude Code](https://claude.com/blog/using-claude-md-files) (November 25, 2025)
- [Claude Code Documentation](https://code.claude.com/docs)

### Research & Community
- [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) - HumanLayer (November 25, 2025)
- [12-Factor Agents](https://github.com/humanlayer/12-factor-agents) - Context engineering principles
- [ClaudeLog](https://claudelog.com/) - Community documentation

### Version History
- **Claude Code v2.0** (October 2025): Binary thinking toggle via Tab
- **Skills System** (October 16, 2025): Progressive disclosure alternative

---

## Changelog

### v3.0 (December 9, 2025)
**Major Updates:**
- **CORRECTED** source dating (original blog is April 18, 2025, not November)
- **ADDED** November 25, 2025 official Claude blog guidance
- **ADDED** HumanLayer system-reminder research (November 25, 2025)
- **UPDATED** thinking mode section for Claude Code v2.0 changes
- **ADDED** instruction limit research (~150-200 max)
- **ADDED** guidance on /init usage and limitations
- **ENHANCED** progressive disclosure section with HumanLayer recommendations
- **ADDED** alwaysThinkingEnabled setting documentation
- **REMOVED** outdated multi-tier thinking keyword guidance

### v2.0 (December 5, 2025)
- Initial expanded guide
- HumanLayer research integration
- Token optimization techniques

### v1.0
- Original compilation from Anthropic blog
