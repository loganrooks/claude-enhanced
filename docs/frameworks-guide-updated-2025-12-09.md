# Claude Code Frameworks Guide

> **Last Updated:** December 9, 2025  
> **Claude Code Version:** v2.0+  
> **Purpose:** Third-party frameworks, orchestration tools, and workflow systems that extend Claude Code

---

## Overview

The Claude Code ecosystem has matured significantly in 2025, with multiple frameworks emerging to provide structure, specialized workflows, and multi-agent orchestration. This guide covers major frameworks, their use cases, installation, and helps you choose the right approach for your needs.

**Framework Landscape (December 2025):**

| Framework | Focus | Complexity | Stars | Active |
|-----------|-------|------------|-------|--------|
| SuperClaude | Personas, workflows, commands | Medium | 13.8k+ | ✅ v4.2 |
| BMAD Method | Full SDLC, agile agents | High | - | ✅ v4.43+ |
| Claude-Flow | Multi-agent swarms, orchestration | High | 10.4k+ | ✅ v2.7+ |
| CCO | Standards, audits, safety | Low | - | ✅ |
| Task Master | AI task management, PRD parsing | Medium | 24.2k+ | ✅ |
| Simone | Project management workflows | Medium | - | ✅ |
| DIY | Custom slash commands, hooks | Low | N/A | ✅ |

---

## Part 1: SuperClaude Framework

SuperClaude is a meta-programming configuration framework that enhances Claude Code with specialized commands, cognitive personas, and development methodologies. It transforms Claude Code into a structured development platform through behavioral instruction injection.

### Current Status (December 2025)

- **Version:** v4.2 (v5.0 with TypeScript plugin system planned)
- **Stars:** 13.8k+ on GitHub
- **License:** MIT
- **Maintainer:** NomenAK / SuperClaude-Org

### Key Features

**19 Specialized Commands across four categories:**

Development:
- `/build` - Compile/packaging
- `/code` - Implementation
- `/debug` - Problem solving

Analysis:
- `/analyze` - Code analysis
- `/optimize` - Performance optimization
- `/refactor` - Code restructuring
- `/review` - Code review
- `/audit` - Security/performance audits

Quality:
- `/test` - Testing workflows
- `/design` - Architecture and design

Deployment:
- `/deploy` - Deployment planning

**9 Cognitive Personas:**
- 🏗️ `architect` - System design and architecture
- 🔒 `security` - Security review and hardening
- ⚙️ `devops` - CI/CD and infrastructure
- 🎨 `frontend` - UI/UX specialist
- 🔧 `backend` - Server-side development
- 📊 `analyzer` - Deep analysis
- ⚡ `performance` - Optimization specialist
- 🧪 `qa` - Quality assurance
- 📚 `mentor` - Teaching and explanation

**Token Optimization:**
- Claims ~70% token reduction through UltraCompressed mode
- `@include` template system for configuration management

### Installation

**Option 1: PyPI (Recommended)**
```bash
# Install using pipx (isolated)
pipx install superclaude
superclaude install

# Verify installation
superclaude install --list
superclaude doctor
```

**Option 2: pip**
```bash
pip install SuperClaude
# Or user installation
pip install --user SuperClaude

SuperClaude install --quick
```

**Option 3: Git Clone**
```bash
git clone https://github.com/NomenAK/SuperClaude.git
cd SuperClaude
./install.sh

# Advanced options
./install.sh --dir /custom/path    # Custom location
./install.sh --update              # Update existing
./install.sh --dry-run --verbose   # Preview changes
```

**MCP Server Integration (Optional):**
```bash
superclaude mcp --list                           # List available
superclaude mcp --servers tavily context7        # Install specific
superclaude mcp                                  # Interactive
```

### Usage Examples

```bash
# Architecture and design phase
/design --api --ddd --architect

# Implementation with testing
/build --feature --tdd --backend

# Quality assurance
/test --coverage --e2e --qa

# Security review
/audit --security --performance

# Deployment planning
/deploy --env staging --plan --ops
```

**Using Personas as Flags:**
```bash
/analyze --frontend          # Frontend specialist analysis
/optimize --performance      # Performance-focused optimization
/review --security           # Security-focused code review
/refactor --architect        # Architectural refactoring
```

