# Documentation Methodology Appendix

**Updated:** December 11, 2025  
**Purpose:** Guidelines for creating accurate, useful Claude Code ecosystem documentation

---

## Core Principles

### 1. Accuracy Over Comprehensiveness

Outdated or incorrect information is more harmful than incomplete coverage. When in doubt:
- Verify claims against recent sources (< 2 months old)
- Mark uncertain information clearly
- Omit rather than speculate

### 2. Source Authority vs. Recency

Sources have two independent dimensions:

|  | Recent (< 2 months) | Older (> 2 months) |
|--|---------------------|-------------------|
| **Official** | Gold standard | May reference deprecated features |
| **Community** | Often reflects current behavior | Historical context only |

**Key insight:** Official sources aren't automatically reliable — even Anthropic docs can reference deprecated features. Recent community sources describing *current behavior* can be more accurate than outdated official documentation.

### 3. Claim-Level Verification

Older sources aren't wholesale unreliable. Verify at the claim level:
- Core concepts often remain stable
- Implementation details change rapidly
- API syntax and flags are most volatile

---

## Handling Known Issues

**When documenting tools or techniques with reported problems, follow this framework:**

### Step 1: Contextualize the Issue

Don't just report that "X has problems." Identify:
- **When** does the issue arise?
- **What conditions** trigger it?
- **Who** is affected?

❌ **Bad:** "Serena causes debugging problems"  
✅ **Good:** "Users report worse debugging performance when using Serena for all file operations, including exploratory investigation"

### Step 2: Identify Root Cause

Distinguish between:
- **Tool defects** — bugs in the software itself
- **Usage patterns** — problems arising from how the tool is being used
- **Environmental factors** — conflicts with other tools, configuration issues
- **Fundamental limitations** — inherent tradeoffs in the tool's design

Most reported "issues" are actually usage pattern problems that can be mitigated.

### Step 3: Propose Mitigations

For each issue, ask:
- Can configuration changes resolve it?
- Can workflow adjustments avoid it?
- Can complementary tools compensate?
- Are there workarounds documented by the community?

**Template:**

```markdown
#### Issue: [Descriptive Name]
**Context:** [When/where this occurs]

**Root Cause:** [Why it happens]

**Mitigation:**
[Specific steps, configuration, or practices to resolve/reduce]
```

### Step 4: Qualify Applicability

Not all issues affect all users. Specify:
- Project size thresholds
- Use case categories
- Skill level considerations
- Configuration requirements

---

## Example: Applying the Framework

### Raw Issue Report
> "Claude Code loses context when using Serena. Significantly less capable of finding/fixing issues" — GitHub Issue #449

### Analyzed Documentation

#### Issue: Reduced Debugging Effectiveness with Serena
**Context:** Users report Claude becomes less capable at finding and fixing bugs when Serena is active for all code operations.

**Root Cause:** Serena's semantic tools optimize for *understanding* code structure, not for the *exploratory reading* that debugging requires. When Claude reads files directly, it often picks up contextual clues (error messages, surrounding code, comments) that inform debugging. Serena's symbol-level queries bypass this serendipitous discovery.

**Mitigation:**
1. Use Serena selectively — enable for analysis/planning, disable for debugging
2. Add explicit guidance in CLAUDE.md:
   ```markdown
   ## Tool Selection
   - Debugging/bug-fixing: Use native Claude Code file operations
   - Code structure analysis: Use Serena's find_symbol tools
   ```
3. Create task-specific sessions (Serena-enabled for refactoring, disabled for debugging)

**Applicability:** Most relevant for users doing iterative debugging work on unfamiliar codebases. Less relevant for users primarily doing greenfield development or well-understood maintenance.

---

## Issue Analysis Checklist

Before documenting a known issue:

- [ ] Have I found the original issue report (GitHub, forum, etc.)?
- [ ] Do I understand the context in which it occurs?
- [ ] Have I identified root cause vs. symptoms?
- [ ] Have I searched for community mitigations?
- [ ] Have I tested or verified the mitigation works?
- [ ] Have I specified who this affects?
- [ ] Is my documentation actionable (not just a warning)?

---

## Anti-Patterns in Issue Documentation

### 1. Drive-By Warnings
❌ "Note: Serena has known issues"

This provides no actionable information. Either document the issues properly or omit.

### 2. Uncontextualized Dismissal
❌ "Serena is problematic and should be avoided"

This ignores that many users report positive experiences. Tools have tradeoffs, not absolute quality.

### 3. Issue Amplification
❌ Listing every GitHub issue without analysis

Issues exist for all actively-used tools. Raw issue counts don't indicate severity or relevance.

### 4. Missing Mitigations
❌ "Serena causes context loss during long sessions"

Without mitigation, this is just FUD. Always pair problems with solutions.

---

## Conflicting Information

When sources disagree:

1. **Document both perspectives** with clear attribution
2. **Note the conditions** under which each applies
3. **Avoid arbitrary resolution** — let readers decide based on their context
4. **Prefer recent sources** when timing could explain the difference
5. **Test when possible** — your own verification trumps conflicting reports

**Template:**
```markdown
> **Note:** Community reports vary on [topic]. Some users report [X] 
> (Source A, Source B), while others find [Y] (Source C). The difference 
> may depend on [project size / configuration / use case]. 
```

---

## Source Citation Standards

### Required Information
- URL (full, not shortened)
- Author/organization when available
- Date when available
- Brief description of what the source covers

### Citation Format
```markdown
- [Author/Title](URL) — Brief description (Date if known)
```

### Source Categories
Organize sources by type:
1. Official Documentation
2. Community Guides & Tutorials
3. GitHub Issues (for known bugs/limitations)
4. Tool-Specific Sources (for MCP servers, frameworks, etc.)

---

## Maintenance Guidelines

### Regular Review Triggers
- Claude Code major version releases
- Model updates (Sonnet/Opus releases)
- 30+ days since last verification
- User reports of outdated information

### Deprecation Handling
When features are deprecated:
1. Mark as deprecated with date discovered
2. Note replacement if available
3. Keep for 1-2 versions for users on older versions
4. Remove after transition period

### Version Tracking
Every guide should include:
- Last updated date
- Claude Code version verified against
- Model version verified against
- Changelog of significant updates

---

## Changelog

### v1.0 (December 11, 2025)
- Initial methodology appendix
- Known issues handling framework
- Source evaluation guidelines
- Anti-patterns documentation
