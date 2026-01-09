# Testing Strategy for AI Agents

> **Last Updated:** December 9, 2025  
> **Claude Code Version:** v2.0+  
> **Purpose:** Define testing approaches that constrain agent behavior and prevent regressions

## What's New (December 2025)

| Feature | Status | Description |
|---------|--------|-------------|
| TDD Guard | ✅ GA | External TDD enforcement via hooks |
| Subagent TDD | ✅ GA | Isolated context for test writer vs implementer |
| LLM Eval-Driven Development | ✅ Emerging | Evals as specifications for agent behavior |
| Mutation Testing + LLMs | ✅ GA | AI-detected equivalent mutants |
| Skills-based TDD | ✅ GA | Custom skills for Red-Green-Refactor workflow |

---

## Why TDD is MORE Critical with Agents

Opus 4.5's improvements make Claude *better at following TDD*, not obsolete from needing it:

1. **Hallucination rate still exists** — Even frontier models hallucinate
2. **Agentic coding amplifies errors** — Small mistakes compound over multi-step changes
3. **Tests provide clear success/failure signals** — Agents respond well to concrete feedback
4. **Anthropic recommends it** — TDD is "an Anthropic-favorite workflow"

```
┌─────────────────────────────────────────────────────────────┐
│  Without TDD:  Agent → Code → (hope it works)              │
│  With TDD:     Agent → Tests → Code → Verification         │
│                         ↑                ↓                  │
│                         └────── Feedback Loop ──────────────┘
└─────────────────────────────────────────────────────────────┘
```

**From Harper Reed (community experience):**
> "Robots LOVE TDD. It's the most effective counter to hallucination and scope drift. Build test and mock first, then make the mock real."

---

## Types of Testing

### 1. Contract-Based Testing (RECOMMENDED)

> "Test what the code does, not how it does it."

**Why it matters for agents:** AI agents frequently rewrite code entirely. Implementation-coupled tests break on every change. Contract tests survive rewrites.

```javascript
// BAD: Implementation-coupled
test('uses internal cache map', () => {
  expect(service._cacheMap.size).toBe(3);  // Breaks on refactor
});

// GOOD: Contract-based
test('returns cached value on second call', () => {
  const result1 = service.getData('key');
  const result2 = service.getData('key');
  expect(result1).toEqual(result2);  // Survives any implementation
});
```

**The Rewrite Test:** Before committing a test, ask: "Would this pass if someone completely rewrote the implementation but kept the same behavior?" If no, fix the test.

### 2. Property-Based Testing

Tests invariants rather than specific examples. More robust against agent-generated edge cases.

```python
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_sort_preserves_length(lst):
    assert len(sorted(lst)) == len(lst)

@given(st.lists(st.integers()))
def test_sort_is_idempotent(lst):
    assert sorted(lst) == sorted(sorted(lst))
```

**Good for agents because:**
- Catches edge cases agents miss
- Tests hold regardless of implementation approach
- Generates regression tests automatically

### 3. Unit Tests

Fast, focused, run on every change. The foundation.

```python
# tests/unit/test_calculator.py
def test_add_positive_numbers():
    assert add(2, 3) == 5

def test_add_negative_numbers():
    assert add(-2, -3) == -5

def test_add_raises_on_non_numeric():
    with pytest.raises(TypeError):
        add("a", 2)
```

### 4. Integration Tests

Test component interactions. Run after unit tests pass.

```python
# tests/integration/test_user_service.py
def test_user_creation_persists_to_database():
    user = UserService.create(name="Alice", email="alice@example.com")
    retrieved = UserService.get_by_email("alice@example.com")
    assert retrieved.name == "Alice"
```

### 5. End-to-End (E2E) Tests

Test full user workflows. Most expensive, run in CI.

```javascript
// tests/e2e/login.spec.js
test('user can log in and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});
```

### 6. Mutation Testing

Verifies tests actually catch bugs by introducing mutations.

```bash
# Using mutmut for Python
mutmut run --paths-to-mutate=src/

# Using Stryker for JavaScript
npx stryker run
```

**Meta's finding:** LLMs can detect equivalent mutants with 0.95 precision, making mutation testing practical at scale.

### 7. LLM Eval-Driven Development (NEW)

Adapting TDD for AI agent behavior using evals as specifications:

```python
# Define eval before implementing agent behavior
eval_suite = [
    {"input": "search for Python tutorials", "expected_behavior": "uses_web_search"},
    {"input": "what's 2+2", "expected_behavior": "answers_directly"},
    {"input": "summarize this PDF", "expected_behavior": "reads_document_first"},
]

# Run eval against agent
results = run_evals(agent, eval_suite)
assert results.pass_rate > 0.95
```