**Introspection (Debug SuperClaude):**
```bash
/troubleshoot --introspect       # Debug SuperClaude behavior
/analyze --introspect --seq      # Analyze framework patterns
/improve --introspect --uc       # Optimize token usage
```

### What Changed in v4

- **Hooks System Removed:** Was complex and buggy; planned return in v4 with redesign
- **v3→v4 Migration:** Must uninstall v3 completely before installing v4
- **Personas as Flags:** 9 cognitive personas integrated into flag system
- **Streamlined Architecture:** `@include` reference system for configuration
- **Modular Design:** Template system for adding new commands

### When to Use SuperClaude

**Good for:**
- Teams wanting structured personas and workflows
- Complex projects needing role separation
- Developers seeking consistent AI-assisted sessions
- Projects that benefit from specialized expertise modes

**Not ideal for:**
- Simple projects or quick prototyping
- Token-constrained environments (adds overhead)
- Teams preferring minimal configuration
- Projects requiring other AI assistant compatibility

### Community Notes

> "SuperClaude's structured approach dramatically improves consistency across AI-assisted sessions. The cognitive personas and specialized commands help maintain focus and apply best practices automatically." — ClaudeLog

> "IMHO if you have a long list of complex, custom slash commands, you've created an anti-pattern." — Shrivu Shankar

---

## Part 2: BMAD Method

BMAD (Breakthrough Method for Agile AI-Driven Development) is a comprehensive AI-driven development orchestration framework that provides structured, guided workflows powered by specialized AI agents.

### Current Status (December 2025)

- **Version:** v4.43.1 (v6 Alpha announced)
- **NPM Package:** `bmad-method`
- **License:** MIT (BMAD™ is a trademark of BMad Code, LLC)
- **Website:** bmadcodes.com

### Key Features

**19 Specialized Agents with distinct personas:**

Planning Agents:
- **Mary (Analyst)** - "Treats analysis like a treasure hunt"
- **Ollie (Product Manager)** - Product requirements and vision
- **Winston (Architect)** - "Champions boring technology that actually works"

Development Agents:
- **Sam (Scrum Master)** - Sprint and story management
- **Dave (Developer)** - Implementation specialist
- **Quinn (QA)** - Testing and validation

Additional Specialists:
- **Uma (UX Designer)** - User experience
- **Theo (Test Architect)** - Test strategy
- **Devin (DevOps)** - Infrastructure and deployment

**50+ Guided Workflows across 4-phase lifecycle:**

1. **Analysis (Optional)** - Brainstorm, research, explore solutions
2. **Planning** - Create PRDs, tech specs, game design documents
3. **Solutioning** - Design architecture, UX, technical approach
4. **Implementation** - Story-driven development with continuous validation

**Document Sharding:**
- 90% token savings for large projects
- Atomic, AI-digestible document pieces
- Prevents hallucination, maintains consistency

**10+ IDE Integrations:**
- Claude Code, Cursor, Roo, Windsurf, VSCode
- Polymorphic handler architecture
- No hardcoded list—extensible for new IDEs

### Installation

```bash
# Install globally
npm install -g bmad-method

# Or run directly with npx
npx bmad-method install

# Check status
npx bmad-method status

# List available agents
npx bmad-method list

# Upgrade existing installation
npx bmad-method install  # Auto-detects and upgrades
```

**For Claude Code specifically:**
```bash
npx bmad-method install
# Select "Claude Code" when prompted for IDE
```

This creates:
- `.bmad/` directory with agents and workflows
- Slash commands for agent activation (`/agent-name`)

### Directory Structure (v4+)

```
.bmad/
├── _cfg/                    # Configuration & customization
│   ├── manifest.yaml        # Installation tracking
│   ├── agents/              # Custom agent customizations
│   │   └── *.customize.yaml
│   └── custom/
│       └── agents/          # User-created agents
├── agents/                  # Compiled agent files
│   └── *.agent.yaml
├── workflows/               # Workflow definitions
│   └── */workflow.yaml
├── templates/               # Shared templates
├── data/                    # Shared data files
└── knowledge/               # Knowledge bases
```

### Usage Examples

**Web UI Planning Phase:**
```bash
*help            # Show available commands
*analyst         # Start with analyst for project brief
*pm              # Switch to Product Manager for PRD
*architect       # Design architecture
```

