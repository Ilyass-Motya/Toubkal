#ifndef TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_
#define TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_

#include "url/gurl.h"

namespace toubkal {
namespace browser {
namespace url {

// Registers the toubkal:// URL scheme with Chromium's URL system
// This enables toubkal:// URLs to be treated as standard, secure, local, and web-displayable
void RegisterToubkalUrlScheme();

// Gets the corresponding toubkal:// URL for a chrome:// URL
// Returns empty GURL if no redirect mapping exists
GURL GetToubkalRedirectUrl(const GURL& chrome_url);

// Checks if a URL is a valid toubkal:// internal page
// Returns true if the URL is a toubkal:// internal page, false otherwise
bool IsValidToubkalInternalUrl(const GURL& url);

// Gets the list of supported toubkal:// internal pages
// Returns a vector of supported internal page paths
std::vector<std::string> GetSupportedToubkalInternalPages();

}  // namespace url
}  // namespace browser
}  // namespace toubkal

#endif  // TOUBKAL_BROWSER_URL_URL_SCHEME_REGISTRATION_H_