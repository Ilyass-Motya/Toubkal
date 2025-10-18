# Epic 1.3: Privacy Controls & Consent Fabric

**Epic ID**: 1.3
**Phase**: Phase 1 - Privacy Foundation
**Timeline**: Week 7-10 (2025-11-30 to 2025-12-27)
**Owner**: Team
**Status**: ⚪ Planned
**Priority**: P0 - Critical (Core privacy infrastructure)

---

## Overview

Implement production-grade privacy controls with cryptographic consent management, fingerprinting protection, and real-time transparency dashboard. Delivers "zero-telemetry-by-default" privacy promise with Ed25519-signed consent decisions and browser-level enforcement via Chromium network stack integration.

---

## Business Value

**Why This Matters:**
- **Privacy Differentiation**: Only browser with cryptographically signed consent decisions
- **Compliance Ready**: GDPR/CCPA compliance through consent fabric and audit trail
- **User Trust**: Real-time transparency dashboard shows all privacy operations
- **Enterprise Adoption**: Meets SOC 2, FedRAMP, HIPAA audit requirements

**Success Metrics:**
- 100% of network requests blocked until user grants consent
- All consent decisions logged with Ed25519 signatures
- <100ms UI latency for real-time audit log streaming (10K+ entries)
- >12 bits entropy reduction on Panopticlick fingerprinting tests
- Zero unsanctioned network requests (verified via automated testing)

---

## Related ADRs

- **[ADR-003: IPC Framework](../adrs/ADR-003-ipc-framework.md)** - Mojo IPC for consent communication
- **[ADR-007: UI Security](../adrs/ADR-007-ui-security.md)** - CSP and Trusted Types for dashboard
- **[ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)** - Chromium network stack integration
- **[ADR-001: UI Framework](../adrs/ADR-001-ui-framework.md)** - React 19 for transparency dashboard

---

## Related Epics

**Prerequisites:**
- **Epic 0.5.1: Real Audit Trail** ✅ Complete - Provides audit logger for consent logging
- **Epic 1.2: Brand Identity** ✅ Required - Provides `toubkal://audit` dashboard foundation

**Parallel Epics:**
- None (runs sequentially after Epic 1.2)

**Downstream Epics:**
- **Epic 1.4: SLSA Level 3 Builds** - Extends with supply chain security
- **Epic 2.1: Multi-Engine AI** - Uses consent fabric for AI operations (Phase 2)

---

## Technical Architecture

### Components

**1. Consent Manager (C++)** (`consent_manager.cc`)
- Browser-level consent enforcement before network requests
- LevelDB persistence for consent decisions
- Ed25519 signature for each consent decision
- Consent state machine: UNKNOWN → REQUESTED → GRANTED/DENIED

**2. Mojo IPC Interfaces** (`consent.mojom`)
- Browser → UI: Consent request with data disclosure details
- UI → Browser: User consent decision (GRANT/DENY/DEFER)
- Real-time consent status updates
- Visual consent banners in renderer process

**3. Fingerprinting Protection** (`fingerprinting_protection.cc`)
- Canvas API randomization
- WebRTC IP leak prevention
- User-Agent normalization
- Battery/CPU API blocking
- Font enumeration protection

**4. Transparency Dashboard (React)** (`TransparencyDashboard/`)
- Real-time audit log streaming (10K+ entries, <100ms latency)
- Filter by operation type (AI query, network call, consent decision)
- Search and pagination
- Export functionality (JSON/CSV/PDF)
- Merkle proof verification UI
- Forensic replay mode (step-through analysis)

**5. Audit Exporter (C++)** (`audit_exporter.cc`)
- Export audit logs with Merkle proofs
- Signature verification report included
- Compliance report generation (GDPR, HIPAA, SOC 2)
- User-selectable formats (JSON/CSV/PDF)

