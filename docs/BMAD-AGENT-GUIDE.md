# BMAD Agent Workflow Guide — Toubkal Browser

**Document Type:** Development Workflow & Agent Coordination Guide  
**Last Updated:** 2025-10-18  
**Status:** Active  
**Audience:** Developers, Product Team, BMAD Agents

---

## Overview

Toubkal Browser uses the **BMAD Method** (Best Method for Agentic Development) to coordinate software development across specialized AI agents. This guide explains how BMAD agents work together to deliver features from concept to production.

### What is BMAD?

BMAD is an **agent-first development framework** where specialized AI personas (PM, Architect, SM, Dev, QA) collaborate through structured workflows and context-rich artifacts.

**Key Benefits:**

- ✅ **Context preservation** — No information lost between phases
- ✅ **Systematic execution** — Structured tasks prevent missed requirements
- ✅ **Quality gates** — Built-in QA reviews at every stage
- ✅ **Agent coordination** — Clear handoffs between specialists
- ✅ **Reproducible** — Same inputs → same high-quality outputs

---

## BMAD Agents in Toubkal

### Agent Directory

| Agent                | ID            | Role                                  | When to Use                                 |
| -------------------- | ------------- | ------------------------------------- | ------------------------------------------- |
| **Business Analyst** | `analyst`     | Market research, competitive analysis | Start of new features, brownfield discovery |
| **Product Manager**  | `pm`          | PRD creation, strategy                | Feature planning, requirements gathering    |
| **Architect**        | `architect`   | System design, ADRs                   | Technical architecture, API design          |
| **Scrum Master**     | `sm`          | Story creation with full context      | Before dev implementation                   |
| **Developer**        | `dev`         | Code implementation                   | Executing stories                           |
| **QA**               | `qa`          | Quality review, test architecture     | After dev completion, quality gates         |
| **UX Expert**        | `ux-expert`   | UI/UX design, wireframes              | Frontend features, user experience          |
| **BMad Master**      | `bmad-master` | One-off tasks, cross-domain           | Ad-hoc tasks, multi-expertise needs         |

### Agent Activation

**Syntax:** `@agent-id *command`

**Examples:**

```bash
@analyst *research        # Start market research
@pm *create-prd           # Create PRD
@architect *design        # Design architecture
@sm *draft                # Draft user story
@dev *implement           # Implement code
@qa *review epic-1.1.story-1  # Review story
```

---

## Development Workflow

### Complete Feature Development Cycle

```mermaid
graph TD
    A[Feature Idea] --> B[@analyst *research]
    B --> C[@pm *create-prd]
    C --> D[@architect *design]
    D --> E[@sm *draft]
    E --> F[@dev *implement]
    F --> G[@qa *review]
    G --> H{QA Gate}
    H -->|PASS| I[Merge to Main]
    H -->|CONCERNS| J[Dev Fixes]
    H -->|FAIL| E
    J --> G
```

### Phase-by-Phase Breakdown

---

## Phase 1: Research & Planning

### Step 1: Market Research (Analyst)

**Agent:** `@analyst`  
**When:** New feature exploration, competitive analysis  
**Output:** Research brief, competitive landscape

**Example:**

```bash
@analyst *research

# Analyst will:
# 1. Research competitive features
# 2. Analyze market trends
# 3. Identify user needs
# 4. Create research brief
```

**Deliverables:**

- Competitive analysis document
- User research summary
- Market opportunity assessment
- Feature recommendations

---

### Step 2: Product Requirements (PM)

**Agent:** `@pm`  
**When:** After research, before architecture  
**Output:** PRD (Product Requirements Document)

**Example:**

```bash
@pm *create-prd

# PM will elicit:
# - Feature goals and success metrics
# - User stories and use cases
# - Technical constraints
# - Priority and timeline
```

**PRD Template:**

```markdown
# Feature: [Name]

## Problem Statement

[What problem are we solving?]

## Goals & Success Metrics

- Goal 1: [Metric]
- Goal 2: [Metric]

## User Stories

1. As a [user], I want to [action] so that [benefit]
2. As a [user], I want to [action] so that [benefit]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Technical Requirements

- Requirement 1
- Requirement 2

## Out of Scope

- Item 1
- Item 2
```

**Deliverables:**

- Complete PRD document
- User stories list
- Success metrics
- Technical requirements

---

### Step 3: Technical Architecture (Architect)

**Agent:** `@architect`  
**When:** After PRD, before implementation  
**Output:** Architecture document, ADRs

