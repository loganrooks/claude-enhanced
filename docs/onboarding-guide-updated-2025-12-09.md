# Onboarding: Existing Projects with Claude Code

> **Last Updated:** December 9, 2025  
> **Claude Code Version:** v2.0+  
> **Purpose:** Initialize Claude Code in pre-existing codebases with best practices

---

## Overview

Claude Code transforms how developers onboard to existing codebases. At Anthropic, using Claude Code for codebase exploration has become the core onboarding workflow, significantly improving ramp-up time and reducing load on other engineers. This guide covers everything from initial setup to advanced team workflows.

**Key Capabilities:**
- **Codebase Understanding**: Ask questions like you would a colleague
- **Architecture Analysis**: Claude builds mental models of your system
- **Pattern Discovery**: Automatically detects conventions and workflows
- **Configuration**: Generate project-specific context via /init
- **Team Collaboration**: Shared configurations that commit to version control

```
┌─────────────────────────────────────────────────────────────────┐
│                    Onboarding Flow                              │
│                                                                 │
│  cd your-project                                                │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────┐                                           │
│  │ claude (start)  │───▶ Ask exploratory questions             │
│  └────────┬────────┘     "What does this project do?"          │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │    /init        │───▶ Auto-generate CLAUDE.md               │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Review & Edit   │───▶ Customize for your workflow           │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Add Permissions │───▶ Configure .claude/settings.json       │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │    Iterate      │───▶ Refine based on experience            │
│  └─────────────────┘     Use # key to add rules on the fly     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Installation and Setup

### Prerequisites

Before starting:
- Node.js 18+ installed (for npm installation method)
- A terminal or command prompt
- A code project to work with
- A Claude.ai (recommended) or Claude Console account

### Installation Methods

**Native Install (Recommended):**

```bash
# Homebrew (macOS, Linux)
brew install --cask claude-code

# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

**NPM Install:**

```bash
npm install -g @anthropic-ai/claude-code
```

**Verify Installation:**

```bash
claude --version
```

### Initial Login

```bash
claude
# Follow the OAuth prompts in your browser
```

You can log in with:
- **Claude.ai** (subscription plans - recommended)
- **Claude Console** (API access with pre-paid credits)

### Health Check

After installation, verify everything works:

```bash
# Inside a Claude Code session
/doctor
```

This runs diagnostics on your installation, checking:
- Node.js version compatibility
- Authentication status
- File system permissions
- Network connectivity

---

## Part 2: Quick Start (5 Minutes)

### Step 1: Navigate and Launch

```bash
cd /path/to/your-project
claude
```

### Step 2: Explore the Codebase

Ask exploratory questions like you would a colleague:

```
> "What does this project do?"
> "What technologies does this project use?"
> "Explain the directory structure"
> "Where is the main entry point?"
> "How is authentication handled?"
```

Claude reads files on demand—no manual context loading required.

### Step 3: Generate CLAUDE.md

```bash
/init
```

This command:
- Scans your project structure (token-efficient)
- Identifies tech stack and frameworks
- Detects common patterns and commands
- Generates a starter CLAUDE.md file

### Step 4: Start Working

Give Claude a small task to verify configuration:

```
> "Add a hello world function to the main file"
```

Claude will:
1. Find the appropriate file
2. Show proposed changes
3. Ask for your approval
4. Make the edit

---

## Part 3: Understanding /init

### What /init Actually Does

The `/init` command instructs Claude to:

> "Please analyze this codebase and create a CLAUDE.md file, which will be given to future instances of Claude Code to operate in this repository."

Specifically, it:
1. Uses BatchTool and GlobTool to collect related files
2. Reads `package*.json`, `*.md`, `.cursor/rules/**`, `.github/copilot-instructions.md`
3. Analyzes project structure, dependencies, and patterns
4. Generates a comprehensive CLAUDE.md tailored to your project

### Critical Guidance (November 2025)

**From the official Anthropic blog:**

> "Think of /init as a starting point, not a finished product. The generated CLAUDE.md captures obvious patterns but may miss nuances specific to your workflow."

