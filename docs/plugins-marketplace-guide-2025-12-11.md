# Plugins & Marketplace Distribution Guide

**Updated:** December 11, 2025  
**Claude Code Version:** 2.0+  
**Status:** Public Beta (since October 9, 2025)

---

## Overview

Plugins are Claude Code's distribution system for packaging and sharing customizations. They bundle commands, agents, hooks, skills, and MCP servers into single-command installations, solving the "it works on my machine" problem for AI-assisted development workflows.

**What Plugins Solve:**

| Before Plugins | With Plugins |
|----------------|--------------|
| Manual config file copying | Single `/plugin install` command |
| "How do I set up your workflow?" | Clone marketplace, install, done |
| Scattered .claude directories | Version-controlled packages |
| Per-project MCP configuration | Shared MCP configs via marketplace |
| Team setup takes hours | Auto-install on repository trust |

**Plugin Ecosystem:**
```
Plugin = Commands + Agents + Hooks + Skills + MCP Servers
           ↓
    .claude-plugin/plugin.json (manifest)
           ↓
    Marketplace (catalog of plugins)
           ↓
    /plugin install name@marketplace
```

---

## Plugin Architecture

### What Plugins Contain

A plugin can include any combination of five component types:

| Component | Location | Purpose |
|-----------|----------|---------|
| **Commands** | `commands/*.md` | Custom slash commands |
| **Agents** | `agents/*.md` | Specialized subagents |
| **Skills** | `skills/*/SKILL.md` | Model-invoked capabilities |
| **Hooks** | `hooks/hooks.json` | Lifecycle event handlers |
| **MCP Servers** | `.mcp.json` | External tool integrations |

### Directory Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Required: Plugin manifest
├── commands/                 # Custom slash commands
│   ├── review.md
│   └── deploy.md
├── agents/                   # Specialized subagents
│   ├── security-reviewer.md
│   └── test-writer.md
├── skills/                   # Agent Skills
│   ├── code-analysis/
│   │   └── SKILL.md
│   └── documentation/
│       ├── SKILL.md
│       └── templates/
├── hooks/                    # Event handlers
│   ├── hooks.json
│   └── scripts/
│       └── format-code.sh
├── .mcp.json                 # MCP server definitions
├── scripts/                  # Helper scripts
│   └── validate.py
├── README.md
├── LICENSE
└── CHANGELOG.md
```

> **Critical:** All component directories (`commands/`, `agents/`, `skills/`, `hooks/`) must be at the plugin root, NOT inside `.claude-plugin/`.

### Plugin Manifest (plugin.json)

The manifest defines plugin metadata:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT",
  "keywords": ["security", "testing"],
  "homepage": "https://github.com/you/my-plugin",
  "repository": "https://github.com/you/my-plugin"
}
```

**Optional Component Declarations:**

```json
{
  "name": "explicit-plugin",
  "version": "1.0.0",
  "commands": [
    "./commands/core/",
    "./commands/experimental/preview.md"
  ],
  "agents": [
    "./agents/security-reviewer.md",
    "./agents/test-writer.md"
  ],
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{"type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"}]
      }
    ]
  },
  "mcpServers": {
    "my-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
    }
  }
}
```

> **Note:** If component arrays are omitted, Claude Code auto-discovers components in standard directories.

---

## Using Plugins

### Installation Workflow

**Step 1: Add a Marketplace**

```bash
# GitHub repository (most common)
/plugin marketplace add anthropics/claude-code

# Git URL (for non-GitHub hosting)
/plugin marketplace add https://gitlab.com/company/plugins.git

# Local directory (for development)
/plugin marketplace add ./my-marketplace
```

**Step 2: Browse Available Plugins**

```bash
/plugin
```

Select "Browse Plugins" to see descriptions, features, and installation options.

**Step 3: Install a Plugin**

```bash
# Interactive selection
/plugin install

# Direct installation
/plugin install code-review@anthropics/claude-code
```

**Step 4: Restart Claude Code**

Plugins require a restart to take effect.

### Plugin Management Commands

