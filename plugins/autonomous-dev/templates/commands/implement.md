---
description: TDD implementation workflow (tests first)
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
argument-hint: <feature-description>
---

# Implement: $ARGUMENTS

Follow this TDD workflow strictly:

## Step 1: Understand

Before writing any code:
- What problem does this solve?
- What are the inputs/outputs?
- What are the edge cases?
- Check project docs for relevant data models
- Check for unresolved decisions that might block

## Step 2: Write Tests First

Create test file in appropriate location based on project structure.

Write tests for:
- [ ] Happy path - normal operation
- [ ] Edge cases - boundary conditions
- [ ] Error conditions - expected failures

Run tests to confirm they FAIL:
```bash
# Use project's test command
```

**DO NOT PROCEED until tests are written and failing.**

## Step 3: Implement Minimum Code

Write just enough code to make tests pass.
- Follow existing patterns in the codebase
- Check design docs for API guidance
- Hooks will auto-format and lint your code

## Step 4: Refactor

With passing tests, improve the code:
- Extract helper functions if needed
- Improve variable naming
- Add type hints for public APIs
- Keep it simple - no over-engineering

## Step 5: Document

- Add docstrings to public functions
- Update README.md if adding user-facing features
- Update CHANGELOG.md with the change
- If architectural decision, document it

## Step 6: Commit

```bash
git add -A
git status
git commit -m "feat: <concise description>"
```

## TDD Principles

- **Red**: Write a failing test
- **Green**: Write minimum code to pass
- **Refactor**: Improve while keeping tests green

Tests are not optional - they define "done".
