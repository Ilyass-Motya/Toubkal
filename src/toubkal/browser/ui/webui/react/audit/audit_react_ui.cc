// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/browser/ui/webui/react/audit/audit_react_ui.h"

#include "base/bind.h"
#include "base/logging.h"
#include "content/public/browser/web_ui.h"
#include "content/public/browser/web_ui_data_source.h"
#include "mojo/public/cpp/bindings/self_owned_receiver.h"
#include "toubkal/browser/branding/branding_manager.h"
#include "toubkal/browser/ui/webui/react/react_webui_data_source.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {

AuditReactUI::AuditReactUI(content::WebUI* web_ui)
    : WebUIController(web_ui) {
  // Create and set the data source
  content::WebUIDataSource* source = CreateAuditDataSource().release();
  content::WebUIDataSource::Add(web_ui->GetWebContents()->GetBrowserContext(), source);
}

AuditReactUI::~AuditReactUI() = default;

void AuditReactUI::WebUIRenderFrameCreated(content::RenderFrameHost* render_frame_host) {
  // Initialize the audit dashboard when the frame is created
  InitializeAuditDashboard();
  ApplyBranding();
}

std::unique_ptr<content::WebUIDataSource> AuditReactUI::CreateAuditDataSource() {
  return ReactWebUIDataSource::CreateAuditDataSource();
}

void AuditReactUI::InitializeAuditDashboard() {
  // Initialize the audit dashboard with default data
  LOG(INFO) << "Initializing Toubkal Audit Dashboard";
}

void AuditReactUI::BindToubkalUIInterface(
    mojo::PendingReceiver<toubkal::mojom::ToubkalUI> receiver) {
  // Bind the Mojo interface for communication with the React app
  mojo::MakeSelfOwnedReceiver(
      std::make_unique<ToubkalUIImpl>(),
      std::move(receiver));
}

void AuditReactUI::GetAuditLogs(GetAuditLogsCallback callback) {
  // Get audit log data from the privacy manager
  // This would typically call the actual audit logger service
  std::vector<toubkal::mojom::AuditLogPtr> audit_logs;
  
  // Mock data for now - in real implementation, this would come from AuditLogger
  auto log_entry = toubkal::mojom::AuditLog::New();
  log_entry->id = "audit_001";
  log_entry->timestamp = base::Time::Now();
  log_entry->event_type = "PRIVACY_SETTINGS_CHANGED";
  log_entry->description = "Fingerprinting protection enabled";
  log_entry->user_id = "user_123";
  log_entry->signature = "mock_signature_hash";
  log_entry->verified = true;
  
  audit_logs.push_back(std::move(log_entry));
  
  std::move(callback).Run(std::move(audit_logs));
}

void AuditReactUI::GetConsentHistory(GetConsentHistoryCallback callback) {
  // Get consent history data from the consent manager
  // This would typically call the actual consent manager service
  std::vector<toubkal::mojom::ConsentEntryPtr> consent_history;
  
  // Mock data for now - in real implementation, this would come from ConsentManager
  auto consent_entry = toubkal::mojom::ConsentEntry::New();
  consent_entry->id = "consent_001";
  consent_entry->timestamp = base::Time::Now();
  consent_entry->consent_type = "analytics";
  consent_entry->action = "granted";
  consent_entry->reason = "User explicitly granted consent for analytics";
  consent_entry->user_id = "user_123";
  consent_entry->signature = "mock_consent_signature";
  consent_entry->verified = true;
  
  consent_history.push_back(std::move(consent_entry));
  
  std::move(callback).Run(std::move(consent_history));
}

void AuditReactUI::ApplyBranding() {
  // Apply Toubkal branding to the audit dashboard
  // This ensures all text and UI elements are properly branded
  LOG(INFO) << "Applying Toubkal branding to audit dashboard";
}

}  // namespace browser
}  // namespace toubkal
