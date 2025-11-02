# Toubkal Browser Build Preparation Guide

**Date:** 2025-10-20
**Status:** Ready for Implementation
**Target:** Story 1.4 (Privacy Defaults) & Toubkal Browser Build

---

## Overview

This guide prepares you to build Toubkal Browser from the Chromium source tree. You'll create custom Chromium components for privacy features, integrate them into the build system, and compile your first Toubkal Browser binary.

**Prerequisites:**
- ✅ Chromium source at `C:\chromium\src\` (COMPLETE)
- ✅ GN and Ninja build tools verified (COMPLETE)
- ✅ Build system operational (4,175 files compiled successfully)

---

## Phase 1: Project Structure Setup

### 1.1 Create Toubkal Source Directory

The Toubkal Browser code lives inside the Chromium source tree at `src/toubkal/`:

```powershell
cd C:\chromium\src

# Create Toubkal root directory
mkdir toubkal
cd toubkal

# Create component directories (mirrors Brave's structure)
mkdir components
mkdir browser
mkdir app
mkdir mojo
mkdir tests
```

**Directory Structure:**
```
C:\chromium\src\toubkal\
├── components\          # Feature modules (C++)
│   ├── privacy\        # Privacy features (fingerprinting, shields)
│   ├── ai_platform\    # AI inference gateway
│   ├── mcp_integration\# MCP protocol support
│   └── transparency\   # Transparency dashboard backend
├── browser\            # Browser-level code (C++)
│   ├── ui\             # Browser UI customization
│   ├── profiles\       # User profiles
│   └── url\            # URL scheme (toubkal://)
├── app\                # React/TypeScript UI
│   ├── features\       # Feature-first organization
│   ├── shared\         # Shared React components
│   └── core\           # Core infrastructure
├── mojo\               # IPC interfaces
│   └── public\         # Public Mojo interfaces
└── tests\              # All tests
    ├── unit\           # Unit tests
    ├── integration\    # Integration tests
    └── e2e\            # End-to-end tests
```

---

## 1.2 Link ToubkalBrowser Repository

Your existing TypeScript/React code at `C:\ToubkalBrowser\` needs to be integrated:

```powershell
# Option A: Copy files to Chromium source tree
cd C:\chromium\src\toubkal
xcopy /E /I C:\ToubkalBrowser\src\* .\app\

# Option B: Create symbolic link (recommended for development)
cd C:\chromium\src\toubkal
mklink /D app C:\ToubkalBrowser\src
```

**Recommended:** Use Option B (symbolic link) during development, then copy for production builds.

---

## Phase 2: Story 1.4 - Privacy Defaults Setup

### 2.1 Create Privacy Component Structure

```powershell
cd C:\chromium\src\toubkal\components

# Create privacy component directories
mkdir privacy
cd privacy
mkdir fingerprinting
mkdir shields
mkdir audit
mkdir consent
```

**Structure:**
```
toubkal\components\privacy\
├── fingerprinting\         # Fingerprinting protection
│   ├── canvas_randomizer.h
│   ├── canvas_randomizer.cc
│   ├── webrtc_ip_protection.h
│   ├── webrtc_ip_protection.cc
│   ├── user_agent_normalizer.h
│   ├── user_agent_normalizer.cc
│   └── BUILD.gn
├── shields\                # Privacy shields (tracker blocking)
│   ├── shields_manager.h
│   ├── shields_manager.cc
│   ├── tracker_blocker.h
│   ├── tracker_blocker.cc
│   └── BUILD.gn
├── audit\                  # Audit logging
│   ├── audit_logger.h
│   ├── audit_logger.cc
│   └── BUILD.gn
└── BUILD.gn                # Privacy component build file
```

---

## 2.2 Create Initial BUILD.gn Files

### Root Toubkal BUILD.gn

Create `C:\chromium\src\toubkal\BUILD.gn`:

```gn
# Toubkal Browser - Root Build File
# This file defines the main Toubkal browser target

import("//build/config/features.gni")

group("toubkal") {
  deps = [
    "//toubkal/components",
    "//toubkal/browser",
  ]
}

group("toubkal_tests") {
  testonly = true
  deps = [
    "//toubkal/tests",
  ]
}
```

## Privacy Component BUILD.gn

Create `C:\chromium\src\toubkal\components\privacy\BUILD.gn`:

```gn
# Toubkal Privacy Components
# Fingerprinting protection, tracker blocking, audit logging

import("//build/config/features.gni")

# Privacy component library
component("privacy") {
  sources = [
    # Add source files as you create them
  ]

  deps = [
    "//base",
    "//content/public/browser",
  ]

  public_deps = [
    "//toubkal/components/privacy/fingerprinting",
    "//toubkal/components/privacy/shields",
    "//toubkal/components/privacy/audit",
  ]
}
```

## Fingerprinting BUILD.gn

Create `C:\chromium\src\toubkal\components\privacy\fingerprinting\BUILD.gn`:

```gn
# Fingerprinting Protection
# Canvas randomization, WebRTC IP protection, User-Agent normalization

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

