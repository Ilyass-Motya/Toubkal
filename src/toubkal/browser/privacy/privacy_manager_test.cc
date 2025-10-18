/**
 * Toubkal Browser Privacy Manager Unit Tests
 * 
 * Comprehensive unit tests for the PrivacyManager C++ implementation
 * following Chromium testing patterns and gtest framework.
 */

#include "toubkal/browser/privacy/privacy_manager.h"

#include <memory>
#include <string>

#include "base/bind.h"
#include "base/callback_helpers.h"
#include "base/run_loop.h"
#include "base/test/task_environment.h"
#include "base/values.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "testing/gtest/include/gtest/gtest.h"

#include "toubkal/common/privacy.mojom.h"

namespace toubkal {

class PrivacyManagerTest : public testing::Test {
 protected:
  void SetUp() override {
    privacy_manager_ = std::make_unique<PrivacyManager>();
  }

  void TearDown() override {
    privacy_manager_.reset();
  }

  base::test::TaskEnvironment task_environment_;
  std::unique_ptr<PrivacyManager> privacy_manager_;
};

TEST_F(PrivacyManagerTest, InitializeReturnsSuccess) {
  // Arrange
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  mojom::PrivacyStatusPtr status;

  // Act
  privacy_manager_->Initialize(base::BindOnce(
      [&](bool result, const std::string& err, mojom::PrivacyStatusPtr st) {
        success = result;
        error = err;
        status = std::move(st);
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_TRUE(status);
  EXPECT_EQ(status->status, "enabled");
  EXPECT_TRUE(status->features->fingerprinting);
  EXPECT_TRUE(status->features->tracking);
  EXPECT_TRUE(status->features->shields);
}

TEST_F(PrivacyManagerTest, GetSettingsReturnsCurrentSettings) {
  // Arrange
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  mojom::PrivacySettingsPtr settings;

  // Act
  privacy_manager_->GetSettings(base::BindOnce(
      [&](bool result, const std::string& err, mojom::PrivacySettingsPtr st) {
        success = result;
        error = err;
        settings = std::move(st);
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_TRUE(settings);
  EXPECT_TRUE(settings->fingerprinting_protection);
  EXPECT_TRUE(settings->tracker_blocking);
  EXPECT_TRUE(settings->brave_shields_aggressive);
  EXPECT_TRUE(settings->protection_enabled);
}

TEST_F(PrivacyManagerTest, UpdateSettingsWithValidData) {
  // Arrange
  base::Value::Dict new_settings;
  new_settings.SetBoolKey("fingerprintingProtection", false);
  new_settings.SetBoolKey("trackerBlocking", false);

  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  mojom::PrivacySettingsPtr updated_settings;

  // Act
  privacy_manager_->UpdateSettings(new_settings, base::BindOnce(
      [&](bool result, const std::string& err, mojom::PrivacySettingsPtr st) {
        success = result;
        error = err;
        updated_settings = std::move(st);
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_TRUE(updated_settings);
  EXPECT_FALSE(updated_settings->fingerprinting_protection);
  EXPECT_FALSE(updated_settings->tracker_blocking);
  EXPECT_TRUE(updated_settings->protection_enabled); // Should remain enabled
}

TEST_F(PrivacyManagerTest, UpdateSettingsWithInvalidData) {
  // Arrange
  base::Value::Dict invalid_settings;
  invalid_settings.SetStringKey("fingerprintingProtection", "invalid");

  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  mojom::PrivacySettingsPtr updated_settings;

  // Act
  privacy_manager_->UpdateSettings(invalid_settings, base::BindOnce(
      [&](bool result, const std::string& err, mojom::PrivacySettingsPtr st) {
        success = result;
        error = err;
        updated_settings = std::move(st);
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_FALSE(success);
  EXPECT_FALSE(error.empty());
  EXPECT_FALSE(updated_settings);
}

TEST_F(PrivacyManagerTest, EnableProtectionWhenAlreadyEnabled) {
  // Arrange
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  bool enabled = false;

  // Act
  privacy_manager_->EnableProtection(base::BindOnce(
      [&](bool result, const std::string& err, bool en) {
        success = result;
        error = err;
        enabled = en;
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_TRUE(enabled);
}

TEST_F(PrivacyManagerTest, DisableProtectionWhenEnabled) {
  // Arrange
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  bool disabled = false;

  // Act
  privacy_manager_->DisableProtection(base::BindOnce(
      [&](bool result, const std::string& err, bool dis) {
        success = result;
        error = err;
        disabled = dis;
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_TRUE(disabled);
}

TEST_F(PrivacyManagerTest, RunFingerprintingTestsReturnsResults) {
  // Arrange
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  std::vector<mojom::FingerprintingTestResultPtr> results;

  // Act
  privacy_manager_->RunFingerprintingTests(base::BindOnce(
      [&](bool result, const std::string& err, 
          std::vector<mojom::FingerprintingTestResultPtr> res) {
        success = result;
        error = err;
        results = std::move(res);
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_FALSE(results.empty());
  EXPECT_EQ(results[0]->test_name, "Canvas Fingerprinting");
  EXPECT_TRUE(results[0]->passed);
}

TEST_F(PrivacyManagerTest, GetAuditLogReturnsEntries) {
  // Arrange
  // First, trigger some events to create audit log entries
  privacy_manager_->Initialize(base::DoNothing());
  
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  std::vector<mojom::AuditLogEntryPtr> entries;

  // Act
  privacy_manager_->GetAuditLog(10, base::BindOnce(
      [&](bool result, const std::string& err, 
          std::vector<mojom::AuditLogEntryPtr> ent) {
        success = result;
        error = err;
        entries = std::move(ent);
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_FALSE(entries.empty());
}

TEST_F(PrivacyManagerTest, ExportAuditLogAsJson) {
  // Arrange
  // First, trigger some events to create audit log entries
  privacy_manager_->Initialize(base::DoNothing());
  
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  std::string json_data;

  // Act
  privacy_manager_->ExportAuditLog("json", base::BindOnce(
      [&](bool result, const std::string& err, const std::string& data) {
        success = result;
        error = err;
        json_data = data;
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_FALSE(json_data.empty());
  EXPECT_TRUE(json_data.find("eventId") != std::string::npos);
}

TEST_F(PrivacyManagerTest, ExportAuditLogAsCsv) {
  // Arrange
  // First, trigger some events to create audit log entries
  privacy_manager_->Initialize(base::DoNothing());
  
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  std::string csv_data;

  // Act
  privacy_manager_->ExportAuditLog("csv", base::BindOnce(
      [&](bool result, const std::string& err, const std::string& data) {
        success = result;
        error = err;
        csv_data = data;
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(error.empty());
  EXPECT_FALSE(csv_data.empty());
  EXPECT_TRUE(csv_data.find("eventId,timestamp,eventType") != std::string::npos);
}

TEST_F(PrivacyManagerTest, ExportAuditLogWithUnsupportedFormat) {
  // Arrange
  base::RunLoop run_loop;
  bool success = false;
  std::string error;
  std::string data;

  // Act
  privacy_manager_->ExportAuditLog("pdf", base::BindOnce(
      [&](bool result, const std::string& err, const std::string& d) {
        success = result;
        error = err;
        data = d;
        run_loop.Quit();
      }));

  run_loop.Run();

  // Assert
  EXPECT_FALSE(success);
  EXPECT_FALSE(error.empty());
  EXPECT_TRUE(data.empty());
}

TEST_F(PrivacyManagerTest, IsProtectionEnabledReturnsCorrectState) {
  // Arrange & Act
  bool initially_enabled = privacy_manager_->IsProtectionEnabled();
  
  // Disable protection
  base::RunLoop disable_loop;
  privacy_manager_->DisableProtection(base::BindOnce(
      [&](bool result, const std::string& err, bool disabled) {
        disable_loop.Quit();
      }));
  disable_loop.Run();
  
  bool after_disable = privacy_manager_->IsProtectionEnabled();
  
  // Re-enable protection
  base::RunLoop enable_loop;
  privacy_manager_->EnableProtection(base::BindOnce(
      [&](bool result, const std::string& err, bool enabled) {
        enable_loop.Quit();
      }));
  enable_loop.Run();
  
  bool after_enable = privacy_manager_->IsProtectionEnabled();

  // Assert
  EXPECT_TRUE(initially_enabled);
  EXPECT_FALSE(after_disable);
  EXPECT_TRUE(after_enable);
}

TEST_F(PrivacyManagerTest, PerformanceRequirementsMet) {
  // Arrange
  base::TimeTicks start_time = base::TimeTicks::Now();
  
  base::RunLoop run_loop;
  bool success = false;
  mojom::PrivacyStatusPtr status;

  // Act
  privacy_manager_->Initialize(base::BindOnce(
      [&](bool result, const std::string& err, mojom::PrivacyStatusPtr st) {
        success = result;
        status = std::move(st);
        run_loop.Quit();
      }));

  run_loop.Run();
  
  base::TimeTicks end_time = base::TimeTicks::Now();
  int64_t duration_ms = (end_time - start_time).InMilliseconds();

  // Assert
  EXPECT_TRUE(success);
  EXPECT_TRUE(status);
  EXPECT_LT(duration_ms, 2000); // Should complete within 2 seconds
  EXPECT_LT(status->performance->activation_time, 2000);
  EXPECT_LT(status->performance->first_run_time, 10000);
}

}  // namespace toubkal
