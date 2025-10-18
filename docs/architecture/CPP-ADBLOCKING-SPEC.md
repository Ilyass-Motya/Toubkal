# C++ Ad Blocking Architecture Specification

**Version**: 1.0
**Status**: Active Development
**Phase**: Phase 0.5 (Weeks 3-4)
**Last Updated**: 2025-10-18
**Owner**: Ilyass Motya

---

## 📋 **Document Overview**

This document specifies the C++ architecture for **Ad Blocking MVP** (Phase 0.5, Weeks 3-4), which integrates Brave's adblock-rust library for network-level ad and tracker blocking.

**Scope**:
- ✅ Brave's adblock-rust integration (Rust FFI)
- ✅ EasyList + uBlock Origin filter loading
- ✅ CNAME uncloaking (aggressive mode)
- ✅ Audit logging integration
- ❌ Browser UI integration (Phase 1)
- ❌ Chromium network service hooks (Phase 1)

---

## 🏗️ **Component Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                  Ad Blocking Components                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────┐      ┌─────────────────────────┐         │
│  │AdBlockingService  │──────│  AdBlockEngine          │         │
│  │(C++ Public API)   │      │  (Rust FFI Wrapper)     │         │
│  └─────────┬─────────┘      └──────────┬──────────────┘         │
│            │                            │                        │
│            │                            │ FFI Calls              │
│            │                            ▼                        │
│            │                   ┌─────────────────┐               │
│            │                   │  adblock-rust   │               │
│            │                   │  (Rust Library) │               │
│            │                   └─────────────────┘               │
│            │                                                     │
│  ┌─────────▼─────────┐                                          │
│  │  FilterManager    │                                          │
│  │  (EasyList/uBlock)│                                          │
│  └─────────┬─────────┘                                          │
│            │                                                     │
│            │  Filter Lists                                       │
│            ▼                                                     │
│  ┌───────────────────┐      ┌─────────────────────────┐         │
│  │  FilterDownloader │──────│  FilterVerifier         │         │
│  │  (HTTPS Download) │      │  (SHA-256 Checksum)     │         │
│  └───────────────────┘      └─────────────────────────┘         │
│                                                                   │
│  ┌────────────────────────────────────────────────┐              │
│  │  CNAMEResolver (Async DNS Uncloaking)          │              │
│  └────────────────────────────────────────────────┘              │
│                                                                   │
│  ┌────────────────────────────────────────────────┐              │
│  │  AuditLogger Integration                       │              │
│  │  (Log all blocked requests with Ed25519)       │              │
│  └────────────────────────────────────────────────┘              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 **Component Specifications**

### 1. **AdBlockingService** (C++ Public API)

**Purpose**: C++ public API for ad blocking operations, wraps Rust adblock-rust engine.

**Location**: `src/toubkal/components/privacy/ad_blocking/ad_blocking_service.{h,cc}`

#### Class Definition

