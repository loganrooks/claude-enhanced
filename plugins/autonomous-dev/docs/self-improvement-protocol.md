# Self-Improvement Protocol

This document describes the self-improvement feedback loop and how to leverage Claude Agent SDK for automated analysis.

## Overview

The self-improvement system creates a closed feedback loop:

```
Session Work → Log Capture → Pattern Analysis → Diagnosis → Improvement → Better Sessions
     ↑                                                                           │
     └───────────────────────────────────────────────────────────────────────────┘
```

## Data Sources

### 1. Custom Session Logs

Location: `.claude/logs/sessions/`

Captured by the `session-logger` hook:
- Session metrics (files, commits, duration)
- Git activity summary
- Issues and warnings detected
- Handoff reminders

### 2. Signal Files

Location: `.claude/logs/signals/`

Auto-generated when issues are detected:
- Error signals (test failures, lint errors)
- Warning signals (large commits, TODOs)
- Process signals (workflow violations)

### 3. Native Claude Code Logs

Location: `~/.claude/projects/{project-path}/`

Rich JSONL format containing:
- Full conversation history
- Tool calls and results
- Token usage
- Timestamps
- Git branch context

### 4. Serena Memories

Persistent cross-session context:
- `session_handoff` - Work continuity
- `decision_log` - Architectural decisions
- `improvement_log` - Change history
- `project_vision` - Canonical description

## Claude Agent SDK Integration

The Claude Agent SDK enables automated analysis through headless execution and structured outputs.

### Headless Mode

Run Claude Code programmatically without interactive prompts:

```bash
# Single command execution
claude-code --print "Run /project:analyze-logs week all"

# With allowedTools restriction
claude-code --allowedTools "Read,Grep,Bash(ls:*)" -p "List session logs"

# JSON output for parsing
claude-code --output-format json -p "Analyze recent errors"
```

### Structured Analysis Script

```typescript
// scripts/analyze-logs.ts
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

interface AnalysisResult {
  patterns: {
    type: string;
    frequency: number;
    severity: "low" | "medium" | "high";
    rootCause: string;
    recommendation: string;
  }[];
  metrics: {
    sessionsAnalyzed: number;
    errorsFound: number;
    warningsFound: number;
    avgFilesPerSession: number;
  };
  improvements: {
    priority: "P0" | "P1" | "P2";
    type: string;
    target: string;
    rationale: string;
  }[];
}

async function analyzeSessionLogs(): Promise<AnalysisResult> {
  const client = new Anthropic();

  // Gather log data
  const logDir = ".claude/logs/sessions";
  const logs = fs.readdirSync(logDir)
    .filter(f => f.endsWith(".md"))
    .slice(-10)  // Last 10 sessions
    .map(f => fs.readFileSync(path.join(logDir, f), "utf-8"));

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: `Analyze these session logs and return structured JSON:

${logs.join("\n---\n")}

Return JSON matching this schema:
{
  "patterns": [{"type": string, "frequency": number, "severity": "low"|"medium"|"high", "rootCause": string, "recommendation": string}],
  "metrics": {"sessionsAnalyzed": number, "errorsFound": number, "warningsFound": number, "avgFilesPerSession": number},
  "improvements": [{"priority": "P0"|"P1"|"P2", "type": string, "target": string, "rationale": string}]
}`
    }]
  });

  // Parse response
  const text = response.content[0].type === "text"
    ? response.content[0].text
    : "";

  return JSON.parse(text);
}

// Execute and save
analyzeSessionLogs().then(result => {
  fs.writeFileSync(
    ".claude/logs/analysis-result.json",
    JSON.stringify(result, null, 2)
  );
  console.log("Analysis complete:", result);
});
```

### GitHub Actions Integration

Automate weekly analysis:

```yaml
# .github/workflows/self-improvement.yml
name: Self-Improvement Analysis
on:
  schedule:
    - cron: '0 9 * * 1'  # Monday 9am
  workflow_dispatch:
    inputs:
      scope:
        description: 'Analysis scope'
        required: true
        default: 'week'
        type: choice
        options:
          - session
          - week
          - month
          - all

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Analysis
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude-code --print "Run /project:analyze-logs ${{ inputs.scope || 'week' }} all" \
            > .claude/logs/weekly-analysis.md

      - name: Create Issue if Problems Found
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const analysis = fs.readFileSync('.claude/logs/weekly-analysis.md', 'utf-8');

            // Check for P0 improvements
            if (analysis.includes('| P0 |')) {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: '🔧 Self-Improvement: P0 Issues Detected',
                body: `## Weekly Analysis Results\n\n${analysis}`,
                labels: ['self-improvement', 'priority-high']
              });
            }

      - name: Commit Analysis
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .claude/logs/
          git commit -m "chore: weekly self-improvement analysis" || echo "No changes"
          git push
