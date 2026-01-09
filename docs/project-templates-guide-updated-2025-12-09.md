# Project Templates Guide

> **Last Updated:** December 9, 2025  
> **Purpose:** Ready-to-use project configurations, templates by stack, and community resources  
> **Companion Guides:** Configuration Guide, CLAUDE.md Best Practices, Skills Guide

---

## Part 1: Universal Template Structure

Every Claude Code project should follow this structure:

```
your-project/
├── CLAUDE.md                  # Main configuration (lean, <100 lines)
├── CLAUDE.local.md            # Personal overrides (gitignored)
├── .claude/
│   ├── settings.json          # Shared settings & permissions
│   ├── settings.local.json    # Personal settings (gitignored)
│   ├── commands/              # Custom slash commands
│   │   ├── review.md
│   │   ├── test.md
│   │   └── deploy.md
│   ├── agents/                # Subagent definitions
│   │   ├── security-auditor.md
│   │   └── code-reviewer.md
│   └── hooks/                 # Automation hooks (optional)
├── .mcp.json                  # MCP server configuration (optional)
└── docs/                      # Detailed docs (@imported)
    ├── architecture.md
    ├── patterns.md
    └── testing.md
```

### Gitignore Additions

```gitignore
# Claude Code personal files
CLAUDE.local.md
.claude/settings.local.json
.claude/logs/
```

---

## Part 2: The /init Command

The `/init` command auto-generates a starter CLAUDE.md by analyzing your codebase.

### How to Use

```bash
cd your-project
claude
/init
```

### What /init Does

1. Scans project structure (reasonably token-efficient)
2. Identifies tech stack and frameworks
3. Detects common patterns
4. Generates starter CLAUDE.md

### Critical Guidance (November 2025)

**From the official Anthropic blog:**
> "Think of /init as a starting point, not a finished product. The generated CLAUDE.md captures obvious patterns but may miss nuances specific to your workflow."

**HumanLayer strongly recommends against accepting auto-generated output without review:**
> "Because CLAUDE.md goes into every single session with Claude Code, it is one of the highest leverage points of the harness—for better or for worse, depending on how you use it... we think you should spend some time thinking very carefully about every single line that goes into it."

### Post-/init Checklist

- [ ] Review generated content for accuracy
- [ ] Remove generic guidance that doesn't apply
- [ ] Add team-specific workflows Claude couldn't infer
- [ ] Trim to <100 lines (ideal <60)
- [ ] Add critical rules (ALWAYS/NEVER sections)
- [ ] Test with a small task
- [ ] Commit to version control

---

## Part 3: Minimal Starter Template

For any project type—start here and expand as needed:

### CLAUDE.md

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

## Rules
ALWAYS:
- [Critical requirement 1]
- [Critical requirement 2]

NEVER:
- [Dangerous pattern 1]
- [Anti-pattern 1]

## Notes
[Any critical gotchas or non-obvious behaviors]
```

### .claude/settings.json

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Edit(src/**)",
      "Edit(tests/**)"
    ],
    "deny": [
      "Edit(.env*)",
      "Bash(rm -rf *)"
    ]
  }
}
```

---

## Part 4: Framework-Specific Templates

### 4.1 Web App (React/TypeScript/Vite)

#### CLAUDE.md

```markdown
# Project: [App Name]

## Stack
- React 18 + TypeScript 5
- Vite, TailwindCSS
- React Query, Zustand
- Vitest + Testing Library

## Commands
- `npm run dev` - Start dev server
- `npm test` - Run tests
- `npm run build` - Production build
- `npm run lint` - Run linter

## Structure
src/
├── components/    # Reusable UI components
├── features/      # Feature modules
├── hooks/         # Custom hooks
├── lib/           # Utilities
└── types/         # TypeScript types

## Rules
ALWAYS:
- Use TypeScript strict mode
- Write tests for new components
- Use functional components with hooks
- Group imports: 1) React, 2) third-party, 3) local (@/*)

NEVER:
- Use `any` type
- Mutate state directly
- Skip error boundaries for async operations

## Patterns
- Prefer `useState` for simple state, `useReducer` for complex
- Use React Query for server state
- Tailwind with class-variance-authority for variants
```