```cpp
// ad_blocking_service.h
#pragma once

#include <memory>
#include <string>

#include "base/callback.h"
#include "base/memory/weak_ptr.h"
#include "url/gurl.h"

namespace toubkal {
namespace privacy {

class AdBlockEngine;
class AuditLogger;
class FilterManager;

// Represents a blocking decision
struct BlockDecision {
  bool should_block;
  std::string reason;          // Filter rule that matched
  std::string filter_list;     // "EasyList", "uBlock Origin", etc.
  bool cname_uncloaked;        // True if blocked via CNAME uncloaking
  std::string cname_target;    // CNAME target (if uncloaked)
};

class AdBlockingService {
 public:
  AdBlockingService();
  ~AdBlockingService();

  // Initialize ad blocking service (loads filters)
  bool Initialize(AuditLogger* audit_logger);

  // Check if request should be blocked
  // Returns: BlockDecision with blocking verdict + reason
  BlockDecision ShouldBlockRequest(const GURL& url,
                                    const std::string& resource_type);

  // Reload filter lists (e.g., after update)
  bool ReloadFilters();

  // Get statistics
  uint64_t GetBlockedRequestCount() const;
  uint64_t GetTotalRequestCount() const;
  double GetBlockRate() const;  // Percentage of blocked requests

  // For testing: Disable ad blocking
  void DisableForTesting();

 private:
  // Check URL against adblock-rust engine
  bool CheckEngine(const GURL& url, const std::string& resource_type);

  // Resolve CNAME asynchronously
  void ResolveCNAMEAsync(const GURL& url,
                         base::OnceCallback<void(const std::string&)> callback);

  // Callback for CNAME resolution
  void OnCNAMEResolved(const GURL& original_url,
                       const std::string& cname_target);

  // Log blocked request to audit trail
  void LogBlockedRequest(const GURL& url,
                         const BlockDecision& decision);

  std::unique_ptr<AdBlockEngine> engine_;
  std::unique_ptr<FilterManager> filter_manager_;
  AuditLogger* audit_logger_ = nullptr;  // Non-owning pointer

  uint64_t blocked_count_ = 0;
  uint64_t total_count_ = 0;

  bool initialized_ = false;
  bool disabled_for_testing_ = false;

  base::WeakPtrFactory<AdBlockingService> weak_factory_{this};
};

}  // namespace privacy
}  // namespace toubkal
```

#### Implementation

```cpp
// ad_blocking_service.cc
#include "toubkal/components/privacy/ad_blocking/ad_blocking_service.h"

#include "base/logging.h"
#include "base/metrics/histogram_macros.h"
#include "base/timer/elapsed_timer.h"
#include "toubkal/components/privacy/ad_blocking/ad_block_engine.h"
#include "toubkal/components/privacy/ad_blocking/filter_manager.h"
#include "toubkal/components/privacy/audit/audit_logger.h"

namespace toubkal {
namespace privacy {

AdBlockingService::AdBlockingService() = default;
AdBlockingService::~AdBlockingService() = default;

bool AdBlockingService::Initialize(AuditLogger* audit_logger) {
  DCHECK(audit_logger);
  audit_logger_ = audit_logger;

  // Initialize adblock-rust engine
  engine_ = std::make_unique<AdBlockEngine>();
  if (!engine_->Initialize()) {
    LOG(ERROR) << "Failed to initialize AdBlockEngine";
    return false;
  }

  // Initialize filter manager
  filter_manager_ = std::make_unique<FilterManager>();
  if (!filter_manager_->Initialize(engine_.get())) {
    LOG(ERROR) << "Failed to initialize FilterManager";
    return false;
  }

  initialized_ = true;
  LOG(INFO) << "AdBlockingService initialized successfully";
  return true;
}

BlockDecision AdBlockingService::ShouldBlockRequest(
    const GURL& url,
    const std::string& resource_type) {
  if (!initialized_ || disabled_for_testing_) {
    return {false, "", "", false, ""};
  }

  base::ElapsedTimer timer;
  total_count_++;

  BlockDecision decision;
  decision.should_block = CheckEngine(url, resource_type);

  if (decision.should_block) {
    decision.reason = engine_->GetBlockReason();
    decision.filter_list = engine_->GetFilterList();
    blocked_count_++;

    // Log to audit trail
    LogBlockedRequest(url, decision);
  } else {
    // CNAME uncloaking (async, queued for background resolution)
    ResolveCNAMEAsync(url, base::BindOnce(&AdBlockingService::OnCNAMEResolved,
                                           weak_factory_.GetWeakPtr(),
                                           url));
  }

  // Performance tracking
  base::TimeDelta elapsed = timer.Elapsed();
  UMA_HISTOGRAM_TIMES("Toubkal.AdBlocking.Latency", elapsed);

  if (elapsed > base::Milliseconds(5)) {
    LOG(WARNING) << "Ad blocking exceeded 5ms budget: "
                 << elapsed.InMilliseconds() << "ms for " << url.spec();
  }

  return decision;
}

bool AdBlockingService::CheckEngine(const GURL& url,
                                     const std::string& resource_type) {
  return engine_->ShouldBlock(url.spec(), resource_type);
}

void AdBlockingService::ResolveCNAMEAsync(
    const GURL& url,
    base::OnceCallback<void(const std::string&)> callback) {
  // TODO: Implement async CNAME resolution (Phase 1)
  // For Phase 0.5, this is a stub
}

void AdBlockingService::OnCNAMEResolved(const GURL& original_url,
                                         const std::string& cname_target) {
  // Check CNAME target against filters
  if (engine_->ShouldBlock(cname_target, "cname")) {
    BlockDecision decision;
    decision.should_block = true;
    decision.reason = engine_->GetBlockReason();
    decision.filter_list = engine_->GetFilterList();
    decision.cname_uncloaked = true;
    decision.cname_target = cname_target;

    blocked_count_++;
    LogBlockedRequest(original_url, decision);

    LOG(INFO) << "CNAME uncloaking blocked: " << original_url.spec()
              << " -> " << cname_target;
  }
}

void AdBlockingService::LogBlockedRequest(const GURL& url,
                                           const BlockDecision& decision) {
  if (!audit_logger_) return;

  AuditEntry entry;
  entry.timestamp = base::Time::Now().ToISO8601String();
  entry.operation_type = "ad_blocking";
  entry.resource_url = url.spec();
  entry.action = "block";

  // Metadata (JSON)
  base::Value::Dict metadata;
  metadata.Set("reason", decision.reason);
  metadata.Set("filter_list", decision.filter_list);
  metadata.Set("cname_uncloaked", decision.cname_uncloaked);
  if (!decision.cname_target.empty()) {
    metadata.Set("cname_target", decision.cname_target);
  }

  std::string metadata_json;
  base::JSONWriter::Write(base::Value(std::move(metadata)), &metadata_json);
  entry.metadata_json = metadata_json;

  // Log to audit trail (Ed25519 signed, added to Merkle tree)
  audit_logger_->LogEntry(entry);
}

bool AdBlockingService::ReloadFilters() {
  return filter_manager_->ReloadFilters();
}

uint64_t AdBlockingService::GetBlockedRequestCount() const {
  return blocked_count_;
}

uint64_t AdBlockingService::GetTotalRequestCount() const {
  return total_count_;
}

double AdBlockingService::GetBlockRate() const {
  if (total_count_ == 0) return 0.0;
  return static_cast<double>(blocked_count_) / total_count_ * 100.0;
}

void AdBlockingService::DisableForTesting() {
  disabled_for_testing_ = true;
}

}  // namespace privacy
}  // namespace toubkal
```

