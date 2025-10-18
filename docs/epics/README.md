# Toubkal Browser - Epic Structure

**Last Updated**: 2025-10-18
**Owner**: Ilyass Motya

---

## Epic Organization

Epics are organized by **Roadmap Phase** to align with [PRODUCT-ROADMAP.md](../PRODUCT-ROADMAP.md).

---

## Phase 0: Infrastructure (Week 0) — ✅ COMPLETE

**Status**: ✅ Complete as of 2025-10-18

### Epics
- **Epic 0.0**: Repository Setup & Tooling
  - Stories: Repository initialization, ESLint, Prettier, Husky, GitHub Actions CI/CD
  - Status: ✅ Complete
  - Note: Completed before epic structure established (no epic file created retrospectively)

---

## Phase 0.5: Foundation Prerequisites (Weeks 1-4) — 🔵 ACTIVE

**Status**: 🔵 Active Development
**Timeline**: 2025-10-19 to 2025-11-15 (4 weeks)

### Epics

#### [Epic 0.5.1: Real Audit Trail](epic-0.5.1-real-audit-trail.md)
- **Timeline**: Week 1-2
- **Owner**: Ilyass Motya
- **Status**: 🔵 In Progress
- **Stories**: 5 total (0 complete, 3 in progress)
- **ADRs**: ADR-002 (Browser Engine), ADR-006 (Supply Chain)
- **Key Deliverables**:
  - BoringSSL Ed25519 signature integration
  - Merkle tree tamper detection
  - LevelDB persistence layer

#### [Epic 0.5.2: Ad Blocking MVP](epic-0.5.2-ad-blocking-mvp.md)
- **Timeline**: Week 3-4
- **Owner**: Team
- **Status**: ⚪ Planned
- **Stories**: 4 total (0 complete)
- **ADRs**: ADR-002 (Browser Engine), ADR-006 (Supply Chain)
- **Key Deliverables**:
  - Brave adblock-rust integration
  - EasyList + uBlock Origin filters
  - Audit logging for blocked requests

---

## Phase 1: Privacy Foundation (Weeks 5-12) — 🟡 PLANNING

**Status**: 🟡 Planning
**Timeline**: 2025-11-16 to 2026-01-10 (8 weeks)
**Prerequisites**: ✅ Phase 0.5 complete, ✅ Chromium fork synchronized

### Epics

#### [Epic 1.1: GN Build System](epic-1.1-gn-build-system.md)
- **Timeline**: Week 5-6
- **Owner**: Team
- **Status**: ⚪ Planned (Epic documented)
- **Stories**: 6 total
- **ADRs**: ADR-005 (Build System)
- **Key Deliverables**:
  - Root BUILD.gn configuration
  - Siso distributed compilation
  - Cross-platform build verification
  - React/TypeScript UI build integration

#### [Epic 1.2: Brand Identity](epic-1.2-brand-identity.md)
- **Timeline**: Week 5-6 (parallel with Epic 1.1)
- **Owner**: Team
- **Status**: ⚪ Planned (Epic documented)
- **Stories**: 6 total
- **ADRs**: ADR-001 (UI Framework), ADR-008 (URL Schema), ADR-007 (UI Security), ADR-003 (IPC Framework)
- **Key Deliverables**:
  - `toubkal://` URL scheme registration
  - Internal page rebranding
  - `toubkal://audit` and `toubkal://consent` dashboards
  - Mojo IPC integration

#### [Epic 1.3: Privacy Controls](epic-1.3-privacy-controls.md)
- **Timeline**: Week 7-10
- **Owner**: Team
- **Status**: ⚪ Planned (Epic documented)
- **Stories**: 8 total
- **ADRs**: ADR-003 (IPC Framework), ADR-007 (UI Security), ADR-002 (Browser Engine), ADR-001 (UI Framework)
- **Key Deliverables**:
  - Consent fabric with cryptographic signing
  - Real-time transparency dashboard
  - Fingerprinting protection
  - Forensic replay mode

#### [Epic 1.4: SLSA Level 3 Builds](epic-1.4-slsa-level-3-builds.md)
- **Timeline**: Week 11-12
- **Owner**: Team
- **Status**: ⚪ Planned (Epic documented)
- **Stories**: 7 total
- **ADRs**: ADR-006 (Supply Chain Security), ADR-005 (Build System), ADR-002 (Browser Engine)
- **Key Deliverables**:
  - SLSA Level 3 provenance generation
  - CycloneDX SBOM generation
  - Cosign signing integration
  - Reproducible builds (Linux, macOS, Windows)
  - Enterprise outreach (5+ LOIs target)

---

## Phase 2: Local AI Platform (Weeks 13-20) — ⚪ PLANNED

**Status**: ⚪ Planned
**Timeline**: 2026-01-11 to 2026-03-07 (8 weeks)
**Prerequisites**: ✅ Phase 1 complete

### Epics

#### [Epic 2.1: Multi-Engine AI Infrastructure](epic-2.1-multi-engine-ai.md)
- **Timeline**: Week 13-16
- **Status**: ⚪ Planned
- **ADRs**: ADR-004 (AI Integration), ADR-003 (IPC Framework)
- **Key Deliverables**:
  - Ollama integration
  - Transformers.js engine
  - WebLLM engine
  - Engine selection logic

