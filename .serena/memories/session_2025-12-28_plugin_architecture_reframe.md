# Session 2025-12-28: Plugin Architecture Reframe

## Critical Realization

The optimization work revealed a fundamental architectural question we hadn't properly addressed:

### Two Projects, One System
- **claude-enhanced**: The plugin system (source/template)
- **scholardoc**: A "deployment" of that system

### The /init Vision
The `/init` command should:
1. Analyze the target project (stack, patterns, needs)
2. Generate a **lean, project-specific** Claude Code ecosystem
3. NOT load globals that don't apply

### The Problem with sc:* Commands
Current state: 25 global sc:* commands (~24k tokens) load for ALL projects regardless of relevance.

**Questions to resolve:**
1. Should we remove sc:* entirely since they interfere with project-specific goals?
2. Should we replace them with adaptable project-specific versions?
3. Should we keep some truly global commands that never need modification?

### Correct Baseline (from fresh /context)
```
Total: 90k/200k (45%) - NOT 172k we were planning around
MCP tools: 4.5k tokens
Memory files: 19.0k tokens  
sc:* commands: ~24k tokens
Project commands: ~20k tokens
```

The 172k figure was from a session with conversation history, not clean overhead.

### Self-Improvement Architecture
The system needs to be self-improving across:
1. **Per-project adaptation** - /init tailors to specific project
2. **Cross-project learning** - Collect feedback/logs across projects
3. **Initialization workflow improvement** - Learn what makes good deployments

### Key Insight from User
> "Over-abstraction and over-generality cause issues in development workflows, adherence to best practices, since these change in their specificity between projects"

### Approach Going Forward
1. **First**: Create ideal lean system IN scholardoc (test it there)
2. **Then**: Abstract/generalize so /init can reproduce similar lean systems
3. **Finally**: Build cross-project feedback loop for continuous improvement

## Review Agent Issues
The quality-engineer agent identified issues but:
- Used wrong baseline (172k vs actual 90k)
- Didn't understand the two-project architecture
- Option A recommendation was for a different context

## Next Steps
1. Decide on sc:* command strategy (remove/replace/keep-some)
2. Reframe plan around actual baseline (45% not 86%)
3. Focus on creating exemplary scholardoc deployment
4. Use learnings to improve /init command

## Files Created This Session
- docs/VISION.md (scholardoc)
- docs/TESTING_METHODOLOGY.md (scholardoc)
- claudedocs/FINAL-OPTIMIZATION-PLAN.md (needs rewrite with correct understanding)
- claudedocs/PLUGIN-ARCHITECTURE-VISION.md
