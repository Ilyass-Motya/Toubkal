# Refresh Toubkal Context

**Purpose**: Update PM agent's understanding of Toubkal's current state  
**Last Updated**: 2025-10-18  
**Status**: Active

---

## Instructions

### 1. Re-load Toubkal Context Files

**Load these files in order:**

- `TOUBKAL-PRD.md` — Product vision, constraints, tech stack
- `PRIVACY-ETHICS-POLICY.md` — Privacy principles, consent model
- `PRODUCT-ROADMAP.md` — Phase 1-4 timeline, milestones
- `TEAM-IMPLEMENTATION-NOTES.md` — Tooling requirements

### 2. Check for State Changes

**Current Week Assessment:**

- **Week 0 (Pre-Phase 1)**: Tooling setup phase
- **Week 1-8 (Phase 1)**: Foundation & Privacy implementation
- **Week 9-16 (Phase 2)**: Local AI Platform
- **Week 17-24 (Phase 3)**: Ecosystem & Enterprise

**Week 0 Tasks Status:**

- [ ] **ESLint Configuration** (Dev Agent - Amelia)
- [ ] **Husky Pre-Commit Hooks** (Dev Agent - Amelia)
- [ ] **Vitest Configuration** (QA Agent - Murat)
- [ ] **GitHub Actions CI/CD** (Architect Agent - Winston)

**Architecture Review Status:**

- [ ] **Ilyass Review Complete** (MCP sandbox, audit trail docs)

**Engineering Team Status:**

- [ ] **2x Backend Engineers** hired
- [ ] **1x Frontend Engineer** hired
- [ ] **Optional: 1x QA Engineer** hired

### 3. Update Internal State

**Current Phase Assessment:**

- **Week 0**: Pre-implementation tooling setup
- **Week 1-8**: Phase 1 implementation (Foundation & Privacy)
- **Week 9-16**: Phase 2 implementation (Local AI Platform)
- **Week 17+**: Phase 3+ implementation (Ecosystem & Enterprise)

**Outstanding Tasks:**

- List all pending tasks with owners and priorities
- Identify blockers preventing next phase kickoff
- Note any new requirements or constraints

**Active Blockers:**

- Engineering team hiring status
- Week 0 tooling completion status
- Architecture review completion
- Any new technical or business constraints

### 4. Confirm to User

**Output Format:**

```
✅ Toubkal context refreshed successfully.

**Current State:**
- Phase: [Week 0 | Week 1-8 | Phase 2+]
- Outstanding Tasks: [count] pending
- Blockers: [count] active
- Next Priority: [specific action]

**Key Changes Detected:**
- [List any state changes since last refresh]
- [Note any new requirements or constraints]

**Recommended Next Action:**
[Specific, actionable recommendation based on current state]
```

---

## Validation Questions

**Before confirming refresh, validate:**

1. **Phase Accuracy**: Is the current phase correctly identified?
2. **Task Status**: Are Week 0 tasks accurately assessed?
3. **Blocker Awareness**: Are all active blockers identified?
4. **Priority Alignment**: Does the next action align with current priorities?

---

## Error Handling

**If context files cannot be loaded:**

- Warn user: "⚠️ Some context files unavailable - using cached information"
- Proceed with available information
- Suggest manual verification of critical facts

**If state changes are detected:**

- Highlight significant changes
- Ask user to confirm before proceeding
- Update internal state accordingly

---

**Status**: Ready for PM Agent use  
**Next Review**: After each major project state change