#### .claude/settings.json

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Edit(src/**)",
      "Edit(tests/**)",
      "Bash(npm run *)",
      "Bash(npx vitest *)"
    ],
    "deny": [
      "Edit(.env*)",
      "Bash(rm -rf *)"
    ]
  },
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit(src/**/*.tsx)",
      "hooks": [{
        "type": "command",
        "command": "npx prettier --write $FILE"
      }]
    }]
  }
}
```

---

### 4.2 Next.js 15 (App Router + React 19)

#### CLAUDE.md

```markdown
# Project: [App Name]

## Stack
- Next.js 15 + React 19
- TypeScript 5 (strict: true)
- App Router
- Server Components by default
- TailwindCSS + shadcn/ui

## Commands
- `pnpm dev` - Start with Turbopack
- `pnpm build` - Production build
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Structure
app/
├── (routes)/      # Route groups
├── api/           # API routes
├── layout.tsx     # Root layout
└── page.tsx       # Home page
components/
├── ui/            # shadcn components
└── [feature]/     # Feature components
lib/
├── actions/       # Server Actions
└── utils/         # Utilities

## Rules
ALWAYS:
- Use Server Components by default
- Add 'use client' only when needed
- Use Server Actions for mutations
- Type all props explicitly

NEVER:
- Use client components for data fetching
- Skip loading.tsx for async routes
- Use inline styles (use Tailwind)

## Patterns
- Path aliases: @/* for src
- Double quotes for JSX, single for strings
- Server Actions in separate files (lib/actions/)
```

---

### 4.3 Python FastAPI Backend

#### CLAUDE.md

```markdown
# Project: [API Name]

## Stack
- Python 3.11+
- FastAPI + Uvicorn
- SQLAlchemy 2.0 + Pydantic 2.0
- pytest + httpx

## Commands
- `uvicorn app.main:app --reload` - Dev server
- `pytest tests/ -v` - Run tests
- `ruff check .` - Lint
- `black .` - Format

## Structure
app/
├── api/           # Route handlers
├── models/        # SQLAlchemy models
├── schemas/       # Pydantic schemas
├── core/          # Config, security
└── services/      # Business logic
tests/
└── conftest.py    # Fixtures

## Rules
ALWAYS:
- Type hints on all functions
- Pydantic for request/response validation
- Dependency injection for shared logic
- Use appropriate HTTP methods

NEVER:
- Raw SQL queries (use ORM)
- Hardcode secrets
- Skip input validation

## Patterns
- All routes use `/api/v1` prefix
- JWT tokens expire after 24 hours
- Use `select_related`/`prefetch_related` equivalents
```

#### .claude/settings.json

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Edit(app/**)",
      "Edit(tests/**)",
      "Bash(pytest *)",
      "Bash(uvicorn *)",
      "Bash(ruff *)",
      "Bash(black *)"
    ],
    "deny": [
      "Edit(.env*)",
      "Bash(rm -rf *)",
      "Bash(pip install *)"
    ]
  },
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit(app/**/*.py)",
      "hooks": [{
        "type": "command",
        "command": "ruff check --fix $FILE && black $FILE"
      }]
    }]
  }
}
```

---

### 4.4 Python Django Backend

#### CLAUDE.md

```markdown
# Project: [App Name]

## Stack
- Python 3.11+
- Django 5.0 + DRF
- PostgreSQL
- pytest-django

## Commands
- `python manage.py runserver` - Dev server
- `python manage.py test` - Run tests
- `python manage.py makemigrations` - Create migrations
- `python manage.py migrate` - Apply migrations
- `ruff check .` - Lint

## Structure
project/
├── settings/      # Split settings
├── urls.py        # Root URLs
└── wsgi.py
apps/
├── users/         # User app
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
└── [feature]/     # Feature apps

## Rules
ALWAYS:
- Use `startapp` for new apps
- Register models in admin.py
- Use Django ORM, not raw SQL
- Avoid N+1 with `select_related`/`prefetch_related`

NEVER:
- Store passwords in plain text
- Use default SECRET_KEY in production
- Skip migrations

## Patterns
- CBV for complex views, FBV for simple
- ModelSerializer for standard CRUD
- Signals for cross-app communication
```

---

### 4.5 Infrastructure (Terraform)

#### CLAUDE.md

```markdown
# Project: [Infra Name]

## Stack
- Terraform 1.6+
- AWS provider
- S3 backend with state locking

## Commands
- `terraform init` - Initialize
- `terraform fmt -recursive` - Format
- `terraform validate` - Validate
- `terraform plan -out=tfplan` - Preview
- `terraform apply tfplan` - Apply (requires approval)

