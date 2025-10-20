#include "toubkal/browser/url/url_redirect_handler.h"

#include "testing/gtest/include/gtest/gtest.h"
#include "url/gurl.h"

namespace toubkal {
namespace browser {
namespace url {

class UrlRedirectHandlerTest : public testing::Test {
 protected:
  void SetUp() override {
    handler_ = std::make_unique<UrlRedirectHandler>();
  }

  std::unique_ptr<UrlRedirectHandler> handler_;
};

TEST_F(UrlRedirectHandlerTest, ShouldRedirect_ChromeUrls) {
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://settings/")));
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://about/")));
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://version/")));
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://flags/")));
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://audit/")));
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://consent/")));
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://mcp/")));
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://ai/")));
  EXPECT_TRUE(handler_->ShouldRedirect(GURL("chrome://newtab/")));
}

TEST_F(UrlRedirectHandlerTest, ShouldRedirect_NonChromeUrls) {
  EXPECT_FALSE(handler_->ShouldRedirect(GURL("https://example.com")));
  EXPECT_FALSE(handler_->ShouldRedirect(GURL("http://example.com")));
  EXPECT_FALSE(handler_->ShouldRedirect(GURL("toubkal://settings/")));
  EXPECT_FALSE(handler_->ShouldRedirect(GURL("file:///path/to/file")));
}

TEST_F(UrlRedirectHandlerTest, ShouldRedirect_InvalidUrls) {
  EXPECT_FALSE(handler_->ShouldRedirect(GURL("")));
  EXPECT_FALSE(handler_->ShouldRedirect(GURL("invalid-url")));
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeSettings) {
  GURL chrome_url("chrome://settings/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://settings/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeAbout) {
  GURL chrome_url("chrome://about/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://about/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeVersion) {
  GURL chrome_url("chrome://version/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://version/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeFlags) {
  GURL chrome_url("chrome://flags/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://flags/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeAudit) {
  GURL chrome_url("chrome://audit/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://audit/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeConsent) {
  GURL chrome_url("chrome://consent/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://consent/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeMCP) {
  GURL chrome_url("chrome://mcp/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://mcp/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeAI) {
  GURL chrome_url("chrome://ai/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://ai/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeNewTab) {
  GURL chrome_url("chrome://newtab/");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://newtab/");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_ChromeWithQueryParams) {
  GURL chrome_url("chrome://settings/?search=privacy");
  GURL redirect_target = handler_->GetRedirectTarget(chrome_url);
  
  EXPECT_TRUE(redirect_target.is_valid());
  EXPECT_EQ(redirect_target.spec(), "toubkal://settings/?search=privacy");
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_NonChromeUrl) {
  GURL non_chrome_url("https://example.com");
  GURL redirect_target = handler_->GetRedirectTarget(non_chrome_url);
  
  EXPECT_EQ(redirect_target.spec(), non_chrome_url.spec());
}

TEST_F(UrlRedirectHandlerTest, GetRedirectTarget_UnsupportedChromeUrl) {
  GURL unsupported_url("chrome://unsupported/");
  GURL redirect_target = handler_->GetRedirectTarget(unsupported_url);
  
  EXPECT_EQ(redirect_target.spec(), unsupported_url.spec());
}

TEST_F(UrlRedirectHandlerTest, ProcessUrl_ChromeUrls) {
  GURL chrome_url("chrome://settings/");
  GURL processed_url = handler_->ProcessUrl(chrome_url);
  
  EXPECT_TRUE(processed_url.is_valid());
  EXPECT_EQ(processed_url.spec(), "toubkal://settings/");
}

TEST_F(UrlRedirectHandlerTest, ProcessUrl_NonChromeUrls) {
  GURL https_url("https://example.com");
  GURL processed_url = handler_->ProcessUrl(https_url);
  
  EXPECT_EQ(processed_url.spec(), https_url.spec());
}

TEST_F(UrlRedirectHandlerTest, ProcessUrl_InvalidUrls) {
  GURL invalid_url("");
  GURL processed_url = handler_->ProcessUrl(invalid_url);
  
  EXPECT_EQ(processed_url.spec(), invalid_url.spec());
}

}  // namespace url
}  // namespace browser
}  // namespace toubkal
