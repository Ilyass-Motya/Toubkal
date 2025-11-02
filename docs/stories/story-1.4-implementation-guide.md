# Story 1.4 Implementation Guide
## Privacy Defaults (Fingerprinting + Tracker Blocking)

**Date:** 2025-10-20
**Status:** Ready for Implementation
**Estimated Effort:** 4 days
**Priority:** P0 (Foundation)

---

## Quick Start

```powershell
# 1. Navigate to Chromium source
cd C:\chromium\src

# 2. Create Toubkal directory structure
mkdir toubkal\components\privacy\fingerprinting

# 3. Follow Day 1-4 implementation steps below
```

---

## Implementation Timeline

### **Day 1: Canvas Randomization + Setup** (8 hours)

#### Morning: Project Setup (4 hours)
- [x] Read Story 1.4 requirements
- [x] Read build preparation guide
- [ ] Create `toubkal\` directory structure
- [ ] Create initial BUILD.gn files
- [ ] Verify build system integration

#### Afternoon: Canvas Randomization (4 hours)
- [ ] Create `canvas_randomizer.h` and `canvas_randomizer.cc`
- [ ] Implement `RandomizeCanvasData()` method
- [ ] Integrate with Blink rendering engine
- [ ] Write unit tests (`canvas_randomizer_unittest.cc`)
- [ ] Build and test: `ninja fingerprinting_unittests`

---

### **Day 2: WebRTC + User-Agent Protection** (8 hours)

#### Morning: WebRTC IP Protection (4 hours)
- [ ] Create `webrtc_ip_protection.h` and `webrtc_ip_protection.cc`
- [ ] Implement local IP leak prevention
- [ ] Integrate with Chromium WebRTC stack
- [ ] Write unit tests (`webrtc_ip_protection_unittest.cc`)
- [ ] Build and test

#### Afternoon: User-Agent Normalization (4 hours)
- [ ] Create `user_agent_normalizer.h` and `user_agent_normalizer.cc`
- [ ] Implement UA string normalization
- [ ] Integrate with Chromium network stack
- [ ] Write unit tests (`user_agent_normalizer_unittest.cc`)
- [ ] Build and test all fingerprinting components

---

### **Day 3: Privacy Settings UI + Integration** (8 hours)

#### Morning: React Privacy Settings (4 hours)
- [ ] Create `PrivacySettings.tsx` component
- [ ] Implement "Protection: Enabled" status display
- [ ] Add opt-out functionality with warnings
- [ ] Create visual indicators (shield icon, status badge)
- [ ] Write Vitest unit tests (`PrivacySettings.test.tsx`)

#### Afternoon: Mojo IPC Integration (4 hours)
- [ ] Define `.mojom` interface for privacy settings
- [ ] Create C++ → TypeScript IPC bridge
- [ ] Implement settings sync between C++ and UI
- [ ] Test IPC communication
- [ ] Integration test for settings flow

---

### **Day 4: Audit Logging + Testing** (8 hours)

#### Morning: Audit Logging (4 hours)
- [ ] Create `audit_logger.h` and `audit_logger.cc`
- [ ] Integrate with Phase 0.5.1 (BoringSSL Ed25519)
- [ ] Log privacy setting changes
- [ ] Add signature verification
- [ ] Write unit tests (`audit_logger_unittest.cc`)

#### Afternoon: Final Testing & Validation (4 hours)
- [ ] Run full test suite (unit + integration + E2E)
- [ ] Verify ≥80% test coverage
- [ ] Run Panopticlick fingerprinting tests
- [ ] Measure activation time (<2 seconds target)
- [ ] Code review preparation
- [ ] Create pull request

---

## Detailed Implementation Steps

### Step 1: Create Directory Structure

```powershell
cd C:\chromium\src

# Create Toubkal root
mkdir toubkal
cd toubkal

# Create component directories
mkdir components
mkdir components\privacy
mkdir components\privacy\fingerprinting
mkdir components\privacy\shields
mkdir components\privacy\audit
mkdir browser
mkdir app
mkdir tests
```

**Verify structure:**
```powershell
tree /F toubkal
```

---

## Step 2: Create Root BUILD.gn

**File:** `C:\chromium\src\toubkal\BUILD.gn`

```gn
# Toubkal Browser - Root Build File

import("//build/config/features.gni")

group("toubkal") {
  deps = [
    "//toubkal/components",
  ]
}

group("toubkal_tests") {
  testonly = true
  deps = [
    "//toubkal/tests",
  ]
}
```

---

## Step 3: Create Privacy BUILD.gn

**File:** `C:\chromium\src\toubkal\components\privacy\BUILD.gn`

```gn
# Toubkal Privacy Components

import("//build/config/features.gni")

