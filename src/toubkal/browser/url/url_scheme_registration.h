/**
 * URL Scheme Registration for Toubkal Browser
 * 
 * Registers the toubkal:// URL scheme with Chromium's URL system
 * and handles backward compatibility redirects from chrome:// URLs.
 */

#ifndef TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_
#define TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_

#include "base/strings/string_piece.h"
#include "url/gurl.h"

namespace toubkal {
namespace browser {

/**
 * Registers the toubkal:// URL scheme with Chromium's URL system.
 * This must be called during browser initialization.
 */
void RegisterToubkalUrlScheme();

/**
 * Checks if a URL should be redirected from chrome:// to toubkal://
 * @param url The URL to check
 * @return The toubkal:// equivalent URL, or empty if no redirect needed
 */
GURL GetToubkalRedirectUrl(const GURL& url);

/**
 * Checks if a URL is a valid toubkal:// internal page
 * @param url The URL to check
 * @return true if the URL is a valid internal page
 */
bool IsValidToubkalInternalUrl(const GURL& url);

/**
 * Checks if a URL is a removed Brave URL that should be blocked
 * @param url The URL to check
 * @return true if the URL should be blocked
 */
bool IsRemovedBraveUrl(const GURL& url);

/**
 * Gets the error message for a removed Brave URL
 * @param url The URL that was blocked
 * @return Human-readable error message
 */
std::string GetBraveUrlErrorMessage(const GURL& url);

}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_