**Claude Code Implementation:**
```bash
# In Claude Code
/pm Create a PRD for a task management app
/architect Design a microservices architecture
/dev Implement story 1.3
```

**Workflow Initialization:**
```bash
*workflow-init   # Let BMad analyze project and recommend track
```

### Three Intelligent Tracks

BMAD adapts to your needs:

1. **Solo/Startup Track** - Rapid iteration for small teams
2. **Team Track** - Structured collaboration for medium teams
3. **Enterprise Track** - Full governance for large organizations

### Document Sharding Example

Instead of a 50-page PRD, segment into:
- Core requirements per feature
- Technical constraints
- User stories
- Acceptance criteria

Each shard becomes focused context that prevents AI hallucination.

### When to Use BMAD

**Good for:**
- Large projects with multiple phases
- Teams needing structured planning
- Projects requiring comprehensive documentation
- Organizations wanting full agile workflow with AI
- Multi-stakeholder projects

**Not ideal for:**
- Small features or quick iterations
- Solo developers wanting minimal process
- Projects not following agile methodology
- Simple automation tasks

### v6 Alpha Preview

Announced features:
- Scale Adaptive Framework (solo → team → enterprise)
- BMad Core - Lean foundation for predictable results
- Custom Language & Custom Agents
- Project Types & Reference Architectures
- BMad Builder - Visual/CLI assembly of agents and workflows

---

## Part 3: Claude-Flow

Claude-Flow is an enterprise-grade agent orchestration platform featuring swarm intelligence, multi-agent coordination, and native Claude Code MCP integration.

### Current Status (December 2025)

- **Version:** v2.7.1+ (alpha)
- **Stars:** 10.4k+ on GitHub
- **NPM Package:** `claude-flow`
- **Companion:** `agentic-flow` (v1.7.7)
- **License:** MIT
- **Maintainer:** ruvnet

### Key Features

**64 Specialized Agents:**
- 12 distinct categories
- 25 organized subdirectories
- YAML frontmatter with markdown documentation
- Full MCP tool integration with 87+ tools

**Swarm Intelligence:**
- Hive-Mind coordination (Queen-led)
- Neural networks with 27+ cognitive models
- Cross-session learning
- Pattern-based reasoning with semantic understanding

**4 Topology Types:**
- **Hierarchical** - Tree structure with clear chain of command
- **Mesh** - Peer-to-peer agent communication
- **Ring** - Sequential task passing
- **Star** - Central coordinator with worker agents

**Memory System:**
- Persistent SQLite storage (`.swarm/memory.db`)
- 2-3ms query latency for semantic searches
- No API keys required (hash-based embeddings)
- Maximal Marginal Relevance search with 4-factor scoring

### Installation

```bash
# Install globally (alpha)
npm install -g claude-flow@alpha

# Or use with npx (recommended)
npx claude-flow@alpha swarm init

# Memory operations (auto-patches AgentDB)
npx claude-flow@alpha memory store mykey "myvalue"
```

### MCP Configuration

Add to Claude Code MCP settings:
```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "npx",
      "args": ["claude-flow@alpha", "mcp"]
    }
  }
}
```

### Usage Examples

**Initialize Swarm:**
```bash
# Basic swarm initialization
npx claude-flow@alpha swarm init myproject --topology hierarchical

# With specific agent configuration
npx claude-flow@alpha swarm init workflow-pool \
  --topology star \
  --agents "coder:5,tester:3,reviewer:2" \
  --idle-timeout 300
```

**Hive-Mind Operations:**
```bash
# Spawn with hive-mind intelligence
npx claude-flow@alpha hive-mind spawn "build microservices" --topology hierarchical

# Interactive wizard
npx claude-flow@alpha hive-mind wizard
```

**SPARC TDD Workflow:**
```bash
npx claude-flow@alpha sparc tdd "implement payment system" \
  --agents specification,pseudocode,architecture,refinement
```

**Workflow Orchestration:**
```yaml
# Example workflow definition
name: comprehensive-review
description: Multi-aspect code review process
stages:
  - name: static-analysis
    agents:
      - code-analyzer
      - security-scanner
    parallel: true
  - name: functional-review
    agents:
      - reviewer
      - tdd-london-swarm
    parallel: true
  - name: integration
    agents:
      - integration-tester
      - production-validator
    sequential: true
```

