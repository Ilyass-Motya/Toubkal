// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_BRANDING_WINDOW_TITLE_MANAGER_H_
#define TOUBKAL_BROWSER_BRANDING_WINDOW_TITLE_MANAGER_H_

#include <string>
#include "base/strings/string_piece.h"

namespace toubkal {
namespace branding {

// Manages browser window titles and ensures Toubkal branding
class WindowTitleManager {
 public:
  // Get the default browser window title
  static std::string GetDefaultTitle();

  // Get window title for a specific page
  static std::string GetTitleForPage(const std::string& page_title);

  // Get window title for internal pages (toubkal://)
  static std::string GetTitleForInternalPage(const std::string& page_name);

  // Get window title for external pages
  static std::string GetTitleForExternalPage(const std::string& page_title, 
                                            const std::string& url);

  // Sanitize page title to remove Chrome/Chromium references
  static std::string SanitizePageTitle(const std::string& page_title);

  // Check if a title should be branded
  static bool ShouldBrandTitle(const std::string& title);

 private:
  // Common internal page titles
  static const char* kInternalPageTitles[];
  static const char* kInternalPageNames[];
  static const size_t kInternalPageCount;
};

}  // namespace branding
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_BRANDING_WINDOW_TITLE_MANAGER_H_
