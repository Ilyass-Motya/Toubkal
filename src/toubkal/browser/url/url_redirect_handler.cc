#include "toubkal/browser/url/url_redirect_handler.h"

#include "base/logging.h"
#include "toubkal/browser/url/url_scheme_registration.h"

namespace toubkal {
namespace browser {
namespace url {

UrlRedirectHandler::UrlRedirectHandler() = default;

UrlRedirectHandler::~UrlRedirectHandler() = default;

GURL UrlRedirectHandler::ProcessUrl(const GURL& url) {
  if (!url.is_valid()) {
    return url;
  }

  if (url.SchemeIs("chrome")) {
    return ProcessChromeToToubkalRedirect(url);
  }

  return url;
}

bool UrlRedirectHandler::ShouldRedirect(const GURL& url) {
  if (!url.is_valid()) {
    return false;
  }

  return url.SchemeIs("chrome");
}

GURL UrlRedirectHandler::GetRedirectTarget(const GURL& url) {
  if (!ShouldRedirect(url)) {
    return url;
  }

  return ProcessChromeToToubkalRedirect(url);
}

GURL UrlRedirectHandler::ProcessChromeToToubkalRedirect(const GURL& chrome_url) {
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  if (redirect_url.is_valid()) {
    LOG(INFO) << "Redirecting " << chrome_url.spec() 
              << " to " << redirect_url.spec();
    return redirect_url;
  }

  // If no specific redirect mapping exists, return the original URL
  return chrome_url;
}

}  // namespace url
}  // namespace browser
}  // namespace toubkal