component("privacy") {
  sources = []

  deps = [
    "//base",
    "//content/public/browser",
  ]

  public_deps = [
    "//toubkal/components/privacy/fingerprinting",
    "//toubkal/components/privacy/audit",
  ]
}
```

---

## Step 4: Create Fingerprinting BUILD.gn

**File:** `C:\chromium\src\toubkal\components\privacy\fingerprinting\BUILD.gn`

```gn
# Fingerprinting Protection

import("//build/config/features.gni")

source_set("fingerprinting") {
  sources = [
    "canvas_randomizer.h",
    "canvas_randomizer.cc",
    "webrtc_ip_protection.h",
    "webrtc_ip_protection.cc",
    "user_agent_normalizer.h",
    "user_agent_normalizer.cc",
  ]

  deps = [
    "//base",
    "//content/public/browser",
    "//third_party/blink/public:blink",
  ]
}

source_set("fingerprinting_unittests") {
  testonly = true

  sources = [
    "canvas_randomizer_unittest.cc",
    "webrtc_ip_protection_unittest.cc",
    "user_agent_normalizer_unittest.cc",
  ]

  deps = [
    ":fingerprinting",
    "//base/test:test_support",
    "//testing/gtest",
  ]
}
```

---

## Step 5: Implement Canvas Randomizer

### Header File

**File:** `C:\chromium\src\toubkal\components\privacy\fingerprinting\canvas_randomizer.h`

```cpp
// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by an MPL 2.0 license.

#ifndef TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_CANVAS_RANDOMIZER_H_
#define TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_CANVAS_RANDOMIZER_H_

#include <string>
#include "base/memory/singleton.h"

namespace toubkal {
namespace privacy {

// CanvasRandomizer provides fingerprinting protection by randomizing
// Canvas API outputs to prevent canvas fingerprinting attacks.
//
// Usage:
//   CanvasRandomizer* randomizer = CanvasRandomizer::GetInstance();
//   randomizer->RandomizeCanvasData(&canvas_data);
class CanvasRandomizer {
 public:
  static CanvasRandomizer* GetInstance();

  // Randomize canvas data for fingerprinting protection.
  // Adds subtle noise to prevent fingerprinting while maintaining
  // visual integrity.
  void RandomizeCanvasData(std::string* canvas_data);

  // Enable/disable canvas randomization.
  // Default: enabled (privacy-first)
  void SetEnabled(bool enabled);
  bool IsEnabled() const;

 private:
  friend struct base::DefaultSingletonTraits<CanvasRandomizer>;

  CanvasRandomizer();
  ~CanvasRandomizer();

  CanvasRandomizer(const CanvasRandomizer&) = delete;
  CanvasRandomizer& operator=(const CanvasRandomizer&) = delete;

  bool enabled_ = true;  // Enabled by default for privacy
};

}  // namespace privacy
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_CANVAS_RANDOMIZER_H_
```

#### Implementation File

**File:** `C:\chromium\src\toubkal\components\privacy\fingerprinting\canvas_randomizer.cc`

```cpp
// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by an MPL 2.0 license.

#include "toubkal/components/privacy/fingerprinting/canvas_randomizer.h"

#include "base/rand_util.h"
#include "base/logging.h"

namespace toubkal {
namespace privacy {

// static
CanvasRandomizer* CanvasRandomizer::GetInstance() {
  return base::Singleton<CanvasRandomizer>::get();
}

CanvasRandomizer::CanvasRandomizer() = default;
CanvasRandomizer::~CanvasRandomizer() = default;

void CanvasRandomizer::RandomizeCanvasData(std::string* canvas_data) {
  if (!enabled_ || !canvas_data || canvas_data->empty()) {
    return;
  }

  // Add subtle randomization to prevent fingerprinting
  // while maintaining visual integrity.
  // Strategy: Randomize last 1% of pixels with subtle noise.
  const size_t data_length = canvas_data->length();
  if (data_length > 0) {
    const size_t randomize_count = std::max(data_length / 100, size_t{1});

    for (size_t i = 0; i < randomize_count; ++i) {
      const size_t index = data_length - 1 - i;
      // XOR with small random value (0-15) for subtle noise
      (*canvas_data)[index] ^= base::RandInt(0, 15);
    }

    VLOG(1) << "Canvas data randomized: " << randomize_count
            << " pixels modified for fingerprinting protection";
  }
}

void CanvasRandomizer::SetEnabled(bool enabled) {
  if (enabled_ != enabled) {
    enabled_ = enabled;
    LOG(INFO) << "Canvas randomization "
              << (enabled ? "enabled" : "disabled");
  }
}

bool CanvasRandomizer::IsEnabled() const {
  return enabled_;
}

}  // namespace privacy
}  // namespace toubkal
```

#### Unit Test File

**File:** `C:\chromium\src\toubkal\components\privacy\fingerprinting\canvas_randomizer_unittest.cc`

```cpp
// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by an MPL 2.0 license.

#include "toubkal/components/privacy/fingerprinting/canvas_randomizer.h"

#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {
namespace privacy {

class CanvasRandomizerTest : public testing::Test {
 protected:
  CanvasRandomizerTest() {
    randomizer_ = CanvasRandomizer::GetInstance();
  }

