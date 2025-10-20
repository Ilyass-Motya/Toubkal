// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/branding/window_title_manager.h"

#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "toubkal/browser/branding/branding_config.h"
#include "toubkal/browser/branding/branding_manager.h"

namespace toubkal {
namespace branding {

// Common internal page titles
const char* WindowTitleManager::kInternalPageTitles[] = {
  "Settings",
  "About",
  "Version", 
  "Flags",
  "Extensions",
  "Help",
  "Audit",
  "Consent",
  "Privacy",
  "Security"
};

const char* WindowTitleManager::kInternalPageNames[] = {
  "settings",
  "about",
  "version",
  "flags", 
  "extensions",
  "help",
  "audit",
  "consent",
  "privacy",
  "security"
};

const size_t WindowTitleManager::kInternalPageCount = 
    sizeof(kInternalPageTitles) / sizeof(kInternalPageTitles[0]);

std::string WindowTitleManager::GetDefaultTitle() {
  return kBrowserWindowTitle;
}

std::string WindowTitleManager::GetTitleForPage(const std::string& page_title) {
  if (page_title.empty()) {
    return GetDefaultTitle();
  }
  
  std::string sanitized_title = SanitizePageTitle(page_title);
  return base::StringPrintf("%s - %s", sanitized_title.c_str(), kProductName);
}

std::string WindowTitleManager::GetTitleForInternalPage(const std::string& page_name) {
  // Find the display name for the internal page
  for (size_t i = 0; i < kInternalPageCount; ++i) {
    if (base::EqualsCaseInsensitiveASCII(page_name, kInternalPageNames[i])) {
      return base::StringPrintf("%s - %s", kInternalPageTitles[i], kProductName);
    }
  }
  
  // Fallback to capitalized page name
  std::string capitalized = page_name;
  if (!capitalized.empty()) {
    capitalized[0] = base::ToUpperASCII(capitalized[0]);
  }
  return base::StringPrintf("%s - %s", capitalized.c_str(), kProductName);
}

std::string WindowTitleManager::GetTitleForExternalPage(const std::string& page_title, 
                                                       const std::string& url) {
  if (page_title.empty()) {
    return GetDefaultTitle();
  }
  
  std::string sanitized_title = SanitizePageTitle(page_title);
  return base::StringPrintf("%s - %s", sanitized_title.c_str(), kProductName);
}

std::string WindowTitleManager::SanitizePageTitle(const std::string& page_title) {
  return BrandingManager::ReplaceChromeReferences(page_title);
}

bool WindowTitleManager::ShouldBrandTitle(const std::string& title) {
  // Don't brand titles that already contain Toubkal
  if (base::Contains(title, "Toubkal")) {
    return false;
  }
  
  // Brand titles that contain Chrome/Chromium references
  return BrandingManager::ContainsChromeReferences(title);
}

}  // namespace branding
}  // namespace toubkal