**Example:**

```bash
@architect *design

# Architect will:
# 1. Design system architecture
# 2. Create API specifications
# 3. Write Architecture Decision Records (ADRs)
# 4. Identify technical dependencies
```

**Architecture Deliverables:**

- System design diagrams
- API specifications
- ADRs for key decisions
- Technology stack choices
- Security considerations

**ADR Template:**

```markdown
# ADR-XXX: [Title]

**Status:** Accepted
**Date:** 2025-XX-XX

## Context

[What is the situation that requires a decision?]

## Decision

[What did we decide?]

## Consequences

**Positive:**

- Benefit 1
- Benefit 2

**Negative:**

- Trade-off 1
- Trade-off 2

## Alternatives Considered

1. Alternative 1: [Why not chosen]
2. Alternative 2: [Why not chosen]
```

---

## Phase 2: Story Preparation

### Step 4: Story Creation (SM)

**Agent:** `@sm`  
**When:** After architecture  
**Output:** Detailed story file with full context

**Example:**

```bash
@sm *draft

# SM will create story with:
# - Complete context from PRD/Architecture
# - Detailed tasks and subtasks
# - Testing requirements
# - Dev notes and hints
```

**Story File Structure:**

```yaml
---
story_id: epic-1.1.story-1
title: Implement Privacy Dashboard UI
epic: epic-1.1-privacy-dashboard
status: draft
---

# Story: Implement Privacy Dashboard UI

## Context
[Background from PRD and Architecture]

## Story
As a user, I want to view all AI operations in a dashboard
so that I can audit what data my browser processes.

## Acceptance Criteria
- [ ] Dashboard displays all AI operations with timestamps
- [ ] Operations show provider, action, and consent decision
- [ ] Export to JSON functionality works
- [ ] Signature verification UI indicates valid/invalid chains

## Tasks
1. Create PrivacyDashboard component
   - Subtask: Set up React component structure
   - Subtask: Add Tailwind styling
   - Subtask: Create operation list UI

2. Integrate with privacy-engine package
   - Subtask: Import audit log reader
   - Subtask: Subscribe to real-time updates
   - Subtask: Handle signature verification

3. Implement export functionality
   - Subtask: Create export button
   - Subtask: Generate JSON from audit log
   - Subtask: Download file handler

## Testing Requirements
- Unit tests: Component rendering, state management
- Integration tests: Privacy engine integration
- E2E tests: Full dashboard workflow

## Dev Notes
- Privacy engine API: `packages/privacy-engine/src/audit-log.ts`
- Signature verification: Use `verifySignatureChain()` utility
- Real-time updates: Subscribe to `auditLog.subscribe()`

## Related Files
- PRD: `docs/features/privacy-dashboard/prd.md`
- Architecture: `docs/features/privacy-dashboard/architecture.md`
- ADR-007: Privacy Engine Design
```

**SM Deliverables:**

- Complete story file with all context
- Clear tasks and subtasks
- Testing requirements
- Dev hints and file references

---

## Phase 3: Implementation

### Step 5: Code Implementation (Dev)

**Agent:** `@dev`  
**When:** After SM drafts story (status: ready)  
**Output:** Working code, passing tests

**Example:**

```bash
@dev *implement

# Dev will:
# 1. Read story file (has ALL needed context)
# 2. Implement tasks sequentially
# 3. Write unit/integration tests
# 4. Update Dev Agent Record in story
```

**Dev Workflow:**

1. **Read Story**

   ```bash
   # Dev reads story file - contains ALL context
   # NO need to read PRD/Architecture separately
   ```

2. **Implement Tasks**

   ```typescript
   // Task 1: Create PrivacyDashboard component
   // - Follow coding standards from CODING-RULES.md
   // - Use TypeScript strict mode
   // - Apply Tailwind for styling
   ```

3. **Write Tests**

   ```typescript
   // Unit tests
   describe('PrivacyDashboard', () => {
     it('renders operation list', () => { ... })
     it('exports audit log as JSON', () => { ... })
   })

   // Integration tests
   describe('Privacy Engine Integration', () => {
     it('displays real-time AI operations', () => { ... })
   })
   ```

4. **Update Story**
   ```yaml
   # In story file
   dev_agent_record:
     - timestamp: 2025-10-18T10:00:00Z
       action: Implemented Task 1 - Created PrivacyDashboard component
       files_changed:
         - apps/toubkal-browser/src/features/privacy/PrivacyDashboard.tsx
       tests_added:
         - apps/toubkal-browser/src/features/privacy/__tests__/PrivacyDashboard.test.tsx
   ```

