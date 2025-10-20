#include "toubkal/browser/toubkal_content_browser_client.h"

#include "base/logging.h"
#include "content/public/browser/render_frame_host.h"
#include "content/public/browser/web_contents.h"
#include "toubkal/browser/url/url_scheme_registration.h"
#include "toubkal/browser/branding/branding_integration.h"

namespace toubkal {
namespace browser {

ToubkalContentBrowserClient::ToubkalContentBrowserClient() = default;

ToubkalContentBrowserClient::~ToubkalContentBrowserClient() = default;

void ToubkalContentBrowserClient::RegisterNonNetworkSubresourceURLLoaderFactories(
    int render_process_id,
    content::RenderFrameHost* frame_host,
    const std::vector<content::NonNetworkURLLoaderFactoryInfo>&
        non_network_factories) {
  // Register non-network URL loader factories for toubkal:// URLs
  // This enables loading of internal pages
  ContentBrowserClient::RegisterNonNetworkSubresourceURLLoaderFactories(
      render_process_id, frame_host, non_network_factories);
}

void ToubkalContentBrowserClient::InitializeToubkalBrowser() {
  LOG(INFO) << "Initializing Toubkal Browser";
  
  // Initialize branding
  branding::BrandingIntegration::Initialize();
  
  // Register URL schemes
  RegisterUrlSchemes();
  
  LOG(INFO) << "Toubkal Browser initialization complete";
}

void ToubkalContentBrowserClient::RegisterUrlSchemes() {
  // Register the toubkal:// URL scheme
  url::RegisterToubkalUrlScheme();
  
  LOG(INFO) << "Registered Toubkal URL schemes";
}

void ToubkalContentBrowserClient::WebContentsCreated(
    content::WebContents* web_contents) {
  // Apply Toubkal branding to the web contents
  branding::BrandingIntegration::ApplyBrandingToWebContents(web_contents);
  
  // Call parent implementation
  ContentBrowserClient::WebContentsCreated(web_contents);
}

}  // namespace browser
}  // namespace toubkal