#### [Epic 2.2: MCP Client Implementation](epic-2.2-mcp-client.md)
- **Timeline**: Week 13-16 (parallel with Epic 2.1)
- **Status**: ⚪ Planned
- **ADRs**: ADR-004 (AI Integration)
- **Key Deliverables**:
  - MCP protocol implementation (stdio, HTTP+SSE)
  - Native MCP servers (browser tools, bookmarks, history)
  - MCP server catalog

#### [Epic 2.3: BYOM (Bring Your Own Model)](epic-2.3-byom.md)
- **Timeline**: Week 17-18
- **Status**: ⚪ Planned
- **ADRs**: ADR-004 (AI Integration), ADR-006 (Supply Chain)
- **Key Deliverables**:
  - Drag-and-drop model import
  - Model format conversion (GGUF, ONNX, etc.)
  - Supply chain verification for models

#### [Epic 2.4: AI Model Supply Chain Security](epic-2.4-ai-supply-chain.md)
- **Timeline**: Week 19-20
- **Status**: ⚪ Planned
- **ADRs**: ADR-006 (Supply Chain Security)
- **Key Deliverables**:
  - Model registry with verification
  - Cryptographic model signing
  - Transparency log integration

---

## Phase 3: Ecosystem & Enterprise (Weeks 21-28) — ⚪ PLANNED

**Status**: ⚪ Planned
**Timeline**: 2026-03-08 to 2026-05-02 (8 weeks)

### Epics

#### [Epic 3.1: Enterprise Features](epic-3.1-enterprise.md)
- **Timeline**: Week 21-24
- **Status**: ⚪ Planned
- **Key Deliverables**:
  - Group policy management
  - SSO integration
  - Enterprise deployment tools

#### [Epic 3.2: Extension Ecosystem](epic-3.2-extensions.md)
- **Timeline**: Week 25-26
- **Status**: ⚪ Planned
- **Key Deliverables**:
  - Extension API compatibility
  - Privacy-safe extension sandbox
  - Extension store integration

#### [Epic 3.3: Performance Optimization](epic-3.3-performance.md)
- **Timeline**: Week 27-28
- **Status**: ⚪ Planned
- **Key Deliverables**:
  - Memory optimization
  - Startup time improvements
  - Rendering performance tuning

---

## Epic Naming Convention

**Format**: `epic-{phase}.{number}-{name}.md`

**Examples:**
- `epic-0.5.1-real-audit-trail.md` → Phase 0.5, Epic 1
- `epic-1.2-brand-identity.md` → Phase 1, Epic 2
- `epic-2.1-multi-engine-ai.md` → Phase 2, Epic 1

---

## Epic → Story Mapping

**Directory Structure:**
```
docs/
├── epics/
│   ├── README.md (this file)
│   ├── epic-0.5.1-real-audit-trail.md
│   ├── epic-0.5.2-ad-blocking-mvp.md
│   ├── epic-1.1-gn-build-system.md
│   └── ... (more epics)
└── stories/
    ├── phase0-week0/           # Phase 0 stories
    ├── phase0.5-week1-4/       # Phase 0.5 stories
    ├── phase1-week5-12/        # Phase 1 stories
    └── phase2-week13-20/       # Phase 2 stories
```

**Each Story References Parent Epic:**
```markdown
# Story 0.5.1.1: BoringSSL Ed25519 Integration

**Epic**: [Epic 0.5.1: Real Audit Trail](../epics/epic-0.5.1-real-audit-trail.md)
**Phase**: Phase 0.5 - Week 1
...
```

---

## Epic Template

See: `epic-template.md` for standard epic structure

**Required Sections:**
- Overview
- Business Value
- Related ADRs
- Technical Architecture
- Stories (with completion tracking)
- Success Criteria
- Dependencies
- Testing Strategy
- Risks & Mitigation
- Timeline
- References

---

## Progress Tracking

### Overall Progress by Phase

| Phase | Epics | Stories | Epic Documentation | Implementation |
|-------|-------|---------|-------------------|----------------|
| **Phase 0** | 1 | ~10 | 100% ✅ | 100% ✅ |
| **Phase 0.5** | 2 | 11 | 100% ✅ | 0% 🔵 |
| **Phase 1** | 4 | 27 | 100% ✅ | 0% 🟡 |
| **Phase 2** | 4 | ~25 | 0% ⚪ | 0% ⚪ |
| **Phase 3** | 3 | ~20 | 0% ⚪ | 0% ⚪ |
| **Total** | 14 | ~93 | 50% | 11% |

**Note**: Epic Documentation = 100% for Phase 0, 0.5, and 1 (all epics documented). Implementation = 0% for Phase 0.5+ (work not yet started).

---

## Related Documentation

- **[PRODUCT-ROADMAP.md](../PRODUCT-ROADMAP.md)** - Master roadmap with phase timelines
- **[ADRs](../adrs/)** - Architecture Decision Records referenced by epics
- **[Stories](../stories/)** - User stories implementing epic deliverables
- **[TOUBKAL-PRD.md](../TOUBKAL-PRD.md)** - Product requirements driving epics

---

**Maintained By**: Ilyass Motya
**Last Review**: 2025-10-18
**Next Review**: After each phase completion
