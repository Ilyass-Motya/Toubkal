/**
 * Toubkal Browser Fingerprinting Protection Tests
 * 
 * Unit tests for fingerprinting protection functionality.
 */

#include "toubkal/browser/privacy/fingerprinting_protection.h"

#include "base/test/task_environment.h"
#include "base/test/test_simple_task_runner.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "mojo/public/cpp/bindings/remote.h"

namespace toubkal {

class FingerprintingProtectionTest : public testing::Test {
 public:
  FingerprintingProtectionTest() = default;
  ~FingerprintingProtectionTest() override = default;

  void SetUp() override {
    task_environment_ = std::make_unique<base::test::TaskEnvironment>();
    protection_ = std::make_unique<FingerprintingProtection>();
  }

  void TearDown() override {
    protection_.reset();
    task_environment_.reset();
  }

 protected:
  std::unique_ptr<base::test::TaskEnvironment> task_environment_;
  std::unique_ptr<FingerprintingProtection> protection_;
};

TEST_F(FingerprintingProtectionTest, InitialState) {
  EXPECT_TRUE(protection_->IsCanvasFingerprintingBlocked());
  EXPECT_TRUE(protection_->IsWebGLFingerprintingBlocked());
  EXPECT_TRUE(protection_->IsFontFingerprintingBlocked());
  EXPECT_TRUE(protection_->IsAudioFingerprintingBlocked());
}

TEST_F(FingerprintingProtectionTest, CanvasProtection) {
  std::string canvas_data = "test canvas data with devicePixelRatio=2.0";
  protection_->StandardizeCanvasData(&canvas_data);
  
  EXPECT_FALSE(canvas_data.find("devicePixelRatio") != std::string::npos);
  EXPECT_TRUE(canvas_data.find("1.0") != std::string::npos);
}

TEST_F(FingerprintingProtectionTest, WebGLProtection) {
  base::Value::Dict webgl_params;
  webgl_params.Set("vendor", "NVIDIA Corporation");
  webgl_params.Set("renderer", "NVIDIA GeForce GTX 1080");
  
  protection_->StandardizeWebGLParameters(&webgl_params);
  
  EXPECT_EQ(webgl_params.FindString("vendor").value_or(""), "WebKit");
  EXPECT_EQ(webgl_params.FindString("renderer").value_or(""), "WebKit WebGL");
}

TEST_F(FingerprintingProtectionTest, FontProtection) {
  std::vector<std::string> fonts = {
    "Arial", "Helvetica", "Times New Roman", "Custom Font 1", "Custom Font 2"
  };
  
  protection_->StandardizeFontList(&fonts);
  
  // Should only contain common fonts
  EXPECT_TRUE(std::find(fonts.begin(), fonts.end(), "Arial") != fonts.end());
  EXPECT_TRUE(std::find(fonts.begin(), fonts.end(), "Helvetica") != fonts.end());
  EXPECT_FALSE(std::find(fonts.begin(), fonts.end(), "Custom Font 1") != fonts.end());
}

TEST_F(FingerprintingProtectionTest, AudioProtection) {
  base::Value::Dict audio_params;
  audio_params.Set("sampleRate", 48000);
  audio_params.Set("maxChannelCount", 8);
  
  protection_->StandardizeAudioContext(&audio_params);
  
  EXPECT_EQ(audio_params.FindInt("sampleRate").value_or(0), 44100);
  EXPECT_EQ(audio_params.FindInt("maxChannelCount").value_or(0), 2);
}

TEST_F(FingerprintingProtectionTest, CanvasTest) {
  auto result = protection_->RunCanvasFingerprintingTest();
  
  EXPECT_EQ(result->test_name, "Canvas Fingerprinting Test");
  EXPECT_TRUE(result->passed);
  EXPECT_EQ(result->score, 0);
  EXPECT_TRUE(result->details->canvas_fingerprint);
}

TEST_F(FingerprintingProtectionTest, WebGLTest) {
  auto result = protection_->RunWebGLFingerprintingTest();
  
  EXPECT_EQ(result->test_name, "WebGL Fingerprinting Test");
  EXPECT_TRUE(result->passed);
  EXPECT_EQ(result->score, 0);
  EXPECT_TRUE(result->details->webgl_fingerprint);
}

TEST_F(FingerprintingProtectionTest, FontTest) {
  auto result = protection_->RunFontFingerprintingTest();
  
  EXPECT_EQ(result->test_name, "Font Fingerprinting Test");
  EXPECT_TRUE(result->passed);
  EXPECT_EQ(result->score, 0);
  EXPECT_TRUE(result->details->font_fingerprint);
}

TEST_F(FingerprintingProtectionTest, AudioTest) {
  auto result = protection_->RunAudioFingerprintingTest();
  
  EXPECT_EQ(result->test_name, "Audio Fingerprinting Test");
  EXPECT_TRUE(result->passed);
  EXPECT_EQ(result->score, 0);
  EXPECT_TRUE(result->details->audio_fingerprint);
}

}  // namespace toubkal
