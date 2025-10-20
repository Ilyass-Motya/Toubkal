#ifndef TOUBKAL_BROWSER_UI_WEBUI_SETTINGS_TOUBKAL_SETTINGS_UI_H_
#define TOUBKAL_BROWSER_UI_WEBUI_SETTINGS_TOUBKAL_SETTINGS_UI_H_

#include "content/public/browser/web_ui_controller.h"
#include "mojo/public/cpp/bindings/pending_receiver.h"
#include "toubkal/mojo/ui/toubkal_ui.mojom.h"

namespace toubkal {
namespace browser {
namespace ui {
namespace webui {

// WebUI controller for the Toubkal settings page
class ToubkalSettingsUI : public content::WebUIController {
 public:
  explicit ToubkalSettingsUI(content::WebUI* web_ui);
  ~ToubkalSettingsUI() override;

  // content::WebUIController overrides
  void BindInterface(
      mojo::PendingReceiver<toubkal::ui::ToubkalUI> receiver);

 private:
  // Handle Mojo interface binding
  void OnBindInterface(mojo::PendingReceiver<toubkal::ui::ToubkalUI> receiver);

  // Privacy settings management
  std::string GetPrivacySettings();
  bool UpdatePrivacySettings(const std::string& settings);
};

}  // namespace webui
}  // namespace ui
}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_UI_WEBUI_SETTINGS_TOUBKAL_SETTINGS_UI_H_