## 2.3 Create Stub Implementation Files

### Canvas Randomizer Header

Create `C:\chromium\src\toubkal\components\privacy\fingerprinting\canvas_randomizer.h`:

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
class CanvasRandomizer {
 public:
  static CanvasRandomizer* GetInstance();

  // Randomize canvas data for fingerprinting protection
  void RandomizeCanvasData(std::string* canvas_data);

  // Enable/disable canvas randomization
  void SetEnabled(bool enabled);
  bool IsEnabled() const;

 private:
  friend struct base::DefaultSingletonTraits<CanvasRandomizer>;

  CanvasRandomizer();
  ~CanvasRandomizer();

  bool enabled_ = true;  // Enabled by default for privacy
};

}  // namespace privacy
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_PRIVACY_FINGERPRINTING_CANVAS_RANDOMIZER_H_
```

#### Canvas Randomizer Implementation

Create `C:\chromium\src\toubkal\components\privacy\fingerprinting\canvas_randomizer.cc`:

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
  // while maintaining visual integrity
  const size_t data_length = canvas_data->length();
  if (data_length > 0) {
    // Randomize last 1% of pixels (subtle but effective)
    const size_t randomize_count = std::max(data_length / 100, size_t{1});
    for (size_t i = 0; i < randomize_count; ++i) {
      const size_t index = data_length - 1 - i;
      (*canvas_data)[index] ^= base::RandInt(0, 15);
    }
  }

  LOG(INFO) << "Canvas data randomized for fingerprinting protection";
}

void CanvasRandomizer::SetEnabled(bool enabled) {
  enabled_ = enabled;
  LOG(INFO) << "Canvas randomization " << (enabled ? "enabled" : "disabled");
}

bool CanvasRandomizer::IsEnabled() const {
  return enabled_;
}

}  // namespace privacy
}  // namespace toubkal
```

---

## Phase 3: Integrate with Chromium Build

### 3.1 Update Chromium Root BUILD.gn

Edit `C:\chromium\src\BUILD.gn` to include Toubkal:

```gn
# Find the group("gn_all") section and add toubkal
group("gn_all") {
  testonly = true
  deps = [
    # ... existing deps ...
    "//toubkal:toubkal",  # Add this line
  ]
}
```

## 3.2 Create DEPS Entry (Optional)

If you want Toubkal to fetch external dependencies, edit `C:\chromium\src\DEPS`:

```python
# Add Toubkal dependencies
vars = {
  # ... existing vars ...
  'toubkal_adblock_rust_version': 'v0.7.0',
}

deps = {
  # ... existing deps ...
  'src/toubkal/third_party/adblock-rust': {
    'url': 'https://github.com/brave/adblock-rust.git@{toubkal_adblock_rust_version}',
  },
}
```

---

## Phase 4: Build Toubkal Components

### 4.1 Generate Build Files

```powershell
cd C:\chromium\src

# Generate build configuration including Toubkal
.\buildtools\win\gn.exe gen out\Toubkal --args="is_debug=true is_component_build=true"
```

## 4.2 Build Privacy Components

```powershell
# Build just the privacy component
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal/components/privacy:privacy

# Or build all Toubkal components
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal:toubkal
```

## 4.3 Run Tests

```powershell
# Build and run fingerprinting tests
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal/components/privacy/fingerprinting:fingerprinting_unittests
.\out\Toubkal\fingerprinting_unittests.exe
```

---

## Phase 5: Story 1.4 Implementation Checklist

### Task 1: Fingerprinting Protection ✅

- [ ] Create `canvas_randomizer.h` and `canvas_randomizer.cc`
- [ ] Create `webrtc_ip_protection.h` and `webrtc_ip_protection.cc`
- [ ] Create `user_agent_normalizer.h` and `user_agent_normalizer.cc`
- [ ] Create `BUILD.gn` for fingerprinting component
- [ ] Write unit tests (`*_unittest.cc`)
- [ ] Verify build: `ninja toubkal/components/privacy/fingerprinting:fingerprinting`
- [ ] Run tests: `.\out\Toubkal\fingerprinting_unittests.exe`

### Task 2: Tracker Blocking (Depends on Phase 0.5.7-0.5.10)

- [ ] Create `tracker_blocker.h` and `tracker_blocker.cc`
- [ ] Integrate with adblock-rust FFI
- [ ] Enable EasyList and uBlock Origin filters by default
- [ ] Add CNAME uncloaking support
- [ ] Create BUILD.gn for shields component
- [ ] Write integration tests

### Task 3: Privacy Settings UI (React/TypeScript)

- [ ] Create `PrivacySettings.tsx` component
- [ ] Show "Protection: Enabled" status
- [ ] Implement opt-out with warnings
- [ ] Add visual indicators
- [ ] Integrate with Mojo IPC for C++ communication
- [ ] Write Vitest unit tests

### Task 4: Audit Logging

- [ ] Create `audit_logger.h` and `audit_logger.cc`
- [ ] Integrate with Phase 0.5.1 (BoringSSL Ed25519)
- [ ] Log privacy setting changes
- [ ] Add signature verification
- [ ] Write unit tests