### Critical Usage Rules

Claude-Flow enforces parallel operations for efficiency:

```javascript
// ✅ CORRECT: Batch all operations
[BatchTool - Message 1]:
  mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 8 }
  mcp__claude-flow__agent_spawn { type: "coder", name: "Backend Dev" }
  mcp__claude-flow__agent_spawn { type: "tester", name: "QA Engineer" }
  mcp__claude-flow__agent_spawn { type: "reviewer", name: "Code Reviewer" }

// ❌ WRONG: Sequential operations (5x slower)
Message 1: mcp__claude-flow__swarm_init
Message 2: mcp__claude-flow__agent_spawn (one agent)
Message 3: mcp__claude-flow__agent_spawn (another agent)
```

### Domain-Specific Templates

```bash
# Data science project
npx claude-flow@alpha init --template data_science --agents 8

# Statistical analysis
npx claude-flow@alpha init --template statistical_analysis --agents 6

# Medium team setup
npx claude-flow@alpha init --template medium_team_structured
```

### When to Use Claude-Flow

**Good for:**
- Large codebases needing parallel work
- Complex orchestration scenarios
- Enterprise-grade multi-team coordination
- Research/experimentation with multi-agent systems
- Projects requiring swarm intelligence

**Not ideal for:**
- Simple projects
- Cost-sensitive environments (high token usage)
- Teams new to agentic coding
- Projects not requiring parallel execution

### Community Comparison

> "Claude Flow community is actively comparing their swarm approach with Claude Code's native sub-agents. Early adopters report excellent results for complex, multi-team projects but note the higher complexity compared to native sub-agents."

---

## Part 4: ClaudeCodeOptimizer (CCO)

CCO is a lightweight process and standards layer for Claude Code, providing project tuning, structured audits, and safe refactoring workflows.

### Philosophy

```
Claude/Opus 4.5 already knows:     CCO adds:
─────────────────────────────       ─────────────────────────────
• Writing good code                 • Pre: git safety checks
• Security best practices           • Process: approval workflows
• Refactoring patterns              • Post: verification
• Test generation                   • Context: project parameters
```

### Current Status (December 2025)

- **PyPI Package:** `claudecodeoptimizer`
- **License:** MIT
- **Maintainer:** sungurerdim

### Key Features

- Pre/post workflow checks
- Consistent standards enforcement
- Git safety checks
- Project-specific tuning
- Statusline integration

### Installation

```bash
# pip (recommended)
pip install claudecodeoptimizer && cco-setup

# pipx (isolated)
pipx install claudecodeoptimizer && cco-setup

# Development
pip install git+https://github.com/sungurerdim/ClaudeCodeOptimizer.git && cco-setup
```

**Project-level setup:**
```bash
# Install statusline and permissions to current project
cco-setup --local . --statusline full --permissions balanced

# Statusline only
cco-setup --local . --statusline minimal

# Permissions only
cco-setup --local . --permissions balanced
```

### Three-Tier Standards

**Universal Standards (All Projects):**
```
~/.claude/CLAUDE.md ← cco-standards.md
├── Quality Standards
├── Documentation Standards
├── Workflow Standards
└── Error Handling Standards
```

**Conditional Standards (Filtered by project type):**
```
./CLAUDE.md ← cco-standards-conditional.md
├── Security Standards (if security-sensitive)
├── API Standards (if API project)
├── Frontend Standards (if frontend)
└── Performance Standards (if performance-critical)
```

### Key Commands

```bash
/cco-tune      # Generate project-specific CLAUDE.md
/cco-audit     # Run structured audit
/cco-refactor  # Safe refactoring workflow
```

### CCO-MCP: Real-Time Audit System

A separate companion tool for monitoring Claude Code tool calls:

```bash
git clone https://github.com/onegrep/cco-mcp.git
cd cco-mcp
docker-compose up
```

**Features:**
- Real-time tool call monitoring via SSE
- Rule-based auto-approval for safe operations
- Manual approval for sensitive operations
- Web dashboard at `http://localhost:8660`
- Configurable deny timeout and entry TTL

**Claude Code Integration:**
```bash
claude code -p "your prompt" \
  --permission-prompt-tool mcp__cco-mcp__approval_prompt
```

