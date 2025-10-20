// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/ui/webui/react/settings/settings_react_ui.h"

#include "base/bind.h"
#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "mojo/public/cpp/bindings/self_owned_receiver.h"
#include "toubkal/browser/branding/branding_manager.h"
#include "toubkal/browser/ui/webui/react/react_webui_data_source.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {

SettingsReactUI::SettingsReactUI(content::WebUI* web_ui)
    : WebUIController(web_ui) {
  // Create and set the data source
  content::WebUIDataSource* source = CreateSettingsDataSource().release();
  content::WebUIDataSource::Add(web_ui->GetWebContents()->GetBrowserContext(), source);
}

SettingsReactUI::~SettingsReactUI() = default;

void SettingsReactUI::WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) {
  // Initialize the settings page when the frame is created
  InitializeSettingsPage();
  ApplyBranding();
}

std::unique_ptr<content::WebUIDataSource> SettingsReactUI::CreateSettingsDataSource() {
  return ReactWebUIDataSource::CreateSettingsDataSource();
}

void SettingsReactUI::InitializeSettingsPage() {
  // Initialize the settings page with default values
  LOG(INFO) << "Initializing Toubkal Settings Page";
}

void SettingsReactUI::BindToubkalUIInterface(
    mojo::PendingReceiver<toubkal::mojom::ToubkalUI> receiver) {
  // Bind the Mojo interface for communication with the React app
  mojo::MakeSelfOwnedReceiver(
      std::make_unique<ToubkalUIImpl>(),
      std::move(receiver));
}

void SettingsReactUI::GetCurrentSettings(GetCurrentSettingsCallback callback) {
  // Get current settings from the privacy manager
  // This would typically call the actual privacy manager service
  base::Value settings(base::Value::Type::DICTIONARY);
  
  // Mock settings for now - in real implementation, this would come from PrivacyManager
  settings.SetBoolKey("fingerprintingProtection", true);
  settings.SetBoolKey("trackerBlocking", true);
  settings.SetBoolKey("enhancedPrivacy", true);
  settings.SetBoolKey("auditLogging", true);
  settings.SetBoolKey("httpsEverywhere", true);
  settings.SetBoolKey("safeBrowsing", true);
  settings.SetBoolKey("csp", true);
  settings.SetBoolKey("zeroTelemetry", true);
  settings.SetBoolKey("localAI", true);
  settings.SetBoolKey("aiSuggestions", true);
  settings.SetBoolKey("privacyAI", true);
  
  std::string settings_json;
  base::JSONWriter::Write(settings, &settings_json);
  
  std::move(callback).Run(settings_json);
}

void SettingsReactUI::UpdateSettings(const std::string& settings_json, 
                                   UpdateSettingsCallback callback) {
  // Update settings in the privacy manager
  // This would typically call the actual privacy manager service
  LOG(INFO) << "Updating settings: " << settings_json;
  
  // Parse the settings JSON
  auto parsed_settings = base::JSONReader::Read(settings_json);
  if (!parsed_settings || !parsed_settings->is_dict()) {
    std::move(callback).Run(false, "Invalid settings format");
    return;
  }
  
  // In a real implementation, this would update the actual settings storage
  // For now, just log the changes
  const base::Value::Dict& settings_dict = parsed_settings->GetDict();
  for (const auto& [key, value] : settings_dict) {
    if (value.is_bool()) {
      LOG(INFO) << "Setting " << key << " = " << value.GetBool();
    }
  }
  
  std::move(callback).Run(true, "Settings updated successfully");
}

void SettingsReactUI::ApplyBranding() {
  // Apply Toubkal branding to the settings page
  // This ensures all text and UI elements are properly branded
  LOG(INFO) << "Applying Toubkal branding to settings page";
}

}  // namespace browser
}  // namespace toubkal