### Task 5: Testing & Validation

- [ ] Achieve ≥80% test coverage
- [ ] Run Panopticlick fingerprinting tests
- [ ] Verify activation time <2 seconds
- [ ] Verify first-run experience <10 seconds
- [ ] No TypeScript `any` types
- [ ] Use Result<T> pattern for errors

---

## Phase 6: Build Full Toubkal Browser

### 6.1 Create Toubkal Browser Target

Edit `C:\chromium\src\toubkal\BUILD.gn`:

```gn
executable("toubkal_browser") {
  sources = [
    "browser/main.cc",
  ]

  deps = [
    "//toubkal/components",
    "//toubkal/browser",
    "//chrome:chrome",  # Inherit from Chrome
  ]

  # Customize browser branding
  defines = [
    "TOUBKAL_BROWSER",
    "BROWSER_NAME=\"Toubkal Browser\"",
  ]
}
```

### 6.2 Build Toubkal Browser Binary

```powershell
cd C:\chromium\src

# Generate build with Toubkal browser target
.\buildtools\win\gn.exe gen out\ToubkalRelease --args="is_debug=false is_official_build=false"

# Build Toubkal Browser (1-3 hours first build)
.\third_party\ninja\ninja.exe -C out\ToubkalRelease toubkal:toubkal_browser

# Run Toubkal Browser
.\out\ToubkalRelease\toubkal_browser.exe
```

---

## Troubleshooting

### Build Errors

**Error: "Can't find toubkal/BUILD.gn"**
```powershell
# Verify BUILD.gn exists
Test-Path C:\chromium\src\toubkal\BUILD.gn
```

**Error: "Unknown target //toubkal:toubkal"**
```powershell
# Regenerate build files
.\buildtools\win\gn.exe gen out\Toubkal --args="is_debug=true"
```

**Error: "Undefined symbol: toubkal::privacy::CanvasRandomizer"**
```gn
# Check BUILD.gn includes source files
sources = [
  "canvas_randomizer.cc",  # Must be listed
]
```

## Incremental Build Issues

```powershell
# Clean and rebuild
.\third_party\ninja\ninja.exe -C out\Toubkal -t clean
.\buildtools\win\gn.exe gen out\Toubkal
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal:toubkal
```

---

## Development Workflow

### Daily Workflow for Story 1.4

```powershell
# 1. Navigate to Chromium source
cd C:\chromium\src

# 2. Edit Toubkal code
# Edit files in toubkal\components\privacy\fingerprinting\

# 3. Rebuild changed components (fast, ~30 seconds)
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal/components/privacy:privacy

# 4. Run unit tests
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal/components/privacy/fingerprinting:fingerprinting_unittests
.\out\Toubkal\fingerprinting_unittests.exe

# 5. Build full browser (if needed)
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal:toubkal_browser

# 6. Test in browser
.\out\Toubkal\toubkal_browser.exe
```

---

## Next Steps

### Immediate (Today)
1. ✅ Read this preparation guide
2. Create `toubkal\` directory structure in Chromium source
3. Create initial BUILD.gn files
4. Create stub C++ files for fingerprinting protection

### This Week (Story 1.4 Implementation)
1. Implement canvas randomization
2. Implement WebRTC IP protection
3. Implement User-Agent normalization
4. Write unit tests
5. Build and verify components

### Next Week (Story 1.4 Completion)
1. Integrate tracker blocking (requires Phase 0.5 ad blocking)
2. Create privacy settings UI (React)
3. Implement audit logging
4. Run full test suite
5. Achieve ≥80% coverage

---

## References

### Documentation
- **Story 1.4:** `docs/stories/phase1-week1-2/story-1.4.md`
- **Chromium Build Reference:** `docs/CHROMIUM-BUILD-REFERENCE.md`
- **Architecture Overview:** `docs/architecture/ARCHITECTURE-OVERVIEW.md`
- **Coding Rules:** `CODING-RULES.md`

### Chromium Build Docs
- **GN Reference:** https://gn.googlesource.com/gn/+/main/docs/reference.md
- **Chromium Build Instructions:** https://chromium.googlesource.com/chromium/src/+/main/docs/windows_build_instructions.md
- **Component Build Guide:** https://chromium.googlesource.com/chromium/src/+/main/docs/component_build.md

### Brave Browser Reference
- **Brave Components:** https://github.com/brave/brave-core/tree/master/components
- **Brave Shields:** https://github.com/brave/brave-core/tree/master/components/brave_shields
- **Brave Fingerprinting:** https://github.com/brave/brave-core/tree/master/components/brave_shields/browser/brave_farbling_service.cc

---

## Status Summary

**Chromium Build System:** ✅ Ready (4,175 files compiled)
**Toubkal Directory Structure:** ⏳ To be created
**Story 1.4 Components:** ⏳ To be implemented
**Build Configuration:** ⏳ To be created

**Next Action:** Create `toubkal\` directory structure and initial BUILD.gn files

---

**Ready to build Toubkal Browser!** 🚀