## Structure
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
├── modules/
│   ├── vpc/
│   ├── ecs/
│   └── rds/
└── shared/

## Rules
ALWAYS:
- Run `terraform plan` before apply
- Use modules for reusable components
- Tag all resources
- Use variables for environment differences
- Store state remotely with locking

NEVER:
- Hardcode secrets (use SSM/Secrets Manager)
- Apply without review
- Modify state manually
- Use default VPC
- Use `terraform apply -auto-approve` in production

## Workflow
1. `terraform plan -out=tfplan`
2. Review plan output carefully
3. `terraform show tfplan`
4. If approved: `terraform apply tfplan`
```

#### .claude/settings.json

```json
{
  "permissions": {
    "allow": [
      "Read(**)",
      "Edit(**.tf)",
      "Bash(terraform fmt *)",
      "Bash(terraform validate)",
      "Bash(terraform plan *)"
    ],
    "deny": [
      "Bash(terraform apply *)",
      "Bash(terraform destroy *)"
    ]
  }
}
```

---

### 4.6 Data Science / ML Project

#### CLAUDE.md

```markdown
# Project: [Analysis Name]

## Stack
- Python 3.11+
- pandas, numpy, scipy
- scikit-learn / PyTorch
- Jupyter notebooks
- matplotlib, seaborn, plotly

## Commands
- `jupyter lab` - Start Jupyter
- `pytest tests/ -v` - Run tests
- `python -m black .` - Format
- `micromamba run -n [env] python script.py` - Run scripts

## Structure
├── data/
│   ├── raw/           # Original data (read-only)
│   ├── processed/     # Cleaned data
│   └── external/      # Third-party data
├── notebooks/         # Jupyter notebooks
├── src/
│   ├── config.py      # Centralized configuration
│   ├── data/          # Data loading/processing
│   ├── features/      # Feature engineering
│   ├── models/        # Model definitions
│   └── visualization/ # Plotting utilities
├── models/            # Trained model artifacts
└── reports/           # Generated reports

## Rules
ALWAYS:
- Centralize paths in config.py
- Use relative imports within src/
- Document data transformations
- Version control notebooks (use nbstripout)

NEVER:
- Hardcode file paths in notebooks
- Commit large data files (use .gitignore)
- Mix exploration and production code

## Workflow
1. Load data → Explore in notebook
2. Extract reusable code → Move to src/
3. Notebook imports from src/
4. Document findings in reports/

## Notes
- Data folder: [path or location note]
- Environment: `micromamba activate [env]`
```

---

### 4.7 Mobile App (React Native)

#### CLAUDE.md

```markdown
# Project: [App Name]

## Stack
- React Native + Expo
- TypeScript
- React Navigation
- React Query

## Commands
- `npx expo start` - Start dev
- `npm test` - Run tests
- `npx expo build` - Build

## Structure
src/
├── screens/       # Screen components
├── components/    # Reusable components
├── navigation/    # Navigation config
├── hooks/         # Custom hooks
└── services/      # API services

## Rules
ALWAYS:
- Test on both iOS and Android
- Use platform-specific code when needed (.ios.tsx, .android.tsx)
- Handle keyboard avoiding views
- Support dark mode
- Use SafeAreaView

NEVER:
- Use fixed pixel values without scaling
- Ignore safe area insets
- Skip loading/error states

## Patterns
- Use react-native-safe-area-context
- Responsive dimensions with useWindowDimensions
- AsyncStorage for persistence
```

---

### 4.8 CLI Tool (Rust)

#### CLAUDE.md

```markdown
# Project: [Tool Name]

## Stack
- Rust (stable)
- clap for CLI parsing
- serde for serialization
- tokio for async

## Commands
- `cargo build` - Build
- `cargo test` - Run tests
- `cargo run -- [args]` - Run
- `cargo clippy` - Lint
- `cargo fmt` - Format

## Structure
src/
├── main.rs        # Entry point
├── cli.rs         # CLI definitions
├── commands/      # Command implementations
├── config.rs      # Configuration
└── lib.rs         # Library exports

## Rules
ALWAYS:
- Use Result<T, E> for fallible operations
- Implement proper error types
- Add doc comments to public items
- Use clippy warnings as errors in CI

NEVER:
- Use unwrap() in production code
- Panic without good reason
- Skip tests for public functions

