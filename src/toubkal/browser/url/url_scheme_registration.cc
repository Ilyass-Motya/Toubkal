#include "toubkal/browser/url/url_scheme_registration.h"

#include <vector>
#include <string>

#include "base/logging.h"
#include "url/gurl.h"
#include "url/url_constants.h"
#include "url/url_util.h"

namespace toubkal {
namespace browser {
namespace url {

namespace {

// Mapping of chrome:// URLs to toubkal:// URLs
const std::vector<std::pair<std::string, std::string>> kChromeToToubkalRedirects = {
  {"chrome://settings/", "toubkal://settings/"},
  {"chrome://about/", "toubkal://about/"},
  {"chrome://version/", "toubkal://version/"},
  {"chrome://flags/", "toubkal://flags/"},
  {"chrome://audit/", "toubkal://audit/"},
  {"chrome://consent/", "toubkal://consent/"},
  {"chrome://mcp/", "toubkal://mcp/"},
  {"chrome://ai/", "toubkal://ai/"},
  {"chrome://newtab/", "toubkal://newtab/"},
};

// List of supported toubkal:// internal pages
const std::vector<std::string> kSupportedToubkalInternalPages = {
  "settings",
  "about", 
  "version",
  "flags",
  "audit",
  "consent",
  "mcp",
  "ai",
  "newtab",
};

}  // namespace

void RegisterToubkalUrlScheme() {
  // Register toubkal:// as a standard, secure, local, and web-displayable scheme
  url::AddStandardScheme("toubkal", url::SCHEME_WITH_HOST);
  
  LOG(INFO) << "Registered toubkal:// URL scheme";
}

GURL GetToubkalRedirectUrl(const GURL& chrome_url) {
  if (!chrome_url.SchemeIs("chrome")) {
    return GURL();
  }

  std::string chrome_url_string = chrome_url.spec();
  
  // Find matching redirect
  for (const auto& redirect : kChromeToToubkalRedirects) {
    if (chrome_url_string == redirect.first) {
      return GURL(redirect.second);
    }
  }
  
  // Check for partial matches (e.g., chrome://settings/ with query params)
  for (const auto& redirect : kChromeToToubkalRedirects) {
    if (chrome_url_string.find(redirect.first) == 0) {
      // Replace the chrome:// part with toubkal://
      std::string toubkal_url = redirect.second + 
          chrome_url_string.substr(redirect.first.length());
      return GURL(toubkal_url);
    }
  }
  
  return GURL();
}

bool IsValidToubkalInternalUrl(const GURL& url) {
  if (!url.SchemeIs("toubkal")) {
    return false;
  }
  
  std::string path = url.path();
  if (path.empty() || path == "/") {
    return false;
  }
  
  // Remove leading slash
  if (path[0] == '/') {
    path = path.substr(1);
  }
  
  // Check if it's a supported internal page
  for (const auto& page : kSupportedToubkalInternalPages) {
    if (path == page || path.find(page + "/") == 0) {
      return true;
    }
  }
  
  return false;
}

std::vector<std::string> GetSupportedToubkalInternalPages() {
  return kSupportedToubkalInternalPages;
}

}  // namespace url
}  // namespace browser
}  // namespace toubkal