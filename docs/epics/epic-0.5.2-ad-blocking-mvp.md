# Epic 0.5.2: Ad Blocking MVP (Brave adblock-rust Integration)

**Epic ID**: 0.5.2
**Phase**: Phase 0.5 - Foundation Prerequisites
**Timeline**: Week 3-4 (2025-11-02 to 2025-11-15)
**Owner**: Team
**Status**: ⚪ Planned
**Priority**: P0 - Critical (Blocking Phase 1)

---

## Overview

Implement production-grade ad blocking using Brave's adblock-rust library, integrated with Toubkal's audit trail for cryptographic proof of blocked requests. This epic delivers privacy-first ad blocking with EasyList and uBlock Origin filter lists, achieving 95%+ block rate competitive with Brave Browser.

---

## Business Value

**Why This Matters:**
- **Privacy Protection**: Block tracking scripts and invasive ads by default
- **Competitive Parity**: Match Brave's ad blocking effectiveness (95%+ block rate)
- **Cryptographic Proof**: Every blocked request logged with Ed25519 signature in audit trail
- **Differentiation**: Only browser with cryptographically signed ad blocking logs

**Success Metrics:**
- 95%+ ad blocking rate on top 100 websites (vs. Brave baseline)
- <5ms per-request latency for ad blocking decisions
- 100% of blocked requests logged to audit trail
- 90-95% YouTube pre-roll/mid-roll ad blocking success rate

---

## Related ADRs

- **[ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)** - Chromium fork enables network stack integration
- **[ADR-006: Supply Chain Security](../adrs/ADR-006-supply-chain.md)** - Filter list verification and integrity

---

## Related Epics

**Dependencies:**
- **Epic 0.5.1: Real Audit Trail** ✅ Required - Ad blocking logs must use audit logger

**Downstream Epics:**
- **Epic 1.2: Brand Identity** - `toubkal://audit` dashboard displays blocked request stats
- **Epic 1.3: Privacy Controls** - Privacy settings control ad blocking aggressiveness

---

## Technical Architecture

### Components

**1. Brave adblock-rust Integration** (`ad_blocking_service.cc`)
- Wrap adblock-rust library in C++ service
- Implement `ShouldBlockRequest(url, resource_type)` method
- Filter list management (EasyList, uBlock Origin)
- CNAME uncloaking for aggressive tracking prevention

**2. Filter List Manager** (`filter_manager.cc`)
- Download filter lists on startup (EasyList, uBlock Origin)
- Parse filter lists using adblock-rust
- Periodic filter list updates (daily)
- Filter list caching and validation

**3. Audit Logging Integration** (`ad_blocking_audit.cc`)
- Log every blocked request to audit trail
- Ed25519 signature for each blocked request
- Generate cryptographic proof of blocking
- Expose blocked request stats via Mojo IPC to UI

**4. Mojo IPC Interface** (`ad_blocking.mojom`)
- Browser → UI communication for blocked request stats
- UI → Browser commands for blocking policy changes
- Real-time blocked request notifications

### File Structure
```
src/toubkal/components/privacy/ad_blocking/
├── ad_blocking_service.h           # Main ad blocking interface
├── ad_blocking_service.cc          # adblock-rust wrapper
├── filter_manager.h                # Filter list management
├── filter_manager.cc               # EasyList/uBlock integration
├── ad_blocking_audit.h             # Audit logging interface
├── ad_blocking_audit.cc            # Audit trail integration
├── cname_uncloaking.h              # CNAME uncloaking logic
├── cname_uncloaking.cc             # Aggressive tracking prevention
└── BUILD.gn                        # GN build configuration

src/toubkal/mojo/privacy/
└── ad_blocking.mojom               # Mojo interface for UI communication
```

---

## Stories

### ⚪ Planned Stories

**Week 3 Stories:**
- **Story 0.5.2.1**: Brave adblock-rust Integration (P0)
- **Story 0.5.2.2**: EasyList + uBlock Origin Filter Lists (P0)

**Week 4 Stories:**
- **Story 0.5.2.3**: CNAME Uncloaking Implementation (P1)
- **Story 0.5.2.4**: Audit Logging for Blocked Requests (P0)
- **Story 0.5.2.5**: Mojo IPC for UI Integration (P1)
- **Story 0.5.2.6**: Performance Testing & YouTube Ad Blocking (P0)