```

### Native Log Analysis with DuckDB

For complex queries over JSONL logs:

```sql
-- Load native Claude Code logs
CREATE TABLE logs AS
SELECT * FROM read_json_auto('~/.claude/projects/*/session*.jsonl');

-- Tool usage frequency
SELECT
  json_extract_string(message, '$.tool') as tool,
  count(*) as usage_count
FROM logs
WHERE json_extract_string(message, '$.type') = 'tool_call'
GROUP BY tool
ORDER BY usage_count DESC
LIMIT 20;

-- Error patterns
SELECT
  json_extract_string(message, '$.error') as error,
  count(*) as frequency
FROM logs
WHERE json_extract_string(message, '$.error') IS NOT NULL
GROUP BY error
ORDER BY frequency DESC;

-- Session duration analysis
SELECT
  date_trunc('day', timestamp) as day,
  avg(duration_minutes) as avg_session_length,
  count(*) as session_count
FROM sessions
GROUP BY day
ORDER BY day DESC;
```

## Self-Improvement Workflow

### Trigger Types

| Trigger | When | Focus |
|---------|------|-------|
| `pr-merge` | After PR merged | Patterns from PR work |
| `error` | After significant error | Root cause of error |
| `weekly` | Weekly during active dev | Accumulated patterns |
| `context-loss` | After re-explanation needed | Memory/doc gaps |
| `full-audit` | Before major work | Comprehensive review |

### The Improvement Cycle

```
1. EXPLORE (Gather Signals)
   └─ Session logs, signals, git history, Serena memories

2. DIAGNOSE (Analyze Patterns)
   └─ Categorize, trace root causes, self-review diagnosis

3. PLAN (Propose Improvements)
   └─ Identify improvement type, prioritize, review proposals

4. IMPLEMENT (Apply Changes)
   └─ Make changes, verify, log to improvement_log

5. REVIEW (Validate & Learn)
   └─ Verify effectiveness, update logs, archive signals
```

### Improvement Types

| Type | Target | Example |
|------|--------|---------|
| COMMAND_REFINEMENT | `.claude/commands/` | Add missing step to workflow |
| AGENT_ADDITION | `.claude/agents/` | New reviewer for blind spot |
| HOOK_ADDITION | `.claude/hooks/` | Automated reminder |
| INSTRUCTION_COMPRESSION | `CLAUDE.md` | Reduce bloat |
| DOCUMENTATION_UPDATE | `docs/` | Sync with reality |
| MEMORY_UPDATE | Serena | Cross-session context |

### System Health Limits

Prevent system bloat:

| Metric | Limit | Action if Exceeded |
|--------|-------|-------------------|
| CLAUDE.md | < 500 lines | Compress or move content |
| Agents | < 10 | Consolidate or remove |
| Hooks | < 10 | Consolidate or remove |

## Commands Reference

| Command | Purpose |
|---------|---------|
| `/project:analyze-logs [scope] [focus]` | Pattern analysis |
| `/project:diagnose <signal>` | Root cause analysis |
| `/project:improve [trigger]` | Full improvement cycle |
| `/project:checkpoint <note>` | Save current state |
| `/project:resume` | Restore session context |

## Best Practices

1. **Run weekly analysis** during active development
2. **Address P0 issues immediately** before they compound
3. **Review improvement_log** before major changes
4. **Keep system lean** - remove unused agents/hooks
5. **Document decisions** in decision_log memory
6. **Test improvements** before committing

## Metrics to Track

| Metric | Good | Warning | Action |
|--------|------|---------|--------|
| Errors per week | < 5 | 5-10 | > 10 → diagnose |
| TODOs accumulated | < 3 | 3-7 | > 7 → address |
| Context loss events | 0-1 | 2-3 | > 3 → improve docs |
| Human interruptions | 0-1 | 2-3 | > 3 → improve workflow |
