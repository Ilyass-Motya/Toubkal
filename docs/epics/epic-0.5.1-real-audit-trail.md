# Epic 0.5.1: Real Audit Trail (C++ BoringSSL Integration)

**Epic ID**: 0.5.1
**Phase**: Phase 0.5 - Foundation Prerequisites
**Timeline**: Week 1-2 (2025-10-19 to 2025-11-01)
**Owner**: Ilyass Motya
**Status**: 🔵 Active Development
**Priority**: P0 - Critical (Blocking Phase 1)

---

## Overview

Replace TypeScript mock audit trail with production-grade C++ implementation using BoringSSL for cryptographic signing, Merkle tree verification, and LevelDB persistence. This epic delivers mathematically provable privacy through Ed25519 signatures and tamper-evident audit logs.

---

## Business Value

**Why This Matters:**
- **Privacy Promise**: Enables "cryptographically provable privacy" core value proposition
- **Trust Building**: Users can independently verify audit trail integrity with OpenSSL
- **Enterprise Readiness**: Meets compliance requirements (SOC 2, FedRAMP) for audit logging
- **Differentiation**: No other browser offers cryptographically signed audit trails

**Success Metrics:**
- 100% of privacy operations logged with Ed25519 signatures
- Audit trail signatures verifiable with OpenSSL command-line tools
- Zero audit trail tampering detected (Merkle tree verification)
- <10ms audit logging overhead per operation

---

## Related ADRs

- **[ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)** - Chromium fork enables C++ BoringSSL integration
- **[ADR-006: Supply Chain Security](../adrs/ADR-006-supply-chain.md)** - Audit trail supports build integrity verification

---

## Technical Architecture

### Components

**1. BoringSSL Integration** (`audit_logger.cc`)
- Ed25519 keypair generation on first run
- Private key storage in LevelDB (encrypted)
- Public key export for user verification
- FIPS 140-2/3 validated cryptographic primitives

**2. Merkle Tree** (`merkle_tree.cc`)
- SHA-256 hashing of audit entries
- Tree construction from ordered logs
- Merkle proof generation (JSON format)
- Root hash verification API

**3. LevelDB Persistence** (`audit_storage.cc`)
- Schema: `audit/{timestamp}` → `{entry, signature, merkle_path}`
- Atomic write operations
- Export functionality (JSON/CSV/PDF)
- Compaction and retention policies

### File Structure
```
src/toubkal/components/privacy/audit/
├── audit_logger.h              # Main audit logging interface
├── audit_logger.cc             # BoringSSL Ed25519 implementation
├── merkle_tree.h               # Merkle tree construction
├── merkle_tree.cc              # SHA-256 hashing, proof generation
├── audit_storage.h             # LevelDB persistence interface
├── audit_storage.cc            # Storage implementation
├── audit_entry.h               # Entry data structures
└── BUILD.gn                    # GN build configuration
```

---

## Stories

### ✅ Completed Stories
- None (Epic just started)

### 🔄 In Progress Stories
- **Story 0.5.1.1**: BoringSSL Ed25519 Integration
- **Story 0.5.1.2**: Merkle Tree Implementation
- **Story 0.5.1.3**: LevelDB Persistence Layer

### ⚪ Planned Stories
- **Story 0.5.1.4**: Audit Export Functionality (JSON/CSV/PDF)
- **Story 0.5.1.5**: Integration Testing & OpenSSL Verification

**Total Stories**: 5
**Completed**: 0
**In Progress**: 3
**Completion**: 0%

---

## Success Criteria

### Week 1 Deliverables (BoringSSL Integration)
- [  ] Ed25519 keypair generated on first browser run
- [  ] Private key stored securely in LevelDB
- [  ] Public key exportable for user verification
- [  ] `AuditLogger::SignEntry()` implemented using BoringSSL
- [  ] Signatures verify with OpenSSL: `openssl dgst -sha256 -verify public.pem -signature sig.bin entry.json`

### Week 2 Deliverables (Merkle Tree + Persistence)
- [  ] Merkle tree construction from audit entries
- [  ] `AuditLogger::VerifyChain()` detects tampered logs
- [  ] Merkle proofs exportable in JSON format
- [  ] LevelDB storage persists logs across browser restarts
- [  ] Export functionality supports JSON/CSV/PDF formats

### Technical Requirements
- [  ] <10ms audit logging overhead per operation
- [  ] 100% of privacy operations logged
- [  ] Audit storage: <100MB for 1M entries
- [  ] Signatures: Ed25519 (256-bit security level)
- [  ] Hashing: SHA-256 for Merkle tree
- [  ] Persistence: LevelDB atomic writes

---

## Dependencies

**Prerequisites:**
- ✅ Chromium fork setup (user-managed, prerequisite)
- ✅ BoringSSL library (included in Chromium)
- ✅ LevelDB library (included in Chromium)

**Blockers:**
- None (all dependencies available in Chromium)

**Downstream Dependencies:**
- **Epic 0.5.2**: Ad Blocking MVP (requires audit logger for logging blocked requests)
- **Epic 1.2**: Brand Identity (requires audit trail for `toubkal://audit` dashboard)
- **Epic 1.3**: Privacy Controls (requires audit trail for consent logging)

