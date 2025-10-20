// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_BRANDING_BRANDING_INTEGRATION_H_
#define TOUBKAL_BROWSER_BRANDING_BRANDING_INTEGRATION_H_

#include <string>
#include "base/strings/string_piece.h"

namespace content {
class WebContents;
}

namespace toubkal {
namespace branding {

// Integrates Toubkal branding into the browser UI
class BrandingIntegration {
 public:
  // Initialize branding integration
  static void Initialize();

  // Apply branding to a web contents
  static void ApplyBrandingToWebContents(content::WebContents* web_contents);

  // Update window title with Toubkal branding
  static void UpdateWindowTitle(content::WebContents* web_contents, 
                               const std::string& title);

  // Replace Chrome references in page content
  static void ReplaceChromeReferencesInPage(content::WebContents* web_contents);

  // Check if a URL should be rebranded
  static bool ShouldRebrandUrl(const std::string& url);

  // Get rebranded URL
  static std::string GetRebrandedUrl(const std::string& url);

  // Apply branding to internal pages
  static void ApplyInternalPageBranding(content::WebContents* web_contents);

  // Inject Toubkal branding CSS
  static void InjectBrandingCSS(content::WebContents* web_contents);

  // Inject Toubkal branding JavaScript
  static void InjectBrandingJS(content::WebContents* web_contents);

 private:
  // Check if URL is an internal page
  static bool IsInternalPage(const std::string& url);

  // Get internal page name from URL
  static std::string GetInternalPageName(const std::string& url);

  // Apply branding to specific internal page
  static void ApplySpecificInternalPageBranding(content::WebContents* web_contents,
                                               const std::string& page_name);
};

}  // namespace branding
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_BRANDING_BRANDING_INTEGRATION_H_