  CanvasRandomizer* randomizer_;
};

TEST_F(CanvasRandomizerTest, EnabledByDefault) {
  EXPECT_TRUE(randomizer_->IsEnabled());
}

TEST_F(CanvasRandomizerTest, CanBeDisabled) {
  randomizer_->SetEnabled(false);
  EXPECT_FALSE(randomizer_->IsEnabled());

  randomizer_->SetEnabled(true);
  EXPECT_TRUE(randomizer_->IsEnabled());
}

TEST_F(CanvasRandomizerTest, RandomizesCanvasData) {
  std::string original_data(1000, 'A');  // 1000 bytes of 'A'
  std::string randomized_data = original_data;

  randomizer_->SetEnabled(true);
  randomizer_->RandomizeCanvasData(&randomized_data);

  // Data should be modified
  EXPECT_NE(original_data, randomized_data);

  // But only subtly (last 1% = 10 bytes)
  size_t diff_count = 0;
  for (size_t i = 0; i < original_data.length(); ++i) {
    if (original_data[i] != randomized_data[i]) {
      diff_count++;
    }
  }

  EXPECT_GE(diff_count, 1u);   // At least 1 byte different
  EXPECT_LE(diff_count, 20u);  // At most 20 bytes different (generous margin)
}

TEST_F(CanvasRandomizerTest, DoesNotRandomizeWhenDisabled) {
  std::string original_data(1000, 'A');
  std::string data = original_data;

  randomizer_->SetEnabled(false);
  randomizer_->RandomizeCanvasData(&data);

  // Data should be unchanged
  EXPECT_EQ(original_data, data);
}

TEST_F(CanvasRandomizerTest, HandlesEmptyData) {
  std::string empty_data;

  randomizer_->SetEnabled(true);
  randomizer_->RandomizeCanvasData(&empty_data);

  // Should not crash and data should remain empty
  EXPECT_TRUE(empty_data.empty());
}

TEST_F(CanvasRandomizerTest, HandlesNullPointer) {
  randomizer_->SetEnabled(true);
  randomizer_->RandomizeCanvasData(nullptr);

  // Should not crash
  SUCCEED();
}

}  // namespace privacy
}  // namespace toubkal
```

---

### Step 6: Build and Test

```powershell
cd C:\chromium\src

# Generate build files
.\buildtools\win\gn.exe gen out\Toubkal --args="is_debug=true is_component_build=true"

# Build fingerprinting component
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal/components/privacy/fingerprinting:fingerprinting

# Build and run tests
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal/components/privacy/fingerprinting:fingerprinting_unittests
.\out\Toubkal\fingerprinting_unittests.exe
```

**Expected Output:**
```
[==========] Running 6 tests from 1 test suite.
[----------] 6 tests from CanvasRandomizerTest
[ RUN      ] CanvasRandomizerTest.EnabledByDefault
[       OK ] CanvasRandomizerTest.EnabledByDefault (0 ms)
[ RUN      ] CanvasRandomizerTest.CanBeDisabled
[       OK ] CanvasRandomizerTest.CanBeDisabled (0 ms)
[ RUN      ] CanvasRandomizerTest.RandomizesCanvasData
[       OK ] CanvasRandomizerTest.RandomizesCanvasData (1 ms)
[ RUN      ] CanvasRandomizerTest.DoesNotRandomizeWhenDisabled
[       OK ] CanvasRandomizerTest.DoesNotRandomizeWhenDisabled (0 ms)
[ RUN      ] CanvasRandomizerTest.HandlesEmptyData
[       OK ] CanvasRandomizerTest.HandlesEmptyData (0 ms)
[ RUN      ] CanvasRandomizerTest.HandlesNullPointer
[       OK ] CanvasRandomizerTest.HandlesNullPointer (0 ms)
[----------] 6 tests from CanvasRandomizerTest (1 ms total)
[==========] 6 tests from 1 test suite ran. (1 ms total)
[  PASSED  ] 6 tests.
```

---

## WebRTC IP Protection (Day 2 Morning)

### Header File Template

**File:** `C:\chromium\src\toubkal\components\privacy\fingerprinting\webrtc_ip_protection.h`

```cpp
// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by an MPL 2.0 license.

#ifndef TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_WEBRTC_IP_PROTECTION_H_
#define TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_WEBRTC_IP_PROTECTION_H_

#include <string>
#include "base/memory/singleton.h"

