// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_VERSION_TOUBKAL_VERSION_PAGE_H_
#define TOUBKAL_BROWSER_UI_WEBUI_VERSION_TOUBKAL_VERSION_PAGE_H_

#include <string>
#include <memory>
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/web_ui_data_source.h"

namespace toubkal {
namespace browser {

// WebUI controller for Toubkal Version page (toubkal://version)
class ToubkalVersionPage : public content::WebUIController {
 public:
  explicit ToubkalVersionPage(content::WebUI* web_ui);
  ~ToubkalVersionPage() override;

  // content::WebUIController overrides
  void WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) override;

 private:
  // Create the data source for the version page
  static std::unique_ptr<content::WebUIDataSource> CreateVersionDataSource();

  // Initialize the version page
  void InitializeVersionPage();

  // Get detailed version information
  std::string GetDetailedVersionInfo();

  // Get build configuration
  std::string GetBuildConfiguration();

  // Get feature flags
  std::string GetFeatureFlags();

  // Apply Toubkal branding to the page
  void ApplyBranding();
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_VERSION_TOUBKAL_VERSION_PAGE_H_