| Command | Purpose |
|---------|---------|
| `/plugin` | Open interactive plugin menu |
| `/plugin install name@marketplace` | Install specific plugin |
| `/plugin uninstall name@marketplace` | Remove plugin |
| `/plugin enable name@marketplace` | Enable disabled plugin |
| `/plugin disable name@marketplace` | Disable without uninstalling |
| `/plugin marketplace add source` | Add marketplace |
| `/plugin marketplace update name` | Refresh marketplace |
| `/plugin marketplace remove name` | Remove marketplace |

### Verification

After installation:
1. Run `/help` to see new commands
2. Check `/agents` for new agents
3. Test plugin features
4. Use `/plugin` → "Manage Plugins" to review what's loaded

---

## Popular Marketplaces

### Official Anthropic Marketplace

```bash
/plugin marketplace add anthropics/claude-code
```

**Included Plugins (12 total):**

| Plugin | Purpose |
|--------|---------|
| `agent-sdk-dev` | Claude Agent SDK development tools |
| `pr-review-toolkit` | Multi-agent PR review with confidence scoring |
| `code-review` | Automated code review |
| `commit` | Git commit workflow commands |
| `plugin-dev` | Plugin development toolkit (7 skills) |
| `feature-dev` | Feature development workflow |
| `frontend-design` | High-quality UI generation |
| `security-guidance` | Security warning hooks |
| `explanatory` | Educational code insights |
| `claude-opus-4-5-migration` | Model migration automation |
| `iterative-loops` | Self-referential development |
| `hook-generator` | Custom hook creation |

### Anthropic Skills Repository

```bash
/plugin marketplace add anthropics/skills
```

Contains document processing skills (docx, pdf, pptx, xlsx) and example skills for creative and technical workflows.

### Community Marketplaces

| Marketplace | Focus | Installation |
|-------------|-------|--------------|
| **jeremylongshore/claude-code-plugins-plus** | 243 plugins, 175 with Skills | `/plugin marketplace add jeremylongshore/claude-code-plugins-plus` |
| **wshobson/agents** | 66 automation plugins | `/plugin marketplace add wshobson/agents` |
| **ChromeDevTools/chrome-devtools-mcp** | Browser automation | `/plugin marketplace add ChromeDevTools/chrome-devtools-mcp` |
| **yamadashy/repomix** | Repomix integration | `/plugin marketplace add yamadashy/repomix` |

### Marketplace Discovery Resources

