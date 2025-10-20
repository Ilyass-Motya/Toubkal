// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_ABOUT_TOUBKAL_ABOUT_PAGE_H_
#define TOUBKAL_BROWSER_UI_WEBUI_ABOUT_TOUBKAL_ABOUT_PAGE_H_

#include <string>
#include <memory>
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/web_ui_data_source.h"

namespace toubkal {
namespace browser {

// WebUI controller for Toubkal About page (toubkal://about)
class ToubkalAboutPage : public content::WebUIController {
 public:
  explicit ToubkalAboutPage(content::WebUI* web_ui);
  ~ToubkalAboutPage() override;

  // content::WebUIController overrides
  void WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) override;

 private:
  // Create the data source for the about page
  static std::unique_ptr<content::WebUIDataSource> CreateAboutDataSource();

  // Initialize the about page
  void InitializeAboutPage();

  // Get browser version information
  std::string GetBrowserVersion();

  // Get build information
  std::string GetBuildInfo();

  // Get privacy features status
  std::string GetPrivacyFeaturesStatus();

  // Apply Toubkal branding to the page
  void ApplyBranding();
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_ABOUT_TOUBKAL_ABOUT_PAGE_H_