### When to Use CCO

**Good for:**
- Teams wanting light governance
- Projects needing consistent standards
- Existing workflows that need guardrails
- CI/CD integration with auditing

**Not ideal for:**
- Teams needing heavy customization
- Unique workflow requirements
- Projects requiring complex orchestration

---

## Part 5: Task Master

Task Master is an AI-powered task management system designed for AI-driven development workflows with PRD parsing, task management, and complexity analysis.

### Current Status (December 2025)

- **Stars:** 24.2k+ on GitHub
- **NPM Package:** `task-master-ai`
- **Language:** Go
- **Maintainer:** Eyal Toledano

### Key Features

- **PRD Parsing:** Automatically parse PRD documents into structured tasks
- **Intelligent Task Sequencing:** Determines dependencies and priorities
- **Complexity Analysis:** Identifies tasks needing breakdown
- **Research Integration:** Perplexity AI for research-backed subtask generation
- **Multi-Model Support:** Claude, OpenAI, Perplexity, Gemini, OpenRouter

### Installation

**MCP Installation (Recommended):**
```bash
# Core mode (~70% token reduction)
claude mcp add task-master-ai --scope user \
  --env TASK_MASTER_TOOLS="core" \
  -- npx -y task-master-ai@latest

# Standard mode (15 tools)
claude mcp add task-master-ai --scope user \
  --env TASK_MASTER_TOOLS="standard" \
  -- npx -y task-master-ai@latest

# All tools (36 tools)
claude mcp add task-master-ai --scope user \
  --env TASK_MASTER_TOOLS="all" \
  -- npx -y task-master-ai@latest
```

**CLI Installation:**
```bash
# Global
npm install -g task-master-ai

# Local
npm install task-master-ai
```

### Tool Modes

| Mode | Tools | Use Case |
|------|-------|----------|
| Core | 7 | Large projects, minimize tokens |
| Standard | 15 | New users, good balance |
| All | 36 | Complex workflows, full features |

**Core Tools (7):**
- `get_tasks`, `next_task`, `get_task`
- `set_task_status`, `update_subtask`
- `parse_prd`, `expand_task`

**Standard Tools (15):**
- All core tools plus:
- `initialize_project`, `analyze_project_complexity`
- `expand_all`, `add_subtask`, `remove_task`
- `generate`, `add_task`, `complexity_report`

### Workflow

1. **Create PRD:**
   ```
   .taskmaster/docs/prd.txt
   ```

2. **Parse PRD into tasks:**
   ```
   > Can you parse my PRD and set up initial tasks?
   ```

3. **Analyze complexity:**
   ```
   > Can you run task-master analyze-complexity?
   ```

4. **Break down complex tasks:**
   ```
   > Help me break down all high complexity tasks
   ```

5. **Implement:**
   ```
   > Implement task 1 and all of its subtasks
   ```

6. **Get next task:**
   ```
   > What's the next task I should work on?
   ```

### Claude Code Integration

Task Master works directly with Claude Code CLI (no API key needed):

```bash
# Available models
claude-code/opus
claude-code/sonnet
```

### When to Use Task Master

**Good for:**
- Complex projects needing task breakdown
- PRD-driven development
- Teams wanting structured task management
- Projects with multiple dependencies

**Not ideal for:**
- Simple projects without PRDs
- Quick prototyping
- Projects not following task-based workflows

---

## Part 6: Simone

Simone is a comprehensive project and task management system designed for AI-assisted development workflows.

### Current Status

- **Repository:** Helmi/claude-simone
- **License:** MIT
- **Focus:** Project management with AI assistance

### Key Features

- Structured prompts for project understanding
- Document management system
- Guidelines and processes for planning/execution
- Task lifecycle management

### When to Use Simone

**Good for:**
- Broader project management needs
- Teams wanting document-centric workflows
- Projects requiring planning and execution guidance

---

## Part 7: RIPER Workflow

RIPER is a structured development workflow enforcing separation between development phases.

### Phases

1. **R**esearch - Gather information and understand context
2. **I**nnovate - Generate creative solutions
3. **P**lan - Create detailed implementation plan
4. **E**xecute - Implement the plan
5. **R**eview - Validate and iterate

### Key Features

