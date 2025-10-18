# Extended Onboarding

**Last Updated**: 2025-10-18  
**Status**: Active  
**Audience**: New Team Members

Extended onboarding guide for Toubkal Browser team members, covering team structure, culture, communication, and your first contributions.

---

## Table of Contents

1. [Welcome to Toubkal](#welcome-to-toubkal)
2. [Team Structure](#team-structure)
3. [Development Philosophy](#development-philosophy)
4. [Communication Channels](#communication-channels)
5. [First Week Tasks](#first-week-tasks)
6. [Working with BMAD Agents](#working-with-bmad-agents)
7. [Code Review Process](#code-review-process)
8. [Career Growth](#career-growth)

---

## Welcome to Toubkal

### Mission Statement

> **"Redefine the web browser as an AI-augmented workspace that protects user data, proves privacy, and runs AI locally."**

**Core Values**:

- **Privacy First** - User data sovereignty is non-negotiable
- **Transparency** - Every operation is cryptographically auditable
- **Local Intelligence** - AI runs on user's machine (no cloud by default)
- **Open Source** - MPL 2.0 licensed, reproducible builds

---

## Team Structure

### Core Team

**Hassan** - Product Manager / Source of Truth

- **Role**: Strategic direction, architecture decisions, documentation
- **Responsibilities**: PRD, ADRs, feature prioritization, quality control
- **Contact**: `@hassan` on GitHub, `hassan@inopsio.com`

**Ilyass Motya** - Technical Lead / Founder

- **Role**: Technical strategy, key architecture decisions, final approvals
- **Responsibilities**: Vision, roadmap, technical leadership
- **Contact**: `@ilyass-motya` on GitHub, `ilyass@inopsio.com`

---

### Development Workflow

**BMAD-First Development**:

- **PM Agent** - Feature briefs, PRDs, user stories
- **Architect Agent** - Technical design, ADRs, API specs
- **SM Agent** - Task breakdown, story validation
- **Dev Agent** - Code implementation (C++, TypeScript)
- **QA Agent** - Test generation, code review

**Your Role**: Collaborate with BMAD agents, review their output, and make final decisions.

---

## Development Philosophy

### Privacy-First Mindset

**Every feature must answer**:

1. **What data is collected?** (Minimize to essential only)
2. **Where is data stored?** (Local by default, encrypted)
3. **Who can access data?** (User controls everything)
4. **How is consent managed?** (Explicit, granular, revocable)

**Red Flags** (Never allowed):

- ❌ Telemetry without explicit consent
- ❌ Cloud processing without user knowledge
- ❌ PII in logs or crash reports
- ❌ Hidden data collection

---

### Local-First AI

**Principles**:

- **Default to Local**: Ollama, Transformers.js, WebLLM run on user's machine
- **Explicit Cloud Consent**: If cloud AI is needed, ask permission first
- **Transparency**: Show model usage, token count, latency
- **Offline Capable**: Core features work without internet

---

### Verifiable Everything

**Audit Trail Requirements**:

- Every user action → Audit log entry (Ed25519 signed)
- Every AI query → Logged with timestamp, model, tokens
- Every consent decision → Stored with cryptographic proof
- Merkle tree → Tamper-proof integrity verification

---

## Communication Channels

### GitHub

**Primary Platform** for development:

- **Issues** - Bug reports, feature requests
- **Pull Requests** - Code reviews, discussions
- **Discussions** - RFCs, Q&A, brainstorming
- **Projects** - Sprint planning, task tracking

**Conventions**:

- **Issue Labels**: `bug`, `feature`, `privacy`, `security`, `ai`, `performance`
- **PR Title Format**: `type(scope): description` (e.g., `feat(consent): add time-bound consent`)
- **Review Tags**: `@hassan` for PM review, `@motyailyass` for technical review

---

### Asynchronous Communication

**Response Time Expectations**:

- **Urgent** (security, crash) - 2 hours
- **High Priority** (blocking issue) - 4 hours
- **Normal** (feature discussion) - 24 hours
- **Low Priority** (documentation) - 48 hours

**Working Hours**:

- **No Fixed Hours** - Work when you're productive
- **Core Overlap** - Be available 10 AM - 2 PM (your timezone) for team sync
- **Deep Work** - Block 4 hours daily for uninterrupted coding

---

## First Week Tasks

### Day 1: Setup & Exploration

**Morning**:

- [ ] Complete technical setup (see [Build Instructions](build-instructions.md))
- [ ] Clone repository, build Toubkal browser
- [ ] Run Toubkal locally, explore features

**Afternoon**:

- [ ] Read [PROJECT-VISION.md](../../PROJECT-VISION.md)
- [ ] Read [TOUBKAL-PRD.md](../TOUBKAL-PRD.md)
- [ ] Read [ARCHITECTURE-OVERVIEW.md](../architecture/ARCHITECTURE-OVERVIEW.md)
- [ ] Review [CODING-RULES.md](../../CODING-RULES.md)

**Evening** (optional):

- [ ] Explore codebase (`/src/toubkal/`)
- [ ] Read 2-3 ADRs (start with ADR-001, ADR-008)

---

### Day 2: First Contribution (Bug Fix)

**Goal**: Fix your first bug (builds confidence)

**Find a Bug**:

```
# Filter "good first issue" bugs
gh issue list --label "good first issue"

# Pick one that interests you
# Example: "Fix typo in consent banner"
```

**Fix Process**:

1. Create branch: `git checkout -b fix/consent-banner-typo`
2. Make fix, add test
3. Run tests: `pnpm test`
4. Commit: `git commit -m "fix(consent): correct typo in consent banner"`
5. Push and create PR
6. Request review from `@hassan` or `@motyailyass`

---

### Day 3: Implement Small Feature

**Goal**: Add a small feature (end-to-end experience)

**Example Feature Ideas**:

- Add "Export Audit Logs" button
- Add keyboard shortcut for AI sidebar
- Add dark mode toggle

**Feature Process**:

1. Create feature brief (see [BMAD-AGENT-GUIDE.md](../../BMAD-AGENT-GUIDE.md))
2. Get PM approval from Hassan
3. Write tests first (TDD)
4. Implement feature
5. Document changes
6. Create PR with demo video

---

### Day 4-5: Pair with BMAD Agent

**Goal**: Learn BMAD workflow

**Task**: Implement a user story with BMAD Dev Agent

**Example**:

```
User Story: As a user, I want to see AI token usage per model

Acceptance Criteria:
- Show total tokens used per model (last 30 days)
- Display in toubkal://ai page
- Update in real-time when AI is used
```

**BMAD Steps**:

1. PM Agent creates feature brief
2. Architect Agent designs database schema
3. SM Agent breaks into tasks
4. Dev Agent generates code (you review)
5. QA Agent generates tests (you review)
6. You refine, commit, and PR

---

## Working with BMAD Agents

### BMAD Workflow Overview

**Phase 1: Feature Brief** (PM Agent)

```
# Feature: AI Token Usage Dashboard

## Problem
Users don't know how much AI they're using (cost transparency)

## Solution
Show per-model token usage stats in toubkal://ai

## Success Metrics
- 80%+ users check token usage weekly
- Average tokens/query visible
```

**Phase 2: Technical Design** (Architect Agent)

```
# ADR-XXX: AI Token Usage Database Schema

## Decision
Store token usage in LevelDB with key: `ai_usage:{model_id}:{date}`

## Schema
{
  model_id: string,
  date: YYYY-MM-DD,
  total_tokens: number,
  query_count: number
}
```

**Phase 3: Implementation** (Dev Agent)

- Generates C++ code for database access
- Generates React component for UI
- Generates unit tests

**Your Role**: Review, refine, approve

---

### When to Use BMAD Agents

**Good Use Cases**:

- ✅ Boilerplate code (CRUD operations, forms)
- ✅ Test generation (unit tests, mocks)
- ✅ Documentation (API docs, README updates)
- ✅ Refactoring (rename, extract functions)

**Bad Use Cases**:

- ❌ Complex algorithms (agents struggle)
- ❌ Security-critical code (manual review required)
- ❌ Performance optimization (needs profiling)
- ❌ Architecture decisions (human judgment needed)

---

## Code Review Process

### What to Review

**Checklist**:

- [ ] **Functionality**: Does it work as expected?
- [ ] **Privacy**: Does it leak user data?
- [ ] **Security**: Are there vulnerabilities (XSS, injection)?
- [ ] **Performance**: Is it efficient?
- [ ] **Tests**: Are there tests? Do they pass?
- [ ] **Documentation**: Are changes documented?
- [ ] **Code Style**: Does it follow [CODING-RULES.md](../../CODING-RULES.md)?

---

### How to Give Feedback

**Good Feedback** (actionable):

````
**Issue**: This loop allocates memory on every iteration (performance concern)

**Suggestion**: Pre-allocate buffer:
```cpp
std::vector<int> buffer(1000);
for (int i = 0; i < 1000; ++i) {
  buffer[i] = compute(i);
}
````

**Bad Feedback** (vague):

```markdown
This looks slow. Can you optimize?
```

---

### Review Timeline

**Response Time**:

- **1-2 hours** - Initial review (approve, request changes, or ask questions)
- **24 hours** - Second review after changes
- **48 hours** - Final approval and merge

---

## Career Growth

### Skills Development

**Toubkal Tech Stack**:

- **C++** (Chromium core) - 40% of codebase
- **TypeScript/React** (UI) - 30% of codebase
- **Python** (Build scripts) - 10% of codebase
- **Chromium Internals** (Mojo IPC, GN, Siso) - 20% learning curve

**Learning Resources**:

- [Chromium Development Guide](https://www.chromium.org/developers/)
- [Mojo IPC Tutorial](https://chromium.googlesource.com/chromium/src/+/HEAD/mojo/README.md)
- [React Documentation](https://react.dev/)
- [BMAD Method](https://github.com/bmad-method)

---

### Contribution Ladder

**Level 1: Contributor** (Week 1-4)

- Fix bugs
- Write tests
- Improve documentation

**Level 2: Feature Developer** (Month 2-6)

- Implement features end-to-end
- Review PRs from other contributors
- Mentor new contributors

**Level 3: Core Team** (6+ months)

- Lead feature development
- Write ADRs
- Make architecture decisions
- Represent Toubkal in community

---

### Recognition

**All contributors are recognized in**:

- [CONTRIBUTORS.md](../../CONTRIBUTORS.md)
- Release notes (feature credits)
- Toubkal website (team page)

**Top Contributors**:

- Invited to quarterly planning sessions
- Early access to new features
- Toubkal swag (stickers, t-shirts)

---

## Quick Reference

### Key Documents

| Document                                    | Purpose                    | When to Read               |
| ------------------------------------------- | -------------------------- | -------------------------- |
| [CODING-RULES.md](../../CODING-RULES.md)    | Critical coding rules      | Before coding              |
| [Code Style Guide](code-style.md)           | Language-specific patterns | When learning new language |
| [Testing Strategy](testing-strategy.md)     | Testing best practices     | When writing tests         |
| [Build Instructions](build-instructions.md) | Build system details       | When build fails           |
| [Release Process](release-process.md)       | How to ship releases       | When preparing release     |

---

### Key Commands

```bash
# Build Toubkal
autoninja -C out/Debug toubkal

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Create PR
gh pr create --title "feat(ai): add token usage dashboard"

# Check out issue
gh issue view 123
```

---

### Who to Ask

| Question                   | Ask                      |
| -------------------------- | ------------------------ |
| **Product/Features**       | Hassan (`@hassan`)       |
| **Technical/Architecture** | Ilyass (`@ilyass-motya`) |
| **Build Issues**           | GitHub Discussions       |
| **Bug Reports**            | GitHub Issues            |
| **General Questions**      | GitHub Discussions       |

---

## Welcome Aboard! 🏔️

You're now part of the Toubkal team! Remember:

- **Privacy First** - Always question data collection
- **Ask Questions** - No question is too small
- **Ship Often** - Small PRs, frequent merges
- **Have Fun** - We're building the future of browsers!

**Next Steps**:

1. ✅ Complete Day 1 tasks (setup, read docs)
2. ✅ Fix your first bug (Day 2)
3. ✅ Implement small feature (Day 3)
4. ✅ Pair with BMAD agent (Day 4-5)

**Questions?** Open a GitHub Discussion or ping `@hassan` / `@motyailyass`.

---

## See Also

- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - General contribution guide
- **[CODING-RULES.md](../../CODING-RULES.md)** - Critical coding rules
- **[Code Style Guide](code-style.md)** - Language-specific patterns
- **[Testing Strategy](testing-strategy.md)** - Testing requirements
- **[Build Instructions](build-instructions.md)** - Chromium build setup
- **[PRD](../TOUBKAL-PRD.md)** - Product requirements and vision
- **[Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md)** - System architecture
- **[Product Roadmap](../PRODUCT-ROADMAP.md)** - Development timeline
- **[Brand Identity](../BRAND-IDENTITY.md)** - Design and messaging guidelines

---

**Last Updated**: 2025-10-18
**Questions?** Email: team@toubkal.app
