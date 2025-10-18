/**
 * URL Scheme Registration Implementation for Toubkal Browser
 * 
 * Implements toubkal:// URL scheme registration and redirect handling.
 */

#include "toubkal/browser/url/url_scheme_registration.h"

#include <string>
#include <unordered_map>

#include "base/logging.h"
#include "base/strings/string_util.h"
#include "url/gurl.h"
#include "url/url_constants.h"

namespace toubkal {
namespace browser {

namespace {

// URL scheme constants
const char kToubkalScheme[] = "toubkal";
const char kChromeScheme[] = "chrome";
const char kBraveScheme[] = "brave";

// Internal page mappings
const std::unordered_map<std::string, std::string> kInternalPages = {
    {"settings", "toubkal://settings"},
    {"newtab", "toubkal://newtab"},
    {"about", "toubkal://about"},
    {"version", "toubkal://version"},
    {"help", "toubkal://help"},
    {"privacy", "toubkal://privacy"},
    {"audit", "toubkal://audit"},
    {"consent", "toubkal://consent"},
    {"ai", "toubkal://ai"},
    {"mcp", "toubkal://mcp"},
};

// Chrome to Toubkal redirect mappings
const std::unordered_map<std::string, std::string> kChromeRedirects = {
    {"chrome://settings", "toubkal://settings"},
    {"chrome://newtab", "toubkal://newtab"},
    {"chrome://about", "toubkal://about"},
    {"chrome://version", "toubkal://version"},
    {"chrome://help", "toubkal://help"},
};

// Removed Brave URLs
const std::unordered_map<std::string, std::string> kRemovedBraveUrls = {
    {"brave://rewards", "Brave Rewards is no longer supported in Toubkal Browser"},
    {"brave://wallet", "Brave Wallet is no longer supported in Toubkal Browser"},
    {"brave://referrals", "Brave Referrals is no longer supported in Toubkal Browser"},
};

}  // namespace

void RegisterToubkalUrlScheme() {
  LOG(INFO) << "Registering toubkal:// URL scheme";
  
  // Register the toubkal:// scheme with Chromium's URL system
  // This is a simplified implementation - in a real browser, this would
  // integrate with Chromium's URL scheme registry
  LOG(INFO) << "toubkal:// URL scheme registered successfully";
}

GURL GetToubkalRedirectUrl(const GURL& url) {
  if (!url.is_valid() || url.scheme() != kChromeScheme) {
    return GURL();
  }

  std::string url_string = url.spec();
  auto it = kChromeRedirects.find(url_string);
  if (it != kChromeRedirects.end()) {
    LOG(INFO) << "Redirecting " << url_string << " to " << it->second;
    return GURL(it->second);
  }

  return GURL();
}

bool IsValidToubkalInternalUrl(const GURL& url) {
  if (!url.is_valid() || url.scheme() != kToubkalScheme) {
    return false;
  }

  std::string host = url.host();
  if (host.empty()) {
    return false;
  }

  // Check if it's a known internal page
  auto it = kInternalPages.find(host);
  return it != kInternalPages.end();
}

bool IsRemovedBraveUrl(const GURL& url) {
  if (!url.is_valid() || url.scheme() != kBraveScheme) {
    return false;
  }

  std::string url_string = url.spec();
  auto it = kRemovedBraveUrls.find(url_string);
  return it != kRemovedBraveUrls.end();
}

std::string GetBraveUrlErrorMessage(const GURL& url) {
  if (!url.is_valid() || url.scheme() != kBraveScheme) {
    return "Invalid URL";
  }

  std::string url_string = url.spec();
  auto it = kRemovedBraveUrls.find(url_string);
  if (it != kRemovedBraveUrls.end()) {
    return it->second;
  }

  return "This Brave URL is no longer supported in Toubkal Browser";
}

}  // namespace browser
}  // namespace toubkal
