---
description: Stack Audit verification protocol — run before every commit to catch governance violations
---

# Stack Audit Workflow

Run this audit before every `git commit` or code generation task to catch violations of the GOVERNANCE.md hierarchy.

## Steps

### 1. Check for Unauthorized Libraries

Search the codebase for any `import` or `require` statements that reference libraries NOT listed in `TECH_STACK.md`.

```bash
# List all unique package imports
grep -rhE "^import .+ from ['\"]" src/ --include="*.ts" --include="*.tsx" | sed "s/.*from ['\"]//;s/['\"].*//" | sort -u
```

Cross-reference the output against the `Approved Libraries` whitelist in `TECH_STACK.md`. Any unlisted package is a violation.

// turbo

### 2. Check for localStorage Auth Token Storage

Search for any usage of `localStorage` in authentication-related code:

```bash
grep -rnI "localStorage" src/ --include="*.ts" --include="*.tsx"
```

If any match involves auth tokens, session tokens, or JWTs, it is a **KILL-SWITCH VIOLATION**. Only secure, HTTP-only cookies are permitted.

// turbo

### 3. Check for Forbidden 3D Physics Engine

If the project uses 3D rendering, verify that only `@react-three/rapier` is used:

```bash
grep -rnI "cannon" src/ --include="*.ts" --include="*.tsx"
grep -rnI "rapier" src/ --include="*.ts" --include="*.tsx"
```

Any reference to `@react-three/cannon` is a **KILL-SWITCH VIOLATION**.

// turbo

### 4. Check Database Test Parity

Verify that test configuration uses the same database engine as production:

```bash
grep -rnI "sqlite" src/ tests/ --include="*.ts" --include="*.tsx" --include="*.config.*"
```

If the project uses PostgreSQL (especially with pgvector), any SQLite reference in test config is a **KILL-SWITCH VIOLATION**.

// turbo

### 5. Check UI Component Library Compliance

If `TECH_STACK.md` mandates Pure Tailwind CSS, check for unauthorized component libraries:

```bash
grep -rnI "shadcn\|radix-ui\|@radix-ui" src/ --include="*.ts" --include="*.tsx"
```

Any match is a **KILL-SWITCH VIOLATION**.

// turbo

## Reporting

If any violations are found:

1. **HALT** the commit
2. List all violations with file paths and line numbers
3. Reference the specific GOVERNANCE.md rule that was violated
4. Suggest the compliant alternative
