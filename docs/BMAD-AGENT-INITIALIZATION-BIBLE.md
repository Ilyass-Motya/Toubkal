# BMAD Agent Initialization Bible — Toubkal Browser

**Document Type**: Agent Context Loading Instructions
**Last Updated**: 2025-10-18
**Status**: Mandatory Reading for All BMAD Agents
**Purpose**: Define which files each agent MUST load before executing tasks

---

## Executive Summary

**Before ANY agent performs work on Toubkal Browser, they MUST**:

1. **Load their role-specific context files** (see tables below)
2. **Validate understanding** by answering role-specific questions
3. **Reference this Bible** when unsure which files to consult

**Rule**: Never execute a task without first loading required context.

---

## Table of Contents

1. [Universal Context (All Agents)](#universal-context-all-agents)
2. [PM Agent (John) Context](#pm-agent-john-context)
3. [Architect Agent (Winston) Context](#architect-agent-winston-context)
4. [Dev Agent (Amelia) Context](#dev-agent-amelia-context)
5. [QA Agent (Murat) Context](#qa-agent-murat-context)
6. [SM Agent (Bob) Context](#sm-agent-bob-context)
7. [UX Agent (Sally) Context](#ux-agent-sally-context)
8. [Business Analyst (Mary) Context](#business-analyst-mary-context)
9. [Party Mode Initialization Checklist](#party-mode-initialization-checklist)
10. [Validation Questions](#validation-questions)

---

## Universal Context (All Agents)

**Every agent MUST load these files FIRST**:

| Priority | File                              | Purpose                                     | Read Time |
| -------- | --------------------------------- | ------------------------------------------- | --------- |
| **P0**   | `TOUBKAL-PRD.md`                  | Project vision, constraints, tech stack     | 15 min    |
| **P0**   | `PRIVACY-ETHICS-POLICY.md`        | Privacy principles, consent fabric          | 10 min    |
| **P0**   | `BMAD-AGENT-GUIDE.md`             | BMAD workflow, commands, agent coordination | 10 min    |
| **P1**   | `PRODUCT-ROADMAP.md`              | Phase 1-4 timeline, milestones              | 5 min     |
| **P1**   | `docs/contributing/onboarding.md` | Team structure, communication, workflow     | 10 min    |

**Total Universal Context Load Time**: ~50 minutes

**Validation Question** (All Agents):

> "What are Toubkal's 3 core principles?" (Answer: Privacy-first, Local-first AI, Cryptographic auditability)

---

## PM Agent (John) Context

**Role**: Create PRDs, feature briefs, user stories
**Responsibilities**: Requirements gathering, product strategy

### Required Files

| Priority | File                           | Purpose                               | When to Load                  |
| -------- | ------------------------------ | ------------------------------------- | ----------------------------- |
| **P0**   | `TOUBKAL-PRD.md`               | Complete product requirements         | Before every task             |
| **P0**   | `PRIVACY-ETHICS-POLICY.md`     | Privacy constraints and consent model | Before every task             |
| **P0**   | `BMAD-AGENT-GUIDE.md`          | PM workflow and templates             | Before every task             |
| **P1**   | `BRAND-IDENTITY.md`            | Brand guidelines, tone of voice       | Before user-facing features   |
| **P1**   | `PRODUCT-ROADMAP.md`           | Phase timeline and priorities         | Before feature prioritization |
| **P2**   | `TEAM-IMPLEMENTATION-NOTES.md` | Tooling constraints (ESLint, Husky)   | Before technical features     |

### Validation Questions

1. **Privacy**: "Does this feature collect user data? If yes, where is consent obtained?"
2. **Tech Stack**: "Is this feature TypeScript strict mode compliant?"
3. **Brand**: "Does this feature description use Toubkal's brand voice (clear, confident, respectful)?"
4. **Phase Alignment**: "Does this feature align with current phase scope (Phase 1: Foundation & Privacy)?"

### Example PM Task with Correct Context

**Task**: Create feature brief for "Transparency Dashboard"
**Context Loaded**: ✅ PRD (privacy requirements), ✅ Privacy Policy (consent model), ✅ Brand Identity (tone)
**Output**: Comprehensive feature brief with privacy-first approach, clear acceptance criteria, and Toubkal brand voice

---

## Architect Agent (Winston) Context

**Role**: Technical design, ADRs, system architecture
**Responsibilities**: Technology selection, architectural decisions, system design

### Required Files

| Priority | File                                         | Purpose                                       | When to Load                    |
| -------- | -------------------------------------------- | --------------------------------------------- | ------------------------------- |
| **P0**   | `TOUBKAL-PRD.md`                             | Technical requirements and constraints        | Before every task               |
| **P0**   | `docs/architecture/ARCHITECTURE-OVERVIEW.md` | System architecture and patterns              | Before every task               |
| **P0**   | `docs/adrs/ADR-001-ui-framework.md`          | UI framework decision (React 19 + TypeScript) | Before UI architecture          |
| **P0**   | `docs/adrs/ADR-002-browser-engine.md`        | Browser engine decision (Chromium)            | Before core architecture        |
| **P0**   | `docs/adrs/ADR-003-ipc-framework.md`         | IPC framework decision (Mojo)                 | Before IPC design               |
| **P0**   | `docs/adrs/ADR-004-ai-integration.md`        | AI integration decision (MCP + Ollama)        | Before AI architecture          |
| **P0**   | `docs/adrs/ADR-005-build-system.md`          | Build system decision (GN + Siso)             | Before build architecture       |
| **P0**   | `docs/adrs/ADR-006-supply-chain.md`          | Supply chain security (SLSA Level 3)          | Before security architecture    |
| **P0**   | `docs/adrs/ADR-007-ui-security.md`           | UI security measures (CSP, Trusted Types)     | Before UI security              |
| **P0**   | `docs/adrs/ADR-008-url-schema.md`            | Custom URL scheme (toubkal://)                | Before URL architecture         |
| **P1**   | `docs/architecture/audit-trail.md`           | Cryptographic audit trail architecture        | Before audit system design      |
| **P1**   | `docs/architecture/mcp-sandbox.md`           | MCP server sandboxing architecture            | Before MCP system design        |
| **P1**   | `docs/PRIVACY-ETHICS-POLICY.md`              | Privacy principles and constraints            | Before privacy-sensitive design |

### Dependency Loading Order

1. **Universal Context** (PRD, Privacy Policy, BMAD Guide)
2. **Core ADRs** (001-008) in sequence
3. **Architecture Documents** (Overview, Audit Trail, MCP Sandbox)
4. **Privacy Policy** (final validation)

### Validation Questions

1. **Architecture Consistency**: "Does this design follow established ADR decisions?"
2. **Privacy Compliance**: "Does this architecture support zero-telemetry-by-default?"
3. **Security**: "Does this design implement defense-in-depth security principles?"
4. **Scalability**: "Can this architecture scale to Phase 2-3 requirements?"
5. **Chromium Compatibility**: "Does this design maintain upstream Chromium compatibility?"

---

## Dev Agent (Amelia) Context

**Role**: Code implementation, technical execution
**Responsibilities**: Feature implementation, bug fixes, code quality

### Required Files

| Priority | File                                         | Purpose                                        | When to Load            |
| -------- | -------------------------------------------- | ---------------------------------------------- | ----------------------- |
| **P0**   | `CODING-RULES.md`                            | Critical coding rules and constraints          | Before every task       |
| **P0**   | `TOUBKAL-PRD.md`                             | Technical requirements and acceptance criteria | Before every task       |
| **P0**   | `docs/contributing/code-style.md`            | Language-specific coding patterns              | Before coding           |
| **P0**   | `docs/contributing/testing-strategy.md`      | Testing requirements and patterns              | Before writing tests    |
| **P0**   | `docs/contributing/build-instructions.md`    | Build system and development setup             | Before development      |
| **P1**   | `docs/architecture/ARCHITECTURE-OVERVIEW.md` | System architecture and patterns               | Before complex features |
| **P1**   | `docs/adrs/ADR-001-ui-framework.md`          | React 19 + TypeScript patterns                 | Before UI development   |
| **P1**   | `docs/adrs/ADR-003-ipc-framework.md`         | Mojo IPC patterns                              | Before IPC development  |
| **P1**   | `docs/PRIVACY-ETHICS-POLICY.md`              | Privacy implementation requirements            | Before privacy features |
| **P2**   | `docs/architecture/audit-trail.md`           | Cryptographic audit implementation             | Before audit features   |
| **P2**   | `docs/architecture/mcp-sandbox.md`           | MCP server implementation                      | Before MCP features     |

### Validation Questions

1. **Coding Rules**: "Does this code follow all critical coding rules (no bare throws, no unhandled promises, no `any` type)?"
2. **Test Coverage**: "Are there tests for all acceptance criteria with proper assertions?"
3. **Privacy Compliance**: "Does this implementation respect privacy-first principles?"
4. **Error Handling**: "Does this code use the Result<T> pattern for error handling?"
5. **Type Safety**: "Is this code fully TypeScript strict mode compliant?"

---

## QA Agent (Murat) Context

**Role**: Test strategy, quality assurance, validation
**Responsibilities**: Test design, quality gates, validation processes

### Required Files

| Priority | File                                    | Purpose                                 | When to Load         |
| -------- | --------------------------------------- | --------------------------------------- | -------------------- |
| **P0**   | `docs/contributing/testing-strategy.md` | Testing requirements and patterns       | Before every task    |
| **P0**   | `TOUBKAL-PRD.md`                        | Acceptance criteria and success metrics | Before every task    |
| **P0**   | `PRIVACY-ETHICS-POLICY.md`              | Privacy validation requirements         | Before every task    |
| **P0**   | `CODING-RULES.md`                       | Test quality requirements               | Before every task    |
| **P1**   | `docs/architecture/audit-trail.md`      | Cryptographic validation requirements   | Before audit testing |
| **P1**   | `docs/architecture/mcp-sandbox.md`      | MCP security validation requirements    | Before MCP testing   |
| **P1**   | `docs/adrs/ADR-007-ui-security.md`      | UI security testing requirements        | Before UI testing    |

### Testable vs. Non-Testable Features Framework

#### ✅ Testable Features (Automated Testing)

| Category                     | Examples                                                     | Test Type          |
| ---------------------------- | ------------------------------------------------------------ | ------------------ |
| **Functional Logic**         | Business rules, calculations, data transformations           | Vitest unit        |
| **API Contracts**            | Input validation, output formatting, error handling          | Vitest integration |
| **UI Interactions**          | Button clicks, form submissions, dropdown selections         | Playwright E2E     |
| **API Responses**            | HTTP status codes, JSON validation, error messages           | Vitest integration |
| **Cryptographic Operations** | Ed25519 signature verification, Merkle tree construction     | Vitest unit        |
| **Privacy Compliance**       | Zero telemetry validation, consent enforcement               | Wireshark + Vitest |
| **Performance**              | Ad-blocking latency (<5ms p95), audit log overhead (<5% CPU) | Benchmark scripts  |

#### ❌ Non-Testable Features (Manual QA)

| Category                     | Examples                                       | Review Process               |
| ---------------------------- | ---------------------------------------------- | ---------------------------- |
| **Visual Aesthetics**        | Color harmony, spacing balance, icon alignment | Human visual review          |
| **Brand Voice**              | Error message tone, help text clarity          | Human editorial review       |
| **User Experience "Feel"**   | Perceived responsiveness, cognitive load       | Usability testing (10 users) |
| **Accessibility Edge Cases** | Screen reader nuances, keyboard nav edge cases | Manual accessibility audit   |

### Validation Rule

**Before creating QA gate decision**, ask:

> "Can this feature be validated with a passing/failing test?"

- ✅ **YES** → Write automated test (unit/integration/E2E)
- ❌ **NO** → Document manual QA process + acceptance criteria for human review

### Validation Questions

1. **Testability**: "Can this feature be validated with automated tests?"
2. **Coverage**: "Do tests cover all acceptance criteria with proper assertions?"
3. **Privacy Validation**: "Are privacy claims cryptographically verifiable?"
4. **Performance**: "Are performance targets measurable and testable?"
5. **Security**: "Are security boundaries properly tested?"

---

## SM Agent (Bob) Context

**Role**: Story preparation, sprint planning, task breakdown
**Responsibilities**: User story creation, acceptance criteria, sprint coordination

### Required Files

| Priority | File                              | Purpose                                   | When to Load             |
| -------- | --------------------------------- | ----------------------------------------- | ------------------------ |
| **P0**   | `BMAD-AGENT-GUIDE.md`             | SM workflow and story preparation process | Before every task        |
| **P0**   | `TOUBKAL-PRD.md`                  | Requirements and acceptance criteria      | Before every task        |
| **P0**   | `docs/contributing/onboarding.md` | Team structure and communication          | Before every task        |
| **P1**   | `PRODUCT-ROADMAP.md`              | Phase priorities and timeline             | Before sprint planning   |
| **P1**   | `PRIVACY-ETHICS-POLICY.md`        | Privacy requirements for stories          | Before privacy stories   |
| **P2**   | `CODING-RULES.md`                 | Technical constraints for stories         | Before technical stories |

### Handoff Process (from BMAD-AGENT-GUIDE.md)

1. **PM Agent** → Creates feature brief
2. **SM Agent** → Breaks into user stories with acceptance criteria
3. **Dev Agent** → Implements stories with tests
4. **QA Agent** → Validates stories meet acceptance criteria
5. **Architect Agent** → Reviews technical design (if needed)

### Validation Questions

1. **Story Completeness**: "Does this story have clear acceptance criteria?"
2. **Sprint Alignment**: "Does this story fit within current sprint capacity?"
3. **Dependencies**: "Are all story dependencies identified and resolved?"
4. **Privacy Compliance**: "Does this story respect privacy-first principles?"
5. **Testability**: "Can this story be validated with automated tests?"

---

## UX Agent (Sally) Context

**Role**: User experience design, UI/UX strategy
**Responsibilities**: User interface design, user experience optimization

### Required Files

| Priority | File                                | Purpose                                      | When to Load                |
| -------- | ----------------------------------- | -------------------------------------------- | --------------------------- |
| **P0**   | `TOUBKAL-PRD.md`                    | User experience requirements                 | Before every task           |
| **P0**   | `BRAND-IDENTITY.md`                 | Brand guidelines and design system           | Before every task           |
| **P0**   | `docs/adrs/ADR-001-ui-framework.md` | React 19 + TypeScript UI patterns            | Before UI design            |
| **P0**   | `docs/adrs/ADR-007-ui-security.md`  | UI security constraints (CSP, Trusted Types) | Before UI design            |
| **P1**   | `docs/PRIVACY-ETHICS-POLICY.md`     | Privacy-first UX principles                  | Before privacy-sensitive UI |
| **P1**   | `docs/architecture/audit-trail.md`  | Transparency dashboard UX requirements       | Before audit UI             |
| **P1**   | `docs/architecture/mcp-sandbox.md`  | MCP server management UX                     | Before MCP UI               |

### Validation Questions

1. **Brand Consistency**: "Does this design follow Toubkal's brand guidelines?"
2. **Privacy-First UX**: "Does this design prioritize user privacy and control?"
3. **Accessibility**: "Is this design accessible to users with disabilities?"
4. **Security**: "Does this design prevent XSS and other UI security issues?"
5. **User Clarity**: "Is this design clear and intuitive for target users?"

---

## Business Analyst (Mary) Context

**Role**: Requirements analysis, business process optimization
**Responsibilities**: Business requirements, stakeholder analysis, process improvement

### Required Files

| Priority | File                              | Purpose                              | When to Load                |
| -------- | --------------------------------- | ------------------------------------ | --------------------------- |
| **P0**   | `TOUBKAL-PRD.md`                  | Business requirements and objectives | Before every task           |
| **P0**   | `PRIVACY-ETHICS-POLICY.md`        | Privacy business requirements        | Before every task           |
| **P0**   | `PRODUCT-ROADMAP.md`              | Business timeline and priorities     | Before every task           |
| **P1**   | `BRAND-IDENTITY.md`               | Business positioning and messaging   | Before stakeholder analysis |
| **P1**   | `docs/contributing/onboarding.md` | Team structure and roles             | Before process analysis     |

### Validation Questions

1. **Business Value**: "Does this requirement deliver clear business value?"
2. **Privacy Compliance**: "Does this requirement respect privacy-first principles?"
3. **Stakeholder Alignment**: "Are all stakeholders aligned on this requirement?"
4. **Feasibility**: "Is this requirement technically and economically feasible?"
5. **Measurability**: "Can this requirement be measured and validated?"

---

## Party Mode Initialization Checklist

**When multiple agents collaborate, each agent MUST**:

### Pre-Collaboration Setup

- [ ] Load Universal Context (all agents)
- [ ] Load Role-Specific Context (individual agents)
- [ ] Validate understanding with role-specific questions
- [ ] Identify potential conflicts or overlaps with other agents

### During Collaboration

- [ ] Reference shared context files when making decisions
- [ ] Respect other agents' expertise boundaries
- [ ] Escalate conflicts to BMad Master for resolution
- [ ] Document decisions and rationale for future reference

### Post-Collaboration

- [ ] Validate all outputs against role-specific questions
- [ ] Ensure consistency across agent contributions
- [ ] Update context files if new information emerges
- [ ] Hand off to next agent with proper context transfer

---

## Validation Questions

### Universal Validation (All Agents)

1. **Core Principles**: "What are Toubkal's 3 core principles?" (Privacy-first, Local-first AI, Cryptographic auditability)
2. **Phase Alignment**: "Does this work align with current phase scope?"
3. **Privacy Compliance**: "Does this work respect privacy-first principles?"
4. **Quality Standards**: "Does this work meet Toubkal's quality standards?"

### Role-Specific Validation

- **PM Agent**: Privacy impact, brand voice, phase alignment
- **Architect Agent**: ADR consistency, security, scalability
- **Dev Agent**: Coding rules, test coverage, error handling
- **QA Agent**: Testability, coverage, privacy validation
- **SM Agent**: Story completeness, sprint alignment, dependencies
- **UX Agent**: Brand consistency, accessibility, privacy-first UX
- **Business Analyst**: Business value, stakeholder alignment, feasibility

---

## Quick Reference

### File Loading Priority

1. **P0** - Critical for role execution
2. **P1** - Important for quality and consistency
3. **P2** - Helpful for context and completeness

### Context Validation

- **Before every task**: Load required context files
- **During task**: Reference context for decisions
- **After task**: Validate against role-specific questions

### Emergency Escalation

**Context conflicts**: Escalate to BMad Master
**Missing context**: Check this Bible for required files
**Quality issues**: Reference validation questions

**Contact**:

- Hassan (Product Manager): hassan@inopsio.com
- Ilyass Motya (Technical Lead): ilyass@inopsio.com
- Slack: #toubkal-dev

---

**Last Updated**: 2025-10-18
**Version**: 2.0 (Updated with agent feedback and PM decisions)
**Next Review**: Phase 1 Week 4 (Implementation Progress)

**Questions?** Contact BMad Master or reference `BMAD-AGENT-GUIDE.md`