**Total Stories**: 6
**Completed**: 0
**In Progress**: 0
**Completion**: 0%

---

## Success Criteria

### Week 3 Deliverables (adblock-rust Integration)
- [  ] adblock-rust added as dependency in Chromium DEPS
- [  ] `AdBlockingService` C++ wrapper implemented
- [  ] `ShouldBlockRequest(url, resource_type)` functional
- [  ] EasyList filters downloaded and parsed on browser startup
- [  ] uBlock Origin filters integrated
- [  ] 95%+ block rate on top 100 websites (automated test suite)

### Week 4 Deliverables (Audit Integration + Performance)
- [  ] CNAME uncloaking implemented (aggressive mode)
- [  ] Every blocked request logged to audit trail with Ed25519 signature
- [  ] Mojo IPC exposes blocked request stats to `toubkal://audit` UI
- [  ] <5ms ad blocking latency (async CNAME resolution)
- [  ] 90-95% YouTube ad blocking success rate
- [  ] Cryptographic proof generation for blocked requests

### Technical Requirements
- [  ] Block rate: ≥95% on top 100 sites (automated testing)
- [  ] Latency: <5ms per request for blocking decision
- [  ] Memory: <50MB additional RAM for filter lists
- [  ] Audit coverage: 100% of blocked requests logged
- [  ] Filter lists: EasyList + uBlock Origin (mandatory)
- [  ] CNAME uncloaking: Async DNS resolution to prevent blocking

---

## Dependencies

**Prerequisites:**
- ✅ **Epic 0.5.1: Real Audit Trail** - REQUIRED (audit logger must be functional)
- ✅ Chromium network stack access (included in fork)
- ✅ adblock-rust library (open-source, Brave maintained)

**Blockers:**
- ⚠️ Epic 0.5.1 completion (audit logger needed for logging blocked requests)

**Downstream Dependencies:**
- **Epic 1.2**: Brand Identity (requires ad blocking stats for `toubkal://audit` dashboard)
- **Epic 1.3**: Privacy Controls (requires ad blocking service for policy configuration)

---

## Testing Strategy

### Unit Tests (Google Test)

```cpp
// ad_blocking_service_unittest.cc
TEST_F(AdBlockingServiceTest, BlocksKnownTrackers) {
  AdBlockingService service;
  service.Initialize();

  // Test known tracker blocking
  ASSERT_TRUE(service.ShouldBlockRequest(
    "https://doubleclick.net/tracker.js",
    ResourceType::kScript
  ));

  // Test legitimate request
  ASSERT_FALSE(service.ShouldBlockRequest(
    "https://example.com/script.js",
    ResourceType::kScript
  ));
}

TEST_F(AdBlockingServiceTest, LoadsFilterLists) {
  AdBlockingService service;
  service.Initialize();

  // Verify EasyList loaded
  ASSERT_TRUE(service.HasFilterList("EasyList"));
  ASSERT_GT(service.GetFilterCount("EasyList"), 50000);

  // Verify uBlock Origin loaded
  ASSERT_TRUE(service.HasFilterList("uBlock Origin"));
}

// filter_manager_unittest.cc
TEST_F(FilterManagerTest, ParsesEasyListCorrectly) {
  FilterManager manager;

  std::string easylist_content = LoadTestFilterList();
  ASSERT_TRUE(manager.ParseFilterList(easylist_content));

  // Verify rules parsed
  ASSERT_GT(manager.GetRuleCount(), 50000);
}

// cname_uncloaking_unittest.cc
TEST_F(CNAMEUnc loakingTest, DetectsCNAMETracking) {
  CNAMEUncloaker uncloaker;

  // Test CNAME cloaked tracker
  std::string cname = uncloaker.ResolveCNAME("metrics.example.com");
  ASSERT_EQ(cname, "doubleclick.net");  // Unmasked tracker

  // Should block based on CNAME
  ASSERT_TRUE(uncloaker.ShouldBlockCNAME(cname));
}
```

### Integration Tests

