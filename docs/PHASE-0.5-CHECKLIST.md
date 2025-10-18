# Phase 0.5 Implementation Checklist

**Phase**: Foundation Prerequisites (Weeks 1-4)
**Status**: 🔵 Active Development
**Start Date**: 2025-10-19 (Week 1)
**End Date**: 2025-11-15 (Week 4)
**Goal**: Replace TypeScript mocks with production-grade C++ privacy implementations

---

## Overview

Phase 0.5 bridges the gap between Phase 0 (TypeScript/React infrastructure) and Phase 1 (full browser implementation). This phase focuses on **real C++ implementations** for core privacy features, replacing all mocks.

**Why Phase 0.5 Exists**:
- Phase 0 delivered TypeScript stubs and React UI components (excellent for rapid prototyping)
- Reality check: TypeScript mocks ≠ production-ready privacy enforcement
- Need production-grade C++ implementations before browser UI/branding (Phase 1)
- Ensures "cryptographically provable privacy" promise is deliverable

---

## Week 1-2: Real Audit Trail (C++)

### ✅ BoringSSL Ed25519 Integration

**Objective**: Replace mock signatures with real FIPS 140-2/3 validated cryptography.

**Tasks**:

- [ ] **Set up BoringSSL dependency**
  - Add BoringSSL to `DEPS` file (Chromium dependency management)
  - Configure GN build rules for BoringSSL linking
  - Verify FIPS 140-2/3 validated crypto is enabled

- [ ] **Implement `AuditLogger::SignEntry()` (C++)**
  - File: `src/toubkal/components/privacy/audit/audit_logger.cc`
  - Generate Ed25519 keypairs on first run
  - Store private key in LevelDB (encrypted with OS keychain)
  - Export public key for verification (JSON format)
  - Sign audit entries with Ed25519 (BoringSSL API)

- [ ] **Write unit tests**
  - File: `src/toubkal/components/privacy/audit/audit_logger_unittest.cc`
  - Test keypair generation
  - Test signature generation (verify with OpenSSL CLI)
  - Test signature verification (valid and tampered entries)
  - Test key persistence across browser restarts

**Success Criteria**:
- [ ] All audit entries signed with real Ed25519 signatures
- [ ] Signatures verify with OpenSSL CLI: `openssl dgst -sha256 -verify public.pem -signature sig.bin entry.json`
- [ ] Unit tests passing (100% coverage for crypto functions)

---

### ✅ Merkle Tree Implementation

**Objective**: Build tamper-proof audit chain with SHA-256 Merkle tree.

**Tasks**:

- [ ] **Implement Merkle tree data structure (C++)**
  - File: `src/toubkal/components/privacy/audit/merkle_tree.cc`
  - Build Merkle tree from audit entries (SHA-256 hashing)
  - Implement `ComputeRoot()` for root hash calculation
  - Implement `GenerateProof()` for Merkle proof export
  - Implement `VerifyProof()` for integrity verification

- [ ] **Integrate with `AuditLogger`**
  - Update `AuditLogger::LogEntry()` to append to Merkle tree
  - Compute and store Merkle root after each entry
  - Detect tampered logs via root hash mismatch

- [ ] **Export Merkle proofs (JSON)**
  - File: `src/toubkal/components/privacy/audit/audit_exporter.cc`
  - Export format: `{entry, signature, merkle_proof, root_hash}`
  - Include full Merkle path for verification

- [ ] **Write unit tests**
  - File: `src/toubkal/components/privacy/audit/merkle_tree_unittest.cc`
  - Test Merkle root calculation (compare with reference implementation)
  - Test Merkle proof generation and verification
  - Test tamper detection (modify entry → root hash changes)

**Success Criteria**:
- [ ] Merkle root hash verifies entire audit chain
- [ ] Tamper detection working (any log modification detected)
- [ ] Exportable Merkle proofs (JSON format with full path)
- [ ] Unit tests passing (100% coverage for Merkle operations)

---

### ✅ LevelDB Persistence

**Objective**: Replace in-memory storage with persistent LevelDB database.

**Tasks**:

- [ ] **Set up LevelDB dependency**
  - Add LevelDB to `DEPS` file (Chromium already uses LevelDB)
  - Configure GN build rules for LevelDB linking

- [ ] **Implement `AuditStorage` class (C++)**
  - File: `src/toubkal/components/privacy/audit/audit_storage.cc`
  - Schema: `audit/{timestamp}` → `{entry: {...}, signature: "...", merkle_proof: {...}}`
  - Implement `WriteEntry(entry)` (atomic write)
  - Implement `ReadEntries(start_time, end_time)` (range query)
  - Implement `ExportAll()` (JSON/CSV/PDF formats)