**Dev Deliverables:**

- Working code following coding standards
- Passing tests (unit + integration)
- Updated Dev Agent Record in story
- Git commit with clear message

---

## Phase 4: Quality Review

### Step 6: Quality Review (QA)

**Agent:** `@qa`  
**When:** After dev completes story  
**Output:** QA gate decision, test recommendations

**Example:**

```bash
@qa *review epic-1.1.story-1

# QA will:
# 1. Analyze code against requirements
# 2. Review test coverage
# 3. Assess risks
# 4. Create gate decision (PASS/CONCERNS/FAIL)
```

**QA Review Process:**

1. **Requirements Traceability**

   ```markdown
   ## Requirements Traceability

   | Acceptance Criteria           | Test Coverage  | Status   |
   | ----------------------------- | -------------- | -------- |
   | Dashboard displays operations | ✅ Unit + E2E  | PASS     |
   | Export to JSON works          | ✅ Integration | PASS     |
   | Signature verification UI     | ⚠️ Manual only | CONCERNS |
   ```

2. **Risk Assessment**

   ```markdown
   ## Risk Profile

   | Risk                        | Probability | Impact | Mitigation                           |
   | --------------------------- | ----------- | ------ | ------------------------------------ |
   | Signature tampering         | Low         | High   | Add E2E test for verification UI     |
   | Performance with large logs | Medium      | Medium | Add performance test (1000+ entries) |
   ```

3. **Gate Decision**

   ```yaml
   # QA Gate File: qa/gates/epic-1.1.story-1-privacy-dashboard.yml

   gate_decision: CONCERNS
   timestamp: 2025-10-18T12:00:00Z
   reviewer: Quinn (QA Agent)

   decision_rationale: |
     Implementation is solid, but missing critical tests:
     - No E2E test for signature verification UI
     - No performance test for large audit logs (>1000 entries)

   required_before_merge:
     - Add E2E test: Signature verification shows valid/invalid correctly
     - Add performance test: Dashboard renders <1s with 1000 entries

   recommended_improvements:
     - Consider virtualization for large lists
     - Add loading states for async operations
   ```

**QA Gate Decisions:**

- **PASS** — Merge approved, all criteria met
- **CONCERNS** — Improvements recommended before merge
- **FAIL** — Blocking issues, return to Dev
- **WAIVED** — Known issues accepted (with justification)

**QA Deliverables:**

- Requirements traceability matrix
- Risk assessment
- Gate decision file
- QA Results section in story file

---

## Phase 5: Merge & Deploy

### Step 7: Code Review & Merge

**When:** After QA PASS (or CONCERNS addressed)  
**Who:** Human reviewer or senior dev

**Review Checklist:**

- [ ] All acceptance criteria met
- [ ] Tests pass (unit, integration, E2E)
- [ ] QA gate decision is PASS
- [ ] Code follows coding standards
- [ ] Documentation updated
- [ ] No security vulnerabilities

**Merge Process:**

```bash
# 1. Address QA concerns (if any)
git add .
git commit -m "fix: Address QA concerns - Add E2E test for signature verification"

# 2. QA re-review
@qa *review epic-1.1.story-1

# 3. Merge PR (after PASS)
gh pr merge --squash
```

---

## BMAD Commands Reference

### Analyst Commands

```bash
@analyst *research              # Start market research
@analyst *help                  # Show available commands
```

### PM Commands

```bash
@pm *create-prd                 # Create PRD
@pm *create-brownfield-prd      # PRD for existing project
@pm *shard-prd                  # Break PRD into epics
@pm *help                       # Show available commands
```

### Architect Commands

```bash
@architect *design              # Design architecture
@architect *create-adr          # Create ADR
@architect *api-spec            # Design API specification
@architect *help                # Show available commands
```

### SM Commands

```bash
@sm *draft                      # Draft next story
@sm *story-checklist            # Run story checklist
@sm *correct-course             # Align on changes
@sm *help                       # Show available commands
```

### Dev Commands

```bash
@dev *implement                 # Implement story
@dev *help                      # Show available commands
```

### QA Commands

```bash
@qa *review epic-1.1.story-1    # Comprehensive review
@qa *gate epic-1.1.story-1      # Create gate decision
@qa *test-design epic-1.1.story-1  # Design test scenarios
@qa *trace epic-1.1.story-1     # Requirements tracing
@qa *risk-profile epic-1.1.story-1  # Risk assessment
@qa *nfr-assess epic-1.1.story-1    # Non-functional requirements
@qa *help                       # Show available commands
```