---

### 2. **AdBlockEngine** (Rust FFI Wrapper)

**Purpose**: C++ RAII wrapper for Rust adblock-rust library.

**Location**: `src/toubkal/components/privacy/ad_blocking/ad_block_engine.{h,cc}`

#### Class Definition

```cpp
// ad_block_engine.h
#pragma once

#include <memory>
#include <string>

// Forward declare Rust FFI types
extern "C" {
struct AdBlockEngineOpaque;

// Rust FFI functions
AdBlockEngineOpaque* adblock_engine_create();
void adblock_engine_destroy(AdBlockEngineOpaque* engine);
bool adblock_engine_check(AdBlockEngineOpaque* engine,
                          const char* url,
                          const char* resource_type);
const char* adblock_engine_get_reason(AdBlockEngineOpaque* engine);
const char* adblock_engine_get_filter_list(AdBlockEngineOpaque* engine);
int adblock_engine_load_filters(AdBlockEngineOpaque* engine,
                                const char* filter_content);
void adblock_free_string(const char* str);
}

namespace toubkal {
namespace privacy {

class AdBlockEngine {
 public:
  AdBlockEngine();
  ~AdBlockEngine();

  // Delete copy/move constructors (non-copyable resource)
  AdBlockEngine(const AdBlockEngine&) = delete;
  AdBlockEngine& operator=(const AdBlockEngine&) = delete;
  AdBlockEngine(AdBlockEngine&&) = delete;
  AdBlockEngine& operator=(AdBlockEngine&&) = delete;

  // Initialize engine
  bool Initialize();

  // Check if URL should be blocked
  bool ShouldBlock(const std::string& url, const std::string& resource_type);

  // Get reason for last block decision
  std::string GetBlockReason();

  // Get filter list name for last block decision
  std::string GetFilterList();

  // Load filter list content
  bool LoadFilters(const std::string& filter_content);

 private:
  // Convert Rust string to C++ string (frees Rust string)
  std::string RustStringToCpp(const char* rust_str);

  AdBlockEngineOpaque* engine_ = nullptr;  // Opaque Rust pointer
};

}  // namespace privacy
}  // namespace toubkal
```

