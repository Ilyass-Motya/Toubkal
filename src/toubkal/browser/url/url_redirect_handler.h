/**
 * URL Redirect Handler for Toubkal Browser
 * 
 * Handles automatic redirects from chrome:// URLs to toubkal:// URLs
 * and manages redirect notifications in the UI.
 */

#ifndef TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_
#define TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_

#include "base/callback.h"
#include "base/memory/weak_ptr.h"
#include "url/gurl.h"

namespace toubkal {
namespace browser {

/**
 * Callback type for URL navigation
 */
using NavigateCallback = base::RepeatingCallback<void(const GURL&)>;

/**
 * Callback type for showing redirect notifications
 */
using ShowRedirectNotificationCallback = base::RepeatingCallback<void(const GURL&, const GURL&)>;

/**
 * Handles URL redirects and notifications for Toubkal Browser.
 * 
 * This class manages the automatic redirection from chrome:// URLs
 * to toubkal:// URLs and provides UI notifications for the redirects.
 */
class UrlRedirectHandler {
 public:
  explicit UrlRedirectHandler(NavigateCallback navigate_callback,
                             ShowRedirectNotificationCallback notification_callback);
  ~UrlRedirectHandler();

  /**
   * Processes a URL and handles redirects if necessary.
   * @param url The URL to process
   * @return true if the URL was processed successfully
   */
  bool ProcessUrl(const GURL& url);

  /**
   * Handles a redirect notification from the UI.
   * @param from_url The original URL
   * @param to_url The redirect target URL
   */
  void HandleRedirectNotification(const GURL& from_url, const GURL& to_url);

  /**
   * Checks if a URL should be redirected.
   * @param url The URL to check
   * @return true if the URL should be redirected
   */
  bool ShouldRedirect(const GURL& url) const;

  /**
   * Gets the redirect target for a URL.
   * @param url The URL to get redirect for
   * @return The redirect target URL, or empty if no redirect
   */
  GURL GetRedirectTarget(const GURL& url) const;

 private:
  NavigateCallback navigate_callback_;
  ShowRedirectNotificationCallback notification_callback_;
  
  base::WeakPtrFactory<UrlRedirectHandler> weak_factory_{this};
};

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_URL_URL_REDIRECT_HANDLER_H_