### UX Expert Commands

```bash
@ux-expert *create-front-end-spec   # Create frontend spec
@ux-expert *generate-ui-prompt      # AI UI generation prompt
@ux-expert *help                    # Show available commands
```

---

## Debugging Workflow (Special)

### BMAD Debugging Commands

```bash
@bmad-master *debug-analyze     # Analyze bug
@bmad-master *debug-trace       # Runtime tracing
@bmad-master *debug-fix         # Implement fix
```

**Debugging Workflow:**

1. **Analyze** → Identify root cause with evidence
2. **Trace** → Runtime diagnostics to verify hypothesis
3. **Fix** → Implement validated fix with comprehensive testing

---

## Best Practices

### 1. Context Preservation

**Problem:** Dev agents lose context when reading PRD/Architecture separately.

**Solution:** SM creates story files with **ALL context embedded**.

```yaml
# ✅ Good: SM story includes everything
story_file:
  context: |
    From PRD: User wants cryptographic proof of AI operations
    From Architecture: Use Ed25519 signatures with Merkle tree
    From ADR-007: Privacy engine stores audit logs in LevelDB

  tasks:
    - Implement signature verification (use Ed25519 from libsodium)
    - Display verification status in UI (green=valid, red=invalid)

# ❌ Bad: Dev has to hunt for info
story_file:
  tasks:
    - Implement signature verification
    # (Dev doesn't know HOW - needs to read PRD, Architecture, ADRs)
```

**Rule:** Dev should **ONLY** read the story file. Everything needed is inside.

---

### 2. Quality Gates

**Problem:** Code merged without proper QA review.

**Solution:** QA gate decisions are **mandatory** before merge.

**QA Gate Workflow:**

```bash
# 1. Dev completes story
@dev *implement

# 2. QA reviews
@qa *review epic-1.1.story-1

# 3. Check gate decision
cat qa/gates/epic-1.1.story-1-privacy-dashboard.yml

# 4. Address concerns (if any)
# If PASS → merge
# If CONCERNS → fix, then QA re-review
# If FAIL → return to SM for story clarification
```

---

### 3. Numbered Lists for Choices

**Problem:** Users have to type full commands or names.

**Solution:** Agents present **numbered options**.

**Example:**

```bash
@pm *create-prd

# PM presents:
# I have 2 PRD templates available:
# 1. prd-tmpl.yaml - Standard PRD for greenfield features
# 2. brownfield-prd-tmpl.yaml - PRD for existing systems
#
# Which template would you like? (Type 1 or 2)
```

**Rule:** Always show numbered lists when presenting choices.

---

### 4. Agent Coordination

**Problem:** Agents work in silos, handoffs fail.

**Solution:** Use **BMad Master** for complex workflows.

**Example:**

```bash
@bmad-master *help

# BMad Master can:
# - Coordinate multi-agent workflows
# - Transform into any specialist agent on demand
# - Track progress across phases
# - Ensure proper handoffs
```

**When to use BMad Master:**

- Complex multi-step workflows
- Unsure which agent to use
- Need coordination across multiple agents
- Party mode (multiple agents collaborate)

---

## File Locations

### BMAD Core Files

All BMAD agent definitions and workflows are in `bmad/`:

```
bmad/
├── core/
│   ├── agents/              # Core agent personas
│   │   └── bmad-master.md
│   ├── tasks/               # Task workflows
│   │   └── workflow.xml
│   └── workflows/           # Complete workflows
│       ├── brainstorming/
│       └── party-mode/
├── bmm/
│   ├── agents/              # BMM agent personas
│   │   ├── analyst.md
│   │   ├── architect.md
│   │   ├── dev.md
│   │   ├── pm.md
│   │   ├── sm.md
│   │   ├── qa.md
│   │   └── ux-expert.md
│   └── workflows/           # BMM workflows
├── cis/
│   ├── agents/              # CIS agent personas
│   │   ├── brainstorming-coach.md
│   │   ├── creative-problem-solver.md
│   │   ├── design-thinking-coach.md
│   │   ├── innovation-strategist.md
│   │   └── storyteller.md
│   └── workflows/           # CIS workflows
└── bmb/
    ├── agents/              # BMB agent personas
    │   └── bmad-builder.md
    └── workflows/           # BMB workflows
```