- [claudecodemarketplace.com](https://claudecodemarketplace.com/) — Community marketplace directory (432+ listed)
- [claude-plugins.dev](https://claude-plugins.dev/) — Plugin browser with installation commands
- [claudecodeplugin.com](https://www.claudecodeplugin.com/) — Plugin directory with categories

---

## Creating Plugins

### Minimal Plugin

**Step 1: Create Structure**

```bash
mkdir my-plugin
cd my-plugin
mkdir -p .claude-plugin commands
```

**Step 2: Create Manifest**

```bash
cat > .claude-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "description": "A simple example plugin",
  "version": "1.0.0",
  "author": {"name": "Your Name"}
}
EOF
```

**Step 3: Add a Command**

```bash
cat > commands/hello.md << 'EOF'
---
description: Greet the user warmly
---

# Hello Command

Greet the user with a personalized, encouraging message.
Ask how you can help them today.
EOF
```

### Adding Components

**Agent Definition (`agents/reviewer.md`):**

```markdown
---
name: code-reviewer
description: Expert at reviewing code for quality and security
---

You are an experienced code reviewer specializing in:
- Security vulnerabilities
- Performance issues
- Code maintainability
- Best practices

When reviewing code:
1. Identify potential issues
2. Explain the problem clearly
3. Suggest specific improvements
4. Prioritize by severity
```

**Skill Definition (`skills/analysis/SKILL.md`):**

```markdown
---
name: code-analysis
description: Analyzes code structure and patterns
trigger: When user asks to analyze, review, or examine code patterns
---

# Code Analysis Skill

## When to Activate
- User asks about code structure
- User wants to understand patterns
- User needs dependency analysis

## Capabilities
- AST-based analysis
- Dependency graphing
- Pattern detection

## Instructions
[Detailed analysis instructions...]
```

**Hook Configuration (`hooks/hooks.json`):**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

**MCP Server (`.mcp.json`):**

```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    }
  }
}
```

### Local Testing

**Step 1: Create Test Marketplace**

```bash
mkdir test-marketplace
cd test-marketplace
mkdir .claude-plugin

cat > .claude-plugin/marketplace.json << 'EOF'
{
  "name": "test-marketplace",
  "owner": {"name": "Developer"},
  "plugins": [
    {
      "name": "my-plugin",
      "source": "../my-plugin",
      "description": "Plugin under development"
    }
  ]
}
EOF
```

**Step 2: Install and Test**

```bash
cd ..
claude

# In Claude Code:
/plugin marketplace add ./test-marketplace
/plugin install my-plugin@test-marketplace
```

**Step 3: Iterate**

```bash
# After making changes:
/plugin uninstall my-plugin@test-marketplace
/plugin install my-plugin@test-marketplace
```

### Plugin Validation

```bash
# Validate plugin structure
claude plugin validate ./my-plugin
```

---

## Marketplace Creation

### Marketplace Manifest

Create `.claude-plugin/marketplace.json` in your repository:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "company-tools",
  "version": "1.0.0",
  "description": "Internal development tools",
  "owner": {
    "name": "DevTools Team",
    "email": "devtools@company.com"
  },
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./plugins/formatter",
      "description": "Automatic code formatting on save",
      "version": "2.1.0",
      "category": "development"
    },
    {
      "name": "deployment-tools",
      "source": {
        "source": "github",
        "repo": "company/deploy-plugin"
      },
      "description": "Deployment automation tools",
      "category": "devops"
    }
  ]
}
```

### Plugin Source Types

**Local Path:**
```json
{"source": "./plugins/my-plugin"}
```

**GitHub Repository:**
```json
{
  "source": {
    "source": "github",
    "repo": "owner/repo"
  }
}
```

**Git URL:**
```json
{
  "source": {
    "source": "git",
    "url": "https://gitlab.com/company/plugin.git"
  }
}
```

### Strict vs. Flexible Mode

| Mode | Behavior |
|------|----------|
| `"strict": true` (default) | Plugin must have its own `plugin.json`; marketplace entry supplements |
| `"strict": false` | Marketplace entry serves as complete manifest |

```json
{
  "name": "simple-plugin",
  "source": "./plugins/simple",
  "strict": false,
  "description": "No plugin.json required",
  "version": "1.0.0"
}
```

---

## Team Distribution

### Repository-Level Configuration

Add to `.claude/settings.json` in your repository:

```json
{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    },
    "project-specific": {
      "source": {
        "source": "git",
        "url": "https://git.company.com/project-plugins.git"
      }
    }
  },
  "enabledPlugins": {
    "code-review@team-tools": true,
    "testing-toolkit@team-tools": true,
    "security-guidance@anthropics/claude-code": true
  }
}
```

### Auto-Installation Flow

1. Developer clones repository
2. Opens Claude Code in repository
3. Claude Code prompts to trust the folder
4. On trust: marketplaces and plugins install automatically
5. Developer is ready to work with full team tooling

### Team Rollout Best Practices

**Phase 1: Pilot**
- Choose team with engaged maintainers
- Start with 2-3 plugins
- Measure: onboarding time, PR turnaround, policy drift

**Phase 2: Standardize**
- Pin specific plugin versions
- Require PRs for marketplace changes
- Add CI validation for plugin configs

**Phase 3: Expand**
- Extract `.claude/` configs to repo template
- Document exceptions and customization points
- Monitor for plugin version drift

### Version Pinning

```json
{
  "plugins": [
    {
      "name": "security-scanner",
      "source": "./plugins/security",
      "version": "2.1.0"
    }
  ]
}
```

> **Recommendation:** Always pin versions in team marketplaces. Test updates in a staging marketplace before promoting.

---

## Known Issues & Mitigations

### Issue: Plugin Enable/Disable Ignored

**Context:** When multiple plugins share a source directory, disabling one plugin loads all skills from the shared directory regardless of settings.

**GitHub Issue:** [#13344](https://github.com/anthropics/claude-code/issues/13344)

**Root Cause:** Claude Code recursively scans directories for SKILL.md files, ignoring the explicit skills array whitelist in marketplace.json.

**Mitigation:**
- Use separate source directories for each plugin
- Don't share parent directories between plugins intended to be toggled independently

---

### Issue: Plugin Management State Inconsistency (Windows)

**Context:** On Windows, previously installed plugins may not be visible in UI, installation shows conflicting states.

**GitHub Issue:** [#9426](https://github.com/anthropics/claude-code/issues/9426)

**Root Cause:** Plugin state tracking doesn't persist correctly across sessions on Windows.

**Mitigation:**
- Clear Claude Code cache: delete `~/.claude/plugins/`
- Reinstall marketplaces and plugins
- Use declarative `.claude/settings.json` for consistent state

---

### Issue: Non-GitHub Repositories Not Supported

**Context:** Using git@ URLs for non-GitHub hosts causes Claude Code to prefix `git@github.com:` incorrectly.

**GitHub Issue:** [#10403](https://github.com/anthropics/claude-code/issues/10403)

**Root Cause:** SSH URL parsing assumes GitHub format.

**Mitigation:**
- Use HTTPS URLs instead: `https://gitlab.com/company/plugins.git`
- Or use local paths for development