**Benefits:**
- Defines expected agent behavior before implementation
- Catches regressions when changing prompts or models
- AI can generate test variations automatically

---

## Testing Pyramid for Agent Development

```
          ╱╲
         ╱  ╲        E2E Tests (5-10%)
        ╱────╲       - Full user flows
       ╱      ╲      - Run in CI only
      ╱────────╲     
     ╱          ╲    Integration (20-30%)
    ╱────────────╲   - Component interactions
   ╱              ╲  - Run before commit
  ╱────────────────╲ 
 ╱                  ╲ Unit Tests (60-70%)
╱────────────────────╲- Fast, focused
                       - Run on every edit
```

---

## TDD Workflow for Claude Code

### Basic Red-Green-Refactor

```
┌─────────────────────────────────────────────────────────────────┐
│                    TDD Workflow with Claude                     │
│                                                                 │
│  Step 1: Write Tests                                            │
│  ────────────────────                                           │
│  "Write tests based on these input/output pairs:                │
│   - Input: [1,2,3] → Output: 6                                  │
│   - Input: [] → Output: 0                                       │
│   - Input: [-1,1] → Output: 0                                   │
│                                                                 │
│   Be explicit: this is TDD, do NOT write implementation yet."   │
│                                                                 │
│  Step 2: Verify Tests Fail (RED)                                │
│  ────────────────────────────────                               │
│  "Run the tests. They should fail. Confirm they fail for        │
│   the right reasons (function not implemented, not syntax)."    │
│                                                                 │
│  Step 3: Commit Tests                                           │
│  ────────────────────                                           │
│  "Commit these tests: git commit -m 'test: add sum tests'"      │
│                                                                 │
│  Step 4: Implement to Pass (GREEN)                              │
│  ─────────────────────────────────                              │
│  "Now write code that passes the tests. Do NOT modify the       │
│   tests. Keep iterating until all tests pass."                  │
│                                                                 │
│  Step 5: Verify All Pass                                        │
│  ───────────────────────                                        │
│  "Run tests again. All should pass. If any fail, fix the        │
│   implementation, not the tests."                               │
│                                                                 │
│  Step 6: Refactor (REFACTOR)                                    │
│  ───────────────────────────                                    │
│  "Clean up the implementation. Tests must stay green."          │
│                                                                 │
│  Step 7: Commit Implementation                                  │
│  ────────────────────────────                                   │
│  "Commit: git commit -m 'feat: implement sum function'"         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### CLAUDE.md TDD Section

```markdown
# CLAUDE.md

## Development Process

1. **Write test first** — Define expected behavior
2. **Run test, confirm RED** — Verify it tests something
3. **Implement minimum code** — Only enough to pass
4. **Run test, confirm GREEN** — Verify implementation works
5. **Refactor if needed** — Clean up while tests stay green
6. **Commit** — Only after all tests pass

### Critical Rules
- NEVER skip writing tests for "simple" changes
- NEVER implement functionality without a corresponding test
- If tests don't exist for modified code, write them FIRST
- Use /rewind if you accidentally break tests
```

### TDD with Plan Mode

```
1. User: "I need a user authentication system"
2. Claude (Plan Mode): Creates plan.md with:
   - List of required tests
   - Implementation approach
   - Edge cases to cover
3. User: Reviews and approves plan
4. Claude: Writes tests FIRST
5. Claude: Runs tests, confirms failure
6. Claude: Implements, iterating until green
```

---

## Subagent TDD Pattern (NEW)

**Problem:** When everything runs in one context window, the test writer's detailed analysis bleeds into the implementer's thinking. Tests become coupled to anticipated implementation.

**Solution:** Use separate subagents with isolated context:

### TDD Test Writer Skill

```markdown
---
name: tdd-test-writer
description: Write failing integration tests for TDD RED phase
tools: Read, Glob, Grep, Write, Edit, Bash
---

# TDD Test Writer (RED Phase)

Write a failing integration test that verifies the requested feature behavior.

## Process
1. Understand the feature requirement from the prompt
2. Write an integration test in `tests/`
3. Run tests to verify they FAIL
4. Do NOT proceed until tests fail for the right reason

## Rules
- Test behavior, NOT implementation
- Do NOT create mock implementations
- Do NOT write any production code
```

### TDD Implementer Skill

```markdown
---
name: tdd-implementer
description: Implement code to pass failing tests (GREEN phase)
tools: Read, Glob, Grep, Write, Edit, Bash
---

