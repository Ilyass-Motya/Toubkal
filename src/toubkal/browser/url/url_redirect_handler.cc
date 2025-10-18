/**
 * URL Redirect Handler Implementation for Toubkal Browser
 * 
 * Implements automatic redirects and notifications for URL scheme changes.
 */

#include "toubkal/browser/url/url_redirect_handler.h"

#include "base/logging.h"
#include "base/task/single_thread_task_runner.h"
#include "toubkal/browser/url/url_scheme_registration.h"

namespace toubkal {
namespace browser {

UrlRedirectHandler::UrlRedirectHandler(
    NavigateCallback navigate_callback,
    ShowRedirectNotificationCallback notification_callback)
    : navigate_callback_(std::move(navigate_callback)),
      notification_callback_(std::move(notification_callback)) {
  LOG(INFO) << "UrlRedirectHandler initialized";
}

UrlRedirectHandler::~UrlRedirectHandler() = default;

bool UrlRedirectHandler::ProcessUrl(const GURL& url) {
  if (!url.is_valid()) {
    LOG(WARNING) << "Invalid URL provided to ProcessUrl: " << url.spec();
    return false;
  }

  // Check if this is a removed Brave URL
  if (IsRemovedBraveUrl(url)) {
    LOG(INFO) << "Blocked removed Brave URL: " << url.spec();
    // In a real implementation, this would show an error page
    return false;
  }

  // Check if this is a chrome:// URL that should be redirected
  GURL redirect_target = GetToubkalRedirectUrl(url);
  if (redirect_target.is_valid()) {
    LOG(INFO) << "Redirecting " << url.spec() << " to " << redirect_target.spec();
    
    // Show redirect notification
    notification_callback_.Run(url, redirect_target);
    
    // Schedule the actual navigation after a brief delay
    base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
        FROM_HERE,
        base::BindOnce(&UrlRedirectHandler::HandleRedirectNotification,
                       weak_factory_.GetWeakPtr(), url, redirect_target),
        base::Milliseconds(1000));  // 1 second delay
    
    return true;
  }

  // Check if this is a valid toubkal:// URL
  if (url.scheme() == "toubkal" && IsValidToubkalInternalUrl(url)) {
    LOG(INFO) << "Processing valid toubkal:// URL: " << url.spec();
    navigate_callback_.Run(url);
    return true;
  }

  // For other URLs, just navigate normally
  navigate_callback_.Run(url);
  return true;
}

void UrlRedirectHandler::HandleRedirectNotification(const GURL& from_url, const GURL& to_url) {
  LOG(INFO) << "Executing redirect from " << from_url.spec() << " to " << to_url.spec();
  navigate_callback_.Run(to_url);
}

bool UrlRedirectHandler::ShouldRedirect(const GURL& url) const {
  return GetToubkalRedirectUrl(url).is_valid();
}

GURL UrlRedirectHandler::GetRedirectTarget(const GURL& url) const {
  return GetToubkalRedirectUrl(url);
}

}  // namespace browser
}  // namespace toubkal