#### Implementation

```cpp
// ad_block_engine.cc
#include "toubkal/components/privacy/ad_blocking/ad_block_engine.h"

#include "base/logging.h"

namespace toubkal {
namespace privacy {

AdBlockEngine::AdBlockEngine() = default;

AdBlockEngine::~AdBlockEngine() {
  if (engine_) {
    adblock_engine_destroy(engine_);
    engine_ = nullptr;
  }
}

bool AdBlockEngine::Initialize() {
  engine_ = adblock_engine_create();
  if (!engine_) {
    LOG(ERROR) << "Failed to create adblock-rust engine";
    return false;
  }

  LOG(INFO) << "AdBlockEngine initialized successfully";
  return true;
}

bool AdBlockEngine::ShouldBlock(const std::string& url,
                                 const std::string& resource_type) {
  if (!engine_) {
    LOG(ERROR) << "AdBlockEngine not initialized";
    return false;
  }

  return adblock_engine_check(engine_, url.c_str(), resource_type.c_str());
}

std::string AdBlockEngine::GetBlockReason() {
  if (!engine_) return "";

  const char* rust_reason = adblock_engine_get_reason(engine_);
  return RustStringToCpp(rust_reason);
}

std::string AdBlockEngine::GetFilterList() {
  if (!engine_) return "";

  const char* rust_list = adblock_engine_get_filter_list(engine_);
  return RustStringToCpp(rust_list);
}

bool AdBlockEngine::LoadFilters(const std::string& filter_content) {
  if (!engine_) {
    LOG(ERROR) << "AdBlockEngine not initialized";
    return false;
  }

  int result = adblock_engine_load_filters(engine_, filter_content.c_str());
  if (result != 0) {
    LOG(ERROR) << "Failed to load filters, error code: " << result;
    return false;
  }

  return true;
}

std::string AdBlockEngine::RustStringToCpp(const char* rust_str) {
  if (!rust_str) {
    LOG(WARNING) << "Null Rust string, returning empty";
    return "";
  }

  std::string result(rust_str);
  adblock_free_string(rust_str);  // Free Rust-allocated string
  return result;
}

}  // namespace privacy
}  // namespace toubkal
```

---

### 3. **FilterManager** (EasyList + uBlock Origin)

**Purpose**: Download, verify, and manage ad/tracker filter lists.

**Location**: `src/toubkal/components/privacy/ad_blocking/filter_manager.{h,cc}`

#### Class Definition

```cpp
// filter_manager.h
#pragma once

#include <memory>
#include <string>
#include <vector>

#include "base/callback.h"
#include "base/files/file_path.h"
#include "base/memory/weak_ptr.h"

namespace toubkal {
namespace privacy {

class AdBlockEngine;

struct FilterList {
  std::string name;              // "EasyList", "uBlock Origin", etc.
  std::string url;               // HTTPS download URL
  std::string checksum_sha256;   // Expected SHA-256 checksum
  std::string content;           // Downloaded filter content
  base::Time last_updated;       // Last download time
};

class FilterManager {
 public:
  FilterManager();
  ~FilterManager();

  // Initialize (download and load filters)
  bool Initialize(AdBlockEngine* engine);

  // Reload filters (re-download and update)
  bool ReloadFilters();

  // Get filter lists
  const std::vector<FilterList>& GetFilterLists() const;

 private:
  // Download filter list via HTTPS
  bool DownloadFilterList(FilterList* filter_list);

  // Verify SHA-256 checksum
  bool VerifyChecksum(const FilterList& filter_list);

  // Load filter list into engine
  bool LoadIntoEngine(const FilterList& filter_list);

  std::vector<FilterList> filter_lists_;
  AdBlockEngine* engine_ = nullptr;  // Non-owning pointer

  base::WeakPtrFactory<FilterManager> weak_factory_{this};
};

}  // namespace privacy
}  // namespace toubkal
```

