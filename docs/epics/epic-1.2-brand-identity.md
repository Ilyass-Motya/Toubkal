# Epic 1.2: Brand Identity & Internal Pages

**Epic ID**: 1.2
**Phase**: Phase 1 - Privacy Foundation
**Timeline**: Week 5-6 (2025-11-16 to 2025-11-29, parallel with Epic 1.1)
**Owner**: Team
**Status**: ⚪ Planned
**Priority**: P0 - Critical (User-facing brand differentiation)

---

## Overview

Establish Toubkal Browser brand identity by implementing custom `toubkal://` URL scheme, rebranding internal pages (Settings, About, etc.), and creating React-based transparency dashboards (`toubkal://audit`, `toubkal://consent`). This epic transforms the Chromium fork into a distinct Toubkal-branded privacy browser.

---

## Business Value

**Why This Matters:**
- **Brand Differentiation**: Distinct identity separate from Chromium/Chrome
- **User Trust**: Transparency dashboards build confidence in privacy claims
- **Market Positioning**: Professional brand identity for enterprise adoption
- **Privacy Transparency**: Audit trail and consent history visible to users

**Success Metrics:**
- Browser window displays "Toubkal Browser" (not "Chromium")
- `toubkal://settings` accessible and rebranded
- `toubkal://audit` displays cryptographically signed audit logs
- `toubkal://consent` shows consent history with Ed25519 signatures
- 100% internal pages use `toubkal://` scheme (no `chrome://` references)

---

## Related ADRs

- **[ADR-001: UI Framework](../adrs/ADR-001-ui-framework.md)** - React 19 + TypeScript for internal pages
- **[ADR-008: URL Schema](../adrs/ADR-008-url-schema.md)** - Custom `toubkal://` scheme
- **[ADR-007: UI Security](../adrs/ADR-007-ui-security.md)** - CSP and Trusted Types for internal pages
- **[ADR-003: IPC Framework](../adrs/ADR-003-ipc-framework.md)** - Mojo IPC for browser ↔ UI communication

---

## Related Epics

**Prerequisites:**
- **Epic 1.1: GN Build System** ✅ Required (parallel) - Builds React UI components
- **Epic 0.5.1: Real Audit Trail** ✅ Complete - Provides audit data for `toubkal://audit`

**Parallel Epics:**
- **Epic 1.1: GN Build System** - Runs parallel (Week 5-6)

**Downstream Epics:**
- **Epic 1.3: Privacy Controls** - Extends internal pages with privacy settings UI
- **Epic 2.1: Multi-Engine AI** - Adds `toubkal://ai` management page (Phase 2)

---

## Technical Architecture

### Components

**1. URL Scheme Registration** (`toubkal_content_browser_client.cc`)
- Register `toubkal://` as custom URL scheme
- Redirect `chrome://` → `toubkal://` for compatibility
- Scheme handlers for internal pages

