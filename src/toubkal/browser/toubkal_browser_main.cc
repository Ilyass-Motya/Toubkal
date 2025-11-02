#include "toubkal/browser/toubkal_browser_main.h"

#include "base/command_line.h"
#include "base/logging.h"
#include "content/public/browser/browser_main_parts.h"
#include "content/public/browser/content_browser_client.h"
#include "content/public/common/content_client.h"
#include "toubkal/browser/toubkal_content_browser_client.h"

namespace toubkal {
namespace browser {

class ToubkalBrowserMainParts : public content::BrowserMainParts {
 public:
  ToubkalBrowserMainParts() = default;
  ~ToubkalBrowserMainParts() override = default;

  int PreEarlyInitialization() override {
    LOG(INFO) << "Toubkal Browser: Pre-early initialization";
    return 0;
  }

  void PreMainMessageLoopStart() override {
    LOG(INFO) << "Toubkal Browser: Pre-main message loop start";
  }

  void PostMainMessageLoopStart() override {
    LOG(INFO) << "Toubkal Browser: Post-main message loop start";
  }

  int PreCreateThreads() override {
    LOG(INFO) << "Toubkal Browser: Pre-create threads";
    return 0;
  }

  void PreMainMessageLoopRun() override {
    LOG(INFO) << "Toubkal Browser: Pre-main message loop run";
    
    // Initialize Toubkal browser components
    auto* browser_client = static_cast<ToubkalContentBrowserClient*>(
        content::GetContentClient()->browser());
    if (browser_client) {
      browser_client->InitializeToubkalBrowser();
    }
  }

  void PostMainMessageLoopRun() override {
    LOG(INFO) << "Toubkal Browser: Post-main message loop run";
  }

  void PostDestroyThreads() override {
    LOG(INFO) << "Toubkal Browser: Post-destroy threads";
  }
};

}  // namespace browser
}  // namespace toubkal

namespace toubkal {
namespace browser {

std::unique_ptr<content::BrowserMainParts> CreateToubkalBrowserMainParts() {
  return std::make_unique<ToubkalBrowserMainParts>();
}

}  // namespace browser
}  // namespace toubkal
