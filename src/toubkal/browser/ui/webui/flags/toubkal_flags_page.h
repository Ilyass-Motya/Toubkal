// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_FLAGS_TOUBKAL_FLAGS_PAGE_H_
#define TOUBKAL_BROWSER_UI_WEBUI_FLAGS_TOUBKAL_FLAGS_PAGE_H_

#include <string>
#include <memory>
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/web_ui_data_source.h"

namespace toubkal {
namespace browser {

// WebUI controller for Toubkal Flags page (toubkal://flags)
class ToubkalFlagsPage : public content::WebUIController {
 public:
  explicit ToubkalFlagsPage(content::WebUI* web_ui);
  ~ToubkalFlagsPage() override;

  // content::WebUIController overrides
  void WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) override;

 private:
  // Create the data source for the flags page
  static std::unique_ptr<content::WebUIDataSource> CreateFlagsDataSource();

  // Initialize the flags page
  void InitializeFlagsPage();

  // Get available feature flags
  std::string GetFeatureFlags();

  // Get flag categories
  std::string GetFlagCategories();

  // Handle flag changes
  void HandleFlagChange(const std::string& flag_name, const std::string& flag_value);

  // Apply Toubkal branding to the page
  void ApplyBranding();
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_FLAGS_TOUBKAL_FLAGS_PAGE_H_