### File Structure
```
src/toubkal/components/privacy/consent/
├── consent_manager.h             # Main consent interface
├── consent_manager.cc            # Browser-level enforcement
├── consent_decision.h            # Consent data structures
├── consent_storage.cc            # LevelDB persistence
└── BUILD.gn                      # GN build configuration

src/toubkal/mojo/privacy/
└── consent.mojom                 # Mojo IPC definitions

src/toubkal/components/privacy/fingerprinting/
├── fingerprinting_protection.h   # Fingerprinting blocker
├── fingerprinting_protection.cc  # Canvas randomization, etc.
├── webrtc_protection.cc          # WebRTC IP leak prevention
└── BUILD.gn

src/toubkal/browser/resources/transparency/
├── src/
│   ├── App.tsx                   # Transparency dashboard React app
│   ├── components/
│   │   ├── AuditLogStream.tsx    # Real-time log viewer
│   │   ├── ConsentHistory.tsx    # Consent decision history
│   │   ├── ForensicReplay.tsx    # Step-through analysis
│   │   └── ExportDialog.tsx      # Export functionality UI
│   └── api/transparency_api.ts   # Mojo IPC bindings
├── package.json
└── vite.config.ts

src/toubkal/components/privacy/audit/
├── audit_exporter.h              # Export interface
├── audit_exporter.cc             # JSON/CSV/PDF export
└── compliance_reporter.cc        # GDPR/HIPAA reports
```

---

## Stories

### Week 7-8 Stories (Consent Fabric)
- **Story 1.3.1**: C++ Consent Manager Implementation (P0)
- **Story 1.3.2**: Mojo IPC Interfaces for Consent Requests (P0)
- **Story 1.3.3**: Consent Audit Logging Integration (P0)
- **Story 1.3.4**: Visual Consent Banners (React Components) (P1)

### Week 9-10 Stories (Transparency Dashboard)
- **Story 1.3.5**: Real-Time Audit Log Streaming Dashboard (P0)
- **Story 1.3.6**: Audit Export Functionality (JSON/CSV/PDF) (P0)
- **Story 1.3.7**: Forensic Replay Mode Implementation (P1)
- **Story 1.3.8**: Fingerprinting Protection Implementation (P1)

**Total Stories**: 8
**Completed**: 0
**Completion**: 0%

---

## Success Criteria

### Week 7-8 Deliverables (Consent Fabric)
- [  ] `ConsentManager::RequestConsent(action_type, data_disclosure)` implemented
- [  ] Consent decisions stored in LevelDB with Ed25519 signatures
- [  ] Network requests blocked until user grants consent (Chromium network service integration)
- [  ] Mojo IPC interfaces functional for consent requests
- [  ] Visual consent banners display accurate data disclosure (100% accuracy)
- [  ] All consent decisions logged to audit trail

### Week 9-10 Deliverables (Transparency Dashboard)
- [  ] Real-time audit log streaming dashboard displays 100% of operations
- [  ] Dashboard supports filtering, search, pagination (10K+ entries)
- [  ] Export functionality working (JSON/CSV/PDF with Merkle proofs)
- [  ] Forensic replay mode shows complete data flow for any operation
- [  ] Fingerprinting protection active (Canvas randomization, WebRTC blocking)
- [  ] <100ms UI latency for log streaming

### Technical Requirements
- [  ] Network request blocking: 100% enforcement (zero unsanctioned requests)
- [  ] Consent persistence: LevelDB atomic writes, survives browser restarts
- [  ] Audit coverage: 100% of privacy operations logged
- [  ] UI performance: <100ms latency for 10K+ log entries
- [  ] Fingerprinting protection: >12 bits entropy reduction (Panopticlick)
- [  ] Export includes: Merkle proofs, signature verification report

---

## Dependencies

**Prerequisites:**
- ✅ **Epic 0.5.1: Real Audit Trail** - COMPLETE (audit logger with Ed25519 signatures)
- ✅ **Epic 1.2: Brand Identity** - REQUIRED (provides `toubkal://audit` dashboard foundation)
- ✅ Chromium network stack access (included in fork)
- ✅ LevelDB library (included in Chromium)

**Blockers:**
- ⚠️ Epic 1.2 completion (need `toubkal://audit` page to extend with transparency features)

**Downstream Dependencies:**
- **Epic 1.4**: SLSA Level 3 Builds (uses consent audit logs for compliance reports)
- **Epic 2.1**: Multi-Engine AI (uses consent fabric for AI operation permissions)

---

## Testing Strategy

### Unit Tests (Google Test)