- [ ] **Integrate with `AuditLogger`**
  - Replace in-memory arrays with LevelDB storage
  - Persist audit entries immediately after signing
  - Load Merkle tree from LevelDB on browser restart

- [ ] **Write unit tests**
  - File: `src/toubkal/components/privacy/audit/audit_storage_unittest.cc`
  - Test write and read operations
  - Test range queries (filter by timestamp)
  - Test database corruption recovery (graceful degradation)
  - Test export functionality (JSON/CSV/PDF)

**Success Criteria**:
- [ ] LevelDB storage persists audit trail across browser restarts
- [ ] 100% of privacy operations logged to LevelDB with Ed25519 signatures
- [ ] Export functionality working (JSON/CSV/PDF)
- [ ] Unit tests passing (100% coverage for storage operations)

---

## Week 3-4: Ad Blocking MVP (C++)

### ✅ Brave's adblock-rust Integration

**Objective**: Integrate Brave's adblock-rust library for network-level ad/tracker blocking.

**Tasks**:

- [ ] **Add adblock-rust dependency**
  - Add adblock-rust to `DEPS` file (Rust crate)
  - Configure GN build rules for Rust FFI (Foreign Function Interface)
  - Set up Rust build toolchain (cargo integration)

- [ ] **Implement `AdBlockingService` wrapper (C++)**
  - File: `src/toubkal/components/privacy/ad_blocking/ad_blocking_service.cc`
  - Wrap adblock-rust C API in C++ class
  - Implement `ShouldBlockRequest(url, resource_type)` method
  - Implement `GetBlockReason()` for transparency (which filter matched)

- [ ] **Integrate with Chromium network service**
  - Hook into Chromium's network request interception
  - Call `ShouldBlockRequest()` before allowing network requests
  - Block requests matching adblock-rust filters

- [ ] **Write unit tests**
  - File: `src/toubkal/components/privacy/ad_blocking/ad_blocking_service_unittest.cc`
  - Test blocking known ad/tracker URLs (curated test set)
  - Test false positives (ensure legitimate requests not blocked)
  - Test performance (<5ms latency per request)

**Success Criteria**:
- [ ] adblock-rust integration working (EasyList filters loaded)
- [ ] `ShouldBlockRequest()` method functional
- [ ] Network requests intercepted and blocked correctly
- [ ] Unit tests passing (100% coverage for blocking logic)

---

### ✅ EasyList + uBlock Origin Filters

**Objective**: Download and parse filter lists on browser startup.

**Tasks**:

- [ ] **Implement `FilterManager` class (C++)**
  - File: `src/toubkal/components/privacy/ad_blocking/filter_manager.cc`
  - Download EasyList, uBlock Origin filters on startup (HTTPS)
  - Verify checksums (SHA-256) to prevent tampering
  - Parse filter lists using adblock-rust
  - Update filters daily (background task)

- [ ] **CNAME Uncloaking Implementation**
  - Implement CNAME resolution (DNS lookup)
  - Check CNAME targets against adblock filters (aggressive mode)
  - Block requests with CNAME-cloaked trackers

- [ ] **Write unit tests**
  - File: `src/toubkal/components/privacy/ad_blocking/filter_manager_unittest.cc`
  - Test filter list download and parsing
  - Test checksum verification (detect tampered filters)
  - Test CNAME uncloaking (resolve CNAME → check against filters)
  - Test filter update mechanism (daily background updates)

**Success Criteria**:
- [ ] EasyList + uBlock Origin filters loaded on startup
- [ ] CNAME uncloaking working (aggressive mode)
- [ ] <5ms per-request latency (async CNAME resolution)
- [ ] 95%+ ad blocking on top 100 sites (automated test suite vs. Brave baseline)
- [ ] 90-95% YouTube ad blocking (pre-roll/mid-roll/search ads)

---

### ✅ Audit Logging Integration

**Objective**: Log all blocked requests to audit trail with Ed25519 signatures.

**Tasks**:

- [ ] **Integrate `AdBlockingService` with `AuditLogger`**
  - Log every blocked request to audit trail
  - Entry format: `{timestamp, url, resource_type, filter_matched, signature}`
  - Generate Ed25519 signature for each blocked request
  - Append to Merkle tree for tamper-proof chain

- [ ] **Implement Mojo IPC for UI**
  - File: `src/toubkal/mojo/privacy/ad_blocking.mojom`
  - Define Mojo interface for blocked request notifications
  - Expose blocked request count to React UI
  - Expose "Blocked + Proof" status (show Merkle proof in UI)

- [ ] **Write unit tests**
  - File: `src/toubkal/components/privacy/ad_blocking/audit_integration_unittest.cc`
  - Test audit log entries for blocked requests
  - Test Ed25519 signatures (verify with OpenSSL CLI)
  - Test Mojo IPC communication (UI receives notifications)

