#include "toubkal/browser/url/url_scheme_registration.h"

#include "testing/gtest/include/gtest/gtest.h"
#include "url/gurl.h"

namespace toubkal {
namespace browser {
namespace url {

class UrlSchemeRegistrationTest : public testing::Test {
 protected:
  void SetUp() override {
    // Register the toubkal:// scheme for testing
    RegisterToubkalUrlScheme();
  }
};

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeSettings) {
  GURL chrome_url("chrome://settings/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://settings/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeAbout) {
  GURL chrome_url("chrome://about/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://about/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeVersion) {
  GURL chrome_url("chrome://version/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://version/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeFlags) {
  GURL chrome_url("chrome://flags/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://flags/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeAudit) {
  GURL chrome_url("chrome://audit/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://audit/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeConsent) {
  GURL chrome_url("chrome://consent/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://consent/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeMCP) {
  GURL chrome_url("chrome://mcp/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://mcp/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeAI) {
  GURL chrome_url("chrome://ai/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://ai/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeNewTab) {
  GURL chrome_url("chrome://newtab/");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://newtab/");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_ChromeWithQueryParams) {
  GURL chrome_url("chrome://settings/?search=privacy");
  GURL redirect_url = GetToubkalRedirectUrl(chrome_url);
  
  EXPECT_TRUE(redirect_url.is_valid());
  EXPECT_EQ(redirect_url.spec(), "toubkal://settings/?search=privacy");
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_NonChromeUrl) {
  GURL non_chrome_url("https://example.com");
  GURL redirect_url = GetToubkalRedirectUrl(non_chrome_url);
  
  EXPECT_FALSE(redirect_url.is_valid());
}

TEST_F(UrlSchemeRegistrationTest, GetToubkalRedirectUrl_UnsupportedChromeUrl) {
  GURL unsupported_url("chrome://unsupported/");
  GURL redirect_url = GetToubkalRedirectUrl(unsupported_url);
  
  EXPECT_FALSE(redirect_url.is_valid());
}

TEST_F(UrlSchemeRegistrationTest, IsValidToubkalInternalUrl_ValidUrls) {
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://settings/")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://about/")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://version/")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://flags/")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://audit/")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://consent/")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://mcp/")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://ai/")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://newtab/")));
}

TEST_F(UrlSchemeRegistrationTest, IsValidToubkalInternalUrl_WithQueryParams) {
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://settings/?search=privacy")));
  EXPECT_TRUE(IsValidToubkalInternalUrl(GURL("toubkal://audit/?filter=recent")));
}

TEST_F(UrlSchemeRegistrationTest, IsValidToubkalInternalUrl_InvalidUrls) {
  EXPECT_FALSE(IsValidToubkalInternalUrl(GURL("https://example.com")));
  EXPECT_FALSE(IsValidToubkalInternalUrl(GURL("chrome://settings/")));
  EXPECT_FALSE(IsValidToubkalInternalUrl(GURL("toubkal://unsupported/")));
  EXPECT_FALSE(IsValidToubkalInternalUrl(GURL("toubkal://")));
  EXPECT_FALSE(IsValidToubkalInternalUrl(GURL("toubkal:///")));
}

TEST_F(UrlSchemeRegistrationTest, GetSupportedToubkalInternalPages) {
  std::vector<std::string> pages = GetSupportedToubkalInternalPages();
  
  EXPECT_EQ(pages.size(), 9);
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "settings") != pages.end());
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "about") != pages.end());
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "version") != pages.end());
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "flags") != pages.end());
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "audit") != pages.end());
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "consent") != pages.end());
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "mcp") != pages.end());
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "ai") != pages.end());
  EXPECT_TRUE(std::find(pages.begin(), pages.end(), "newtab") != pages.end());
}

}  // namespace url
}  // namespace browser
}  // namespace toubkal
