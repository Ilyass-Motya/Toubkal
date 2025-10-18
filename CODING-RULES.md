# Toubkal Browser Coding Rules

**Status**: Mandatory
**Last Updated**: 2025-10-18 (v2.0 - Phase 0.5 enhancements)
**Audience**: All developers, BMAD agents, AI coding assistants

This document contains **STRICT** coding rules for Toubkal Browser. These rules are designed to prevent common errors and ensure consistency across the codebase.

**What's New (v2.0)**:
- 🔐 **Cryptography Rules** (BoringSSL Ed25519, constant-time comparison, key storage)
- 🦀 **Rust FFI Rules** (adblock-rust integration, RAII wrappers, safe string conversion)
- 🗄️ **LevelDB Rules** (atomic writes, compression, iterators for range queries)
- ⚡ **Performance Budgets** (<10ms audit logging, <5ms ad blocking, <50MB RAM)
- 🚀 **Phase-Specific Rules** (what's allowed in Phase 0.5 vs Phase 1+)

---

## 🚨 CRITICAL RULES (NEVER VIOLATE)

### Rule 1: NO Bare String Throws

```
// ❌ FORBIDDEN
throw 'Missing consent'
throw `Error: ${message}`

// ✅ CORRECT
throw new Error('Missing consent')
throw new ConsentError('Missing consent', { providerId })
```

**Why**: Bare strings don't have stack traces. Always use `Error` objects.

---

### Rule 2: NO Unhandled Promises

```
// ❌ FORBIDDEN
someAsyncFunc()  // Fire and forget
apiCall().then(data => process(data))  // No .catch()

// ✅ CORRECT
try {
  await someAsyncFunc()
} catch (error) {
  handleError(error)
}

// OR with .catch()
apiCall()
  .then(data => process(data))
  .catch(error => handleError(error))
```

**Why**: Unhandled promise rejections crash the browser process.

---

### Rule 3: NO Silent Error Swallowing

```
// ❌ FORBIDDEN
try {
  dangerousOperation()
} catch (e) {
  // Silent fail
}

// ❌ FORBIDDEN
try {
  dangerousOperation()
} catch (e) {
  console.log('Error')  // No details
}

// ✅ CORRECT
try {
  dangerousOperation()
} catch (error) {
  console.error('[Context] Error:', error)
  return { success: false, error: 'Operation failed' }
}
```

**Why**: Silent errors are impossible to debug.

---

### Rule 4: NO `any` Type

```
// ❌ FORBIDDEN
function process(data: any) { ... }
const config: any = getConfig()

// ✅ CORRECT
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type guard, then use
  }
}

// OR with proper typing
interface Config {
  apiKey: string;
  timeout: number;
}
const config: Config = getConfig()
```

**Why**: `any` defeats TypeScript's type safety. Use `unknown` + type guards.

---

### Rule 5: NO Missing Test Assertions

```
// ❌ FORBIDDEN
it('should do something', () => {
  doSomething()  // No assertion!
})

// ❌ FORBIDDEN
it('should return data', async () => {
  await fetchData()  // No assertion!
})

// ✅ CORRECT
it('should do something', () => {
  const result = doSomething()
  expect(result).toBe(expected)
})

it('should return data', async () => {
  const data = await fetchData()
  expect(data).toEqual({ ... })
})
```

**Why**: Tests without assertions always pass (false positive).

---

## 📐 FILE NAMING RULES

### TypeScript/React Files

```
✅ CORRECT:
- Components: PascalCase.tsx (AISidebar.tsx, ConsentBanner.tsx)
- Hooks: use-kebab-case.ts (use-consent.ts, use-audit-logs.ts)
- Services: kebab-case.ts (ollama-client.ts, audit-logger.ts)
- Types: PascalCase.ts (ConsentTypes.ts, AuditLogTypes.ts)
- Tests: Same-as-source.test.ts (AISidebar.test.tsx, use-consent.test.ts)

❌ WRONG:
- ai_sidebar.tsx (snake_case - reserved for C++)
- UseConsent.ts (hooks must be kebab-case)
- OllamaClient.test.ts (separate test files - put next to source)
```

### C++ Files (Chromium Overlays)

```
✅ CORRECT:
- Headers: snake_case.h (consent_manager.h, audit_logger.h)
- Implementation: snake_case.cc (consent_manager.cc, audit_logger.cc)
- Tests: snake_case_test.cc (consent_manager_test.cc)

❌ WRONG:
- ConsentManager.h (PascalCase - not Chromium style)
- consent-manager.cc (kebab-case - not Chromium style)
- consent_manager.cpp (C++ extension - Chromium uses .cc)
```

---

## 🔒 ERROR HANDLING RULES

### Use Result<T> Pattern

```
// ✅ CORRECT: Type-safe error handling
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

async function riskyOperation(): Promise<Result<Data>> {
  try {
    const data = await someAsyncCall()
    return { success: true, data }
  } catch (error) {
    console.error('[riskyOperation] Failed:', error)
    return { success: false, error: 'Operation failed' }
  }
}

// Usage
const result = await riskyOperation()
if (result.success) {
  console.log(result.data)  // Type-safe access
} else {
  console.error(result.error)
}
```

### Domain-Specific Errors

```
// ✅ CORRECT: Custom error classes
export class ConsentError extends Error {
  constructor(message: string, public context: { providerId?: string }) {
    super(message)
    this.name = 'ConsentError'
  }
}

throw new ConsentError('Consent denied', { providerId: 'ollama' })
```

---

## 🧪 TESTING RULES

### Rule 1: Mock External Dependencies

```
// ✅ CORRECT: Mock Ollama client
vi.mock('@/packages/ai-providers', () => ({
  OllamaClient: vi.fn().mockImplementation(() => ({
    query: vi.fn().mockResolvedValue({
      text: 'Mock response',
      tokens: 50,
      latency: 100
    })
  }))
}))

// ❌ WRONG: No mocking (test depends on real Ollama)
const client = new OllamaClient()  // Real dependency!
const response = await client.query('test')
```

### Rule 2: Wait for Async Operations

```
// ✅ CORRECT: Wait for async effects
it('loads consent status on mount', async () => {
  render(<ConsentBanner />)

  await waitFor(() => {
    expect(screen.getByText('Consent granted')).toBeInTheDocument()
  })
})

// ❌ WRONG: No waiting (race condition)
it('loads consent status', () => {
  render(<ConsentBanner />)
  expect(screen.getByText('Consent granted')).toBeInTheDocument()  // Fails!
})
```

### Rule 3: Test Structure

```
// ✅ CORRECT: Describe block per component/function
describe('ConsentManager', () => {
  describe('requestConsent()', () => {
    it('returns true when user grants consent', async () => {
      // Arrange
      const manager = new ConsentManager()

      // Act
      const result = await manager.requestConsent({ ... })

      // Assert
      expect(result.granted).toBe(true)
    })

    it('returns false when user denies consent', async () => {
      // ...
    })
  })

  describe('hasConsent()', () => {
    // ...
  })
})

// ❌ WRONG: Flat structure
it('consent manager works', () => {
  // Tests 10 different things
})
```

---

## 🐍 CHROMIUM C++ RULES

### Class Naming

```
// ✅ CORRECT: PascalCase classes, snake_case members
class ConsentManager {
 public:
  bool HasConsent(const std::string& action_type);

 private:
  std::string user_id_;  // Trailing underscore for members
  void LogDecision();    // PascalCase methods
};

// ❌ WRONG: Inconsistent naming
class consent_manager {  // snake_case class
  bool hasConsent(std::string actionType);  // camelCase method
  std::string userId;  // No trailing underscore
};
```

### Include Order

```
// ✅ CORRECT: Chromium include order
#include "toubkal/browser/consent_manager.h"  // Own header FIRST

#include <memory>                             // C++ stdlib
#include <string>

#include "base/logging.h"                     // Chromium base
#include "mojo/public/cpp/bindings/remote.h"  // Mojo

#include "toubkal/common/audit_logger.h"      // Toubkal headers

// ❌ WRONG: Random order
#include "toubkal/common/audit_logger.h"
#include <string>
#include "toubkal/browser/consent_manager.h"  // Own header not first
```

### Logging

```
// ✅ CORRECT: Chromium logging macros
LOG(INFO) << "Consent granted for " << action_type;
LOG(ERROR) << "Signature verification failed";
DCHECK(entry.signature) << "Signature required";

// ❌ WRONG: std::cout or printf
std::cout << "Debug message";  // NEVER use this
printf("Error: %s\n", error);  // NEVER use this
```

---

## 🔐 CRYPTOGRAPHY RULES (PHASE 0.5 - CRITICAL!)

### Rule 1: Always Use BoringSSL (FIPS 140-2/3 Validated)

**Context**: Enterprise compliance requires FIPS 140-2/3 validated cryptography. BoringSSL is Google's FIPS-validated fork of OpenSSL.

```cpp
// ✅ CORRECT: BoringSSL Ed25519 signing
#include "third_party/boringssl/src/include/openssl/evp.h"
#include "third_party/boringssl/src/include/openssl/ed25519.h"

bool AuditLogger::SignEntry(const std::string& entry,
                             uint8_t signature[ED25519_SIGNATURE_LEN]) {
  ED25519_sign(signature,
               reinterpret_cast<const uint8_t*>(entry.data()),
               entry.size(),
               private_key_);
  return true;
}

// ❌ WRONG: Third-party crypto libraries (non-FIPS)
#include "libsodium/sodium.h"   // NOT allowed
#include "openssl/rsa.h"        // Use BoringSSL, not OpenSSL
#include "crypto++/rsa.h"       // NOT allowed
```

**Why**: BoringSSL is the only FIPS-validated crypto library in Chromium. Third-party libraries break enterprise compliance and create security audit failures.

---

### Rule 2: Never Store Private Keys Unencrypted

```cpp
// ✅ CORRECT: Encrypt private key with OS keychain
#include "components/os_crypt/sync/os_crypt.h"

bool AuditLogger::StorePrivateKey(const uint8_t private_key[ED25519_PRIVATE_KEY_LEN]) {
  std::string key_data(reinterpret_cast<const char*>(private_key),
                       ED25519_PRIVATE_KEY_LEN);
  std::string encrypted_key;

  // Encrypt with OS keychain (Keychain/DPAPI/libsecret)
  if (!OSCrypt::EncryptString(key_data, &encrypted_key)) {
    LOG(ERROR) << "Failed to encrypt private key";
    return false;
  }

  // Store encrypted key in LevelDB
  return audit_storage_->WriteKey("ed25519_private_key", encrypted_key);
}

// ❌ WRONG: Store private key in plaintext
leveldb::WriteOptions options;
std::string key_data(reinterpret_cast<const char*>(private_key), 32);
db_->Put(options, "private_key", key_data);  // SECURITY VULNERABILITY!
```

**Why**: Private keys must be protected at rest. Use OS keychain (Keychain on macOS, DPAPI on Windows, libsecret on Linux). Plaintext keys are a **critical security vulnerability**.

---

### Rule 3: Constant-Time Comparison for Signatures

```cpp
// ✅ CORRECT: Constant-time comparison (prevents timing attacks)
#include "crypto/secure_util.h"

bool AuditLogger::VerifySignature(const uint8_t signature[ED25519_SIGNATURE_LEN],
                                   const std::string& entry,
                                   const uint8_t public_key[ED25519_PUBLIC_KEY_LEN]) {
  // ED25519_verify uses constant-time comparison internally
  return ED25519_verify(reinterpret_cast<const uint8_t*>(entry.data()),
                        entry.size(),
                        signature,
                        public_key) == 1;
}

// ❌ WRONG: memcmp (timing attack vulnerability)
uint8_t expected_signature[ED25519_SIGNATURE_LEN];
ED25519_sign(expected_signature, /* ... */);

if (memcmp(signature, expected_signature, ED25519_SIGNATURE_LEN) == 0) {
  return true;  // TIMING ATTACK VULNERABILITY!
}
```

**Why**: `memcmp` leaks timing information about where bytes differ. Attackers can use timing side-channels to extract cryptographic secrets. Always use constant-time comparison for signatures.

---

### Rule 4: Zero Sensitive Memory After Use

```cpp
// ✅ CORRECT: Zero memory containing private keys
void AuditLogger::ClearPrivateKey() {
  if (private_key_) {
    OPENSSL_cleanse(private_key_, ED25519_PRIVATE_KEY_LEN);
    delete[] private_key_;
    private_key_ = nullptr;
  }
}

// ❌ WRONG: Memory contains private key data after free
delete[] private_key_;  // Memory still contains key data!
```

**Why**: `OPENSSL_cleanse` prevents compiler optimizations from removing the zero operation. Regular `memset` can be optimized away.

---

## 🦀 RUST FFI RULES (ADBLOCK-RUST INTEGRATION)

### Rule 1: Wrap All Rust Calls in C++ RAII Classes

**Context**: Rust resources must be manually freed. Use RAII to ensure cleanup.

```cpp
// ✅ CORRECT: RAII wrapper for Rust adblock-rust
class AdBlockEngine {
 public:
  AdBlockEngine() : engine_(adblock_engine_create()) {
    CHECK(engine_) << "Failed to create adblock engine";
  }

  ~AdBlockEngine() {
    if (engine_) {
      adblock_engine_destroy(engine_);
      engine_ = nullptr;
    }
  }

  // Delete copy/move constructors (non-copyable resource)
  AdBlockEngine(const AdBlockEngine&) = delete;
  AdBlockEngine& operator=(const AdBlockEngine&) = delete;
  AdBlockEngine(AdBlockEngine&&) = delete;
  AdBlockEngine& operator=(AdBlockEngine&&) = delete;

  bool ShouldBlock(const std::string& url) const {
    return adblock_engine_check(engine_, url.c_str());
  }

 private:
  void* engine_;  // Opaque Rust pointer
};

// ❌ WRONG: Raw Rust pointers (memory leaks)
void ProcessURL(const std::string& url) {
  void* engine = adblock_engine_create();
  bool blocked = adblock_engine_check(engine, url.c_str());

  if (blocked) {
    return;  // MEMORY LEAK! Forgot to call adblock_engine_destroy()
  }

  adblock_engine_destroy(engine);
}
```

**Why**: Rust resources don't have automatic cleanup like C++ objects. RAII ensures `adblock_engine_destroy()` is called even on early returns or exceptions.

---

### Rule 2: Convert Between C++ and Rust Types Safely

```cpp
// ✅ CORRECT: Safe string conversion
std::string RustStringToCpp(const char* rust_str) {
  if (!rust_str) {
    LOG(WARNING) << "Null Rust string, returning empty";
    return "";
  }
  std::string result(rust_str);
  adblock_free_string(rust_str);  // Free Rust-allocated string
  return result;
}

// Convert C++ string to Rust (caller must free with adblock_free_string)
const char* CppStringToRust(const std::string& cpp_str) {
  return strdup(cpp_str.c_str());
}

// ❌ WRONG: Direct casting (undefined behavior)
void ProcessFilter(const std::string& filter) {
  char* rust_str = (char*)filter.c_str();  // UNDEFINED BEHAVIOR!
  adblock_add_filter(engine_, rust_str);
  // Rust may modify or free this memory!
}

// ❌ WRONG: Forgetting to free Rust strings
const char* result = adblock_get_reason(engine_);
std::string reason(result);  // Memory leak! Must call adblock_free_string(result)
```

**Why**: Rust and C++ have different string representations and ownership models. C++ `std::string` owns its memory, Rust `String` owns its memory. Direct casting causes undefined behavior.

---

### Rule 3: Check All Rust FFI Return Values

```cpp
// ✅ CORRECT: Check return values
bool AdBlockingService::LoadFilters(const std::string& filter_list) {
  int result = adblock_load_filters(engine_, filter_list.c_str());

  if (result != ADBLOCK_SUCCESS) {
    const char* error_msg = adblock_get_last_error(engine_);
    LOG(ERROR) << "Failed to load filters: "
               << (error_msg ? error_msg : "Unknown error");
    adblock_free_string(error_msg);
    return false;
  }

  return true;
}

// ❌ WRONG: Ignore return values
adblock_load_filters(engine_, filter_list.c_str());  // May have failed silently!
```

**Why**: Rust FFI functions return error codes. Ignoring them leads to silent failures that are impossible to debug.

---

## 🗄️ LEVELDB RULES (AUDIT TRAIL PERSISTENCE)

### Rule 1: Always Check Write Status

```cpp
// ✅ CORRECT: Check write status
bool AuditStorage::WriteEntry(const std::string& key, const std::string& value) {
  leveldb::WriteOptions options;
  leveldb::Status status = db_->Put(options, key, value);

  if (!status.ok()) {
    LOG(ERROR) << "LevelDB write failed: " << status.ToString();
    return false;
  }

  return true;
}

// ❌ WRONG: Ignore write status (silent data loss)
void AuditStorage::WriteEntry(const std::string& key, const std::string& value) {
  leveldb::WriteOptions options;
  db_->Put(options, key, value);  // May fail silently due to disk full!
}
```

**Why**: LevelDB writes can fail (disk full, corruption, permissions). Silent failures cause data loss that's impossible to detect until it's too late.

---

### Rule 2: Use Atomic Writes for Related Entries

```cpp
// ✅ CORRECT: Atomic batch write
bool AuditStorage::WriteAuditEntry(const std::string& timestamp,
                                    const std::string& entry_json,
                                    const std::string& root_hash) {
  leveldb::WriteBatch batch;
  batch.Put("audit/" + timestamp, entry_json);
  batch.Put("merkle_root", root_hash);

  leveldb::WriteOptions options;
  leveldb::Status status = db_->Write(options, &batch);

  if (!status.ok()) {
    LOG(ERROR) << "Atomic write failed: " << status.ToString();
    return false;
  }

  return true;
}

// ❌ WRONG: Separate writes (inconsistent state if second write fails)
db_->Put(leveldb::WriteOptions(), "audit/" + timestamp, entry_json);
db_->Put(leveldb::WriteOptions(), "merkle_root", root_hash);
// If this fails, audit entry exists but Merkle root is stale! INCONSISTENT STATE!
```

**Why**: Audit trail + Merkle root must stay in sync. If one write succeeds and the other fails, the database is in an inconsistent state. Use atomic batch writes.

---

### Rule 3: Enable Compression

```cpp
// ✅ CORRECT: Enable Snappy compression (audit logs compress well)
bool AuditStorage::Open(const std::string& db_path) {
  leveldb::Options options;
  options.create_if_missing = true;
  options.compression = leveldb::kSnappyCompression;  // 50-70% size reduction!

  leveldb::DB* db;
  leveldb::Status status = leveldb::DB::Open(options, db_path, &db);

  if (!status.ok()) {
    LOG(ERROR) << "Failed to open LevelDB: " << status.ToString();
    return false;
  }

  db_.reset(db);
  return true;
}

// ❌ WRONG: No compression (wastes disk space)
options.compression = leveldb::kNoCompression;
// Audit logs are JSON text, compress to 30-50% of original size!
```

**Why**: Audit logs are highly compressible (JSON text). Snappy compression reduces disk usage by 50-70% with minimal CPU overhead.

---

### Rule 4: Use Iterators for Range Queries

```cpp
// ✅ CORRECT: Use iterators for range queries
std::vector<std::string> AuditStorage::ReadEntries(const std::string& start_time,
                                                     const std::string& end_time) {
  std::vector<std::string> entries;
  std::unique_ptr<leveldb::Iterator> it(db_->NewIterator(leveldb::ReadOptions()));

  std::string start_key = "audit/" + start_time;
  std::string end_key = "audit/" + end_time;

  for (it->Seek(start_key); it->Valid() && it->key().ToString() < end_key; it->Next()) {
    entries.push_back(it->value().ToString());
  }

  if (!it->status().ok()) {
    LOG(ERROR) << "Iterator error: " << it->status().ToString();
  }

  return entries;
}

// ❌ WRONG: Individual Get() calls (inefficient)
for (const auto& timestamp : timestamps) {
  std::string value;
  db_->Get(leveldb::ReadOptions(), "audit/" + timestamp, &value);  // N separate disk reads!
  entries.push_back(value);
}
```

**Why**: Iterators are optimized for range queries. Individual `Get()` calls make N separate disk reads. Iterators use sequential reads which are 10-100x faster.

---

## ⚡ PERFORMANCE RULES (PHASE 0.5 TARGETS)

### Rule 1: Audit Logging Latency Budget

**Target**: <10ms p95 latency (event → Ed25519 signature → LevelDB write)

```cpp
// ✅ CORRECT: Async signing with performance tracking
void AuditLogger::LogEntry(const std::string& entry) {
  base::ElapsedTimer timer;

  // Async Ed25519 signing (off main thread)
  base::ThreadPool::PostTask(
      FROM_HERE,
      {base::TaskPriority::USER_BLOCKING},
      base::BindOnce(&AuditLogger::SignAndPersist,
                     base::Unretained(this),
                     entry));

  // Log if exceeds budget
  base::TimeDelta elapsed = timer.Elapsed();
  if (elapsed > base::Milliseconds(10)) {
    LOG(WARNING) << "Audit logging exceeded 10ms budget: "
                 << elapsed.InMilliseconds() << "ms";
  }
}

// ❌ WRONG: Synchronous signing (blocks UI thread)
void AuditLogger::LogEntry(const std::string& entry) {
  uint8_t signature[ED25519_SIGNATURE_LEN];
  ED25519_sign(signature, /* ... */);  // Blocks UI thread for 5-10ms!

  leveldb::WriteOptions options;
  db_->Put(options, key, value);  // Another 5-10ms block!
}
```

**Why**: UI thread must remain responsive (<16ms per frame for 60fps). Cryptographic operations and disk I/O must run asynchronously.

---

### Rule 2: Ad Blocking Latency Budget

**Target**: <5ms p95 latency (network request → adblock check → block/allow decision)

```cpp
// ✅ CORRECT: Async CNAME resolution
bool AdBlockingService::ShouldBlockRequest(const GURL& url) {
  base::ElapsedTimer timer;

  // Quick filter check (synchronous, <1ms)
  bool blocked = engine_->ShouldBlock(url.spec());

  // CNAME uncloaking (async, queued for background resolution)
  if (!blocked) {
    ResolveCNAMEAsync(url, base::BindOnce(&AdBlockingService::OnCNAMEResolved,
                                           base::Unretained(this)));
  }

  base::TimeDelta elapsed = timer.Elapsed();
  DCHECK_LT(elapsed, base::Milliseconds(5))
      << "Ad blocking exceeded 5ms budget: " << elapsed.InMilliseconds() << "ms";

  return blocked;
}

// ❌ WRONG: Synchronous CNAME resolution (blocks network requests)
bool AdBlockingService::ShouldBlockRequest(const GURL& url) {
  bool blocked = engine_->ShouldBlock(url.spec());

  if (!blocked) {
    std::string cname = ResolveCNAMESync(url);  // DNS lookup, 50-200ms!
    blocked = engine_->ShouldBlock(cname);
  }

  return blocked;
}
```

**Why**: Network requests must complete quickly to avoid page load delays. CNAME resolution can take 50-200ms. Queue it asynchronously and return the initial filter check result immediately.

---

### Rule 3: Memory Budget

**Target**: <50MB additional RAM (compared to base Chromium with 1000+ audit entries)

```cpp
// ✅ CORRECT: Use string_view to avoid copies
void AuditLogger::ProcessAuditEntry(std::string_view entry) {
  // No copy, just references original string
  parser_.Parse(entry);

  // Extract timestamp without copying
  std::string_view timestamp = entry.substr(0, 20);
}

// ❌ WRONG: Unnecessary copies (wastes RAM)
void AuditLogger::ProcessAuditEntry(std::string entry) {  // Copy 1!
  parser_.Parse(entry);  // Copy 2 if Parse() takes by value!

  std::string timestamp = entry.substr(0, 20);  // Copy 3!
}
```

**Why**: Every copy allocates memory. With 1000+ audit entries, unnecessary copies waste 10-50MB RAM. Use `std::string_view` for read-only access.

---

### Rule 4: Batch Operations

```cpp
// ✅ CORRECT: Batch write audit entries
void AuditLogger::FlushPendingEntries() {
  if (pending_entries_.empty()) return;

  leveldb::WriteBatch batch;
  for (const auto& [key, value] : pending_entries_) {
    batch.Put(key, value);
  }

  leveldb::WriteOptions options;
  options.sync = true;  // Ensure durability
  db_->Write(options, &batch);  // Single disk write!

  pending_entries_.clear();
}

// ❌ WRONG: Individual writes (disk I/O bottleneck)
void AuditLogger::FlushPendingEntries() {
  for (const auto& [key, value] : pending_entries_) {
    leveldb::WriteOptions options;
    options.sync = true;
    db_->Put(options, key, value);  // N separate disk writes!
  }
}
```

**Why**: Disk I/O is expensive (1-10ms per write). Batching 100 entries reduces total write time from 100-1000ms to 1-10ms.

---

## 🚀 PHASE-SPECIFIC RULES

### Phase 0.5 (Current) — C++ Privacy Implementations

**Status**: 🔵 Active Development (Weeks 1-4)
**Focus**: Real Ed25519 signing, Merkle trees, LevelDB, adblock-rust

**Allowed**:
- ✅ C++ implementations in `src/toubkal/components/privacy/`
- ✅ BoringSSL Ed25519 API (FIPS 140-2/3 validated)
- ✅ Rust FFI for adblock-rust (with RAII wrappers)
- ✅ LevelDB for audit storage (with compression + atomic writes)
- ✅ TypeScript/React UI stubs (no browser integration yet)
- ✅ Unit tests for all cryptographic operations

**NOT Allowed** (Phase 1+):
- ❌ Chromium fork modifications (user-managed, not ready yet)
- ❌ GN `BUILD.gn` files (Phase 1, Week 5-6)
- ❌ Mojo `.mojom` interface definitions (Phase 1, Week 7-8)
- ❌ Browser UI branding (`toubkal://` scheme) (Phase 1, Week 5-6)
- ❌ Chromium network service integration (Phase 1, Week 7-8)

---

### Phase 1 (Weeks 5-12) — Full Chromium Integration

**Status**: 🟡 Planning
**Focus**: GN build system, consent fabric (C++), transparency dashboard, SLSA builds

**Allowed**:
- ✅ GN `BUILD.gn` files (build configuration)
- ✅ Mojo `.mojom` interface definitions (IPC between processes)
- ✅ Chromium network service integration (consent enforcement before requests)
- ✅ Browser UI modifications (`toubkal://` scheme registration)
- ✅ React transparency dashboard (real-time audit log viewer)
- ✅ E2E tests (Playwright) for consent workflows

---

### Phase 2 (Weeks 13-20) — AI & MCP

**Status**: ⚪ Planned
**Focus**: Ollama integration, MCP client (C++), AI assistant UI

**Allowed**:
- ✅ AI inference abstractions (`AIInferenceEngine` interface)
- ✅ Ollama client (REST API integration)
- ✅ Transformers.js fallback (WebGPU)
- ✅ MCP client (JSON-RPC 2.0 over stdio/HTTP+SSE/SHTTP)
- ✅ React AI overlay components
- ✅ Native MCP servers (toubkal-tabs, toubkal-bookmarks, toubkal-history)

---

## 🚫 FORBIDDEN PATTERNS

### Pattern 1: Inline Style Objects

```
// ❌ FORBIDDEN: Inline styles
<div style={{ color: 'red', fontSize: '14px' }}>Text</div>

// ✅ CORRECT: Tailwind classes
<div className="text-red-500 text-sm">Text</div>
```

### Pattern 2: Non-Null Assertions

```
// ❌ FORBIDDEN: Non-null assertion
const user = getUser()!
const name = user.name!

// ✅ CORRECT: Null checking
const user = getUser()
if (user) {
  const name = user.name ?? 'Unknown'
}
```

### Pattern 3: Var Keyword

```
// ❌ FORBIDDEN: var
var count = 0

// ✅ CORRECT: const/let
const count = 0
let mutableCount = 0
```

---

## 📦 PACKAGE RULES

### Import Paths

```
// ✅ CORRECT: Use path aliases
import { ConsentManager } from '@/core/consent/consent-manager'
import { useAuditLogs } from '@/shared/hooks/use-audit-logs'

// ❌ WRONG: Relative paths
import { ConsentManager } from '../../../core/consent/consent-manager'
```

### Dependencies

```
// ✅ CORRECT: Only import what you need
import { useState, useEffect } from 'react'

// ❌ WRONG: Wildcard imports
import * as React from 'react'
```

---

## 🔐 SECURITY RULES

### Rule 1: Sanitize User Input

```
// ✅ CORRECT: Sanitize before rendering
import DOMPurify from 'dompurify'

const sanitizedHtml = DOMPurify.sanitize(userInput)
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

// ❌ WRONG: Directly render user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Rule 2: No Hardcoded Secrets

```
// ❌ FORBIDDEN: Hardcoded API keys
const API_KEY = 'sk-1234567890abcdef'

// ✅ CORRECT: Environment variables
const API_KEY = process.env.VITE_API_KEY
if (!API_KEY) throw new Error('API_KEY required')
```

---

## ✅ QUICK REFERENCE

### Before Committing

```bash
# Phase 0.5 (TypeScript/React + C++ Privacy Implementations)

# 1. TypeScript/React checks
pnpm run lint              # ESLint (TypeScript)
pnpm run test              # Vitest (TypeScript unit tests)
pnpm run typecheck         # TypeScript compiler
pnpm run format            # Prettier

# 2. C++ checks (if you modified C++ files)
git clang-format           # Format C++ files (auto-format staged files)
# OR manually:
# clang-format -i src/toubkal/**/*.{cc,h}

# 3. C++ unit tests (Phase 1+, when Chromium build is ready)
# ninja -C out/Debug toubkal_unit_tests  # Build C++ tests
# ./out/Debug/toubkal_unit_tests         # Run C++ tests
```

```bash
# Phase 1+ (Full Chromium Build)

# All of the above, plus:
autoninja -C out/Debug toubkal         # Build browser
./out/Debug/toubkal --test             # Run browser tests (if available)

# E2E tests (Playwright)
# pnpm run test:e2e                    # Run end-to-end tests
```

**Pre-Commit Hook (Husky)**: Automatically runs `lint-staged` which formats TypeScript and C++ files.

### Common Fixes

```
// Fix "any" types
// ❌ function foo(x: any)
// ✅ function foo(x: unknown)

// Fix unhandled promises
// ❌ apiCall()
// ✅ await apiCall()

// Fix missing assertions
// ❌ it('test', () => { doThing() })
// ✅ it('test', () => { expect(doThing()).toBe(true) })
```

---

**Last Updated**: 2025-10-18 (v2.0)
**Next Review**: 2025-11-18 (Monthly review during Phase 0.5)

---

## References

This document is part of the Toubkal Browser documentation suite:

- **[Product Roadmap](docs/PRODUCT-ROADMAP.md)** - 28-week timeline (v2.0 with Phase 0.5)
- **[Phase 0.5 Checklist](docs/PHASE-0.5-CHECKLIST.md)** - Implementation checklist (Weeks 1-4)
- **[PRD](docs/TOUBKAL-PRD.md)** - Product requirements and technical specifications
- **[Architecture Overview](docs/architecture/ARCHITECTURE-OVERVIEW.md)** - System architecture and design
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to Toubkal (updated timeline)
- **[Code Style Guide](docs/contributing/code-style.md)** - Language-specific patterns (deep dive)
- **[Testing Strategy](docs/contributing/testing-strategy.md)** - Comprehensive testing guide
- **[Build Instructions](docs/contributing/build-instructions.md)** - Chromium build system setup (Phase 1+)
- **[Security Policy](docs/SECURITY.md)** - Security features and vulnerability reporting

---

## Revision History

| Version | Date       | Changes                                                              | Author        |
| ------- | ---------- | -------------------------------------------------------------------- | ------------- |
| 1.0     | 2025-10-18 | Initial coding rules (TypeScript/React + basic C++ Chromium rules)   | Ilyass Motya  |
| 2.0     | 2025-10-18 | Added Phase 0.5 rules (Cryptography, Rust FFI, LevelDB, Performance) | Hassan (BMAD) |

---

**Questions?** Email: dev@toubkal.app