## Patterns
- Clap derive macros for CLI
- thiserror for custom errors
- anyhow for application errors
```

---

## Part 5: Monorepo Templates

### Hierarchical CLAUDE.md Strategy

For monorepos, use multiple CLAUDE.md files:

```
monorepo/
├── CLAUDE.md                    # Global rules (lean)
├── packages/
│   ├── web/
│   │   └── CLAUDE.md           # Web-specific patterns
│   ├── api/
│   │   └── CLAUDE.md           # API conventions
│   └── shared/
│       └── CLAUDE.md           # Shared utilities
└── apps/
    ├── mobile/
    │   └── CLAUDE.md           # Mobile patterns
    └── desktop/
        └── CLAUDE.md           # Desktop patterns
```

### Root CLAUDE.md (Monorepo)

```markdown
# Project: [Monorepo Name]

## About
Monorepo containing [brief description of components].

## Structure
- `packages/` - Shared packages
- `apps/` - Application deployables
- `tools/` - Build and dev tools

## Commands
- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm dev` - Start development

## Rules
ALWAYS:
- Use workspace protocol for internal deps
- Run affected tests before PR
- Keep shared types in packages/types

NEVER:
- Import between apps directly
- Skip the shared types package
- Duplicate shared logic

## Sub-configs
See per-package CLAUDE.md for specific patterns:
@packages/web/CLAUDE.md
@packages/api/CLAUDE.md
```

### Monorepo Size Management

**Problem:** CLAUDE.md becomes too large (47k+ words warning at 40k limit).

**Solution from community (December 2025):**

1. **Split by context:** Backend doesn't need frontend guides
2. **Reference, don't embed:**
   ```markdown
   ## Frontend
   See docs/frontend-guideline.md for detailed guide.
   ```
3. **Let Claude load on-demand:** Don't use @ imports for everything
4. **Target:** Keep root CLAUDE.md under 10k words

---

## Part 6: Custom Slash Commands

### Creating Project Commands

Store in `.claude/commands/` as Markdown files:

```markdown
<!-- .claude/commands/fix-issue.md -->
---
allowed-tools: Bash(git *), Edit, Read
argument-hint: [issue-number]
description: Analyze and fix GitHub issue
---

Analyze and fix GitHub issue: $ARGUMENTS

1. Use `gh issue view $ARGUMENTS` for details
2. Search codebase for relevant files
3. Implement changes
4. Write tests
5. Create commit with conventional message
```

**Usage:** `/project:fix-issue 1234`

### Common Command Templates

#### Code Review Command

```markdown
<!-- .claude/commands/review.md -->
---
allowed-tools: Read, Bash(git diff *)
description: Review current changes
---

Review the current changes for:
1. Code correctness and edge cases
2. Adherence to project patterns
3. Test coverage
4. Security implications

Current diff:
!`git diff HEAD`
```

#### Test Command

```markdown
<!-- .claude/commands/test.md -->
---
allowed-tools: Bash(npm test *), Bash(pytest *), Read
argument-hint: [test-pattern]
description: Run specific tests
---

Run tests matching: $ARGUMENTS

1. Identify test files matching pattern
2. Run targeted tests
3. Report results
4. Suggest fixes for failures
```

#### Component Scaffolding

```markdown
<!-- .claude/commands/component.md -->
---
allowed-tools: Edit, Bash(mkdir *)
argument-hint: [ComponentName]
description: Create new React component
---

Create React component: $ARGUMENTS

1. Create component at src/components/$ARGUMENTS.tsx
2. Use TypeScript with proper prop types
3. Include basic Tailwind styling
4. Create test at src/components/$ARGUMENTS.test.tsx
5. Add Storybook story if applicable
```

---

## Part 7: Subagent Templates

### Security Auditor Subagent

```markdown
<!-- .claude/agents/security-auditor.md -->
---
name: security-auditor
description: Security review for code changes
tools: Read, Grep, Glob
model: sonnet
---

You are a security auditor specializing in OWASP vulnerabilities,
code injection risks, and authentication issues.

## Review Focus
- SQL injection vectors
- XSS vulnerabilities
- Authentication/authorization flaws
- Exposed secrets and credentials
- Insecure dependencies

## Output Format
For each finding:
- Severity: Critical/High/Medium/Low
- Location: file:line
- Description: What's the issue
- Recommendation: How to fix
```

**Invoke:** `@security-auditor review the authentication module`

### Code Reviewer Subagent

