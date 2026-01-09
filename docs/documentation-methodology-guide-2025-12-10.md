# Documentation Methodology Guide

> **Last Updated:** December 10, 2025  
> **Purpose:** Principles and processes for creating accurate, maintainable technical documentation  
> **Scope:** Research methodology, source evaluation, cross-referencing, transparency standards

---

## Overview

This guide establishes the methodology for creating and maintaining documentation in fast-moving technical ecosystems where information becomes outdated quickly. The core philosophy is **accuracy over comprehensiveness**—incomplete but correct documentation serves users better than comprehensive but outdated documentation.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Documentation Quality Hierarchy                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   BEST:    Verified accurate, clearly sourced, dated                │
│              ↓                                                      │
│   GOOD:    Accurate but sources not fully documented                │
│              ↓                                                      │
│   OKAY:    Comprehensive but some claims unverified                 │
│              ↓                                                      │
│   BAD:     Outdated information presented as current                │
│              ↓                                                      │
│   WORST:   Fabricated sources or hallucinated features              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Insight:** In rapidly evolving ecosystems like Claude Code, documentation from 3+ months ago may describe deprecated features, removed functionality, or superseded patterns. Always verify.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Research Methodology](#research-methodology)
3. [Source Evaluation Framework](#source-evaluation-framework) *(authority vs. recency)*
   - [The Two-Dimensional Problem](#the-two-dimensional-problem)
   - [The Corroboration Principle](#the-corroboration-principle)
   - [Community Consensus as Blindspot Detection](#community-consensus-as-blindspot-detection)
   - [Release Notes and GitHub Issues](#release-notes-and-github-issues-as-primary-sources)
4. [Cross-Referencing Requirements](#cross-referencing-requirements)
5. [Date Verification](#date-verification)
6. [Transparency Standards](#transparency-standards)
7. [Document Structure Standards](#document-structure-standards)
8. [Handling Uncertainty](#handling-uncertainty)
9. [Maintenance & Updates](#maintenance--updates)
10. [Quality Checklist](#quality-checklist)
11. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Core Principles

### 1. Accuracy Over Comprehensiveness

**Principle:** It's better to document 70% of a topic accurately than 100% with errors.

**Why:** Users who encounter incorrect information:
- Waste time debugging non-existent issues
- Lose trust in the entire documentation
- May implement deprecated patterns that cause real problems

**Application:**
- If you can't verify a claim, don't include it
- Explicitly note gaps rather than filling them with guesses
- Mark uncertain information clearly

### 2. Recency Awareness

**Principle:** Treat information older than 1-3 months with skepticism in fast-moving ecosystems.

**Why:** Claude Code specifically has undergone major changes:
- v2.0 (October 2025) deprecated thinking keywords, output styles
- Skills system launched October 16, 2025
- Opus 4.5 changed capability landscape

**Application:**
- Always check publication dates
- Prefer sources from the last 30-60 days
- Note when using older sources and verify current accuracy

### 3. Source Transparency

**Principle:** Every significant claim should be traceable to a source.

**Why:**
- Enables readers to verify and go deeper
- Allows future maintainers to check if sources are still valid
- Builds trust through accountability

**Application:**
- Include source URLs in document headers
- Use inline citations for specific claims
- Maintain a references section

### 4. Tension Documentation

**Principle:** When sources disagree, document both perspectives rather than picking one.

**Why:**
- Reality is often nuanced
- Different contexts may warrant different approaches  
- Community experience sometimes contradicts official docs

**Application:**
- "Official documentation states X, but community experience suggests Y"
- Note which approach is recommended for which context
- Update when tensions are resolved

### 5. Defensive Skepticism

**Principle:** Challenge claims that seem inconsistent with current platform behavior.

**Why:**
- Documentation often lags behind actual behavior
- Features get deprecated without documentation updates
- Community posts may describe pre-release or beta behavior

**Application:**
- If possible, verify claims through actual testing
- Cross-reference with multiple sources
- Note when something "should work according to docs but hasn't been verified"

---

## Research Methodology

### Phase 1: Initial Landscape Survey

Before writing anything, survey the information landscape:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Research Phase Workflow                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. SURVEY        2. COLLECT       3. EVALUATE     4. SYNTHESIZE   │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐     ┌─────────┐     │
│  │ Find    │ ───▶ │ Gather  │ ───▶ │ Assess  │ ──▶ │ Write   │     │
│  │ sources │      │ claims  │      │ quality │     │ guide   │     │
│  └─────────┘      └─────────┘      └─────────┘     └─────────┘     │
│       │                │                │               │           │
│       ▼                ▼                ▼               ▼           │
│  - Official docs   - Key claims    - Source age    - Structure     │
│  - Engineering     - Code examples - Reliability   - Citations     │
│    blogs           - Warnings      - Consensus     - Caveats       │
│  - Community       - Edge cases    - Tensions      - Examples      │
│    posts                                                            │
│  - GitHub repos                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Survey checklist:**
- [ ] Release notes and changelogs (most accurate for "what changed when")
- [ ] GitHub issues and discussions (real bugs, workarounds, team responses)
- [ ] Official Anthropic documentation
- [ ] Anthropic Engineering blog posts
- [ ] Claude product blog posts
- [ ] GitHub repositories (official and community)
- [ ] Community tutorials (Medium, Dev.to, personal blogs)
- [ ] Forum discussions (Reddit, Discord, HN)
- [ ] Video tutorials (YouTube, course platforms)

### Phase 2: Source Collection

Gather sources systematically:

**For each source, record:**
| Field | Example |
|-------|---------|
| Title | "Claude Code Best Practices" |
| Author | Boris Cherny (Anthropic) |
| URL | anthropic.com/engineering/... |
| Publication Date | April 18, 2025 |
| Last Updated | (if different from publication) |
| Key Claims | TDD recommended, context management, etc. |
| Reliability Tier | Tier 1 (official) |

### Phase 3: Claim Verification

For each significant claim:

1. **Find the original source** - Don't cite aggregators; find where the claim originated
2. **Check the date** - Is this from before major platform changes?
3. **Cross-reference** - Do other sources confirm this?
4. **Test if possible** - Does this actually work as described?

### Phase 4: Synthesis

Write the guide by:

1. Starting with high-confidence, well-sourced claims
2. Adding context from multiple sources
3. Noting tensions and disagreements
4. Explicitly marking uncertain areas
5. Including practical examples

---

## Source Evaluation Framework

### The Two-Dimensional Problem

A common mistake is treating "official" as synonymous with "reliable." These are actually separate dimensions:

```
                        RECENCY
                    Old ◄─────────────► Recent
                     │                    │
        AUTHORITY    │                    │
                     │                    │
          Official ──┼────────────────────┼──
                     │   ⚠️ DANGER ZONE   │  ✓ IDEAL
                     │   Authoritative    │  Authoritative
                     │   but outdated     │  AND current
                     │                    │
                     │   Example:         │  Example:
                     │   April 2025       │  November 2025
                     │   best practices   │  CLAUDE.md blog
                     │   (deprecated      │
                     │   thinking         │
                     │   keywords)        │
                     │                    │
         Community ──┼────────────────────┼──
                     │   ✗ LOW VALUE      │  ✓ OFTEN BETTER
                     │   Old AND          │  Current real-world
                     │   unverified       │  experience
                     │                    │
                     │                    │  Example:
                     │                    │  Dec 2025 community
                     │                    │  post correctly
                     │                    │  describing Tab toggle
                     │                    │
```

**Key Insight:** A recent community source that accurately describes current behavior is MORE reliable than an official source that describes deprecated features. Authority tells you the source *would know* if current; recency tells you if they *do know* what's current.

**Critical Nuance:** Old sources aren't wholesale unreliable—they need **claim-level verification**. The April 2025 best practices post contains excellent guidance on TDD, context management, and iterative development that remains valid. It's the *mechanism-specific claims* (thinking keywords, output styles) that are outdated. Don't dismiss sources; verify claims.

### The Corroboration Principle

**Older sources + Recent consensus = Confidence**

The amount of corroboration needed scales with risk:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Corroboration Sliding Scale                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Source Characteristics              Corroboration Needed           │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Official + Recent (<2 months)       Minimal (spot-check)           │
│       │                                                             │
│       ▼                                                             │
│  Official + Older (2-6 months)       1-2 recent sources             │
│       │                                                             │
│       ▼                                                             │
│  Official + Pre-breaking-change      2-3 recent sources             │
│       │                                                             │
│       ▼                                                             │
│  Expert Community + Recent           1-2 additional sources         │
│       │                                                             │
│       ▼                                                             │
│  Expert Community + Older            2-3 recent sources             │
│       │                                                             │
│       ▼                                                             │
│  General Community + Recent          2-3 corroborating sources      │
│       │                                                             │
│       ▼                                                             │
│  General Community + Older           3+ sources OR test yourself    │
│       │                                                             │
│       ▼                                                             │
│  Undated / Anonymous                 Avoid OR heavily verify        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Community Consensus as Blindspot Detection

Multiple recent community sources pointing to the same issue often reveal **blindspots in official documentation**:

```
┌─────────────────────────────────────────────────────────────────────┐
│              What Community Sources Surface                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Official docs excel at:          Community sources surface:        │
│  ─────────────────────────        ──────────────────────────        │
│  • Feature announcements          • Practical workarounds           │
│  • Intended behavior              • Actual behavior (edge cases)    │
│  • API specifications             • Performance gotchas             │
│  • Architecture decisions         • "What I wish I knew"            │
│  • Security guidance              • Integration pain points         │
│                                   • Undocumented tips               │
│                                   • Common failure modes            │
│                                   • Real-world usage patterns       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Pattern to watch for:** When 3+ recent community sources mention the same tip, workaround, or gotcha that official docs don't cover, that's a strong signal worth including—even without official confirmation.

**Examples from this project:**
- `@imports` reliability issues: Multiple community reports of inconsistent loading, not mentioned in official docs
- System-reminder discovery: HumanLayer research revealed behavior not documented officially
- Token costs for MCP: Community testing surfaced practical limits official docs didn't specify

### Release Notes and GitHub Issues as Primary Sources

**Often the most accurate sources for current behavior:**

| Source | Why It's Valuable | What to Look For |
|--------|-------------------|------------------|
| **Release Notes** | Version-specific, authoritative | Breaking changes, new features, deprecations |
| **GitHub Issues** | Real bugs, real edge cases | Confirmed bugs, workarounds, team responses |
| **GitHub PRs** | What actually changed in code | Implementation details, rationale |
| **GitHub Discussions** | Team clarifications | Official responses to community questions |
| **Changelogs** | Chronological accuracy | When exactly something changed |

**GitHub issues are especially valuable because:**
- They're tied to specific versions
- Team responses are authoritative
- Workarounds are tested by the reporter
- Status (open/closed) indicates if still relevant

**Example research pattern:**
```markdown
1. Find claim in blog post: "Feature X works like Y"
2. Search GitHub issues: "Feature X" 
3. Find issue #1234: "Feature X doesn't work when Z"
4. See team response: "Fixed in v2.1, workaround is W"
5. Document: "Feature X works like Y. Note: Before v2.1, 
   issue with Z (see #1234). Workaround: W"
```

### Claim Verification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Claim Verification Flow                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Old Official Source                                                │
│  (e.g., April 2025 blog)                                           │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────────┐                                               │
│  │ Extract specific │                                               │
│  │ claim            │                                               │
│  └────────┬────────┘                                               │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐     ┌─────────────────┐                       │
│  │ Is this about a │ YES │ Seek recent     │                       │
│  │ mechanism that  │────►│ corroboration   │                       │
│  │ could change?   │     │ (community OK)  │                       │
│  └────────┬────────┘     └────────┬────────┘                       │
│           │ NO                    │                                 │
│           ▼                       ▼                                 │
│  ┌─────────────────┐     ┌─────────────────┐                       │
│  │ Likely still    │     │ Recent sources  │                       │
│  │ valid (concepts,│     │ confirm?        │                       │
│  │ principles)     │     └────────┬────────┘                       │
│  └─────────────────┘              │                                 │
│                          ┌────────┴────────┐                       │
│                          │                 │                        │
│                         YES               NO                        │
│                          │                 │                        │
│                          ▼                 ▼                        │
│                    ┌──────────┐     ┌──────────────┐               │
│                    │ Include  │     │ Note as      │               │
│                    │ with     │     │ potentially  │               │
│                    │ citation │     │ deprecated   │               │
│                    └──────────┘     └──────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**What to verify vs. what to trust:**

| Claim Type | Verification Need | Example |
|------------|-------------------|---------|
| Principles & philosophy | Low | "Use TDD for agent constraints" |
| Workflow patterns | Medium | "Explore before coding" |
| Specific commands | Medium-High | "/compact to reduce context" |
| Keyboard shortcuts | High | Tab toggle vs. keywords |
| Configuration syntax | High | settings.json structure |
| Feature existence | Very High | Skills, Plan Mode, etc. |

**The more recent the consensus, the better.** A claim verified by 3 sources from the last 30 days is more reliable than one verified by 5 sources from 6 months ago.

### Evaluation Dimensions

Evaluate every source on these independent dimensions:

| Dimension | Question | Why It Matters |
|-----------|----------|----------------|
| **Authority** | Would this source know if accurate? | Official sources have inside knowledge |
| **Recency** | When was this published/updated? | Older sources may describe deprecated behavior |
| **Verifiability** | Can claims be tested or cross-referenced? | Untestable claims require more trust |
| **Methodology** | Does the source show its work? | Transparent reasoning can be evaluated |
| **Specificity** | Does it reference versions, dates, concrete details? | Vague claims are harder to verify |

### Reliability Matrix

Use this matrix to assess overall reliability:

| Authority | Recency | Reliability | Action |
|-----------|---------|-------------|--------|
| Official | Recent (< 2 months) | **HIGH** | Trust, but verify breaking changes |
| Official | Old (> 3 months) | **MEDIUM** ⚠️ | Verify against current behavior |
| Official | Pre-breaking-change | **LOW** ⚠️ | Assume outdated until verified |
| Expert Community | Recent | **HIGH** | Often more current than old official |
| Expert Community | Old | **MEDIUM** | Cross-reference with recent sources |
| General Community | Recent | **MEDIUM** | Verify key claims |
| General Community | Old | **LOW** | Use for discovery only |
| Any | Undated | **VERY LOW** | Avoid or heavily verify |

### Source Type Characteristics

**Version-Anchored Sources (Highest Accuracy for "What Changed")**

These sources are tied to specific versions and are often the most accurate for current behavior:

| Source | Accuracy | Best For | Limitations |
|--------|----------|----------|-------------|
| **Release Notes** | Very High | Breaking changes, new features | May not cover edge cases |
| **Changelogs** | Very High | Chronological changes | Terse, lacks context |
| **GitHub Issues** | High | Bugs, workarounds, edge cases | May be outdated if old |
| **GitHub PRs** | Very High | Implementation details | Requires code literacy |
| **GitHub Discussions** | High | Team clarifications | Scattered, hard to find |

**Why these matter most:** When a blog post says "Feature X works like Y" but a GitHub issue shows "Feature X breaks when Z, fixed in v2.1"—the GitHub issue is more accurate for practical use.

**Official Prose Sources (Anthropic)**

| Source | Authority | Recency Risk | Best Use |
|--------|-----------|--------------|----------|
| docs.anthropic.com | Very High | Medium (can lag) | Reference, verify date |
| Engineering blog | Very High | High (point-in-time) | Understand rationale, verify currency |
| Product blog | High | Medium | Feature announcements, tutorials |

**Critical Warning:** The Anthropic Engineering blog post "Claude Code Best Practices" (April 18, 2025) is frequently cited and contains excellent foundational guidance (TDD, context management, iterative workflows). However, its **mechanism-specific claims** about thinking keywords (`think hard`, `ultrathink`) describe deprecated behavior—these were replaced by the Tab toggle in v2.0 (October 2025). Use the source for principles; verify mechanisms against recent consensus.

**Expert Community Sources**

| Source Type | Authority | Typical Recency | Reliability Notes |
|-------------|-----------|-----------------|-------------------|
| Recognized practitioners | Medium-High | Varies | Check their track record |
| Research-backed posts (HumanLayer, etc.) | Medium-High | Usually recent | Methodology visible, verifiable |
| Multi-source syntheses | Medium | Check date | Only as good as sources used |
| Tutorial with tested code | Medium | Check version | Can verify by running |

**General Community Sources**

| Source Type | Authority | Use For | Watch Out For |
|-------------|-----------|---------|---------------|
| Blog tutorials | Low-Medium | Discovery, patterns | May not test edge cases |
| Forum discussions | Low | Pain points, workarounds | Unverified claims |
| Video tutorials | Low-Medium | Visual learning | Often outdated quickly |
| GitHub community repos | Varies | Working code examples | Check last commit date |

**High-Risk Sources**

| Source Type | Risk | Handling |
|-------------|------|----------|
| Undated content | May be any age | Avoid unless can estimate date |
| AI-generated summaries | May hallucinate | Verify every specific claim |
| Marketing content | May exaggerate | Extract factual claims only |
| Pre-release/beta content | May describe unreleased features | Note version explicitly |
| Aggregator articles | May propagate errors | Trace to original sources |

### Version-Aware Evaluation

For Claude Code specifically, major version changes create reliability boundaries:

```
Timeline:
─────────────────────────────────────────────────────────────────────►
     │                    │                    │
     │                    │                    │
   Early 2025        Oct 2025              Dec 2025
   (Pre-v2.0)        (v2.0 Release)        (Current)
     │                    │                    │
     │    BREAKING        │                    │
     │    CHANGES         │                    │
     │    ◄──────────────►│                    │
     │                    │                    │
   • Thinking keywords    │    • Tab toggle    │
   • Output styles        │    • Skills system │
   • Old SDK name         │    • Plan mode     │
                          │    • Checkpoints   │
```

**Pre-October 2025 sources require explicit verification** of any feature-specific claims. Many mechanics changed fundamentally.

### Practical Evaluation Checklist

For each source, assess:

```markdown
□ Authority
  - Who wrote this? What's their relationship to the topic?
  - Official? Expert? General community?
  
□ Recency  
  - Publication date: ____
  - Last updated: ____
  - Is this before or after relevant breaking changes?
  
□ Version Specificity
  - Does it mention specific versions?
  - Does it mention features that may have changed?
  
□ Verifiability
  - Can I test these claims?
  - Are there code examples?
  - Do other sources confirm this?
  
□ Methodology
  - Does it explain how conclusions were reached?
  - Does it acknowledge limitations?

Overall Reliability: HIGH / MEDIUM / LOW / VERIFY FIRST
```

---

## Cross-Referencing Requirements

### Minimum Standards

| Claim Type | Minimum Sources | Verification Level |
|------------|-----------------|-------------------|
| Core feature description | 1 official | High confidence |
| Best practice recommendation | 2+ sources | Medium-high confidence |
| Configuration syntax | 1 official + test | High confidence |
| Performance claim | 2+ independent | Note as "reported" |
| Community pattern | 3+ community | Medium confidence |
| Workaround/hack | Test + 1 source | Note as "community workaround" |
| Bug/edge case | GitHub issue + 1 | Note issue number |
| Breaking change | Release notes | High confidence |

### Using GitHub Issues in Documentation

GitHub issues deserve special treatment as sources:

```markdown
## Good: Referencing GitHub Issues

"The @imports feature has known reliability issues with relative 
paths (see anthropic-ai/claude-code#1234). Community workaround: 
use absolute paths or duplicate critical instructions."

## Pattern: Bug + Workaround Documentation

| Issue | Status | Versions Affected | Workaround |
|-------|--------|-------------------|------------|
| #1234 | Open | v2.0-v2.1 | Use absolute paths |
| #5678 | Fixed in v2.2 | Pre-v2.2 | Upgrade or use X |
```

**When to cite GitHub issues:**
- Documenting known limitations
- Providing workarounds
- Explaining unexpected behavior
- Noting version-specific bugs

### Cross-Reference Process

```markdown
## Example: Verifying a Claim

**Claim:** "CLAUDE.md files have a ~500 line practical limit"

**Source 1:** Anthropic Engineering Blog (April 2025)
- States: Keep CLAUDE.md "concise"
- No specific line count mentioned

**Source 2:** Claude Product Blog (November 2025)  
- States: "500 lines" as practical maximum
- Provides rationale (token efficiency)

**Source 3:** HumanLayer Research (November 2025)
- States: ~150 instruction limit before degradation
- Explains system-reminder mechanism

**Synthesis:** The 500-line recommendation appears in official sources 
(November 2025), with research explaining why (instruction limits). 
This is HIGH CONFIDENCE.
```

### When Sources Conflict

Document tensions explicitly:

```markdown
## CLAUDE.md @imports Reliability

**Official Position (Anthropic, November 2025):**
@imports are supported for modular CLAUDE.md organization.

**Community Experience (Multiple sources, December 2025):**
@imports have known reliability issues—some users report they 
don't always load, especially with relative paths.

**Recommendation:** Use @imports for organization, but don't rely 
on them for critical instructions. Duplicate essential rules in 
the main CLAUDE.md file.

**Status:** Tension unresolved as of December 2025.
```

---

## Date Verification

### Why Dates Matter

In the Claude Code ecosystem specifically:

| Period | Key Changes |
|--------|-------------|
| Pre-October 2025 | Thinking keywords active, output styles supported |
| October 2025 | v2.0 released—major breaking changes |
| October 16, 2025 | Skills system launched |
| November 2025 | Enhanced documentation, system-reminder discovered |
| Late 2025 | Opus 4.5, 1M context window |

**Content from before October 2025 requires careful verification.**

### Date Verification Checklist

- [ ] Publication date is clearly visible
- [ ] If updated, both dates are noted
- [ ] Content references specific versions when relevant
- [ ] No undated claims used for current guidance
- [ ] Breaking changes since publication date are noted

### Handling Undated Content

```markdown
## Options for Undated Sources

1. **Avoid entirely** - Safest option
2. **Use for discovery only** - Don't cite, but verify claims elsewhere
3. **Note explicitly** - "Undated source, verify before relying"
4. **Estimate date** - From context clues, clearly marked as estimate
```

---

## Transparency Standards

### Document Header Requirements

Every guide should include:

```markdown
# [Topic] Guide

> **Last Updated:** [Date]
> **Verified Against:** [Platform version, model version]
> **Primary Sources:** [List key sources with URLs]
> **Status:** [Verified/Partially verified/Needs review]
```

### Inline Citation Formats

**For specific claims:**
```markdown
According to [Anthropic Engineering (April 2025)](URL), the recommended 
approach is...

Community research from [HumanLayer (November 2025)](URL) discovered that...

Multiple sources [1][2][3] confirm this pattern works reliably.
```

**For uncertain claims:**
```markdown
This approach reportedly works (Source: community forum, unverified).

Official documentation suggests X, though community experience varies.

⚠️ **Unverified:** This feature is mentioned in pre-release documentation
but has not been confirmed in current versions.
```

### References Section

Include at document end:

```markdown
## References

### Official Sources
1. [Anthropic Engineering: Claude Code Best Practices](URL) - April 18, 2025
2. [Claude Blog: Using CLAUDE.md Files](URL) - November 25, 2025

### Community Sources  
3. [HumanLayer: Writing a Good CLAUDE.md](URL) - November 25, 2025
4. [Scott Spence: MCP Token Optimization](URL) - September 30, 2025

### Additional Resources
5. [awesome-claude-code GitHub](URL) - Community resource collection
```

---

## Document Structure Standards

### Standard Template

```markdown
# [Topic] Guide

> **Last Updated:** [Date]
> **Verified Against:** [Versions]  
> **Primary Sources:** [URLs]

---

## Overview

[2-3 paragraph introduction explaining what this covers and why it matters]

---

## Table of Contents

[If document > 500 lines]

---

## [Main Sections]

[Content organized logically]

---

## Quick Reference

[Summary table or cheatsheet for key information]

---

## Troubleshooting / Common Issues

[If applicable]

---

## References

[Full source list]
```

### Section Guidelines

**Introductions should:**
- Explain what the topic is
- Explain why it matters
- Note key prerequisites
- Mention what's NOT covered

**Main sections should:**
- Start with the most important information
- Include practical examples
- Note caveats and edge cases
- Cross-reference related guides

**Examples should:**
- Be tested when possible
- Include both the code and expected behavior
- Note version requirements
- Show common variations

---

## Handling Uncertainty

### Uncertainty Markers

Use consistent markers for different confidence levels:

| Marker | Meaning | Usage |
|--------|---------|-------|
| (verified) | Tested or multiply confirmed | High-confidence claims |
| (reported) | Community reports, not personally verified | Medium-confidence |
| (unverified) | Single source, not confirmed | Low-confidence, use cautiously |
| (deprecated?) | May no longer work | Needs verification |
| ⚠️ | Important caveat | Highlight potential issues |

### Example Usage

```markdown
## Extended Thinking Toggle

The extended thinking mode is activated by pressing Tab (verified, 
official documentation). This replaces the previous keyword-based 
system (deprecated in v2.0).

Some users report that thinking mode persists across sessions 
(reported, multiple community sources), though this behavior 
is not explicitly documented.

⚠️ The old keywords (`think`, `think hard`, `ultrathink`) no longer 
function as of v2.0 and should be removed from existing CLAUDE.md files.
```

### When to Omit vs. Include Uncertain Information

**Include with caveats when:**
- Information would be genuinely useful if correct
- User can easily verify themselves
- Risk of acting on incorrect info is low

**Omit entirely when:**
- Information could cause significant problems if wrong
- No way for user to verify
- Better-verified alternatives exist

---

## Maintenance & Updates

### Review Triggers

Documents should be reviewed when:

| Trigger | Action |
|---------|--------|
| Major platform release | Full review |
| 30 days elapsed | Check key claims |
| User reports issue | Investigate and update |
| New official guidance | Incorporate |
| Source becomes unavailable | Find alternatives |

### Update Process

1. **Note what changed** - In changelog or version history
2. **Update date** - In header and filename if significant
3. **Verify still-current claims** - Don't assume unchanged = still accurate
4. **Update references** - Sources may have moved or been updated
5. **Update index** - If filename changed

### Deprecation Handling

When information becomes outdated:

```markdown
## ~~Output Styles~~ (DEPRECATED)

> ⚠️ **Deprecated in Claude Code v2.0 (October 2025)**
> Output styles are no longer supported. Use hooks or plugins instead.
> See [hooks-guide](./hooks-guide.md) for modern alternatives.

[Historical content can remain for reference, clearly marked]
```

---

## Quality Checklist

### Before Publishing

**Accuracy:**
- [ ] All claims have identified sources
- [ ] Sources are dated and date-appropriate
- [ ] Cross-referenced where required (see standards above)
- [ ] Tested code examples where possible
- [ ] Caveats noted for uncertain information

**Transparency:**
- [ ] Document header complete (date, version, sources)
- [ ] Inline citations for specific claims
- [ ] References section complete
- [ ] Tensions between sources documented
- [ ] Uncertainty clearly marked

**Structure:**
- [ ] Follows standard template
- [ ] Logical organization
- [ ] Table of contents (if > 500 lines)
- [ ] Practical examples included
- [ ] Related guides cross-referenced

**Maintenance:**
- [ ] Filename follows convention
- [ ] Added to index
- [ ] Version history updated
- [ ] Review date set (if applicable)

### Red Flags to Address

- [ ] Claims without any source
- [ ] Sources older than 3 months without verification
- [ ] Undated sources used for current guidance
- [ ] Broken source URLs
- [ ] Contradictions with official documentation (unless noted)
- [ ] Code examples that don't specify version requirements

---

## Anti-Patterns to Avoid

### 1. Conflating Authority with Currency

**Never:**
- Assume "official" means "current"
- Cite old official sources without verifying *mechanism-specific claims*
- Dismiss old sources entirely instead of verifying claim-by-claim
- Ignore community sources that reflect more recent consensus

**The Classic Trap:**
```markdown
❌ "According to Anthropic's best practices, use 'think hard' for 
   complex reasoning tasks."
   
   Problem: This cites the April 2025 blog post, but thinking keywords
   were deprecated in v2.0 (October 2025). The mechanism-specific 
   claim is now wrong, even though the source is authoritative.

✓ "Extended thinking is activated via Tab toggle (Claude Code v2.0+).
   Note: Earlier documentation referenced thinking keywords, but these
   were deprecated in October 2025."
```

**The Right Approach:**
```markdown
The April 2025 best practices post remains valuable for its guidance
on TDD workflows and context management (still accurate). However,
its specific instructions on thinking modes should be verified against
current behavior—recent community consensus confirms the Tab toggle
replaced the keyword system in v2.0.
```

**Instead:**
- Treat authority and recency as separate dimensions
- Verify *specific claims* against recent sources, don't dismiss whole sources
- Seek recent corroboration—community consensus from the last 30-60 days
- Distinguish timeless principles from mechanism-specific details
- Trust recent accurate community sources over old official sources *for mechanism details*

### 2. Source Fabrication

**Never:**
- Invent URLs that don't exist
- Attribute claims to sources that don't make them
- Guess at publication dates

**Instead:**
- Note when you can't find a source
- Use "community consensus" for widely-held beliefs without specific source
- Mark claims as unverified

### 3. Outdated Confidence

**Never:**
- Present 6-month-old information as current without verification
- Assume features still work because they did in older docs
- Ignore version numbers in source material

**Instead:**
- Note source dates prominently
- Verify older claims against recent sources
- Mark potentially outdated information

### 4. False Precision

**Never:**
- Make up specific numbers ("47% faster")
- Claim exact limits without source ("maximum 523 lines")
- Present opinions as facts

**Instead:**
- Use ranges and approximations when precise data unavailable
- Attribute specific numbers to their sources
- Distinguish recommendations from requirements

### 5. Tension Suppression

**Never:**
- Cherry-pick sources that agree with your view
- Ignore contradicting information
- Present controversial practices as settled

**Instead:**
- Document disagreements explicitly
- Present multiple perspectives
- Let readers make informed decisions

### 6. Verification Theater

**Never:**
- List sources you didn't actually read
- Claim verification without actually verifying
- Copy citations from other aggregator articles

**Instead:**
- Only cite sources you've examined
- Test claims when possible
- Trace claims to their origin

---

## Example: Applying This Methodology

### Scenario: Writing a Guide on MCP Token Costs

**Phase 1: Survey**
- Search Anthropic docs for MCP
- Search engineering blog for MCP posts
- Find community articles on MCP optimization
- Check GitHub for MCP-related repos

**Phase 2: Collect**
- Official MCP documentation (anthropic.com/docs/mcp)
- Scott Spence's optimization guide (Sept 2025)
- Multiple Medium articles on MCP patterns
- GitHub discussions on token usage

**Phase 3: Evaluate**
- Official docs: Tier 1, but may not cover optimization
- Scott Spence: Tier 2, detailed methodology, respected author
- Medium articles: Tier 3, cross-reference for consensus
- GitHub: Tier 2-3, check recent activity

**Phase 4: Synthesize**
```markdown
# MCP Token Optimization Guide

> **Last Updated:** December 10, 2025
> **Verified Against:** Claude Code v2.0+
> **Primary Sources:**
> - [Anthropic MCP Documentation](URL)
> - [Scott Spence: Optimising MCP Context Usage](URL) - Sept 30, 2025

## Overview

MCP servers can significantly impact context window usage...

## Token Cost Analysis

According to community research (Scott Spence, September 2025), 
MCP servers typically consume [X] tokens for [operation]...

⚠️ **Note:** Specific token counts may vary by server implementation
and Claude Code version. These figures are based on September 2025
testing and should be verified for your specific setup.
```

---

## References

### On Documentation Methodology
- [Diátaxis Documentation Framework](https://diataxis.fr/)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Write the Docs](https://www.writethedocs.org/)

### On Source Evaluation
- [Wikipedia: Reliable Sources](https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources)
- [Stanford Web Credibility Research](https://credibility.stanford.edu/)

### Project-Specific
- [Community Sources Appendix](./community-sources-appendix-v3.md) - Curated source catalog
- [Index](./index-2025-12-10.md) - Full guide listing