```cpp
// consent_manager_unittest.cc
TEST_F(ConsentManagerTest, BlocksNetworkRequestsUntilConsent) {
  ConsentManager manager;
  manager.Initialize();

  // Request consent for network operation
  ConsentRequest request = {
    .action_type = "ai_query",
    .data_disclosure = "Send query to cloud AI service",
    .url = "https://api.openai.com"
  };

  // Before consent granted
  ASSERT_FALSE(manager.IsAllowed(request));

  // Grant consent
  manager.GrantConsent(request);

  // After consent granted
  ASSERT_TRUE(manager.IsAllowed(request));

  // Verify audit logging
  auto audit_entries = audit_logger_.GetRecentEntries(1);
  ASSERT_EQ(audit_entries[0].operation, "consent_granted");
  ASSERT_TRUE(audit_logger_.VerifySignature(audit_entries[0]));
}

TEST_F(ConsentManagerTest, PersistsConsentDecisionsAcrossRestarts) {
  ConsentManager manager;
  manager.Initialize();

  // Grant consent
  ConsentRequest request = CreateTestRequest();
  manager.GrantConsent(request);

  // Simulate browser restart
  manager.Shutdown();
  manager.Initialize();

  // Verify consent persisted
  ASSERT_TRUE(manager.IsAllowed(request));
}

// fingerprinting_protection_unittest.cc
TEST_F(FingerprintingProtectionTest, RandomizesCanvasAPI) {
  FingerprintingProtection protection;
  protection.Initialize();

  // Generate canvas fingerprint twice
  std::string fingerprint1 = GenerateCanvasFingerprint();
  std::string fingerprint2 = GenerateCanvasFingerprint();

  // Verify randomization (fingerprints should differ)
  ASSERT_NE(fingerprint1, fingerprint2);
}

TEST_F(FingerprintingProtectionTest, BlocksWebRTCIPLeaks) {
  FingerprintingProtection protection;
  protection.Initialize();

  // Attempt to get local IP via WebRTC
  auto ip_addresses = GetWebRTCLocalIPs();

  // Verify IP leak prevention (should return empty or dummy IP)
  ASSERT_TRUE(ip_addresses.empty() || ip_addresses[0] == "0.0.0.0");
}
```

### Integration Tests

```cpp
// consent_integration_test.cc
TEST_F(ConsentIntegrationTest, EndToEndConsentFlow) {
  // 1. Initialize consent system
  ConsentManager manager;
  ASSERT_TRUE(manager.Initialize());

  // 2. Trigger consent request (simulate AI query)
  ConsentRequest request = {
    .action_type = "ai_query",
    .data_disclosure = "Send query to Ollama local inference"
  };

  bool consent_requested = manager.RequestConsent(request);
  ASSERT_TRUE(consent_requested);

  // 3. Verify Mojo IPC notification sent to UI
  ASSERT_TRUE(MockMojoIPC::ReceivedConsentRequest(request));

  // 4. Simulate user granting consent via UI
  manager.OnUserDecision(request, ConsentDecision::GRANTED);

  // 5. Verify audit logging
  auto audit_entries = audit_logger_.GetRecentEntries(1);
  ASSERT_EQ(audit_entries[0].operation, "consent_granted");
  ASSERT_EQ(audit_entries[0].metadata["action_type"], "ai_query");

  // 6. Verify Ed25519 signature
  ASSERT_TRUE(audit_logger_.VerifySignature(audit_entries[0]));

  // 7. Verify persistence
  AuditStorage storage;
  auto persisted_entries = storage.GetRecentEntries(1);
  ASSERT_EQ(persisted_entries.size(), 1);
}
```

### E2E Tests (Playwright)

```typescript
// transparency-dashboard.spec.ts
describe('Transparency Dashboard', () => {
  it('displays real-time audit log stream', async ({ page }) => {
    // Navigate to transparency dashboard
    await page.goto('toubkal://audit');

    // Trigger privacy operation (block ad)
    await page.goto('https://example-ad-site.com');

    // Wait for audit log to appear in dashboard
    const auditEntry = page.locator('[data-testid="audit-log-entry"]').first();
    await expect(auditEntry).toContainText('ad_blocked');

    // Verify signature verification UI
    const signatureStatus = auditEntry.locator('[data-testid="signature-status"]');
    await expect(signatureStatus).toHaveText('✓ Verified');
  });

  it('exports audit log with Merkle proofs', async ({ page }) => {
    await page.goto('toubkal://audit');

    // Click export button
    await page.click('[data-testid="export-button"]');

    // Select JSON format
    await page.click('[data-testid="format-json"]');

    // Download export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="confirm-export"]');
    const download = await downloadPromise;

    // Verify export contains Merkle proof
    const exportPath = await download.path();
    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
    expect(exportData).toHaveProperty('merkle_proof');
    expect(exportData).toHaveProperty('signature_verification');
  });
});
```