**HumanLayer strongly recommends careful review:**

> "Because CLAUDE.md goes into every single session with Claude Code, it is one of the highest leverage points of the harness—for better or for worse, depending on how you use it... we think you should spend some time thinking very carefully about every single line that goes into it."

### Post-/init Checklist

After running /init:

- [ ] Review generated content for accuracy
- [ ] Remove generic guidance that doesn't apply
- [ ] Add workflow instructions Claude couldn't infer
- [ ] Trim to under 100 lines (ideally under 60)
- [ ] Add critical rules (ALWAYS/NEVER items)
- [ ] Test with a small task to verify
- [ ] Commit to version control

### Running /init on Existing CLAUDE.md

You can also use `/init` on projects that already have a CLAUDE.md:

```bash
/init
```

Claude will review the current file and suggest improvements based on what it learns from exploring your codebase.

---

## Part 4: The # Key—Live Memory

Press `#` during a session to add instructions to CLAUDE.md instantly:

```
# Always run prettier after editing TypeScript files
# Use snake_case for API endpoints
# Never use inline styles—use Tailwind classes
```

You'll be prompted to select which memory file to store this in:
- **Project memory**: `./CLAUDE.md` (shared with team)
- **Local project memory**: `./CLAUDE.local.md` (gitignored)
- **User memory**: `~/.claude/CLAUDE.md` (all projects)

**Why this matters:**

Many engineers use `#` frequently to document commands, files, and style guidelines while coding, then include CLAUDE.md changes in commits so team members benefit as well.

---

## Part 5: CLAUDE.md Locations and Loading

### Memory File Hierarchy

Claude Code loads CLAUDE.md files from multiple locations:

```
~/.claude/CLAUDE.md                 # User memory (all projects)
     │
     └── Always loaded
     
~/projects/awesome-app/
├── CLAUDE.md                       # Project memory (shared)
│   └── Loaded when working anywhere in project
├── CLAUDE.local.md                 # Local memory (gitignored)
│   └── Loaded when working anywhere in project
├── apps/
│   ├── web/
│   │   └── CLAUDE.md              # Subdirectory memory
│   │       └── Only loaded when working in apps/web/**
│   └── api/
│       └── CLAUDE.md              # Subdirectory memory
│           └── Only loaded when working in apps/api/**
└── services/
    └── infrastructure/
        └── CLAUDE.md              # Subdirectory memory
            └── Only loaded when working in services/infrastructure/**
```

### Loading Behavior

- **Root and parent CLAUDE.md files**: Always loaded at session start
- **Subdirectory CLAUDE.md files**: Loaded on-demand when Claude accesses files in those directories
- **CLAUDE.local.md files**: Automatically added to .gitignore

### Alternative: .claude/rules/ Directory

For larger projects, organize instructions into multiple files:

```
your-project/
├── .claude/
│   ├── CLAUDE.md              # Main project instructions
│   └── rules/
│       ├── code-style.md      # Code style guidelines
│       ├── testing.md         # Testing conventions
│       └── security.md        # Security requirements
```

All `.md` files in `.claude/rules/` are automatically loaded as project memory.

---

## Part 6: Customizing Your CLAUDE.md

### Essential Sections

```markdown
# Project: [Your Project Name]

## About This Project
[One-paragraph summary of what this does]

## Tech Stack
- [Framework]: [Version]
- [Database]: [Type]
- [Testing]: [Framework]

## Key Directories
- `src/` - Main source code
- `tests/` - Test files
- `docs/` - Documentation

## Common Commands
npm run dev      # Start development server
npm run test     # Run tests
npm run build    # Production build

## Workflow
1. Before modifying code: understand current state first
2. Create a plan before implementation
3. Run tests after changes
4. Commit with conventional messages

## Rules
ALWAYS:
- Write tests for new functionality
- Follow existing patterns in the codebase
- Run linter before commits

NEVER:
- Use inline styles (use Tailwind)
- Commit secrets or API keys
- Skip code review process
```

