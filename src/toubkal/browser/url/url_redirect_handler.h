#ifndef TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_
#define TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_

#include "url/gurl.h"

namespace toubkal {
namespace browser {
namespace url {

// Handles URL redirects from chrome:// to toubkal:// URLs
class UrlRedirectHandler {
 public:
  UrlRedirectHandler();
  ~UrlRedirectHandler();

  // Processes a URL and returns the redirect target if applicable
  // Returns the original URL if no redirect is needed
  GURL ProcessUrl(const GURL& url);

  // Checks if a URL should be redirected
  bool ShouldRedirect(const GURL& url);

  // Gets the redirect target for a given URL
  GURL GetRedirectTarget(const GURL& url);

 private:
  // Internal redirect processing logic
  GURL ProcessChromeToToubkalRedirect(const GURL& chrome_url);
};

}  // namespace url
}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_