# TDD Implementer (GREEN Phase)

Write the minimum code necessary to pass the failing tests.

## Process
1. Read the failing tests
2. Implement ONLY what's needed to pass
3. Run tests until GREEN
4. Do NOT add features not covered by tests

## Rules
- Do NOT modify tests
- Do NOT add untested functionality
- Keep implementation minimal
```

### Orchestrating TDD Subagents

```markdown
Implement the user authentication feature using TDD:

1. @tdd-test-writer: Write failing tests for login, logout, session management
2. Wait for tests to be committed
3. @tdd-implementer: Implement code to pass the tests
4. @tdd-refactorer: Clean up implementation while keeping tests green
```

---

## Enforcement Mechanisms

### Level 1: CLAUDE.md (Soft Guidance)

```markdown
# CLAUDE.md

## Testing Requirements

ALWAYS write tests before implementing features.
NEVER skip the red-green-refactor cycle.
Run `npm test` after every code change.
```

**Limitation:** Can be ignored. Good for guidelines, not enforcement.

### Level 2: Hooks (Runtime Enforcement)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit:*)",
        "hooks": [{
          "type": "command",
          "command": "test -f /tmp/tests-passed || (echo 'Tests must pass before commit' >&2 && exit 2)"
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "npm test --watchAll=false 2>&1 | head -20"
        }]
      }
    ]
  }
}
```

**Block-at-Submit Strategy:** Don't block during edits (confuses agent). Block at commit time.

### Level 3: TDD Guard (External Enforcement)

