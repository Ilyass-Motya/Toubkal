#ifndef TOUBKAL_BROWSER_UI_WEBUI_AUDIT_AUDIT_UI_H_
#define TOUBKAL_BROWSER_UI_WEBUI_AUDIT_AUDIT_UI_H_

#include "content/public/browser/web_ui_controller.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {
namespace ui {
namespace webui {

// WebUI controller for the audit transparency dashboard
class AuditUI : public content::WebUIController {
 public:
  explicit AuditUI(content::WebUI* web_ui);
  ~AuditUI() override;

  // content::WebUIController overrides
  void BindInterface(
      mojo::PendingReceiver<toubkal::ui::ToubkalUI> receiver);

 private:
  // Handle Mojo interface binding
  void OnBindInterface(mojo::PendingReceiver<toubkal::ui::ToubkalUI> receiver);

  // Audit log data provider
  std::vector<toubkal::ui::AuditLogEntry> GetAuditLogs();
  
  // Export audit logs
  std::string ExportAuditLogs(const std::string& format);
};

}  // namespace webui
}  // namespace ui
}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_AUDIT_AUDIT_UI_H_
