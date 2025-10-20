// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_SETTINGS_TOUBKAL_SETTINGS_PAGE_H_
#define TOUBKAL_BROWSER_UI_WEBUI_SETTINGS_TOUBKAL_SETTINGS_PAGE_H_

#include <string>
#include <memory>
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/web_ui_data_source.h"

namespace toubkal {
namespace browser {

// WebUI controller for Toubkal Settings page (toubkal://settings)
class ToubkalSettingsPage : public content::WebUIController {
 public:
  explicit ToubkalSettingsPage(content::WebUI* web_ui);
  ~ToubkalSettingsPage() override;

  // content::WebUIController overrides
  void WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) override;

 private:
  // Create the data source for the settings page
  static std::unique_ptr<content::WebUIDataSource> CreateSettingsDataSource();

  // Handle settings page initialization
  void InitializeSettingsPage();

  // Handle settings updates
  void HandleSettingsUpdate(const std::string& settings_json);

  // Handle privacy settings
  void HandlePrivacySettingsUpdate(const std::string& privacy_settings_json);

  // Handle security settings
  void HandleSecuritySettingsUpdate(const std::string& security_settings_json);

  // Handle AI settings
  void HandleAISettingsUpdate(const std::string& ai_settings_json);

  // Handle audit log requests
  void HandleAuditLogRequest();

  // Handle consent history requests
  void HandleConsentHistoryRequest();

  // Apply Toubkal branding to the page
  void ApplyBranding();
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_SETTINGS_TOUBKAL_SETTINGS_PAGE_H_