```markdown
<!-- .claude/agents/code-reviewer.md -->
---
name: code-reviewer
description: Thorough code review
tools: Read, Grep, Glob
model: sonnet
---

You are a senior engineer conducting code review.

## Review Criteria
- Code correctness and logic
- Error handling completeness
- Test coverage adequacy
- Performance implications
- Maintainability and readability

## Output Format
Provide:
1. Summary assessment
2. Must-fix issues
3. Suggestions for improvement
4. Positive observations
```

---

## Part 8: Community Tools and Resources

### Claude Code Templates (aitmpl.com)

The de facto package manager for Claude Code ecosystem with 400+ components.

**Installation:**

```bash
# Interactive setup
npx claude-code-templates@latest

# Install specific components
npx claude-code-templates@latest --agent development-team/frontend-developer --yes
npx claude-code-templates@latest --command testing/generate-tests --yes
npx claude-code-templates@latest --hook git/pre-commit-validation --yes
npx claude-code-templates@latest --mcp database/postgresql-integration --yes

# Install complete stack
npx claude-code-templates@latest \
  --agent development-team/frontend-developer \
  --command testing/generate-tests \
  --mcp development/github-integration \
  --yes

# Health check
npx claude-code-templates@latest --health-check

# Real-time analytics
npx claude-code-templates@latest --analytics
```

**Component Categories:**
- **Agents:** 160+ specialized AI personas (frontend-developer, security-auditor, data-scientist)
- **Commands:** Reusable task configurations
- **Settings:** Permission and configuration templates
- **Hooks:** Git, validation, formatting automations
- **MCPs:** Database, API, service integrations
- **Templates:** Complete project setups by stack

### Claude Starter Kit

Pre-configured MCP servers and tools:

```bash
git clone https://github.com/serpro69/claude-starter-kit
```

**Includes:**
- Context7: Up-to-date library documentation
- Serena: Semantic code analysis with LSP
- Task Master: AI-powered task management (50+ commands)
- Zen: Multi-model AI for debugging/review

### Awesome Claude Code

Curated list of commands, files, and workflows:

**Categories:**
- CLAUDE.md files from real projects
- Slash commands and workflows
- CLI tools and utilities
- Design review workflows
- Stack-specific starter kits

**Notable Resources:**
- ClaudoPro Directory: Well-crafted hooks, commands, agents
- Context Priming: Systematic project context approach
- Design Review Workflow: Automated UI/UX review
- Laravel TALL Stack Starter Kit
- RIPER Workflow: Research-Innovate-Plan-Execute-Review

### Config Composer

Generate configurations from framework combinations:

```bash
cd claude-config-composer
npm run dev nextjs-15 shadcn

# Generates:
# - CLAUDE.md with combined best practices
# - .claude/settings.json with merged settings
# - .claude/agents/ with framework-specific agents
# - .claude/commands/ with workflow commands
```

**Supported Frameworks:**
- Next.js 15 (App Router, React 19)
- shadcn/ui (Radix UI + Tailwind)
- Tailwind CSS
- Vercel AI SDK
- Drizzle ORM
- Memory MCP Server

---

## Part 9: Quick Setup Script

Automate project initialization:

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

## Stack
- [Add your stack]

## Commands
- [Add common commands]

## Structure
[Brief directory overview]

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
    "allow": ["Read(**)", "Edit(src/**)"],
    "deny": ["Edit(.env*)"]
  }
}
EOF

# Create review command
cat > .claude/commands/review.md << 'EOF'
---
description: Review current changes
---
Review the current changes for correctness, tests, and patterns.
EOF

# Add to gitignore
echo "CLAUDE.local.md" >> .gitignore
echo ".claude/settings.local.json" >> .gitignore

echo "✅ Claude Code setup complete for $PROJECT_NAME"
echo "Next: Run /init in Claude Code to auto-detect your stack"
```

---

## Part 10: Validation Checklist

After setting up your project template, verify:

### Configuration

- [ ] CLAUDE.md exists at project root
- [ ] CLAUDE.md is under 100 lines
- [ ] settings.json has appropriate permissions
- [ ] Dangerous operations are denied
- [ ] Local files are gitignored

### Functionality

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
# Check: Right place? Right format?

# Test 3: Rule enforcement
> "Quick hack: just use any type"
# Check: Does it push back?

# Test 4: Command knowledge
> "How do I run the tests?"
```

---

## Part 11: References