- Consolidated subagents for context-efficiency
- Branch-aware memory bank
- Strict mode enforcement for guided development
- Phase separation prevents premature implementation

### Repository

- **Author:** Tony Narlock
- **License:** MIT
- **Location:** awesome-claude-code resources

### When to Use RIPER

**Good for:**
- Developers wanting structured phase separation
- Projects requiring careful planning before coding
- Teams that value research-first approaches

---

## Part 8: DIY / Minimal Approach

Many experienced developers prefer building their own minimal setup rather than adopting heavy frameworks.

### Philosophy

> "IMHO if you have a long list of complex, custom slash commands, you've created an anti-pattern. The entire point of an agent like Claude is that you can type almost whatever you want and get a useful, mergable result." — Shrivu Shankar

> "Keep CLAUDE.md lean, ideally under 100 lines." — Nizar

### Minimal Setup Structure

```
your-project/
├── CLAUDE.md                    # Lean, <100 lines
├── .claude/
│   ├── commands/
│   │   ├── test.md              # /test workflow
│   │   ├── review.md            # /review workflow
│   │   └── deploy.md            # /deploy workflow
│   ├── hooks/
│   │   ├── pre-commit.sh
│   │   └── post-edit.sh
│   └── settings.json
└── docs/
    └── architecture.md          # Referenced, not embedded
```

### Example Lean CLAUDE.md

```markdown
# Project Name

Brief description of what this project does.

## Structure
- src/validators/     # Input validation patterns
- src/middlewares/    # Express middleware
- src/utils/          # Shared utilities
- test/factories/     # Test data factories

## Commands
npm run test          # Run all tests
npm run lint          # Check code style
npm run build         # Production build

## Critical Rules
- ALWAYS run tests before committing
- NEVER commit .env files
- Use TypeScript strict mode

## Patterns
- Use async/await, not callbacks
- Error handling with try/catch
- JSDoc comments on public functions
```

### Example Custom Commands

**/test.md:**
```markdown
Please run comprehensive tests:
1. Run `npm run test`
2. Check for failing tests
3. If failures, analyze and fix
4. Run again until green
```

**/review.md:**
```markdown
Review the current changes:
1. Run `git diff`
2. Check for code style issues
3. Identify potential bugs
4. Suggest improvements
5. Verify test coverage
```

