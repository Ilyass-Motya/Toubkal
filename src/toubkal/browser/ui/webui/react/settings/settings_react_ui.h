// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_REACT_SETTINGS_SETTINGS_REACT_UI_H_
#define TOUBKAL_BROWSER_UI_WEBUI_REACT_SETTINGS_SETTINGS_REACT_UI_H_

#include <memory>
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/web_ui_data_source.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {

// WebUI controller for Toubkal Settings (toubkal://settings)
// Serves the React-based settings page
class SettingsReactUI : public content::WebUIController {
 public:
  explicit SettingsReactUI(content::WebUI* web_ui);
  ~SettingsReactUI() override;

  // content::WebUIController overrides
  void WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) override;

 private:
  // Create the data source for the settings page
  static std::unique_ptr<content::WebUIDataSource> CreateSettingsDataSource();

  // Initialize the settings page
  void InitializeSettingsPage();

  // Handle Mojo IPC for settings data
  void BindToubkalUIInterface(
      mojo::PendingReceiver<toubkal::mojom::ToubkalUI> receiver);

  // Get current settings
  void GetCurrentSettings(GetCurrentSettingsCallback callback);

  // Update settings
  void UpdateSettings(const std::string& settings_json, UpdateSettingsCallback callback);

  // Apply Toubkal branding to the page
  void ApplyBranding();
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_REACT_SETTINGS_SETTINGS_REACT_UI_H_