### Official Resources

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) - Anthropic Engineering
- [Using CLAUDE.md Files](https://claude.com/blog/using-claude-md-files) - Anthropic Blog, November 2025
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)
- [CLI Reference](https://docs.claude.com/en/docs/claude-code/cli-reference)

### Community Resources

- [Claude Code Templates](https://github.com/davila7/claude-code-templates) - 400+ components, aitmpl.com
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code) - Curated community resources
- [Claude Starter Kit](https://github.com/serpro69/claude-starter-kit) - Pre-configured MCP setup
- [Claude Config Composer](https://github.com/Matt-Dionis/claude-code-configs) - Dynamic config generator
- [My Claude Code Setup](https://github.com/centminmod/my-claude-code-setup) - Memory bank system
- [Claude-Flow Templates](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-Templates) - Multi-agent orchestration

### Stack-Specific Guides

- [Next.js + TypeScript Template](https://gist.github.com/gregsantos/2fc7d7551631b809efa18a0bc4debd2a)
- [Python/uv/ruff Setup](https://github.com/omaciel/claude-python-setup)
- [FastAPI Template](https://claude.com/blog/using-claude-md-files) - Official example
- [Terraform Skills](https://claude-plugins.dev/skills/@jonhill90/vibes/terraform-basics)
- [Data Science Guide](https://www.dataquest.io/blog/getting-started-with-claude-code-for-data-scientists/)

### Best Practices Articles

- [Writing CLAUDE.md for Mature Codebases](https://blog.huikang.dev/2025/05/31/writing-claude-md.html)
- [Organizing CLAUDE.md in Monorepos](https://dev.to/anvodev/how-i-organized-my-claudemd-in-a-monorepo-with-too-many-contexts-37k7)
- [Claude Code 2.0 Best Practices](https://skywork.ai/blog/claude-code-2-0-best-practices-ai-coding-workflow-2025/)
- [6 Weeks of Claude Code](https://blog.puzzmo.com/posts/2025/07/30/six-weeks-of-claude-code/)
- [Complete Guide to Templates](https://medium.com/@dan.avila7/complete-guide-to-claude-code-templates-4e53d6688b34)
- [Claude Code for Data Science](https://www.sjoerddehaan.com/tech/claude-code-data-science-1.html)
- [Agent Clusters with Worktrees](https://www.pulsemcp.com/posts/how-to-use-claude-code-to-wield-coding-agent-clusters)

### Tools and Utilities

- [ClaudeJupy](https://mcpmarket.com/server/claudejupy) - Persistent Jupyter kernel
- [Claudia](https://www.blog.brightcoding.dev/2025/07/04/claudia-a-powerful-gui-app-and-toolkit-for-claude-code/) - Desktop GUI for Claude Code
- [CCometixLine](https://github.com/Haleclipse/CCometixLine) - Rust statusline tool
- [ccexp](https://github.com/nyatinte/ccexp) - Interactive CLI for config discovery
- [claude-code-templates npm](https://www.npmjs.com/package/claude-code-templates)

---

## Appendix A: Permission Patterns

### Common Permission Patterns

| Pattern | Matches |
|---------|---------|
| `Read(**)` | Read any file |
| `Edit(src/**)` | Edit files in src/ recursively |
| `Edit(**.py)` | Edit any Python file |
| `Bash(npm run:*)` | Any npm run command |
| `Bash(git:*)` | Any git command |
| `Bash(git commit:*)` | Git commit specifically |
| `mcp__github__*` | All GitHub MCP tools |

### Safety Denials (Recommended)

```json
{
  "deny": [
    "Edit(.env*)",
    "Edit(*.key)",
    "Edit(*.pem)",
    "Bash(rm -rf *)",
    "Bash(sudo *)",
    "Bash(curl * | sh)",
    "Bash(wget * | sh)"
  ]
}
```

---

## Appendix B: Hook Examples

### Auto-Format on Save

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit(src/**/*.tsx)",
      "hooks": [{
        "type": "command",
        "command": "npx prettier --write $FILE"
      }]
    }]
  }
}
```

### Pre-Commit Test

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash(git commit:*)",
      "hooks": [{
        "type": "command",
        "command": "npm test || exit 1"
      }]
    }]
  }
}
```

### Type Check After Edit

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit(src/**/*.ts)",
      "hooks": [{
        "type": "command", 
        "command": "npx tsc --noEmit"
      }]
    }]
  }
}
```

---

*This guide is part of the Claude Code Ecosystem documentation series. For configuration details, see the Configuration Guide. For CLAUDE.md best practices, see the CLAUDE.md Best Practices Guide.*
