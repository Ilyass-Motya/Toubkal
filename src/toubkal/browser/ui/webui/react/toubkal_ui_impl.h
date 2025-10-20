// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_REACT_TOUBKAL_UI_IMPL_H_
#define TOUBKAL_BROWSER_UI_WEBUI_REACT_TOUBKAL_UI_IMPL_H_

#include <memory>
#include "mojo/public/cpp/bindings/receiver.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {

// Implementation of the ToubkalUI Mojo interface
// Provides data access for React WebUI pages
class ToubkalUIImpl : public toubkal::mojom::ToubkalUI {
 public:
  ToubkalUIImpl();
  ~ToubkalUIImpl() override;

  // toubkal::mojom::ToubkalUI overrides
  void GetAuditLogs(GetAuditLogsCallback callback) override;
  void GetConsentHistory(GetConsentHistoryCallback callback) override;
  void GetCurrentSettings(GetCurrentSettingsCallback callback) override;
  void UpdateSettings(const std::string& settings_json, UpdateSettingsCallback callback) override;

 private:
  // Get audit logs from the audit logger service
  std::vector<toubkal::mojom::AuditLogPtr> LoadAuditLogs();

  // Get consent history from the consent manager service
  std::vector<toubkal::mojom::ConsentEntryPtr> LoadConsentHistory();

  // Get current settings from the privacy manager service
  std::string LoadCurrentSettings();

  // Update settings in the privacy manager service
  bool SaveSettings(const std::string& settings_json, std::string& error_message);
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_REACT_TOUBKAL_UI_IMPL_H_
