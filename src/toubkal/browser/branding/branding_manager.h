// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_BRANDING_BRANDING_MANAGER_H_
#define TOUBKAL_BROWSER_BRANDING_BRANDING_MANAGER_H_

#include <string>
#include "base/strings/string_piece.h"

namespace toubkal {
namespace branding {

// Manages Toubkal Browser branding and replaces Chromium/Chrome references
class BrandingManager {
 public:
  // Initialize branding configuration
  static void Initialize();

  // Get product name for window titles
  static std::string GetProductName();

  // Get window title for a given page
  static std::string GetWindowTitle(const std::string& page_title = "");

  // Get about dialog information
  static std::string GetAboutDialogTitle();
  static std::string GetAboutDialogDescription();

  // Replace Chrome/Chromium references with Toubkal branding
  static std::string ReplaceChromeReferences(const std::string& text);

  // Check if a string contains Chrome/Chromium references
  static bool ContainsChromeReferences(const std::string& text);

  // Get internal URL scheme
  static std::string GetInternalScheme();

  // Get brand colors
  static std::string GetPrimaryColor();
  static std::string GetSecondaryColor();
  static std::string GetAccentColor();

  // Get logo and icon paths
  static std::string GetLogoPath();
  static std::string GetIconPath();
  static std::string GetFaviconPath();

 private:
  // Common Chrome/Chromium references to replace
  static const char* kChromeReferences[];
  static const char* kToubkalReplacements[];
  static const size_t kReferenceCount;
};

}  // namespace branding
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_BRANDING_BRANDING_MANAGER_H_