#### Implementation

```cpp
// filter_manager.cc
#include "toubkal/components/privacy/ad_blocking/filter_manager.h"

#include "base/logging.h"
#include "base/strings/string_util.h"
#include "crypto/sha2.h"
#include "net/http/http_status_code.h"
#include "services/network/public/cpp/simple_url_loader.h"
#include "toubkal/components/privacy/ad_blocking/ad_block_engine.h"

namespace toubkal {
namespace privacy {

FilterManager::FilterManager() {
  // Initialize filter list metadata
  filter_lists_.push_back({
      .name = "EasyList",
      .url = "https://easylist.to/easylist/easylist.txt",
      .checksum_sha256 = "",  // TODO: Fetch from trusted source
  });

  filter_lists_.push_back({
      .name = "uBlock Origin - Filters",
      .url = "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt",
      .checksum_sha256 = "",  // TODO: Fetch from trusted source
  });

  filter_lists_.push_back({
      .name = "uBlock Origin - Privacy",
      .url = "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt",
      .checksum_sha256 = "",  // TODO: Fetch from trusted source
  });
}

FilterManager::~FilterManager() = default;

bool FilterManager::Initialize(AdBlockEngine* engine) {
  DCHECK(engine);
  engine_ = engine;

  // Download and load all filter lists
  for (auto& filter_list : filter_lists_) {
    LOG(INFO) << "Downloading filter list: " << filter_list.name;

    if (!DownloadFilterList(&filter_list)) {
      LOG(ERROR) << "Failed to download filter list: " << filter_list.name;
      continue;  // Continue with other lists
    }

    if (!VerifyChecksum(filter_list)) {
      LOG(ERROR) << "Checksum verification failed: " << filter_list.name;
      continue;
    }

    if (!LoadIntoEngine(filter_list)) {
      LOG(ERROR) << "Failed to load filter list: " << filter_list.name;
      continue;
    }

    filter_list.last_updated = base::Time::Now();
    LOG(INFO) << "Successfully loaded filter list: " << filter_list.name
              << " (" << filter_list.content.size() << " bytes)";
  }

  return true;
}

bool FilterManager::DownloadFilterList(FilterList* filter_list) {
  // TODO: Implement HTTPS download using Chromium's network service
  // For Phase 0.5, this is a stub
  LOG(WARNING) << "DownloadFilterList not implemented (Phase 0.5 stub)";
  return false;
}

bool FilterManager::VerifyChecksum(const FilterList& filter_list) {
  if (filter_list.checksum_sha256.empty()) {
    LOG(WARNING) << "No checksum provided for " << filter_list.name
                 << ", skipping verification";
    return true;  // Allow if checksum not provided (TODO: Make mandatory)
  }

  std::string computed_hash = crypto::SHA256HashString(filter_list.content);
  std::string computed_hex = base::HexEncode(computed_hash);

  if (!base::EqualsCaseInsensitiveASCII(computed_hex,
                                        filter_list.checksum_sha256)) {
    LOG(ERROR) << "Checksum mismatch for " << filter_list.name
               << "\nExpected: " << filter_list.checksum_sha256
               << "\nComputed: " << computed_hex;
    return false;
  }

  return true;
}

bool FilterManager::LoadIntoEngine(const FilterList& filter_list) {
  if (!engine_) {
    LOG(ERROR) << "Engine not initialized";
    return false;
  }

  return engine_->LoadFilters(filter_list.content);
}

bool FilterManager::ReloadFilters() {
  return Initialize(engine_);
}

const std::vector<FilterList>& FilterManager::GetFilterLists() const {
  return filter_lists_;
}

}  // namespace privacy
}  // namespace toubkal
```