### Project Files

```
toubkal-browser/
├── docs/
│   ├── features/            # Feature PRDs and architecture
│   ├── epics/               # Epic definitions
│   ├── stories/             # Story files (created by SM)
│   ├── qa/
│   │   └── gates/           # QA gate decisions
│   ├── adrs/                # Architecture Decision Records
│   └── architecture/        # System architecture docs
├── CODING-RULES.md          # Critical coding rules
├── TOUBKAL-PRD.md           # Product requirements
├── PRIVACY-ETHICS-POLICY.md # Privacy principles
└── BMAD-AGENT-INITIALIZATION-BIBLE.md # Agent context guide
```

---

## Troubleshooting

### Agent Not Loading

**Problem:** Agent doesn't respond or shows errors.

**Solution:**

1. Check `bmad/core/config.yaml` for correct paths
2. Validate agent file exists: `ls bmad/*/agents/`
3. Run: `pnpm bmad:validate`

---

### Context Lost in Story

**Problem:** Dev says "I don't have enough info to implement this."

**Solution:**

1. **SM responsibility:** Story must include ALL context from PRD/Architecture
2. Check story file has:
   - Context section with background
   - Dev notes with file references
   - Technical hints from architecture
3. If missing, SM re-drafts: `@sm *draft`

---

### QA Gate Confusion

**Problem:** Not sure when to merge after QA review.

**Solution:** Follow QA gate decision:

| Decision     | Action                                                 |
| ------------ | ------------------------------------------------------ |
| **PASS**     | ✅ Merge approved                                      |
| **CONCERNS** | ⚠️ Address recommendations, then merge (QA discretion) |
| **FAIL**     | ❌ Blocking issues - fix and re-review                 |
| **WAIVED**   | ⚠️ Issues known and accepted - merge with caution      |

**Rule:** Never merge on FAIL. Always address CONCERNS or get waiver justification.

---

## Quick Reference

### Typical Feature Flow

```bash
# 1. Research (optional for new features)
@analyst *research

# 2. Create PRD
@pm *create-prd

# 3. Design architecture
@architect *design

# 4. Draft detailed story
@sm *draft

# 5. Implement code
@dev *implement

# 6. QA review
@qa *review epic-1.1.story-1

# 7. Address QA concerns (if any)
# ... fix code, add tests ...

# 8. QA re-review
@qa *review epic-1.1.story-1

# 9. Merge (after PASS)
gh pr merge --squash
```

### Debugging Flow

```bash
# 1. Analyze bug
@bmad-master *debug-analyze

# 2. Runtime tracing (if needed)
@bmad-master *debug-trace

# 3. Implement fix
@bmad-master *debug-fix

# 4. QA review fix
@qa *review epic-X.X.story-X

# 5. Merge fix
gh pr merge --squash
```

---

## Appendix: Related Documents

### Core References

- **[BMAD-AGENT-INITIALIZATION-BIBLE.md](BMAD-AGENT-INITIALIZATION-BIBLE.md)** — Agent context loading guide
- **[CODING-RULES.md](../CODING-RULES.md)** — Critical coding rules and constraints
- **[TOUBKAL-PRD.md](TOUBKAL-PRD.md)** — Product requirements and vision
- **[PRIVACY-ETHICS-POLICY.md](PRIVACY-ETHICS-POLICY.md)** — Privacy principles and consent model

### Architecture

- **[ARCHITECTURE-OVERVIEW.md](architecture/ARCHITECTURE-OVERVIEW.md)** — System architecture
- **[audit-trail.md](architecture/audit-trail.md)** — Cryptographic audit trail architecture
- **[mcp-sandbox.md](architecture/mcp-sandbox.md)** — MCP server sandboxing architecture
- **[adrs/](adrs/)** — Architecture Decision Records

### Development

- **[onboarding.md](contributing/onboarding.md)** — Team onboarding guide
- **[code-style.md](contributing/code-style.md)** — Language-specific coding patterns
- **[testing-strategy.md](contributing/testing-strategy.md)** — Testing requirements and patterns
- **[build-instructions.md](contributing/build-instructions.md)** — Build system and development setup

---

**Document Owner:** Development Team  
**Contributors:** BMAD Core Team, Engineering  
**Review Cycle:** Monthly  
**Next Review:** 2025-11-18

---

**Last Updated**: 2025-10-18  
**Version**: 2.0 (Updated for Toubkal Browser project structure and rules)
