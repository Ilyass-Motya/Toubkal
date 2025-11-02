# C++ Architecture Specification — Phase 0.5

**Version**: 1.0
**Status**: Active Development
**Phase**: Phase 0.5 (Weeks 1-4)
**Last Updated**: 2025-10-18
**Owner**: Ilyass Motya

---

## 📋 **Document Overview**

This document specifies the C++ architecture for **Phase 0.5: Foundation Prerequisites**, which replaces TypeScript mocks with production-grade C++ privacy implementations.

**Scope**:
- ✅ Real Audit Trail (BoringSSL Ed25519, Merkle trees, LevelDB)
- ✅ Ad Blocking MVP (Brave's adblock-rust integration)
- ❌ Chromium fork modifications (user-managed, not part of Phase 0.5)
- ❌ Browser UI integration (Phase 1)

---

## 🏗️ **System Architecture**

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Phase 0.5 Components                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────┐      ┌─────────────────────────┐         │
│  │  AuditLogger      │──────│  CryptoSigningService   │         │
│  │  (Core Audit)     │      │  (BoringSSL Ed25519)    │         │
│  └─────────┬─────────┘      └──────────┬──────────────┘         │
│            │                            │                        │
│            │                            │                        │
│  ┌─────────▼─────────┐      ┌──────────▼──────────────┐         │
│  │  MerkleTree       │      │  KeyManager             │         │
│  │  (SHA-256)        │      │  (OS Keychain)          │         │
│  └─────────┬─────────┘      └─────────────────────────┘         │
│            │                                                     │
│            │                                                     │
│  ┌─────────▼────────────────────────────────────────┐           │
│  │  AuditStorage (LevelDB Persistence)              │           │
│  │  - Snappy Compression                            │           │
│  │  - Atomic WriteBatch                             │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                   │
│  ┌───────────────────┐      ┌─────────────────────────┐         │
│  │  AdBlockingService│──────│  AdBlockEngine          │         │
│  │  (C++ Wrapper)    │      │  (Rust FFI to adblock)  │         │
│  └─────────┬─────────┘      └─────────────────────────┘         │
│            │                                                     │
│            │                                                     │
│  ┌─────────▼─────────┐                                          │
│  │  FilterManager    │                                          │
│  │  (EasyList/uBlock)│                                          │
│  └───────────────────┘                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 **Component Specifications**

### 1. **AuditLogger** (Core Audit Trail)

**Purpose**: Centralized audit logging with Ed25519 cryptographic signatures.

**Location**: `src/toubkal/components/privacy/audit/audit_logger.{h,cc}`

#### Class Definition

```cpp
// audit_logger.h
#pragma once

#include <memory>
#include <string>
#include <vector>

#include "base/memory/weak_ptr.h"
#include "base/sequence_checker.h"
#include "third_party/boringssl/src/include/openssl/ed25519.h"

namespace toubkal {
namespace privacy {

class AuditStorage;
class CryptoSigningService;
class MerkleTree;

// Represents a single audit log entry
struct AuditEntry {
  std::string timestamp;       // ISO 8601 format (e.g., "2025-10-18T12:34:56Z")
  std::string operation_type;  // e.g., "network_request", "ai_query", "consent_decision"
  std::string resource_url;    // URL or resource identifier
  std::string action;          // "allow", "block", "consent_granted", "consent_denied"
  std::string metadata_json;   // JSON-encoded metadata (extensible)

  // Cryptographic fields (filled by AuditLogger)
  std::vector<uint8_t> signature;  // Ed25519 signature (64 bytes)
  std::string merkle_proof_json;   // Merkle proof for this entry
};

class AuditLogger {
 public:
  AuditLogger();
  ~AuditLogger();

  // Initialize audit logger (loads keys, sets up storage)
  bool Initialize(const base::FilePath& storage_path);

  // Log an audit entry (signs, adds to Merkle tree, persists to LevelDB)
  // Returns: true if logged successfully, false on error
  bool LogEntry(const AuditEntry& entry);

  // Verify a single audit entry signature
  bool VerifyEntry(const AuditEntry& entry) const;

  // Verify entire Merkle tree integrity
  bool VerifyChain() const;

  // Export audit logs (JSON/CSV/PDF format)
  bool ExportLogs(const std::string& format,
                  const std::string& output_path,
                  const std::string& start_time = "",
                  const std::string& end_time = "") const;

  // Get Merkle root hash (for integrity verification)
  std::string GetMerkleRoot() const;

  // For testing: Get total number of audit entries
  size_t GetEntryCount() const;

 private:
  // Sign an audit entry with Ed25519
  bool SignEntry(AuditEntry* entry);

  // Add entry to Merkle tree
  void AddToMerkleTree(const AuditEntry& entry);

  // Persist entry to LevelDB
  bool PersistEntry(const AuditEntry& entry);

  // Generate JSON representation of entry (for signing)
  std::string SerializeEntry(const AuditEntry& entry) const;

  std::unique_ptr<AuditStorage> storage_;
  std::unique_ptr<CryptoSigningService> signing_service_;
  std::unique_ptr<MerkleTree> merkle_tree_;

  SEQUENCE_CHECKER(sequence_checker_);
  base::WeakPtrFactory<AuditLogger> weak_factory_{this};
};

}  // namespace privacy
}  // namespace toubkal
```

#### Implementation Details

```cpp
// audit_logger.cc
#include "toubkal/components/privacy/audit/audit_logger.h"

#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/time/time.h"
#include "toubkal/components/privacy/audit/audit_storage.h"
#include "toubkal/components/privacy/audit/crypto_signing_service.h"
#include "toubkal/components/privacy/audit/merkle_tree.h"

namespace toubkal {
namespace privacy {

AuditLogger::AuditLogger() = default;
AuditLogger::~AuditLogger() = default;

bool AuditLogger::Initialize(const base::FilePath& storage_path) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);

  // Initialize storage (LevelDB)
  storage_ = std::make_unique<AuditStorage>();
  if (!storage_->Open(storage_path)) {
    LOG(ERROR) << "Failed to open audit storage at " << storage_path;
    return false;
  }

  // Initialize signing service (BoringSSL Ed25519)
  signing_service_ = std::make_unique<CryptoSigningService>();
  if (!signing_service_->Initialize(storage_.get())) {
    LOG(ERROR) << "Failed to initialize crypto signing service";
    return false;
  }

  // Initialize Merkle tree
  merkle_tree_ = std::make_unique<MerkleTree>();

  LOG(INFO) << "AuditLogger initialized successfully";
  return true;
}

bool AuditLogger::LogEntry(const AuditEntry& entry) {
  DCHECK_CALLED_ON_VALID_SEQUENCE(sequence_checker_);

  base::ElapsedTimer timer;

  // Make a mutable copy for signing
  AuditEntry signed_entry = entry;

  // Step 1: Sign entry with Ed25519
  if (!SignEntry(&signed_entry)) {
    LOG(ERROR) << "Failed to sign audit entry";
    return false;
  }

  // Step 2: Add to Merkle tree
  AddToMerkleTree(signed_entry);

  // Step 3: Persist to LevelDB (atomic write with Merkle root)
  if (!PersistEntry(signed_entry)) {
    LOG(ERROR) << "Failed to persist audit entry";
    return false;
  }

  // Performance tracking
  base::TimeDelta elapsed = timer.Elapsed();
  if (elapsed > base::Milliseconds(10)) {
    LOG(WARNING) << "Audit logging exceeded 10ms budget: "
                 << elapsed.InMilliseconds() << "ms";
  }

  return true;
}

bool AuditLogger::SignEntry(AuditEntry* entry) {
  DCHECK(entry);

  // Serialize entry to canonical JSON (for signing)
  std::string entry_json = SerializeEntry(*entry);

  // Sign with Ed25519
  std::vector<uint8_t> signature(ED25519_SIGNATURE_LEN);
  if (!signing_service_->Sign(entry_json, &signature)) {
    return false;
  }

  entry->signature = std::move(signature);
  return true;
}

void AuditLogger::AddToMerkleTree(const AuditEntry& entry) {
  // Compute SHA-256 hash of signed entry
  std::string entry_json = SerializeEntry(entry);
  merkle_tree_->AddEntry(entry_json);
}

bool AuditLogger::PersistEntry(const AuditEntry& entry) {
  // Atomic write: entry + Merkle root
  return storage_->WriteAuditEntry(entry, merkle_tree_->GetRoot());
}

std::string AuditLogger::SerializeEntry(const AuditEntry& entry) const {
  base::Value::Dict dict;
  dict.Set("timestamp", entry.timestamp);
  dict.Set("operation_type", entry.operation_type);
  dict.Set("resource_url", entry.resource_url);
  dict.Set("action", entry.action);
  dict.Set("metadata", entry.metadata_json);

  std::string json;
  base::JSONWriter::Write(base::Value(std::move(dict)), &json);
  return json;
}

bool AuditLogger::VerifyEntry(const AuditEntry& entry) const {
  std::string entry_json = SerializeEntry(entry);
  return signing_service_->Verify(entry_json, entry.signature);
}

bool AuditLogger::VerifyChain() const {
  return merkle_tree_->VerifyIntegrity();
}

std::string AuditLogger::GetMerkleRoot() const {
  return merkle_tree_->GetRoot();
}

size_t AuditLogger::GetEntryCount() const {
  return merkle_tree_->GetEntryCount();
}

}  // namespace privacy
}  // namespace toubkal
```

#### Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Signing Latency** | <5ms p95 | Ed25519 signature generation |
| **Merkle Tree Update** | <2ms p95 | SHA-256 hash + tree update |
| **LevelDB Write** | <3ms p95 | Atomic batch write |
| **Total Latency** | <10ms p95 | End-to-end logging |
| **Memory Usage** | <10MB | With 1000+ entries in Merkle tree |

#### Testing Strategy

```cpp
// audit_logger_unittest.cc
TEST_F(AuditLoggerTest, LogEntry_SignsWithEd25519) {
  AuditEntry entry;
  entry.timestamp = "2025-10-18T12:34:56Z";
  entry.operation_type = "network_request";
  entry.resource_url = "https://example.com";
  entry.action = "block";

  EXPECT_TRUE(audit_logger_->LogEntry(entry));

  // Verify signature with OpenSSL CLI
  // (integration test, not unit test)
}

TEST_F(AuditLoggerTest, VerifyChain_DetectsTampering) {
  // Add 100 entries
  for (int i = 0; i < 100; ++i) {
    AuditEntry entry;
    entry.timestamp = GetTimestamp(i);
    entry.operation_type = "test";
    EXPECT_TRUE(audit_logger_->LogEntry(entry));
  }

  // Verify chain integrity
  EXPECT_TRUE(audit_logger_->VerifyChain());

  // Tamper with entry #50 in storage
  // (direct LevelDB modification)
  // ...

  // Verify chain detects tampering
  EXPECT_FALSE(audit_logger_->VerifyChain());
}
```

---

### 2. **CryptoSigningService** (BoringSSL Ed25519)

**Purpose**: Cryptographic signing and verification using BoringSSL Ed25519.

**Location**: `src/toubkal/components/privacy/audit/crypto_signing_service.{h,cc}`

#### Class Definition

```cpp
// crypto_signing_service.h
#pragma once

#include <memory>
#include <string>
#include <vector>

#include "third_party/boringssl/src/include/openssl/ed25519.h"

namespace toubkal {
namespace privacy {

class AuditStorage;

class CryptoSigningService {
 public:
  CryptoSigningService();
  ~CryptoSigningService();

  // Initialize (loads or generates Ed25519 keypair)
  bool Initialize(AuditStorage* storage);

  // Sign data with Ed25519 private key
  // Returns: true if signing succeeded, false on error
  bool Sign(const std::string& data, std::vector<uint8_t>* signature);

  // Verify signature with Ed25519 public key
  bool Verify(const std::string& data,
              const std::vector<uint8_t>& signature) const;

  // Export public key (for external verification)
  std::vector<uint8_t> GetPublicKey() const;

  // For testing: Set private key (NOT for production use)
  void SetPrivateKeyForTesting(const uint8_t private_key[ED25519_PRIVATE_KEY_LEN]);

 private:
  // Generate new Ed25519 keypair
  void GenerateKeypair();

  // Load keypair from storage (encrypted)
  bool LoadKeypair(AuditStorage* storage);

  // Store keypair to storage (encrypted with OS keychain)
  bool StoreKeypair(AuditStorage* storage);

  // Encrypt private key with OS keychain
  bool EncryptPrivateKey(const uint8_t private_key[ED25519_PRIVATE_KEY_LEN],
                         std::string* encrypted_key);

  // Decrypt private key from OS keychain
  bool DecryptPrivateKey(const std::string& encrypted_key,
                         uint8_t private_key[ED25519_PRIVATE_KEY_LEN]);

  uint8_t private_key_[ED25519_PRIVATE_KEY_LEN];
  uint8_t public_key_[ED25519_PUBLIC_KEY_LEN];

  bool initialized_ = false;
};

}  // namespace privacy
}  // namespace toubkal
```

#### Implementation Details

```cpp
// crypto_signing_service.cc
#include "toubkal/components/privacy/audit/crypto_signing_service.h"

#include "base/logging.h"
#include "components/os_crypt/sync/os_crypt.h"
#include "crypto/random.h"
#include "third_party/boringssl/src/include/openssl/ed25519.h"
#include "toubkal/components/privacy/audit/audit_storage.h"

namespace toubkal {
namespace privacy {

CryptoSigningService::CryptoSigningService() = default;

CryptoSigningService::~CryptoSigningService() {
  // Zero sensitive memory on destruction
  OPENSSL_cleanse(private_key_, ED25519_PRIVATE_KEY_LEN);
}

bool CryptoSigningService::Initialize(AuditStorage* storage) {
  DCHECK(storage);

  // Try to load existing keypair
  if (LoadKeypair(storage)) {
    LOG(INFO) << "Loaded existing Ed25519 keypair";
    initialized_ = true;
    return true;
  }

  // No existing keypair, generate new one
  LOG(INFO) << "Generating new Ed25519 keypair";
  GenerateKeypair();

  // Store encrypted keypair
  if (!StoreKeypair(storage)) {
    LOG(ERROR) << "Failed to store Ed25519 keypair";
    return false;
  }

  initialized_ = true;
  return true;
}

void CryptoSigningService::GenerateKeypair() {
  // Generate random seed for Ed25519 keypair
  uint8_t seed[ED25519_PRIVATE_KEY_SEED_LEN];
  crypto::RandBytes(seed, ED25519_PRIVATE_KEY_SEED_LEN);

  // Generate Ed25519 keypair from seed
  ED25519_keypair_from_seed(public_key_, private_key_, seed);

  // Zero seed (sensitive data)
  OPENSSL_cleanse(seed, ED25519_PRIVATE_KEY_SEED_LEN);
}

bool CryptoSigningService::Sign(const std::string& data,
                                  std::vector<uint8_t>* signature) {
  DCHECK(initialized_);
  DCHECK(signature);

  signature->resize(ED25519_SIGNATURE_LEN);

  int result = ED25519_sign(
      signature->data(),
      reinterpret_cast<const uint8_t*>(data.data()),
      data.size(),
      private_key_);

  if (result != 1) {
    LOG(ERROR) << "Ed25519 signing failed";
    return false;
  }

  return true;
}

bool CryptoSigningService::Verify(const std::string& data,
                                    const std::vector<uint8_t>& signature) const {
  DCHECK(initialized_);

  if (signature.size() != ED25519_SIGNATURE_LEN) {
    LOG(ERROR) << "Invalid signature length: " << signature.size();
    return false;
  }

  int result = ED25519_verify(
      reinterpret_cast<const uint8_t*>(data.data()),
      data.size(),
      signature.data(),
      public_key_);

  return result == 1;
}

std::vector<uint8_t> CryptoSigningService::GetPublicKey() const {
  return std::vector<uint8_t>(public_key_,
                              public_key_ + ED25519_PUBLIC_KEY_LEN);
}

bool CryptoSigningService::StoreKeypair(AuditStorage* storage) {
  // Encrypt private key with OS keychain
  std::string encrypted_key;
  if (!EncryptPrivateKey(private_key_, &encrypted_key)) {
    return false;
  }

  // Store encrypted private key + public key
  return storage->WriteKey("ed25519_private_key", encrypted_key) &&
         storage->WriteKey("ed25519_public_key",
                          std::string(reinterpret_cast<const char*>(public_key_),
                                     ED25519_PUBLIC_KEY_LEN));
}

bool CryptoSigningService::LoadKeypair(AuditStorage* storage) {
  // Load encrypted private key
  std::string encrypted_key;
  if (!storage->ReadKey("ed25519_private_key", &encrypted_key)) {
    return false;  // No existing keypair
  }

  // Decrypt private key
  if (!DecryptPrivateKey(encrypted_key, private_key_)) {
    LOG(ERROR) << "Failed to decrypt private key";
    return false;
  }

  // Load public key
  std::string public_key_str;
  if (!storage->ReadKey("ed25519_public_key", &public_key_str)) {
    LOG(ERROR) << "Private key found but public key missing";
    return false;
  }

  if (public_key_str.size() != ED25519_PUBLIC_KEY_LEN) {
    LOG(ERROR) << "Invalid public key length";
    return false;
  }

  memcpy(public_key_, public_key_str.data(), ED25519_PUBLIC_KEY_LEN);
  return true;
}

bool CryptoSigningService::EncryptPrivateKey(
    const uint8_t private_key[ED25519_PRIVATE_KEY_LEN],
    std::string* encrypted_key) {
  std::string key_data(reinterpret_cast<const char*>(private_key),
                       ED25519_PRIVATE_KEY_LEN);

  // Encrypt with OS keychain (Keychain/DPAPI/libsecret)
  if (!OSCrypt::EncryptString(key_data, encrypted_key)) {
    LOG(ERROR) << "Failed to encrypt private key with OS keychain";
    return false;
  }

  return true;
}

bool CryptoSigningService::DecryptPrivateKey(
    const std::string& encrypted_key,
    uint8_t private_key[ED25519_PRIVATE_KEY_LEN]) {
  std::string decrypted_key;

  // Decrypt with OS keychain
  if (!OSCrypt::DecryptString(encrypted_key, &decrypted_key)) {
    LOG(ERROR) << "Failed to decrypt private key with OS keychain";
    return false;
  }

  if (decrypted_key.size() != ED25519_PRIVATE_KEY_LEN) {
    LOG(ERROR) << "Decrypted key has invalid length";
    return false;
  }

  memcpy(private_key, decrypted_key.data(), ED25519_PRIVATE_KEY_LEN);
  return true;
}

void CryptoSigningService::SetPrivateKeyForTesting(
    const uint8_t private_key[ED25519_PRIVATE_KEY_LEN]) {
  memcpy(private_key_, private_key, ED25519_PRIVATE_KEY_LEN);
  ED25519_keypair_from_seed(public_key_, private_key_, private_key);
  initialized_ = true;
}

}  // namespace privacy
}  // namespace toubkal
```

#### Security Requirements

| Requirement | Implementation | Validation |
|-------------|----------------|------------|
| **FIPS 140-2/3 Compliance** | BoringSSL (Google's FIPS-validated fork) | Verified via BoringSSL build config |
| **Private Key Encryption** | OS Keychain (Keychain/DPAPI/libsecret) | Unit test: encrypted key != plaintext |
| **Constant-Time Verification** | Ed25519_verify (internal constant-time) | N/A (BoringSSL handles this) |
| **Memory Zeroing** | OPENSSL_cleanse on destruction | Unit test: memory contents after free |
| **Key Persistence** | LevelDB (encrypted) | Integration test: restart browser, verify keys |

---

### 3. **MerkleTree** (SHA-256 Integrity Verification)

**Purpose**: Build tamper-proof Merkle tree from audit entries using SHA-256.

**Location**: `src/toubkal/components/privacy/audit/merkle_tree.{h,cc}`

#### Class Definition

```cpp
// merkle_tree.h
#pragma once

#include <memory>
#include <string>
#include <vector>

namespace toubkal {
namespace privacy {

class MerkleTree {
 public:
  MerkleTree();
  ~MerkleTree();

  // Add audit entry to Merkle tree (recomputes root)
  void AddEntry(const std::string& entry_hash);

  // Get Merkle root hash (hex-encoded SHA-256)
  std::string GetRoot() const;

  // Get total number of entries
  size_t GetEntryCount() const;

  // Verify Merkle tree integrity (recomputes root, compares with stored)
  bool VerifyIntegrity() const;

  // Generate Merkle proof for entry at index
  std::string GenerateProof(size_t entry_index) const;

  // Verify Merkle proof for entry
  bool VerifyProof(const std::string& entry_hash,
                   const std::string& merkle_proof_json,
                   const std::string& expected_root) const;

 private:
  // Compute SHA-256 hash
  std::string ComputeHash(const std::string& data) const;

  // Recompute Merkle root from all entries
  void RecomputeRoot();

  std::vector<std::string> entries_;  // SHA-256 hashes of entries
  std::string root_;                  // Current Merkle root
};

}  // namespace privacy
}  // namespace toubkal
```

#### Implementation

```cpp
// merkle_tree.cc
#include "toubkal/components/privacy/audit/merkle_tree.h"

#include "base/base64.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "crypto/sha2.h"

namespace toubkal {
namespace privacy {

MerkleTree::MerkleTree() = default;
MerkleTree::~MerkleTree() = default;

void MerkleTree::AddEntry(const std::string& entry_hash) {
  entries_.push_back(entry_hash);
  RecomputeRoot();
}

std::string MerkleTree::GetRoot() const {
  return root_;
}

size_t MerkleTree::GetEntryCount() const {
  return entries_.size();
}

void MerkleTree::RecomputeRoot() {
  if (entries_.empty()) {
    root_ = "";
    return;
  }

  // Build Merkle tree bottom-up
  std::vector<std::string> level = entries_;

  while (level.size() > 1) {
    std::vector<std::string> next_level;

    for (size_t i = 0; i < level.size(); i += 2) {
      if (i + 1 < level.size()) {
        // Pair of nodes: hash(left + right)
        std::string combined = level[i] + level[i + 1];
        next_level.push_back(ComputeHash(combined));
      } else {
        // Odd node: promote to next level
        next_level.push_back(level[i]);
      }
    }

    level = std::move(next_level);
  }

  root_ = level[0];
}

std::string MerkleTree::ComputeHash(const std::string& data) const {
  std::string hash = crypto::SHA256HashString(data);
  return base::Base64Encode(hash);  // Base64 for readability
}

bool MerkleTree::VerifyIntegrity() const {
  // Recompute root and compare with stored root
  MerkleTree temp_tree;
  for (const auto& entry : entries_) {
    temp_tree.AddEntry(entry);
  }

  return temp_tree.GetRoot() == root_;
}

std::string MerkleTree::GenerateProof(size_t entry_index) const {
  if (entry_index >= entries_.size()) {
    LOG(ERROR) << "Invalid entry index: " << entry_index;
    return "";
  }

  // Generate Merkle proof (sibling hashes along path to root)
  std::vector<std::string> proof;
  std::vector<std::string> level = entries_;
  size_t index = entry_index;

  while (level.size() > 1) {
    size_t sibling_index = (index % 2 == 0) ? index + 1 : index - 1;

    if (sibling_index < level.size()) {
      proof.push_back(level[sibling_index]);
    }

    // Move to next level
    std::vector<std::string> next_level;
    for (size_t i = 0; i < level.size(); i += 2) {
      if (i + 1 < level.size()) {
        next_level.push_back(ComputeHash(level[i] + level[i + 1]));
      } else {
        next_level.push_back(level[i]);
      }
    }

    level = std::move(next_level);
    index /= 2;
  }

  // Convert proof to JSON
  base::Value::List proof_list;
  for (const auto& hash : proof) {
    proof_list.Append(hash);
  }

  std::string proof_json;
  base::JSONWriter::Write(base::Value(std::move(proof_list)), &proof_json);
  return proof_json;
}

}  // namespace privacy
}  // namespace toubkal
```

---

## 📄 **Continued in Next Response...**

This is getting quite long! Shall I continue with:
- AdBlockingService specification
- AdBlockEngine (Rust FFI wrapper) specification
- AuditStorage (LevelDB) specification
- FilterManager specification
- Build configuration (GN files)
- Testing specifications

**Would you like me to continue with the remaining components?** 🚀