---

## Testing Strategy

### Unit Tests (Google Test)
```cpp
// audit_logger_unittest.cc
TEST_F(AuditLoggerTest, GeneratesEd25519Keypair) {
  AuditLogger logger;
  ASSERT_TRUE(logger.Initialize());
  ASSERT_TRUE(logger.HasKeypair());
  ASSERT_EQ(logger.GetPublicKey().size(), 32);  // 256-bit key
}

TEST_F(AuditLoggerTest, SignsEntriesCorrectly) {
  AuditLogger logger;
  logger.Initialize();

  AuditEntry entry = CreateTestEntry();
  std::string signature = logger.SignEntry(entry);

  ASSERT_TRUE(VerifySignatureWithOpenSSL(entry, signature, logger.GetPublicKey()));
}

// merkle_tree_unittest.cc
TEST_F(MerkleTreeTest, DetectsTamperedEntries) {
  MerkleTree tree;
  tree.AddEntry(CreateEntry("entry1"));
  tree.AddEntry(CreateEntry("entry2"));

  std::string root_hash = tree.GetRootHash();

  // Tamper with entry
  tree.ModifyEntry(0, CreateEntry("tampered"));

  ASSERT_NE(tree.GetRootHash(), root_hash);  // Root hash changed
}
```

### Integration Tests
```cpp
// audit_integration_test.cc
TEST_F(AuditIntegrationTest, EndToEndAuditFlow) {
  // 1. Initialize audit system
  AuditLogger logger;
  ASSERT_TRUE(logger.Initialize());

  // 2. Log privacy operation
  logger.LogPrivacyOperation("fingerprinting_blocked", {{"domain", "tracker.com"}});

  // 3. Verify persistence
  AuditStorage storage;
  auto entries = storage.GetRecentEntries(1);
  ASSERT_EQ(entries.size(), 1);

  // 4. Verify signature
  ASSERT_TRUE(logger.VerifySignature(entries[0]));

  // 5. Verify Merkle tree
  MerkleTree tree = logger.BuildMerkleTree();
  ASSERT_TRUE(tree.VerifyIntegrity());
}
```

### Manual Verification
```bash
# Export public key
./toubkal --export-audit-public-key > audit_public_key.pem

# Export audit log entry
./toubkal --export-audit-entry 12345 > entry.json

# Verify signature with OpenSSL
openssl dgst -sha256 -verify audit_public_key.pem \
  -signature entry.sig entry.json
# Expected: "Verified OK"
```

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **BoringSSL API Changes** | High | Low | Use stable Chromium BoringSSL APIs, pin to specific Chromium version |
| **LevelDB Corruption** | High | Medium | Implement atomic writes, backup/restore functionality |
| **Performance Overhead** | Medium | Medium | Async audit logging, batched writes to LevelDB |
| **Key Management** | High | Low | Secure key storage with OS keychain integration (future) |
| **Merkle Tree Complexity** | Low | Low | Use proven algorithms, extensive unit testing |

---

## Out of Scope

- ❌ Remote audit log backup (Phase 2)
- ❌ Multi-device audit synchronization (Phase 3)
- ❌ Advanced export formats (XML, Parquet) - only JSON/CSV/PDF in Phase 0.5
- ❌ Audit log retention policies (future enhancement)
- ❌ Audit log compression (LevelDB compression sufficient for now)

---

## Documentation

- [ ] `docs/architecture/audit-trail.md` - Architecture overview
- [ ] `docs/contributing/audit-testing.md` - Testing guide
- [ ] `docs/user-guide/verify-audit-logs.md` - User verification instructions
- [ ] Code comments in `audit_logger.cc` and related files

---

## Timeline

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| **Week 1** | BoringSSL Ed25519 Integration | Real cryptographic signing working, LevelDB storage functional |
| **Week 2** | Merkle Tree Verification | Tamper-proof audit chain, exportable Merkle proofs (JSON) |

**Start Date**: 2025-10-19 (Week 1)
**End Date**: 2025-11-01 (Week 2)
**Duration**: 2 weeks

---

## Related Epics

- **Epic 0.5.2**: Ad Blocking MVP (consumes audit logger for request blocking logs)
- **Epic 1.2**: Brand Identity (uses audit trail for `toubkal://audit` dashboard)
- **Epic 1.3**: Privacy Controls (uses audit trail for consent logging)

---

## References

- [PRODUCT-ROADMAP.md - Phase 0.5](../PRODUCT-ROADMAP.md#phase-05-foundation-prerequisites-weeks-1-4)
- [ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)
- [ADR-006: Supply Chain Security](../adrs/ADR-006-supply-chain.md)
- [BoringSSL Documentation](https://boringssl.googlesource.com/boringssl/)
- [Chromium LevelDB Usage](https://www.chromium.org/developers/design-documents/leveldb/)

---

**Epic Owner**: Ilyass Motya
**Last Updated**: 2025-10-18
**Status**: 🔵 Active Development (Week 1)