**2. Internal Page Rebranding**
- `toubkal://settings` - Browser settings (rebranded from chrome://settings)
- `toubkal://about` - About page with Toubkal branding
- `toubkal://version` - Version information
- `toubkal://flags` - Feature flags (rebranded)

**3. Transparency Dashboards (React 19)**
- **`toubkal://audit`** - Cryptographically signed audit trail viewer
  - Real-time audit log display
  - Ed25519 signature verification UI
  - Merkle tree integrity visualization
  - Export functionality (JSON/CSV/PDF)

- **`toubkal://consent`** - Consent history viewer
  - Chronological consent decisions
  - Cryptographic proof display
  - Revocation controls

**4. Mojo IPC Interfaces** (`toubkal_ui.mojom`)
- Browser → UI: Audit logs, consent history, system info
- UI → Browser: User actions (export, revoke consent)

### File Structure
```
src/toubkal/browser/ui/
├── webui/
│   ├── toubkal_ui.h                # WebUI controller base
│   ├── toubkal_ui.cc
│   ├── audit/
│   │   ├── audit_ui.h              # Audit dashboard controller
│   │   ├── audit_ui.cc
│   │   └── audit_page_handler.cc   # Mojo handler for audit data
│   ├── consent/
│   │   ├── consent_ui.h            # Consent history controller
│   │   ├── consent_ui.cc
│   │   └── consent_page_handler.cc # Mojo handler
│   └── settings/
│       ├── toubkal_settings_ui.h   # Rebranded settings
│       └── toubkal_settings_ui.cc

src/toubkal/browser/resources/  # React app source
├── audit/
│   ├── src/
│   │   ├── App.tsx                 # Audit dashboard React app
│   │   ├── components/
│   │   │   ├── AuditLogTable.tsx
│   │   │   ├── SignatureVerifier.tsx
│   │   │   └── MerkleTreeVisualizer.tsx
│   │   └── api/audit_api.ts        # Mojo IPC bindings
│   ├── package.json
│   └── vite.config.ts
├── consent/
│   └── src/                        # Similar structure
└── settings/
    └── src/                        # Rebranded settings UI

src/toubkal/mojo/ui/
└── toubkal_ui.mojom                # UI ↔ Browser IPC definitions
```

---

## Stories

### Week 5 Stories
- **Story 1.2.1**: `toubkal://` URL Scheme Registration (P0)
- **Story 1.2.2**: Internal Page Rebranding (Settings, About, Version) (P0)
- **Story 1.2.3**: `toubkal://audit` Dashboard - React App Setup (P0)

### Week 6 Stories
- **Story 1.2.4**: `toubkal://audit` - Audit Log Display & Signature Verification (P0)
- **Story 1.2.5**: `toubkal://consent` - Consent History Viewer (P1)
- **Story 1.2.6**: Mojo IPC Integration for Dashboard Data (P0)

**Total Stories**: 6
**Completed**: 0
**Completion**: 0%

---

## Success Criteria

### Week 5 Deliverables
- [  ] `toubkal://` scheme registered and functional
- [  ] `chrome://` → `toubkal://` auto-redirect working
- [  ] `toubkal://settings` accessible (rebranded UI)
- [  ] `toubkal://about` displays "Toubkal Browser" branding
- [  ] React app scaffold for `toubkal://audit` created

### Week 6 Deliverables
- [  ] `toubkal://audit` displays real-time audit logs from Epic 0.5.1
- [  ] Ed25519 signature verification in UI (green checkmark for valid signatures)
- [  ] Merkle tree integrity visualization (optional Week 6, can move to Week 7)
- [  ] `toubkal://consent` shows consent history (if consent implemented)
- [  ] Mojo IPC bindings functional (browser ↔ UI data flow)
- [  ] Export functionality working (JSON/CSV/PDF)

### Branding Requirements
- [  ] Browser window title: "Toubkal Browser"
- [  ] About page: Toubkal logo and branding
- [  ] No visible "Chromium" or "Chrome" references in UI
- [  ] Custom icon/logo (if available)

---

## Dependencies

**Prerequisites:**
- ✅ **Epic 1.1: GN Build System** - REQUIRED (parallel) for React UI compilation
- ✅ **Epic 0.5.1: Real Audit Trail** - COMPLETE (provides audit data)
- ✅ React 19, TypeScript 5.5, Tailwind CSS 4 (already configured)

**Blockers:**
- None (can run parallel with Epic 1.1)

**Downstream Dependencies:**
- **Epic 1.3**: Privacy Controls (extends `toubkal://settings` with privacy UI)

---

## Testing Strategy

### Manual Testing
```bash
# URL scheme verification
1. Launch Toubkal browser
2. Navigate to toubkal://settings → Verify settings page loads
3. Navigate to chrome://settings → Verify auto-redirect to toubkal://settings
4. Navigate to toubkal://audit → Verify audit dashboard displays
5. Navigate to toubkal://about → Verify "Toubkal Browser" branding

# Audit dashboard testing
1. Perform privacy operation (e.g., block ad)
2. Open toubkal://audit → Verify blocked request logged
3. Click signature verification → Verify green checkmark (signature valid)
4. Export audit log → Verify JSON/CSV/PDF export works
```

### Automated Tests
```cpp
// URL scheme registration test
TEST_F(URLSchemeTest, ToubkalSchemeRegistered) {
  EXPECT_TRUE(IsStandardScheme("toubkal"));
  EXPECT_TRUE(IsWebUIScheme("toubkal"));
}

// Redirect test
TEST_F(URLSchemeTest, ChromeRedirectsToToubkal) {
  GURL chrome_url("chrome://settings");
  GURL redirected = GetRedirectURL(chrome_url);
  EXPECT_EQ(redirected.spec(), "toubkal://settings");
}

// WebUI controller test
TEST_F(AuditUITest, AuditDashboardLoads) {
  GURL audit_url("toubkal://audit");
  content::WebContents* web_contents = CreateWebContents();

  NavigateAndCommit(web_contents, audit_url);
  EXPECT_TRUE(IsWebUIControllerActive(web_contents));
  EXPECT_EQ(GetWebUIName(web_contents), "AuditUI");
}
```

### Integration Tests (React Testing Library)
```typescript
// Audit dashboard integration test
describe('Audit Dashboard', () => {
  it('displays audit logs from Mojo IPC', async () => {
    // Mock Mojo IPC response
    mockMojoIPC.getAuditLogs.mockResolvedValue({
      logs: [
        { operation: 'ad_blocked', url: 'tracker.com', signature: '0x123...', timestamp: 1699999999 }
      ]
    });

    render(<AuditDashboard />);

    // Verify log displayed
    await waitFor(() => {
      expect(screen.getByText('ad_blocked')).toBeInTheDocument();
      expect(screen.getByText('tracker.com')).toBeInTheDocument();
    });

    // Verify signature verification UI
    expect(screen.getByTestId('signature-valid-icon')).toBeInTheDocument();
  });
});
```

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **React Build Integration** | Medium | Medium | Use proven Vite + GN integration pattern from ADR-001 |
| **Mojo IPC Complexity** | Medium | Low | Follow Chromium WebUI patterns, extensive testing |
| **Branding Assets Missing** | Low | Medium | Use placeholder branding initially, update later |
| **CSP Violations** | High | Low | Strict CSP testing per ADR-007, Trusted Types enforcement |
| **Performance (Audit Log Size)** | Medium | Medium | Pagination, virtualized lists in React, limit displayed logs to 1000 |

---

## Out of Scope

- ❌ Advanced audit log filtering/search (Phase 2)
- ❌ Audit log analytics/charts (Phase 2)
- ❌ `toubkal://ai` AI management page (Phase 2)
- ❌ `toubkal://mcp` MCP server catalog (Phase 2)
- ❌ Mobile-responsive internal pages (desktop-first Phase 1)
- ❌ Dark mode for internal pages (Phase 2)

---

## Documentation

- [ ] `docs/user-guide/internal-pages.md` - User guide for toubkal:// pages
- [ ] `docs/architecture/webui-architecture.md` - WebUI technical overview
- [ ] `docs/contributing/webui-development.md` - How to develop internal pages
- [ ] Inline JSDoc comments in React components

---

## Timeline

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| **Week 5** | Brand Identity Established | `toubkal://` scheme, rebranded pages, audit dashboard scaffold |
| **Week 6** | Transparency Dashboards Live | `toubkal://audit` functional, Mojo IPC working, export features |

**Start Date**: 2025-11-16 (Week 5, parallel with Epic 1.1)
**End Date**: 2025-11-29 (Week 6)
**Duration**: 2 weeks (parallel)

---

## References

- [PRODUCT-ROADMAP.md - Phase 1](../PRODUCT-ROADMAP.md#phase-1-privacy-foundation-weeks-5-12)
- [ADR-001: UI Framework](../adrs/ADR-001-ui-framework.md)
- [ADR-008: URL Schema](../adrs/ADR-008-url-schema.md)
- [ADR-007: UI Security](../adrs/ADR-007-ui-security.md)
- [Chromium WebUI Documentation](https://www.chromium.org/developers/webui/)
- [React 19 Documentation](https://react.dev/)

---

**Epic Owner**: Team
**Last Updated**: 2025-10-18
**Status**: ⚪ Planned (starts Week 5, parallel with Epic 1.1)
