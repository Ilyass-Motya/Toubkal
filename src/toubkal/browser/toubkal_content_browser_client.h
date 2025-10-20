#ifndef TOUBKAL_BROWSER_TOUBKAL_CONTENT_BROWSER_CLIENT_H_
#define TOUBKAL_BROWSER_TOUBKAL_CONTENT_BROWSER_CLIENT_H_

#include "content/public/browser/content_browser_client.h"

namespace toubkal {
namespace browser {

// Main content browser client for Toubkal Browser
// Handles URL scheme registration and browser initialization
class ToubkalContentBrowserClient : public content::ContentBrowserClient {
 public:
  ToubkalContentBrowserClient();
  ~ToubkalContentBrowserClient() override;

  // content::ContentBrowserClient overrides
  void RegisterNonNetworkSubresourceURLLoaderFactories(
      int render_process_id,
      content::RenderFrameHost* frame_host,
      const std::vector<content::NonNetworkURLLoaderFactoryInfo>&
          non_network_factories) override;

  void WebContentsCreated(content::WebContents* web_contents) override;

  // Initialize Toubkal-specific browser components
  void InitializeToubkalBrowser();

 private:
  // Register the toubkal:// URL scheme
  void RegisterUrlSchemes();
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_TOUBKAL_CONTENT_BROWSER_CLIENT_H_