### Making Rules Stick

Claude responds better to emphatic language:

| Weak (may be ignored) | Strong (more likely followed) |
|----------------------|------------------------------|
| Try to use strict mode | ALWAYS use strict mode |
| Consider writing tests | YOU MUST write tests |
| Avoid using `any` type | NEVER use `any` type |
| Remember to lint | IMPORTANT: Run linter |

**Emphasis Keywords (Ranked):**
```
CRITICAL > IMPORTANT > YOU MUST > ALWAYS/NEVER > SHOULD > Consider
```

### What NOT to Include

**Code Style Rules** (Use linters instead):
```markdown
# BAD - Claude is an expensive linter
- Use 2 spaces for indentation
- Always use semicolons
```
**Solution:** Use ESLint/Prettier/Ruff + hooks

**Task-Specific Instructions**:
```markdown
# BAD - Only relevant sometimes
When modifying the users table, always check foreign keys...
```
**Solution:** Put in `docs/database_schema.md` and reference when needed

**Sensitive Information**:
```markdown
# BAD - Security risk
API_KEY=sk-abc123...
```
**Solution:** Use environment variables

### Importing External Docs

Reference detailed documentation without bloating CLAUDE.md:

```markdown
## Architecture
See @docs/architecture.md for detailed design decisions.

## API Patterns
See @docs/api-conventions.md for REST standards.

## Testing
See docs/testing-principles.md for comprehensive guide.
```

Note: Using `@` syntax loads content at startup. Referencing without `@` lets Claude load on-demand.

---

## Part 7: Permission Configuration

### Settings File Locations

```
~/.claude/settings.json           # User-level (all projects)
./.claude/settings.json           # Project-level (shared)
./.claude/settings.local.json     # Personal overrides (gitignored)
```