### Manual Testing

```bash
# Consent enforcement verification
1. Launch Toubkal browser (fresh profile)
2. Navigate to toubkal://settings → Enable cloud AI
3. Trigger AI query → Verify consent banner appears
4. Deny consent → Verify AI query blocked
5. Navigate to toubkal://audit → Verify "consent_denied" logged

# Fingerprinting protection verification
1. Visit https://panopticlick.eff.org/
2. Run fingerprinting test
3. Compare entropy with Chrome baseline
4. Expected: >12 bits entropy reduction

# Transparency dashboard verification
1. Perform 50 privacy operations (block ads, deny consents, etc.)
2. Open toubkal://audit → Verify all 50 operations visible
3. Filter by "ad_blocked" → Verify filtering works
4. Export as PDF → Verify Merkle proof included
5. Verify <100ms UI latency for log streaming

# Network request blocking verification
1. Use Wireshark to monitor network traffic
2. Launch Toubkal browser → Deny all consents
3. Verify ZERO unsanctioned network requests
4. Expected: Only explicit user-initiated requests allowed
```

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Chromium Network Stack Integration** | High | Medium | Use proven Chromium network service hooks, extensive testing |
| **Consent UX Complexity** | Medium | High | User testing, clear data disclosure language, progressive disclosure |
| **Performance Overhead (Real-time Streaming)** | Medium | Medium | Virtualized lists, pagination, background workers for log processing |
| **Fingerprinting Arms Race** | High | High | Regular updates to fingerprinting protection, community contributions |
| **False Consent Denials** | Low | Medium | Clear consent explanations, allow granular consent (per-domain, per-action) |
| **Audit Log Storage Growth** | Medium | Low | Implement log retention policies, compression, archival |

---

## Out of Scope

- ❌ Remote consent synchronization across devices (Phase 2)
- ❌ Advanced fingerprinting protection (GPU fingerprinting, WebGL) - Phase 2
- ❌ Consent policies for enterprise (group policy enforcement) - Phase 3
- ❌ Machine learning-based consent suggestions - Phase 2
- ❌ Dark mode for transparency dashboard - Phase 2
- ❌ Mobile-responsive transparency dashboard - Phase 3

---

## Documentation

- [ ] `docs/architecture/consent-fabric.md` - Consent management architecture
- [ ] `docs/architecture/fingerprinting-protection.md` - Fingerprinting techniques
- [ ] `docs/user-guide/transparency-dashboard.md` - User guide for audit dashboard
- [ ] `docs/user-guide/consent-management.md` - Understanding consent decisions
- [ ] `docs/contributing/privacy-testing.md` - Privacy feature testing guide
- [ ] Inline JSDoc comments in React components
- [ ] Code comments in `consent_manager.cc` and related files

---

## Timeline

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| **Week 7-8** | Consent Fabric | Browser-level consent enforcement, Mojo IPC working, audit logging integration |
| **Week 9-10** | Transparency Dashboard | Real-time audit streaming, export functionality, forensic replay mode |

**Start Date**: 2025-11-30 (Week 7)
**End Date**: 2025-12-27 (Week 10)
**Duration**: 4 weeks

---

## References

- [PRODUCT-ROADMAP.md - Phase 1](../PRODUCT-ROADMAP.md#phase-1-privacy-foundation-weeks-5-12)
- [ADR-003: IPC Framework](../adrs/ADR-003-ipc-framework.md)
- [ADR-007: UI Security](../adrs/ADR-007-ui-security.md)
- [ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)
- [ADR-001: UI Framework](../adrs/ADR-001-ui-framework.md)
- [Chromium Network Service Documentation](https://www.chromium.org/developers/design-documents/network-stack/)
- [EFF Panopticlick](https://panopticlick.eff.org/)
- [GDPR Consent Requirements](https://gdpr.eu/consent/)

---

**Epic Owner**: Team
**Last Updated**: 2025-10-18
**Status**: ⚪ Planned (starts Week 7 after Epic 1.2 completion)