---

## 🧪 **Testing Strategy**

### Unit Tests

```cpp
// ad_blocking_service_unittest.cc
class AdBlockingServiceTest : public testing::Test {
 protected:
  void SetUp() override {
    audit_logger_ = std::make_unique<AuditLogger>();
    audit_logger_->Initialize(temp_dir_.GetPath());

    ad_blocking_service_ = std::make_unique<AdBlockingService>();
    ad_blocking_service_->Initialize(audit_logger_.get());
  }

  std::unique_ptr<AuditLogger> audit_logger_;
  std::unique_ptr<AdBlockingService> ad_blocking_service_;
  base::ScopedTempDir temp_dir_;
};

TEST_F(AdBlockingServiceTest, BlocksKnownTrackerDomain) {
  GURL url("https://doubleclick.net/ad.js");
  auto decision = ad_blocking_service_->ShouldBlockRequest(url, "script");

  EXPECT_TRUE(decision.should_block);
  EXPECT_FALSE(decision.reason.empty());
  EXPECT_EQ(decision.filter_list, "EasyList");
}

TEST_F(AdBlockingServiceTest, AllowsLegitimateRequest) {
  GURL url("https://example.com/page.html");
  auto decision = ad_blocking_service_->ShouldBlockRequest(url, "document");

  EXPECT_FALSE(decision.should_block);
}

TEST_F(AdBlockingServiceTest, LogsBlockedRequestToAudit) {
  GURL url("https://ads.example.com/banner.js");
  ad_blocking_service_->ShouldBlockRequest(url, "script");

  // Verify audit log entry
  size_t entry_count = audit_logger_->GetEntryCount();
  EXPECT_GT(entry_count, 0);
}

TEST_F(AdBlockingServiceTest, PerformanceUnder5ms) {
  GURL url("https://example.com/test.js");

  base::ElapsedTimer timer;
  for (int i = 0; i < 1000; ++i) {
    ad_blocking_service_->ShouldBlockRequest(url, "script");
  }
  base::TimeDelta elapsed = timer.Elapsed();

  // Average latency should be < 5ms
  double avg_ms = elapsed.InMillisecondsF() / 1000.0;
  EXPECT_LT(avg_ms, 5.0) << "Average latency: " << avg_ms << "ms";
}
```

---

## 📊 **Performance Requirements**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Per-Request Latency** | <5ms p95 | `UMA_HISTOGRAM_TIMES` |
| **Blocking Accuracy** | 95%+ vs. Brave | Automated test suite (top 100 sites) |
| **YouTube Ad Blocking** | 90-95% | Manual testing (20+ videos) |
| **Filter Load Time** | <2s | Startup time measurement |
| **Memory Usage** | <20MB | Process memory tracking |
| **CNAME Resolution** | <200ms p95 | Async DNS timing |

---

## 🔒 **Security Requirements**

1. **Filter Integrity**: SHA-256 checksum verification for all downloaded filters
2. **HTTPS Only**: All filter downloads over HTTPS (no HTTP fallback)
3. **No Code Execution**: Filters are declarative (no JavaScript execution)
4. **Audit Logging**: All blocked requests logged with Ed25519 signatures
5. **Memory Safety**: Rust FFI wrappers use RAII (no memory leaks)

---

## 📁 **File Structure**

```
src/toubkal/components/privacy/ad_blocking/
├── ad_blocking_service.{h,cc}      # C++ public API
├── ad_blocking_service_unittest.cc  # Unit tests
├── ad_block_engine.{h,cc}          # Rust FFI wrapper
├── ad_block_engine_unittest.cc      # Unit tests
├── filter_manager.{h,cc}           # Filter list management
├── filter_manager_unittest.cc       # Unit tests
├── cname_resolver.{h,cc}           # CNAME uncloaking (Phase 1)
└── BUILD.gn                        # GN build configuration
```

---

**Last Updated**: 2025-10-18
**Status**: Phase 0.5 Active Development (Weeks 3-4)