### Basic Settings Structure

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Edit(src/**)",
      "Bash(npm run:*)",
      "Bash(git:*)"
    ],
    "deny": [
      "Edit(.env*)",
      "Edit(*.key)",
      "Edit(*.pem)",
      "Bash(rm -rf:*)",
      "Bash(sudo:*)"
    ]
  }
}
```

### Permission Patterns

| Pattern | Matches |
|---------|---------|
| `Read(**)` | Read any file |
| `Edit(src/**)` | Edit files in src/ recursively |
| `Edit(**.py)` | Edit any Python file |
| `Bash(npm run:*)` | Any npm run command |
| `Bash(git:*)` | Any git command |
| `Bash(git commit:*)` | Git commit specifically |
| `mcp__github__*` | All GitHub MCP tools |

### Permission Modes

Claude Code supports four permission modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| `default` | Prompts for permission on first use | Beginners, cautious workflows |
| `acceptEdits` | Auto-accepts file edits | Daily development |
| `plan` | Read-only, no modifications | Code review, planning |
| `bypassPermissions` | Skips all prompts | Sandboxed environments only |

**Switch modes during session:**
- Press `Shift+Tab` twice to enter Plan Mode
- Use `/config` to change default mode

**Set default mode in settings:**
```json
{
  "defaultMode": "acceptEdits"
}
```

---

## Part 8: Onboarding Large Codebases

### Strategy: Progressive Disclosure

Don't load everything at once:

```markdown
# CLAUDE.md - Modular approach

## Quick Reference
[Essential info only - under 1000 tokens]

## Detailed Docs (loaded on demand)
- See @docs/architecture.md for overall design
- See @docs/database-schema.md for data model
- See @docs/api-conventions.md for API patterns
- See @docs/frontend-patterns.md for UI patterns
```

### Strategy: Domain-Focused CLAUDE.md Files

Create CLAUDE.md files per domain:

```
your-monolith/
├── CLAUDE.md                    # Global rules (lean)
├── src/
│   ├── auth/
│   │   └── CLAUDE.md           # Auth-specific patterns
│   ├── billing/
│   │   └── CLAUDE.md           # Billing conventions
│   └── notifications/
│       └── CLAUDE.md           # Notification patterns
```

Claude auto-discovers subdirectory CLAUDE.md files when working with files there.

### Managing Large CLAUDE.md Size

**The Problem:** CLAUDE.md warning at 40k words, hard limit around 47k+

**Solutions (December 2025 community best practices):**

1. **Split by context**: Backend doesn't need frontend guides
2. **Reference, don't embed**: "See docs/frontend-guideline.md"
3. **Let Claude load on-demand**: Don't use `@` imports for everything
4. **Target**: Keep root CLAUDE.md under 10k words

**From the community (anvodev):**
> "My Claude Code showed a warning because my CLAUDE.md was 47k words—far above the recommended 40k. Ideally, a CLAUDE.md should stay under 10k words for best performance."

### Real-World Example: Puzzmo

> "We use monorepos. A monorepo is perfect for working with an LLM, because it can read the file which represents our schema, it can read the SDL files defining the public GraphQL API, read the per-screen requests and figure out what you're trying to do. Having a single place with so much context means that I as user of Claude Code do not need to tell it that sort of stuff and a vague message like 'Add a xyz field to the user model in the db and make it show in this screen' is something that Claude Code can do."

---

## Part 9: Understanding Legacy Code

Claude Code excels at codebase exploration. Ask questions like you would a colleague:

### General Understanding

```
"I'm new to this codebase. Can you:
1. Explain what this project does in plain English
2. Identify the main architectural patterns used
3. Point out any areas that seem complex or risky
4. Suggest where I should start reading"
```

### Architecture Analysis

```
"Help me understand the authentication system:
- Walk through a login flow
- Explain how tokens are managed
- Show me the key files involved
- Identify any security considerations"
```

### Finding Your Way

```
"I need to add a new feature for [X]. Help me:
1. Find similar existing features I can reference
2. Identify which files I'll need to modify
3. Understand any patterns I should follow
4. Know what tests I should write"
```

### Using Plan Mode for Exploration

Enter Plan Mode for safe analysis (Shift+Tab twice):

```
> Analyze this codebase and create a comprehensive architecture overview.
> Include: component relationships, data flow, and key design decisions.
```

Plan Mode lets Claude explore without modifying anything—perfect for understanding before acting.

### Generating Architecture Documentation

Ask Claude to create visualizations:

```
> Generate a Mermaid diagram showing the data flow through the payment system
> Create a C4 context diagram for this application
> Map all dependencies of the auth module
```

---

## Part 10: Team Onboarding

### Shared Configuration (Committed to Git)

```
.claude/
├── settings.json      # Shared permissions/hooks
├── commands/          # Team slash commands
│   ├── review.md
│   ├── test.md
│   └── deploy.md
└── agents/            # Subagent definitions
    ├── security-auditor.md
    └── code-reviewer.md

CLAUDE.md              # Project rules (committed)
```

### Personal Configuration (Gitignored)

```
CLAUDE.local.md                # Personal preferences
.claude/settings.local.json    # Personal permissions

# In .gitignore:
CLAUDE.local.md
.claude/settings.local.json
```

### Onboarding New Team Members

When a new developer joins:

```bash
# Clone repo (CLAUDE.md comes with it)
git clone your-repo
cd your-repo

# Start Claude Code
claude

# Claude automatically loads team's CLAUDE.md
```

**Suggested first prompts for new developers:**

```
> "Help me understand the codebase as someone new"
> "What should I know before making my first change?"
> "Guide me through the local dev setup"
```

### Custom Onboarding Command

Create a dedicated onboarding command:

```markdown
<!-- .claude/commands/onboard.md -->
---
description: Onboard a new developer to this project
allowed-tools: Read, Bash(git log:*)
---

Welcome to [Project Name]! Let me help you get oriented.

1. First, I'll read the key architecture docs:
   @docs/architecture.md
   @docs/conventions.md

2. Then I'll analyze the current state:
   - Run: git log --oneline -20
   - Check recent changes

3. I'll give you a summary of:
   - What this project does
   - How it's organized
   - What patterns to follow
   - Where to find things

4. Finally, I'll ask what you want to work on and help you find relevant code.

$ARGUMENTS
```

**Usage:**
```bash
> /project:onboard "I need to add a new payment method"
```

---

## Part 11: Session Management

### Essential Session Commands

| Command | Purpose |
|---------|---------|
| `/init` | Auto-generate CLAUDE.md |
| `/help` | Show available commands |
| `/clear` | Clear conversation history |
| `/compact` | Summarize and compress context |
| `/rewind` | Restore to previous checkpoint |
| `/config` | View/edit settings |
| `/memory` | Open memory file in editor |
| `Esc + Esc` | Open rewind menu |

### Continuing Sessions

```bash
# Continue most recent conversation
claude -c
# or
claude --continue

# Resume specific session
claude -r <session-id>
# or
claude --resume

# Interactive session picker
claude --resume
```

### Context Management

**Monitor context usage**: Watch the context meter (bottom right of terminal).

**When context fills up:**

1. **At 70% capacity**: Consider using `/compact`
2. **Before switching tasks**: Use `/clear`
3. **For long sessions**: Save important context to files

```
> Just finished the auth feature. Time to /compact before starting payments.
```

**The /compact Command:**
- Summarizes current conversation
- Reduces token usage
- Preserves essential context
- Takes 1-2 minutes to complete

**When to use /compact:**
- Context window is almost full
- You want to preserve session context
- Switching between related tasks

**When NOT to use /compact:**
- You don't need the current context (use `/clear` instead)
- You're starting fresh work (start new session)

### Checkpoints and Rewind

Claude Code automatically creates checkpoints before each edit.

**Access rewind menu:**
- Press `Esc` twice, or
- Use `/rewind` command

**Rewind options:**
- **Conversation only**: Rewind messages, keep code changes
- **Code only**: Revert files, keep conversation
- **Both**: Restore both to prior point

**Important limitations:**
- Only tracks Claude's file editing tools
- Does NOT track: `rm`, `mv`, `cp`, or manual edits
- Session-level only—use Git for permanent history

---

## Part 12: First Task Workflows

### Workflow: Fix a Bug

```
> "I've been assigned to fix issue #123. Can you:
1. Help me understand the bug
2. Find the relevant code
3. Suggest a fix approach
4. Tell me what tests to update"
```

### Workflow: Add a Feature

```
> "Add input validation to the user registration form"
```

Claude will:
- Locate relevant code
- Understand context
- Implement solution
- Run tests if available

### Workflow: Refactor Code

```
> "Refactor the authentication module to use async/await instead of callbacks"
```

**Best practice**: Ask for a plan first:
```
> "Propose a 3-step plan with small diffs and tests for refactoring auth to async/await"
```

### Workflow: Write Tests

```
> "Write unit tests for the calculator functions"
```

### Workflow: Code Review

```
> "Review my changes and suggest improvements"
```

---

## Part 13: Specialized Onboarding Prompts

### For Legacy Systems

```
"This is a legacy system without documentation. Please:
1. Analyze the code structure and identify the main components
2. Create a high-level architecture diagram (Mermaid format)
3. Document the critical business logic you find
4. Identify technical debt and potential risks
5. Suggest a prioritized modernization approach"
```

### For Microservices

```
"Help me understand this microservices architecture:
1. Map all the services and their responsibilities
2. Document the communication patterns (REST, gRPC, events)
3. Identify shared dependencies and data stores
4. Show the request flow for [specific use case]"
```

### For Frontend Projects

```
"I'm onboarding to this React codebase. Help me understand:
1. The component hierarchy and state management approach
2. How routing is configured
3. The styling methodology (CSS modules, Tailwind, etc.)
4. Testing patterns and coverage
5. Build and deployment process"
```

### For Data Projects

```
"Help me understand this data pipeline:
1. Map the data sources and destinations
2. Document the transformation logic
3. Identify scheduling and orchestration patterns
4. Show the data lineage for key outputs
5. Note any data quality checks"
```

---

## Part 14: Troubleshooting Onboarding

### Claude Ignores CLAUDE.md

```bash
# Check file exists at project root
ls -la CLAUDE.md

# Verify Claude sees it
> "What does my CLAUDE.md say about testing?"

# Check for syntax errors—CLAUDE.md is markdown
```

### Claude Uses Wrong Patterns

Add more specific rules:

```markdown
# Before (vague)
- Follow our patterns

# After (specific)
- API handlers MUST use the responseWrapper from src/utils/response.ts
- Database queries MUST go through the repository layer, never direct Prisma calls
- Components MUST use the Button from src/components/ui, not native button
```

### Claude Forgets Context in Long Sessions

```bash
# Compress periodically
/compact

# Or reference docs explicitly
> "Following the patterns in @docs/api-guide.md, add a new endpoint"
```

### Claude Puts Files in Wrong Places

Be explicit about structure:

```markdown
## Directory Structure Rules
- React components → src/components/[FeatureName]/
- API routes → src/routes/[resource]/
- Types → src/types/[domain].ts
- Tests → __tests__/ directory next to source file
- Utilities → src/utils/[category]/
```

### Installation Issues

```bash
# Run diagnostics
/doctor

# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Or use npx as alternative
npx @anthropic-ai/claude-code
```

### Authentication Issues

```bash
# Force re-login
/logout
# Restart Claude Code
claude
```

### MCP Connection Issues

```bash
# Debug MCP configuration
claude --mcp-debug
```

---

## Part 15: Validation Checklist

After onboarding, verify your setup:

### Configuration Checklist

- [ ] CLAUDE.md exists at project root
- [ ] CLAUDE.md is under 100 lines (ideally under 60)
- [ ] settings.json has appropriate permissions
- [ ] Dangerous operations are denied
- [ ] Local files are gitignored
- [ ] Team commands are in .claude/commands/

### Functionality Checklist

- [ ] Claude correctly identifies your tech stack
- [ ] Claude puts new files in the right directories
- [ ] Claude follows your naming conventions
- [ ] Claude uses your established patterns
- [ ] Claude runs the right test commands
- [ ] Claude respects critical rules (NEVER items)

### Test Prompts

```bash
# Test 1: Stack awareness
> "What testing framework do we use?"

# Test 2: Pattern following
> "Create a simple utility function"
# Check: Did it go in the right place? Right format?

# Test 3: Rule enforcement
> "Quick hack: just use any type"
# Check: Does it push back based on CLAUDE.md?

# Test 4: Command knowledge
> "How do I run the tests?"
```

---

## Part 16: Community Tools for Onboarding

### Claude Code Init (istealersn-dev)

Comprehensive toolkit for initializing new and migrating existing projects:

```bash
# Initialize new project
./init-new-project.sh \
  --name "my-project" \
  --type web \
  --framework react

# Initialize existing project
./init-existing-project.sh --force
```

**Features:**
- TodoWrite integration for task tracking
- MCP server setup guides
- Session management best practices
- CLAUDE.md templates for various project types

**Repository:** https://github.com/istealersn-dev/claude-code-init

### Claude Starter Kit (serpro69)

Pre-configured Claude Code setup with MCP servers:

```bash
git clone https://github.com/serpro69/claude-starter-kit
```

**Includes:**
- Context7 (library documentation access)
- Serena (LSP-powered code analysis)
- Task Master (50+ project management commands)
- Zen (multi-model AI interactions)

### Awesome Claude Code (hesreallyhim)

Curated collection of CLAUDE.md files, commands, and workflows:

**Notable resources:**
- Design Review Workflow (automated UI/UX review)
- Laravel TALL Stack Starter Kit
- RIPER Workflow (Research-Innovate-Plan-Execute-Review)
- Stack-specific CLAUDE.md templates

**Repository:** https://github.com/hesreallyhim/awesome-claude-code

### Auto-Memory Plugin (severity1)

Automatically maintains CLAUDE.md files with hierarchical support for monorepos:

```bash
claude plugin install auto-memory@claude-code-marketplace
```

**Commands:**
- `/memory init` - Initialize CLAUDE.md structure
- `/memory recalibrate` - Full recalibration
- `/memory sync` - Sync with manual changes

---

## Part 17: Quick Setup Script

Automate your onboarding setup:

```bash
#!/bin/bash
# setup-claude.sh

PROJECT_NAME=$(basename $(pwd))

mkdir -p .claude/commands
mkdir -p .claude/agents
mkdir -p docs

# Create minimal CLAUDE.md
cat > CLAUDE.md << EOF
# Project: $PROJECT_NAME

## About
[Brief description of what this project does]

## Stack
- [Add your stack]

## Commands
- \`npm run dev\` - Start development server
- \`npm run test\` - Run tests
- \`npm run build\` - Production build

## Structure
[Brief directory overview]

## Workflow
1. Understand before modifying
2. Plan before implementing
3. Test after changes
4. Commit with conventional messages

## Rules
ALWAYS:
- Write tests for new code
- Follow existing patterns

NEVER:
- Commit secrets
- Skip code review
EOF

# Create settings
cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Edit(src/**)",
      "Bash(npm run:*)",
      "Bash(git:*)"
    ],
    "deny": [
      "Edit(.env*)",
      "Bash(rm -rf:*)",
      "Bash(sudo:*)"
    ]
  }
}
EOF

# Create review command
cat > .claude/commands/review.md << 'EOF'
---
description: Review current changes for correctness and patterns
---
Review the current changes for:
- Code correctness and logic
- Error handling completeness
- Test coverage adequacy
- Adherence to project patterns
- Security considerations

Provide specific, actionable feedback.
EOF

# Create onboard command
cat > .claude/commands/onboard.md << 'EOF'
---
description: Onboard a new developer to this project
---
Welcome to the project! Let me help you get oriented.

I'll analyze the codebase and provide:
1. Project overview and purpose
2. Architecture and key components
3. Common patterns and conventions
4. Where to find things
5. How to run and test

$ARGUMENTS
EOF

# Add to gitignore
echo "CLAUDE.local.md" >> .gitignore
echo ".claude/settings.local.json" >> .gitignore
echo ".claude/logs/" >> .gitignore

echo "✅ Claude Code setup complete for $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "1. Run 'claude' to start Claude Code"
echo "2. Run '/init' to auto-detect your stack"
echo "3. Review and customize CLAUDE.md"
echo "4. Test with a small task"
```

**Usage:**
```bash
chmod +x setup-claude.sh
./setup-claude.sh
```

---

## References

### Official Resources

- [Claude Code Quickstart](https://code.claude.com/docs/en/quickstart) - Official getting started guide
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) - Anthropic engineering recommendations
- [Using CLAUDE.md Files](https://claude.com/blog/using-claude-md-files) - Official CLAUDE.md guide (November 2025)
- [Claude Code Settings](https://code.claude.com/docs/en/settings) - Configuration reference
- [Claude Code Memory](https://code.claude.com/docs/en/memory) - Memory management documentation
- [Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing) - Checkpoint and rewind guide
- [Claude Code Troubleshooting](https://code.claude.com/docs/en/troubleshooting) - Official troubleshooting guide
- [Enabling Claude Code Autonomy](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously) - v2.0 features announcement

### Community Guides

- [Stop Repeating Yourself: Onboard Claude Code](https://www.nathanonn.com/stop-repeating-yourself-onboard-claude-code-with-a-claude-md-guide/) - Nathan Onn's CLAUDE.md guide
- [Claude Code's Memory](https://thomaslandgraf.substack.com/p/claude-codes-memory-working-with) - Thomas Landgraf on memory management
- [Writing CLAUDE.md for Mature Codebases](https://blog.huikang.dev/2025/05/31/writing-claude-md.html) - Huikang's monorepo strategies
- [How I Organized My CLAUDE.md in a Monorepo](https://dev.to/anvodev/how-i-organized-my-claudemd-in-a-monorepo-with-too-many-contexts-37k7) - Context management techniques
- [6 Weeks of Claude Code](https://blog.puzzmo.com/posts/2025/07/30/six-weeks-of-claude-code/) - Puzzmo's real-world experience
- [The Complete Claude Code Best Practices Guide](https://notes.muthu.co/2025/08/the-complete-claude-code-best-practices-guide/) - Comprehensive reference
- [10 Essential Claude Code Tips](https://blog.sixeyed.com/ten-tips-claude-code/) - Elton's power user tips
- [Claude Code Best Practices: Memory Management](https://cuong.io/blog/2025/06/15-claude-code-best-practices-memory-management) - Code Centre memory guide
- [A Prompt for Smoother Claude Code Onboarding](https://apidog.com/blog/claude-code-onboarding-prompt/) - Automated documentation setup
- [Build Your Own /init Command](https://kau.sh/blog/build-ai-init-command/) - Kaushik Gopal's reverse-engineering

### Legacy Code and Architecture

- [Legacy Code Modernization with Claude Code](https://www.tribe.ai/applied-ai/legacy-code-modernization-with-claude-code-breaking-through-context-window-barriers) - Tribe AI guide
- [Reverse Engineering Software Architecture](https://medium.com/nick-tune-tech-strategy-blog/reverse-engineering-your-software-architecture-with-claude-code-to-help-claude-code-1746a7b941bc) - Nick Tune's approach
- [Augmented Outside-In Discovery](https://goatreview.com/augmented-outside-discovery-claude-code/) - C4 model integration
- [Using Claude Code for Information Architecture](https://jarango.com/2025/07/01/using-claude-code-for-information-architecture/) - Jorge Arango's taxonomy generation
- [Understanding Claude Code Plan Mode](https://lord.technology/2025/07/03/understanding-claude-code-plan-mode-and-the-architecture-of-intent.html) - Plan mode deep dive

### Tools and Repositories

- [Claude Code Init](https://github.com/istealersn-dev/claude-code-init) - Project initialization toolkit
- [Claude Starter Kit](https://github.com/serpro69/claude-starter-kit) - Pre-configured MCP setup
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code) - Curated resources
- [Claude Code Auto Memory](https://github.com/severity1/claude-code-auto-memory) - Automatic CLAUDE.md maintenance
- [Awesome Claude Cheatsheet](https://awesomeclaude.ai/code-cheatsheet) - Commands and shortcuts reference

### IDE Integration

- [How to Turn Your IDE into a Smart Assistant](https://skywork.ai/blog/how-to-turn-your-ide-into-a-smart-assistant-with-claude-code/) - VS Code and JetBrains setup
- [Permission Model in Claude Code](https://skywork.ai/blog/permission-model-claude-code-vs-code-jetbrains-cli/) - Permission configuration guide
- [Claude Code Permissions Guide](https://stevekinney.com/courses/ai-development/claude-code-permissions) - Steve Kinney's permissions course

### Workflow and Best Practices

- [Claude Code 2.0 Best Practices](https://skywork.ai/blog/claude-code-2-0-best-practices-ai-coding-workflow-2025/) - Updated for v2.0
- [Claude Code Workflow Best Practices](https://www.sidetool.co/post/unlocking-efficiency-claude-code-workflow-best-practices-explained/) - Permission modes guide
- [Claude Code Development Workflow](https://vladimirsiedykh.com/blog/ai-development-workflow-claude-code-production-complete-guide-2025) - Production guide
- [Give Claude Code a Memory](https://www.producttalk.org/give-claude-code-a-memory/) - Teresa Torres on context management
- [The Ultimate Guide to Claude Code](https://medium.com/@tonimaxx/the-ultimate-guide-to-claude-code-production-prompts-power-tricks-and-workflow-recipes-42af90ca3b4a) - Toni Maxx's production recipes

---

*This guide is part of the Claude Code Ecosystem documentation series. For configuration details, see the Configuration Guide. For CLAUDE.md best practices, see the CLAUDE.md Best Practices Guide. For project templates, see the Project Templates Guide.*