**/catchup.md (Shrivu's minimal approach):**
```markdown
Read all changed files in current git branch and understand the context.
```

### Document & Clear Pattern

For complex tasks spanning sessions:

1. Have Claude dump plan/progress to a `.md` file
2. `/clear` the session
3. Start new session referencing the `.md` file
4. Continue from documented state

This creates durable "external memory" without relying on compaction.

### Benefits of DIY

- Full control over behavior
- Minimal token overhead
- No framework updates to track
- Customized exactly to your needs
- Easy to understand and modify

### When to Use DIY

**Good for:**
- Experienced developers
- Simple to medium projects
- Token-constrained environments
- Teams preferring minimal tooling
- Projects with unique requirements

---

## Part 9: Additional Community Tools

### Awesome Claude Code Ecosystem

**Main Repository:** hesreallyhim/awesome-claude-code (16.9k+ stars)

Curated resources including:
- CLAUDE.md files
- Slash commands
- Workflows
- Specialized subagents

### Notable Tools from Awesome Claude Code

**Claude Squad (smtg-ai):**
- Terminal app managing multiple Claude Code instances
- Separate workspaces for parallel tasks
- AGPL-3.0 license

**Claude Swarm (parruda):**
- Launch Claude Code connected to swarm of agents
- MIT license

**Claudekit (Carl Rannaberg):**
- Auto-save checkpointing
- Code quality hooks
- 20+ specialized subagents
- MIT license

**Vibe-Log:**
- Session analysis with strategic guidance
- Pretty HTML reports
- Statusline integration
- MIT license

**viwo-cli (Hal Shin):**
- Docker containers with git worktrees
- Safe `--dangerously-skip-permissions` usage
- Multiple parallel instances
- MIT license

**cc-tools (Josh Symonds):**
- High-performance Go hooks and utilities
- Smart linting, testing, statusline
- Minimal overhead

### Claude Starter Kit (serpro69)

Minimal template with pre-configured MCP servers:
- Claude Code configuration
- Serena integration
- Task Master setup
- MIT license

### Design Review Workflow (Patrick Ellis)

Automated UI/UX design review:
- Specialized subagents
- Responsive design checks
- Accessibility validation
- MIT license

### RIPER Workflow (Tony Narlock)

Structured development phases:
- Research → Innovate → Plan → Execute → Review
- Branch-aware memory bank
- Strict mode enforcement
- MIT license

### Agentic Workflow Patterns (ThibautMelen)

Comprehensive pattern collection:
- Subagent Orchestration
- Progressive Skills
- Parallel Tool Calling
- Master-Clone Architecture
- Wizard Workflows
- Compatible with other providers
- MIT license

---

## Part 10: Framework Comparison Matrix

### Feature Comparison

| Feature | SuperClaude | BMAD | Claude-Flow | CCO | Task Master | DIY |
|---------|-------------|------|-------------|-----|-------------|-----|
| **Setup Time** | 5-10 min | 15-30 min | 10-20 min | 5 min | 5-10 min | Varies |
| **Token Overhead** | High | Medium | High | Low | Low-Medium | Minimal |
| **Multi-Agent** | No | Yes (agents) | Yes (swarms) | No | No | Manual |
| **TDD Support** | Yes | Yes | Yes | Partial | Indirect | Manual |
| **Git Integration** | Basic | Yes | Yes | Strong | No | Manual |
| **Learning Curve** | Medium | Steep | Steep | Gentle | Medium | Low |
| **Customization** | Medium | High | High | Low | Medium | Full |
| **MCP Integration** | Yes | Partial | Yes | Yes | Yes | Manual |
| **IDE Support** | Claude Code | 10+ | Claude Code | Claude Code | Multiple | Any |

### Complexity vs Control

```
    High Control
         │
    DIY  ┼─────────────────────────────────────┐
         │                                     │
         │         Claude-Flow                 │
         │              ●                      │
         │                                     │
         │    BMAD          SuperClaude        │
         │      ●               ●              │
         │                                     │
         │           Task Master               │
         │               ●                     │
         │                                     │
         │                  CCO                │
         │                   ●                 │
         │                                     │
    Low  └─────────────────────────────────────┘
         Low                               High
                     Complexity
```

### Cost Considerations

| Framework | Token Usage | API Calls | Learning Investment |
|-----------|-------------|-----------|---------------------|
| SuperClaude | High (personas loaded) | Normal | 2-4 hours |
| BMAD | Medium-High (agents) | Multiple sessions | 4-8 hours |
| Claude-Flow | High (swarm coordination) | Many parallel | 4-8 hours |
| CCO | Low (standards only) | Normal | 1-2 hours |
| Task Master | Medium (task context) | Normal | 2-4 hours |
| DIY | Minimal | Normal | Ongoing |

---

## Part 11: Selection Guide

### Quick Decision Tree

```
Start Here
    │
    ▼
Do you need multi-agent coordination?
    │
    ├── Yes ──► Is enterprise-grade orchestration needed?
    │               │
    │               ├── Yes ──► Claude-Flow
    │               │
    │               └── No ──► BMAD or Native Subagents
    │
    └── No ──► Do you need structured personas/workflows?
                    │
                    ├── Yes ──► SuperClaude
                    │
                    └── No ──► Do you need task management?
                                    │
                                    ├── Yes ──► Task Master
                                    │
                                    └── No ──► Do you need standards/auditing?
                                                    │
                                                    ├── Yes ──► CCO
                                                    │
                                                    └── No ──► DIY
```

### Recommendations by Use Case

**Solo Developer, Simple Projects:**
- Start with DIY or CCO
- Add custom commands as needed
- Keep CLAUDE.md lean

**Solo Developer, Complex Projects:**
- Consider Task Master for PRD management
- SuperClaude if you want structured personas
- DIY with good session management

**Small Team (2-5):**
- BMAD for full agile workflow
- SuperClaude for consistent practices
- Shared CLAUDE.md and commands

**Medium Team (5-15):**
- BMAD for structured SDLC
- Claude-Flow for parallel work
- CCO for standards enforcement

**Enterprise:**
- Claude-Flow for swarm orchestration
- BMAD for governance and documentation
- CCO-MCP for audit trails

### Combining Frameworks

Some teams mix elements:

```markdown
# Example: CCO standards + Custom workflows + Task Master

1. CCO for universal standards (~/.claude/CLAUDE.md)
2. Task Master MCP for PRD-driven tasks
3. Custom slash commands for team workflows
4. Hooks for enforcement
5. Lean project CLAUDE.md with @imports
```

### Anti-Patterns to Avoid

1. **Overloading CLAUDE.md** - Keep under 100 lines
2. **Too many frameworks** - Pick one primary, supplement lightly
3. **Complex slash command libraries** - Keep commands simple
4. **Ignoring native features** - Claude's Task tool works well
5. **Framework lock-in** - Ensure you can revert to basics

---

## Part 12: Getting Started Recommendations

### For Beginners

1. Start with no framework
2. Learn Claude Code basics
3. Create a lean CLAUDE.md
4. Add 2-3 custom commands for common tasks
5. Only adopt a framework when you hit limits

### For Intermediate Users

1. Assess your pain points
2. Try Task Master if PRD/task management is needed
3. Try SuperClaude if you want personas
4. Evaluate after 1-2 weeks
5. Keep what works, discard what doesn't

### For Advanced Users

1. Consider native subagents first
2. Evaluate Claude-Flow for complex orchestration
3. Use BMAD for full project lifecycle
4. Build custom tooling for unique needs
5. Contribute back to community

---

## References

### Official Resources

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) - Anthropic Engineering
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)
- [Slash Commands](https://code.claude.com/docs/en/slash-commands)

### Framework Repositories

- [SuperClaude](https://github.com/NomenAK/SuperClaude) - NomenAK
- [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) - SuperClaude-Org
- [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) - bmad-code-org
- [Claude-Flow](https://github.com/ruvnet/claude-flow) - ruvnet
- [ClaudeCodeOptimizer](https://github.com/sungurerdim/ClaudeCodeOptimizer) - sungurerdim
- [Task Master](https://github.com/eyaltoledano/claude-task-master) - eyaltoledano
- [Simone](https://github.com/Helmi/claude-simone) - Helmi
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code) - hesreallyhim

### Community Guides

- [How I Use Every Claude Code Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature) - Shrivu Shankar
- [Lean Claude Code for Production](https://nizar.se/lean-claude-code-for-production/) - Nizar
- [Claude Code Frameworks Guide](https://www.medianeth.dev/blog/claude-code-frameworks-subagents-2025) - Medianeth
- [SuperClaude ClaudeLog Guide](https://claudelog.com/claude-code-mcps/super-claude/)
- [BMAD Official Website](https://bmadcodes.com/)
- [Claude-Flow Website](https://claude-flow.ruv.io/)
- [Task Master Setup Tutorial](https://pageai.pro/blog/claude-code-taskmaster-ai-tutorial) - PageAI

### Tool Collections

- [wshobson/commands](https://github.com/wshobson/commands) - 57 production-ready commands
- [wshobson/agents](https://github.com/wshobson/agents) - 44 production-ready subagents
- [Claude Starter Kit](https://github.com/serpro69/claude-starter-kit)
- [Claude Command Suite](https://github.com/qdhenry/Claude-Command-Suite)

### Articles and Tutorials

- [Custom Commands in Claude Code](https://www.lexo.ch/blog/2025/12/automate-repetitive-prompts-with-claude-code-custom-commands/) - Lexo
- [The BMAD Method: Building AI Apps 10x Faster](https://stevekaplanai.medium.com/the-bmad-method-how-i-build-ai-apps-10x-faster-than-traditional-dev-teams-23fddf0ff56e) - Steve Kaplan
- [Orchestrating AI Development with Task Master](https://medium.com/@hasanmk52/orchestrating-ai-development-my-task-master-ai-and-claude-code-workflow-422cb3e9d084)
- [How I Use Claude Code](https://www.builder.io/blog/claude-code) - Builder.io

---

*This guide covers major Claude Code frameworks. For testing workflows, see [testing-guide](./testing-guide-updated-2025-12-09.md). For hooks, see [hooks-guide](./hooks-guide-updated-2025-12-09.md). For MCP best practices, see [mcp-best-practices](./mcp-best-practices-updated-2025-12-09.md).*