[tdd-guard](https://github.com/nizos/tdd-guard) - An MCP-style tool that:
- Tracks test state (RED/GREEN/REFACTOR)
- Blocks writes that skip test-first step
- Works with Jest, Vitest, pytest, PHPUnit, Go, Rust

```bash
# Installation
npm install -g tdd-guard

# Configure hooks
# .claude/settings.json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit|MultiEdit|TodoWrite",
      "hooks": [{ "type": "command", "command": "tdd-guard" }]
    }],
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{ "type": "command", "command": "tdd-guard" }]
    }],
    "SessionStart": [{
      "matcher": "startup|resume|clear",
      "hooks": [{ "type": "command", "command": "tdd-guard" }]
    }]
  }
}
```

**Test Framework Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { VitestReporter } from 'tdd-guard-vitest'

export default defineConfig({
  test: {
    reporters: [
      'default',
      new VitestReporter('/path/to/project'),
    ],
  },
})
```

### Level 4: CI/CD Pipeline (Final Gate)

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Unit Tests
        run: npm test -- --coverage --ci
        
      - name: Run Integration Tests
        run: npm run test:integration
        
      - name: Fail on Coverage Drop
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage dropped below 80%"
            exit 1
          fi
```

---

## Test File Organization

```
tests/
├── unit/                    # Fast, isolated tests
│   ├── services/
│   │   ├── user.test.ts
│   │   └── auth.test.ts
│   └── utils/
│       └── validation.test.ts
├── integration/             # Component interaction tests
│   ├── api/
│   │   └── endpoints.test.ts
│   └── database/
│       └── queries.test.ts
├── e2e/                     # Full workflow tests
│   ├── auth.spec.ts
│   └── checkout.spec.ts
├── fixtures/                # Shared test data
│   └── users.json
└── helpers/                 # Test utilities
    └── setup.ts
```

---

## Testing Agent-Generated Code

### The Review Loop

```python
# Human reviews Claude's tests for:
# 1. Are they testing behavior, not implementation?
# 2. Do they cover edge cases?
# 3. Would they survive a rewrite?

def review_test_quality(test_file):
    red_flags = [
        r'_private_method',      # Testing internals
        r'\.mock\(',             # Excessive mocking
        r'implementation',        # Testing how, not what
    ]
    # Flag for human review if red flags found
```

### Executor-Evaluator Pattern

Use two agents: one writes, one reviews.

```markdown
## Subagent: Test Writer
Write comprehensive tests for the user authentication module.
Focus on behavior, not implementation.

## Subagent: Test Reviewer
Review the tests written. Check for:
- Implementation coupling
- Missing edge cases
- Assertion quality
Suggest improvements.
```

---

## AI-Assisted Test Generation

### Generating Test Variations

```markdown
"Take these 4 initial test cases and expand each one into 8 variations:

1. Login success test → Create variations for:
   - Different user roles
   - Different input formats
   - Edge cases (empty strings, special characters)
   - Error conditions

Generate comprehensive test coverage automatically."
```

**Result:** AI can quickly generate 32+ tests from 4 seed cases, covering edge cases humans might miss.

### E2E Test Generation

```markdown
"Based on the user story:
'As a user, I want to delete recipes from my library'

Write E2E tests using Playwright that cover:
1. Successful deletion
2. Confirmation dialog
3. Undo functionality
4. Error handling
5. UI state after deletion"
```

---

## Language-Specific Setup

### Python (pytest)

```bash
pip install pytest pytest-cov hypothesis

# pytest.ini
[pytest]
testpaths = tests
addopts = --cov=src --cov-report=html
```

### JavaScript/TypeScript (Vitest)

```bash
npm install -D vitest @vitest/coverage-v8

# vitest.config.ts
export default defineConfig({
  test: {
    coverage: { provider: 'v8' }
  }
})
```

### Go

```bash
# Run with coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Rust

```bash
cargo install cargo-nextest
cargo nextest run
```

---

## Common Pitfalls

### 1. Testing Implementation Details

```javascript
// BAD
expect(service.cache._internal_map.size).toBe(3);

// GOOD
expect(service.getData(key)).toEqual(expectedValue);
```

### 2. Over-Mocking

```javascript
// BAD - mocks everything
const mockDb = jest.fn();
const mockCache = jest.fn();
const mockLogger = jest.fn();

// GOOD - test real interactions where possible
const testDb = new InMemoryDatabase();
```

### 3. Skipping Tests for "Simple" Code

```markdown
# NEVER in CLAUDE.md:
"Simple utility functions don't need tests"

# ALWAYS:
"All functions need tests, regardless of perceived simplicity"
```

### 4. Letting Agent Skip Red Phase

```markdown
# CLAUDE.md
After writing tests, you MUST run them and verify they FAIL
before writing any implementation code.
```

### 5. Context Pollution in TDD

```markdown
# Problem: Test writer sees implementation plans
# Solution: Use isolated subagents

@tdd-test-writer: Write tests (isolated context)
@tdd-implementer: Implement code (separate context)
```

---

## Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| Code Coverage | >80% | nyc, coverage.py |
| Mutation Score | >70% | Stryker, mutmut |
| Test Execution Time | <30s for unit | Built-in |
| Flaky Test Rate | <1% | CI logs |
| TDD Compliance | 100% | TDD Guard |

---

## Self-Improvement: Test Analytics

```bash
# Analyze test failures over time
find ~/.claude/projects -name "*.jsonl" -mtime -7 | \
  xargs grep -h "test failed" | \
  claude -p "Identify patterns in test failures and suggest CLAUDE.md updates"
```

Feed failures back into CLAUDE.md to prevent recurrence.

---

## Integration with Checkpoints

Use checkpoints alongside TDD for safe experimentation:

```markdown
1. Write failing tests → Checkpoint created
2. Implement code → Checkpoint created
3. Tests fail unexpectedly?
   - Press Esc+Esc to open /rewind
   - Restore code to pre-implementation state
   - Try different approach
4. Tests pass → Commit
```

**Checkpoints complement TDD:**
- TDD catches logical errors
- Checkpoints enable rollback from structural mistakes
- Together: fearless experimentation

---

## References

**Official Anthropic:**
- [Claude Code Best Practices: TDD Workflow](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Checkpointing Documentation](https://code.claude.com/docs/en/checkpointing)

**Community Resources:**
- [TDD Guard - Automated Enforcement](https://github.com/nizos/tdd-guard)
- [Forcing Claude Code to TDD](https://alexop.dev/posts/custom-tdd-workflow-claude-code-vue/)
- [LLM Eval-Driven Development](https://fireworks.ai/blog/eval-driven-development-with-claude-code)
- [Testing in the Age of AI Agents](https://kumak.dev/testing-in-the-age-of-ai-agents/)
- [TDD with Claude Code](https://stevekinney.com/courses/ai-development/test-driven-development-with-claude)

---

## Changelog

### December 9, 2025
- Added Subagent TDD Pattern with isolated context
- Added TDD Guard integration and configuration
- Added LLM Eval-Driven Development section
- Added AI-Assisted Test Generation patterns
- Added Skills-based TDD workflow
- Added integration with Checkpoints
- Expanded enforcement mechanisms
- Added test variation generation examples
- Updated references with December 2025 sources

### December 4, 2025
- Initial guide with TDD fundamentals
- Contract-based testing emphasis
- Basic enforcement mechanisms
- Testing pyramid for agents