namespace toubkal {
namespace privacy {

// WebRTCIPProtection prevents local IP address leaks through WebRTC.
// Blocks mDNS and local IP exposure in ICE candidates.
class WebRTCIPProtection {
 public:
  static WebRTCIPProtection* GetInstance();

  // Filter ICE candidate to remove local IPs
  bool ShouldFilterICECandidate(const std::string& candidate);

  // Enable/disable WebRTC IP protection
  void SetEnabled(bool enabled);
  bool IsEnabled() const;

 private:
  friend struct base::DefaultSingletonTraits<WebRTCIPProtection>;

  WebRTCIPProtection();
  ~WebRTCIPProtection();

  bool enabled_ = true;  // Enabled by default
};

}  // namespace privacy
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_WEBRTC_IP_PROTECTION_H_
```

**Implementation and tests follow similar pattern to Canvas Randomizer.**

---

## User-Agent Normalization (Day 2 Afternoon)

### Header File Template

**File:** `C:\chromium\src\toubkal\components\privacy\fingerprinting\user_agent_normalizer.h`

```cpp
// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by an MPL 2.0 license.

#ifndef TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_USER_AGENT_NORMALIZER_H_
#define TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_USER_AGENT_NORMALIZER_H_

#include <string>
#include "base/memory/singleton.h"

namespace toubkal {
namespace privacy {

// UserAgentNormalizer provides consistent User-Agent strings
// to prevent UA-based fingerprinting.
class UserAgentNormalizer {
 public:
  static UserAgentNormalizer* GetInstance();

  // Normalize User-Agent string for privacy
  std::string NormalizeUserAgent(const std::string& original_ua);

  // Enable/disable UA normalization
  void SetEnabled(bool enabled);
  bool IsEnabled() const;

 private:
  friend struct base::DefaultSingletonTraits<UserAgentNormalizer>;

  UserAgentNormalizer();
  ~UserAgentNormalizer();

  bool enabled_ = true;
};

}  // namespace privacy
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_USER_AGENT_NORMALIZER_H_
```

---

## Success Criteria Checklist

### Acceptance Criteria (from Story 1.4)

- [ ] **AC1:** Fingerprinting protection enabled by default
  - [ ] Canvas randomization working
  - [ ] WebRTC IP leak prevention working
  - [ ] User-Agent normalization working

- [ ] **AC2:** Tracker blocking enabled by default
  - [ ] EasyList filters loaded
  - [ ] uBlock Origin filters loaded
  - [ ] adblock-rust integration working

- [ ] **AC3:** Privacy settings UI shows "Protection: Enabled"
  - [ ] React component created
  - [ ] Status displayed correctly

- [ ] **AC4:** User can opt-out with warnings
  - [ ] Opt-out toggle implemented
  - [ ] Warning dialog shown

- [ ] **AC5:** Audit log entries for settings changes
  - [ ] Ed25519 signatures working
  - [ ] Logs persisted to LevelDB

- [ ] **AC6:** Integration with Phase 0.5 ad blocking
  - [ ] adblock-rust FFI working
  - [ ] Filters loaded correctly

- [ ] **AC7:** First-run completes in <10 seconds
  - [ ] Measured and verified

- [ ] **AC8:** Protection activation <2 seconds
  - [ ] Measured and verified

- [ ] **AC9:** Panopticlick tests pass (>12 bits entropy reduction)
  - [ ] Run Panopticlick tests
  - [ ] Verify entropy reduction

- [ ] **AC10:** Test coverage ≥80%
  - [ ] Measure coverage
  - [ ] Add tests if needed

- [ ] **AC11:** TypeScript strict mode (no `any`)
  - [ ] Run type checker
  - [ ] Fix any `any` types

- [ ] **AC12:** Result<T> pattern for errors
  - [ ] Review error handling
  - [ ] Convert to Result<T>

- [ ] **AC13:** Code review approved
  - [ ] Create PR
  - [ ] Address review comments

---

## Resources

### Documentation
- **Story 1.4:** `docs/stories/phase1-week1-2/story-1.4.md`
- **Build Prep:** `docs/TOUBKAL-BUILD-PREPARATION.md`
- **Chromium Build:** `docs/CHROMIUM-BUILD-REFERENCE.md`

### Code Examples
- **Brave Farbling:** https://github.com/brave/brave-core/blob/master/chromium_src/third_party/blink/renderer/core/html/canvas/canvas_rendering_context.cc
- **Brave Shields:** https://github.com/brave/brave-core/tree/master/components/brave_shields

### Testing
- **Google Test:** https://google.github.io/googletest/
- **Chromium Testing:** https://chromium.googlesource.com/chromium/src/+/main/docs/testing/

---

**Implementation Status:** Ready to Begin
**Next Step:** Create `toubkal\` directory structure
**Target Completion:** 4 days from start
