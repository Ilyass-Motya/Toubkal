#ifndef TOUBKAL_BROWSER_UI_WEBUI_CONSENT_CONSENT_UI_H_
#define TOUBKAL_BROWSER_UI_WEBUI_CONSENT_CONSENT_UI_H_

#include "content/public/browser/web_ui_controller.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {
namespace ui {
namespace webui {

// WebUI controller for the consent history page
class ConsentUI : public content::WebUIController {
 public:
  explicit ConsentUI(content::WebUI* web_ui);
  ~ConsentUI() override;

  // content::WebUIController overrides
  void BindInterface(
      mojo::PendingReceiver<toubkal::ui::ToubkalUI> receiver);

 private:
  // Handle Mojo interface binding
  void OnBindInterface(mojo::PendingReceiver<toubkal::ui::ToubkalUI> receiver);

  // Consent history data provider
  std::vector<toubkal::ui::ConsentDecision> GetConsentHistory();
  
  // Export consent history
  std::string ExportConsentHistory(const std::string& format);
};

}  // namespace webui
}  // namespace ui
}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_CONSENT_CONSENT_UI_H_
