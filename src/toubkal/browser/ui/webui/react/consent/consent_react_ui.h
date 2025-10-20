// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_REACT_CONSENT_CONSENT_REACT_UI_H_
#define TOUBKAL_BROWSER_UI_WEBUI_REACT_CONSENT_REACT_UI_H_

#include <memory>
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/web_ui_data_source.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {

// WebUI controller for Toubkal Consent History (toubkal://consent)
// Serves the React-based consent management dashboard
class ConsentReactUI : public content::WebUIController {
 public:
  explicit ConsentReactUI(content::WebUI* web_ui);
  ~ConsentReactUI() override;

  // content::WebUIController overrides
  void WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) override;

 private:
  // Create the data source for the consent history
  static std::unique_ptr<content::WebUIDataSource> CreateConsentDataSource();

  // Initialize the consent history dashboard
  void InitializeConsentDashboard();

  // Handle Mojo IPC for consent data
  void BindToubkalUIInterface(
      mojo::PendingReceiver<toubkal::mojom::ToubkalUI> receiver);

  // Get consent history data
  void GetConsentHistory(GetConsentHistoryCallback callback);

  // Get audit log data
  void GetAuditLogs(GetAuditLogsCallback callback);

  // Apply Toubkal branding to the page
  void ApplyBranding();
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_REACT_CONSENT_CONSENT_REACT_UI_H_