---

### Issue: Project-Level Enable/Disable Not Supported in UI

**Context:** `/plugin` command only modifies `~/.claude/settings.json`, not project-level settings.

**GitHub Issue:** [#9533](https://github.com/anthropics/claude-code/issues/9533)

**Root Cause:** UI doesn't have scoping options for enable/disable operations.

**Mitigation:**
- Manually edit `.claude/settings.json` in project directory:
  ```json
  {
    "enabledPlugins": {
      "plugin-name@marketplace": true
    }
  }
  ```

---

### Issue: PostToolUse Hook Crashes with Long Files

**Context:** Plugin hooks using PostToolUse crash when Claude interacts with long files.

**GitHub Issue:** [#11504](https://github.com/anthropics/claude-code/issues/11504)

**Root Cause:** Large file content passed to hook exceeds processing limits.

**Mitigation:**
- Add file size checks in hook scripts
- Use PreToolUse hooks when possible (less data)
- Consider async processing for large files

---

### Issue: WebFetch/WebSearch in permissions.deny Breaks Plugins

**Context:** Adding `WebFetch(**)` or `WebSearch(**)` to `permissions.deny` causes all plugins to fail loading.

**GitHub Issue:** [#11812](https://github.com/anthropics/claude-code/issues/11812)

**Root Cause:** Permission processing has special-case handling that short-circuits plugin initialization.

**Mitigation:**
- Use PreToolUse hooks to block web access instead of permissions.deny:
  ```json
  {
    "hooks": {
      "PreToolUse": [
        {
          "matcher": "WebFetch|WebSearch",
          "hooks": [{"type": "command", "command": "exit 2"}]
        }
      ]
    }
  }
  ```

---

## Best Practices

### Plugin Development

**Structure:**
- Keep plugins focused on a single domain
- Use kebab-case for all file and directory names
- Include README.md with usage instructions
- Version with semantic versioning

**Commands:**
- One command per file in `commands/`
- Include `description` in frontmatter
- Keep instructions clear and specific

**Skills:**
- Define clear trigger conditions
- Include example prompts in SKILL.md
- Test skill activation across contexts

**Hooks:**
- Set appropriate timeouts (default is 60s)
- Handle errors gracefully in scripts
- Log actions for debugging

### Security Considerations

**Before Installing Plugins:**
- Review source code for security issues
- Check for suspicious MCP server configurations
- Verify author reputation
- Test in isolated environment first

**For Plugin Authors:**
- Never include credentials in plugin code
- Use environment variables for sensitive config
- Document required permissions
- Follow least-privilege principles

**Team Governance:**
- Maintain allowlisted marketplaces
- Require PR review for plugin additions
- Audit installed plugins regularly
- Pin versions to prevent unexpected changes

### Plugin Naming Conventions

```
# Command namespacing
commands/namespace/command.md → /namespace:command
commands/simple.md → /simple

# Examples
commands/prime/vue.md → /prime:vue
commands/docs/generate.md → /docs:generate
```

---

## Quick Reference

### Plugin Commands

| Command | Purpose |
|---------|---------|
| `/plugin` | Interactive menu |
| `/plugin install name@marketplace` | Install plugin |
| `/plugin uninstall name@marketplace` | Remove plugin |
| `/plugin enable name@marketplace` | Enable plugin |
| `/plugin disable name@marketplace` | Disable plugin |
| `/plugin marketplace add source` | Add marketplace |
| `/plugin marketplace update name` | Refresh |
| `/plugin marketplace remove name` | Remove |
| `claude plugin validate path` | Validate structure (CLI) |

### Environment Variables in Plugins

| Variable | Resolves To |
|----------|-------------|
| `${CLAUDE_PLUGIN_ROOT}` | Plugin installation directory |

### Marketplace Source Types

| Type | Example |
|------|---------|
| GitHub | `"repo": "owner/repo"` |
| Git URL | `"url": "https://gitlab.com/org/repo.git"` |
| Local | `"./path/to/plugin"` |

### Plugin Component Checklist

- [ ] `.claude-plugin/plugin.json` exists with required fields
- [ ] Components at plugin root (not inside `.claude-plugin/`)
- [ ] Commands have frontmatter with description
- [ ] Agents have name and description in frontmatter
- [ ] Skills have SKILL.md in skill subdirectory
- [ ] Hooks reference scripts with correct paths
- [ ] MCP servers use `${CLAUDE_PLUGIN_ROOT}` for paths

---

## Sources

### Official Documentation
- [Plugins Guide](https://code.claude.com/docs/en/plugins) — Official plugin tutorial
- [Plugins Reference](https://docs.claude.com/en/docs/claude-code/plugins-reference) — Technical specifications
- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — Marketplace management
- [Plugins Announcement](https://www.anthropic.com/news/claude-code-plugins) — Launch blog post (October 9, 2025)

### Official Repositories
- [anthropics/claude-code/plugins](https://github.com/anthropics/claude-code/tree/main/plugins) — Official plugins
- [anthropics/skills](https://github.com/anthropics/skills) — Official skills repository
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) — Curated plugin directory

### Community Resources
- [claudecodemarketplace.com](https://claudecodemarketplace.com/) — Marketplace directory
- [claude-plugins.dev](https://claude-plugins.dev/) — Plugin browser
- [jeremylongshore/claude-code-plugins-plus](https://github.com/jeremylongshore/claude-code-plugins-plus) — 243 plugin marketplace

### Guides
- [Composio Plugin Guide](https://composio.dev/blog/claude-code-plugin) — Practical workflow examples
- [Skywork Team Setup Guide](https://skywork.ai/blog/claude-code-plugin-standardization-team-guide/) — Enterprise rollout
- [Agnost Plugin Tutorial](https://agnost.ai/blog/claude-code-plugins-guide/) — Step-by-step creation

### GitHub Issues
- [#13344](https://github.com/anthropics/claude-code/issues/13344) — Plugin enable/disable ignored
- [#9426](https://github.com/anthropics/claude-code/issues/9426) — Windows management issues
- [#10403](https://github.com/anthropics/claude-code/issues/10403) — Non-GitHub repos not supported
- [#9533](https://github.com/anthropics/claude-code/issues/9533) — Project-level scoping missing
- [#11504](https://github.com/anthropics/claude-code/issues/11504) — PostToolUse crash on long files
- [#11812](https://github.com/anthropics/claude-code/issues/11812) — WebFetch deny breaks plugins

---

## Changelog

### v1.0 (December 11, 2025)
- Initial guide covering plugin architecture, installation, creation
- Marketplace creation and team distribution
- 6 known issues documented with mitigations
- Quick reference and best practices
