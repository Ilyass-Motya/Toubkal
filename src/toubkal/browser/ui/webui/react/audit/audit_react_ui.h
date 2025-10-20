// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_BROWSER_UI_WEBUI_REACT_AUDIT_AUDIT_REACT_UI_H_
#define TOUBKAL_BROWSER_UI_WEBUI_REACT_AUDIT_REACT_UI_H_

#include <memory>
#include "content/public/browser/web_ui_controller.h"
#include "content/public/browser/web_ui_data_source.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {

// WebUI controller for Toubkal Audit Dashboard (toubkal://audit)
// Serves the React-based transparency dashboard
class AuditReactUI : public content::WebUIController {
 public:
  explicit AuditReactUI(content::WebUI* web_ui);
  ~AuditReactUI() override;

  // content::WebUIController overrides
  void WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) override;

 private:
  // Create the data source for the audit dashboard
  static std::unique_ptr<content::WebUIDataSource> CreateAuditDataSource();

  // Initialize the audit dashboard
  void InitializeAuditDashboard();

  // Handle Mojo IPC for audit data
  void BindToubkalUIInterface(
      mojo::PendingReceiver<toubkal::mojom::ToubkalUI> receiver);

  // Get audit log data
  void GetAuditLogs(GetAuditLogsCallback callback);

  // Get consent history data
  void GetConsentHistory(GetConsentHistoryCallback callback);

  // Apply Toubkal branding to the page
  void ApplyBranding();
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_REACT_AUDIT_AUDIT_REACT_UI_H_