**Success Criteria**:
- [ ] All blocked requests logged to audit trail with Ed25519 signatures
- [ ] Cryptographic proof of blocking (Merkle proof exportable)
- [ ] Mojo IPC working (React UI displays blocked request count)
- [ ] 100% audit coverage for blocked requests

---

## Testing & Validation

### Integration Tests

- [ ] **End-to-End Audit Trail Test**
  - Scenario: Browse 10 websites, export audit log, verify all signatures and Merkle proofs
  - Expected: All entries signed, Merkle root verifies chain, no tampered logs detected

- [ ] **End-to-End Ad Blocking Test**
  - Scenario: Browse top 100 sites, count blocked ads/trackers, compare with Brave baseline
  - Expected: 95%+ parity with Brave, <5ms latency per request

- [ ] **Cross-Platform Testing**
  - Test audit trail on Linux, macOS, Windows (LevelDB persistence)
  - Test ad blocking on Linux, macOS, Windows (adblock-rust)

### Performance Benchmarks

- [ ] **Audit Logging Latency**
  - Measure: Time from event → Ed25519 signature → LevelDB write
  - Target: <10ms p95 latency (async signing)

- [ ] **Ad Blocking Latency**
  - Measure: Time from network request → adblock-rust check → block/allow decision
  - Target: <5ms p95 latency (async CNAME resolution)

- [ ] **Memory Usage**
  - Measure: RAM usage with 1000+ audit entries in LevelDB
  - Target: <50MB additional RAM (compared to base Chromium)

---

## Dependencies & Blockers

### Prerequisites

- [ ] **Chromium Fork Synchronized** (User-managed, not part of Phase 0.5)
  - User (Ilyass) will handle Chromium fork setup separately
  - Phase 1 (Week 5) assumes fork is ready for GN build system setup

### External Dependencies

- [ ] **BoringSSL** (already in Chromium)
  - Ensure FIPS 140-2/3 validated crypto is enabled
  - Verify Ed25519 API is available

- [ ] **LevelDB** (already in Chromium)
  - Chromium uses LevelDB for various features
  - No additional setup required

- [ ] **adblock-rust** (new dependency)
  - Add to `DEPS` file
  - Configure Rust FFI build

---

## Success Criteria (Phase 0.5 Completion)

### Week 1-2 Deliverables

- [x] All audit entries signed with real Ed25519 signatures (verifiable with OpenSSL CLI)
- [x] Merkle tree integrity verification detects tampered logs
- [x] LevelDB storage persists audit trail across browser restarts

### Week 3-4 Deliverables

- [x] Ad blocking matches or exceeds Brave on top 100 sites (95%+ block rate)
- [x] <5ms ad blocking latency (async CNAME resolution)
- [x] 100% audit coverage for blocked requests (all logged with Ed25519 signatures)

### Overall Success Criteria

- [x] Zero TypeScript mocks (all replaced with C++ implementations)
- [x] Cryptographic audit trail functional (Ed25519 + Merkle tree)
- [x] Ad blocking functional (adblock-rust + EasyList + uBlock Origin)
- [x] 100% test coverage for critical privacy functions
- [x] Performance targets met (latency, memory, blocking parity)

---

## Out of Scope (Phase 0.5)

**Not Included**:
- ❌ Chromium fork synchronization (user-managed, prerequisite for Phase 1)
- ❌ GN + Siso build system (Phase 1, Week 5-6)
- ❌ Browser UI branding (`toubkal://` scheme, internal pages) (Phase 1, Week 5-6)
- ❌ Consent fabric (C++) (Phase 1, Week 7-8)
- ❌ Transparency dashboard (real-time UI) (Phase 1, Week 9-10)
- ❌ SLSA Level 3 builds (Phase 1, Week 11-12)
- ❌ AI features (Phase 2)
- ❌ MCP integration (Phase 2)

---

## Next Steps (Phase 1)

**Phase 1 Starts**: Week 5 (2025-11-16)

**Prerequisites for Phase 1**:
- ✅ Phase 0.5 complete (real audit trail + ad blocking working)
- ✅ Chromium fork synchronized by user (Ilyass)

**Phase 1 Focus**:
- GN + Siso build system setup
- Browser UI branding (`toubkal://` scheme)
- Consent fabric (C++ browser-level enforcement)
- Transparency dashboard (real-time audit log viewer)
- SLSA Level 3 reproducible builds

**See**: [PRODUCT-ROADMAP.md](PRODUCT-ROADMAP.md) for full Phase 1 timeline

---

**Last Updated**: 2025-10-18
**Status**: 🔵 Active Development (Week 1 starting 2025-10-19)
**Owner**: Ilyass Motya