```cpp
// ad_blocking_integration_test.cc
TEST_F(AdBlockingIntegrationTest, EndToEndBlockingFlow) {
  // 1. Initialize ad blocking service
  AdBlockingService service;
  ASSERT_TRUE(service.Initialize());

  // 2. Initialize audit logger
  AuditLogger logger;
  ASSERT_TRUE(logger.Initialize());

  // 3. Attempt to load known tracker
  ResourceRequest request;
  request.url = GURL("https://doubleclick.net/tracker.js");
  request.resource_type = ResourceType::kScript;

  bool blocked = service.ShouldBlockRequest(request.url, request.resource_type);
  ASSERT_TRUE(blocked);

  // 4. Verify audit logging
  auto recent_entries = logger.GetRecentEntries(1);
  ASSERT_EQ(recent_entries.size(), 1);
  ASSERT_EQ(recent_entries[0].operation, "ad_blocked");
  ASSERT_EQ(recent_entries[0].metadata["url"], request.url.spec());

  // 5. Verify Ed25519 signature
  ASSERT_TRUE(logger.VerifySignature(recent_entries[0]));
}
```

### Performance Tests

```bash
# Ad blocking latency benchmark
./ad_blocking_benchmark --urls top-100-sites.txt --iterations 1000
# Expected: <5ms average latency per request

# Memory usage validation
valgrind --tool=massif ./toubkal --test-ad-blocking-memory
# Expected: <50MB additional memory for filter lists

# Block rate validation
./ad_blocking_test_suite --filter-lists easylist,ublock --top-sites 100
# Expected: ≥95% block rate (vs. Brave baseline)

# YouTube ad blocking test
./youtube_ad_blocking_test --videos 50 --ad-types preroll,midroll
# Expected: 90-95% blocking success rate
```

## Manual Testing

1. **Top 100 Sites Test**: Visit top 100 sites, verify no ads visible
2. **YouTube Ad Blocking**: Watch 10 videos, verify pre-roll/mid-roll ads blocked
3. **Audit Log Verification**: Check `toubkal://audit`, verify blocked requests logged
4. **Performance Check**: Measure page load times vs. Chrome (should be comparable)

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **adblock-rust API Changes** | Medium | Low | Pin to stable adblock-rust version, upstream monitoring |
| **Filter List Download Failures** | High | Medium | Fallback to cached filter lists, retry logic with exponential backoff |
| **CNAME Uncloaking Performance** | Medium | Medium | Async DNS resolution, caching CNAME results |
| **YouTube Ad Blocking Arms Race** | Medium | High | Regular filter list updates (daily), community filter contributions |
| **False Positives** | Low | Medium | Whitelist for known legitimate domains, user-configurable exceptions |

---

## Out of Scope

- ❌ Custom filter list creation UI (Phase 2)
- ❌ Regional filter lists (non-English) - EasyList + uBlock only in Phase 0.5
- ❌ Element hiding (cosmetic filtering) - Phase 1
- ❌ Advanced filter syntax (scriptlets, procedural cosmetic filters) - Phase 2
- ❌ User-defined blocking rules - Phase 1

---

## Documentation

- [ ] `docs/architecture/ad-blocking.md` - Architecture overview
- [ ] `docs/contributing/ad-blocking-testing.md` - Testing guide
- [ ] `docs/user-guide/ad-blocking-settings.md` - User configuration guide
- [ ] Code comments in `ad_blocking_service.cc` and related files

---

## Timeline

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| **Week 3** | adblock-rust Integration | `ShouldBlockRequest()` working, EasyList filters loaded |
| **Week 4** | Audit Integration | All blocked requests logged with Ed25519 signatures, Mojo IPC to UI working |

**Start Date**: 2025-11-02 (Week 3)
**End Date**: 2025-11-15 (Week 4)
**Duration**: 2 weeks

---

## References

- [PRODUCT-ROADMAP.md - Phase 0.5](../PRODUCT-ROADMAP.md#phase-05-foundation-prerequisites-weeks-1-4)
- [ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)
- [ADR-006: Supply Chain Security](../adrs/ADR-006-supply-chain.md)
- [Brave adblock-rust](https://github.com/brave/adblock-rust)
- [EasyList Filter List](https://easylist.to/)
- [uBlock Origin Filters](https://github.com/uBlockOrigin/uAssets)

---

**Epic Owner**: Team
**Last Updated**: 2025-10-18
**Status**: ⚪ Planned (starts Week 3 after Epic 0.5.1 completion)
