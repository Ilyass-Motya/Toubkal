// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/branding/branding_manager.h"

#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "toubkal/browser/branding/branding_config.h"

namespace toubkal {
namespace branding {

// Common Chrome/Chromium references to replace
const char* BrandingManager::kChromeReferences[] = {
  "Chrome",
  "Chromium", 
  "Google Chrome",
  "chrome://",
  "Chrome Browser",
  "Chromium Browser",
  "Google Inc.",
  "The Chromium Authors",
  "Chromium Project",
  "Chrome DevTools",
  "Chrome Settings",
  "Chrome Flags",
  "Chrome Extensions",
  "Chrome Help",
  "Chrome Version",
  "Chrome About",
  "Chrome://settings",
  "Chrome://flags",
  "Chrome://extensions",
  "Chrome://help",
  "Chrome://version",
  "Chrome://about"
};

const char* BrandingManager::kToubkalReplacements[] = {
  "Toubkal",
  "Toubkal Browser",
  "Toubkal Browser",
  "toubkal://",
  "Toubkal Browser",
  "Toubkal Browser",
  "Toubkal Browser",
  "Toubkal Browser",
  "Toubkal Browser",
  "Toubkal DevTools",
  "Toubkal Settings",
  "Toubkal Flags",
  "Toubkal Extensions",
  "Toubkal Help",
  "Toubkal Version",
  "Toubkal About",
  "toubkal://settings",
  "toubkal://flags",
  "toubkal://extensions",
  "toubkal://help",
  "toubkal://version",
  "toubkal://about"
};

const size_t BrandingManager::kReferenceCount = 
    sizeof(kChromeReferences) / sizeof(kChromeReferences[0]);

void BrandingManager::Initialize() {
  // Initialize any global branding state if needed
  // This is called during browser startup
}

std::string BrandingManager::GetProductName() {
  return kProductName;
}

std::string BrandingManager::GetWindowTitle(const std::string& page_title) {
  if (page_title.empty()) {
    return kBrowserWindowTitle;
  }
  return base::StringPrintf("%s - %s", page_title.c_str(), kProductName);
}

std::string BrandingManager::GetAboutDialogTitle() {
  return kAboutDialogTitle;
}

std::string BrandingManager::GetAboutDialogDescription() {
  return kAboutDialogDescription;
}

std::string BrandingManager::ReplaceChromeReferences(const std::string& text) {
  std::string result = text;
  
  for (size_t i = 0; i < kReferenceCount; ++i) {
    base::ReplaceSubstringsAfterOffset(&result, 0, 
                                      kChromeReferences[i], 
                                      kToubkalReplacements[i]);
  }
  
  return result;
}

bool BrandingManager::ContainsChromeReferences(const std::string& text) {
  for (size_t i = 0; i < kReferenceCount; ++i) {
    if (base::Contains(text, kChromeReferences[i])) {
      return true;
    }
  }
  return false;
}

std::string BrandingManager::GetInternalScheme() {
  return kInternalScheme;
}

std::string BrandingManager::GetPrimaryColor() {
  return kPrimaryColor;
}

std::string BrandingManager::GetSecondaryColor() {
  return kSecondaryColor;
}

std::string BrandingManager::GetAccentColor() {
  return kAccentColor;
}

std::string BrandingManager::GetLogoPath() {
  return kLogoPath;
}

std::string BrandingManager::GetIconPath() {
  return kIconPath;
}

std::string BrandingManager::GetFaviconPath() {
  return kFaviconPath;
}

}  // namespace branding
}  // namespace toubkal
