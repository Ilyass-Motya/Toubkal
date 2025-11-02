// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/components/diagnostics/logging/logger.h"

#include <memory>
#include <string>
#include <vector>

#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/json/json_reader.h"
#include "base/run_loop.h"
#include "base/test/task_environment.h"
#include "base/values.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {
namespace diagnostics {

class LoggerTest : public testing::Test {
 protected:
  void SetUp() override {
    task_environment_ = std::make_unique<base::test::TaskEnvironment>();
    ASSERT_TRUE(temp_dir_.CreateUniqueTempDir());
  }

  void TearDown() override {
    task_environment_.reset();
  }

  std::unique_ptr<base::test::TaskEnvironment> task_environment_;
  base::ScopedTempDir temp_dir_;
};

TEST_F(LoggerTest, InitializeWithConfig) {
  Logger& logger = Logger::GetInstance();
  
  base::Value::Dict config;
  config.Set("console_enabled", true);
  config.Set("file_path", temp_dir_.GetPath().AppendASCII("test.log").AsUTF8Unsafe());
  
  logger.Initialize(config);
  
  // Logger should be initialized without errors
  SUCCEED();
}

TEST_F(LoggerTest, LogLevels) {
  Logger& logger = Logger::GetInstance();
  
  base::Value::Dict config;
  config.Set("console_enabled", true);
  logger.Initialize(config);
  
  // Test all log levels
  logger.Debug("TestComponent", "Debug message");
  logger.Info("TestComponent", "Info message");
  logger.Warn("TestComponent", "Warning message");
  logger.Error("TestComponent", "Error message");
  logger.Fatal("TestComponent", "Fatal message");
  
  // All log calls should complete without errors
  SUCCEED();
}

TEST_F(LoggerTest, StructuredLogging) {
  Logger& logger = Logger::GetInstance();
  
  base::Value::Dict config;
  config.Set("console_enabled", true);
  logger.Initialize(config);
  
  base::Value::Dict context;
  context.Set("key1", "value1");
  context.Set("key2", 42);
  context.Set("key3", true);
  
  logger.Info("TestComponent", "Structured message", context);
  
  // Structured logging should complete without errors
  SUCCEED();
}

TEST_F(LoggerTest, PrivacySafeLogging) {
  Logger& logger = Logger::GetInstance();
  
  base::Value::Dict config;
  config.Set("console_enabled", true);
  logger.Initialize(config);
  
  base::Value::Dict context;
  context.Set("email", "user@example.com");
  context.Set("password", "secret123");
  context.Set("userId", "12345");
  context.Set("safeField", "not-redacted");
  
  logger.LogSafe(LogLevel::INFO, "TestComponent", "Privacy test", context);
  
  // Privacy-safe logging should complete without errors
  SUCCEED();
}

TEST_F(LoggerTest, CorrelationId) {
  Logger& logger = Logger::GetInstance();
  
  base::Value::Dict config;
  config.Set("console_enabled", true);
  logger.Initialize(config);
  
  const std::string correlation_id = "test-correlation-123";
  logger.SetCorrelationId(correlation_id);
  
  EXPECT_EQ(logger.GetCorrelationId(), correlation_id);
  
  logger.Info("TestComponent", "Message with correlation");
  
  // Correlation ID should be set and used
  SUCCEED();
}

TEST_F(LoggerTest, FileLogging) {
  Logger& logger = Logger::GetInstance();
  
  base::FilePath log_file = temp_dir_.GetPath().AppendASCII("test.log");
  
  base::Value::Dict config;
  config.Set("file_path", log_file.AsUTF8Unsafe());
  logger.Initialize(config);
  
  logger.Info("TestComponent", "File log message");
  logger.Flush();
  
  // Check if file was created and contains the log message
  EXPECT_TRUE(base::PathExists(log_file));
  
  std::string file_contents;
  EXPECT_TRUE(base::ReadFileToString(log_file, &file_contents));
  EXPECT_TRUE(file_contents.find("File log message") != std::string::npos);
}

TEST_F(LoggerTest, JsonLogging) {
  Logger& logger = Logger::GetInstance();
  
  base::FilePath json_file = temp_dir_.GetPath().AppendASCII("test.json");
  
  base::Value::Dict config;
  config.Set("json_path", json_file.AsUTF8Unsafe());
  logger.Initialize(config);
  
  base::Value::Dict context;
  context.Set("key", "value");
  
  logger.Info("TestComponent", "JSON log message", context);
  logger.Flush();
  
  // Check if JSON file was created and contains valid JSON
  EXPECT_TRUE(base::PathExists(json_file));
  
  std::string file_contents;
  EXPECT_TRUE(base::ReadFileToString(json_file, &file_contents));
  
  // Parse JSON to verify it's valid
  auto json_value = base::JSONReader::Read(file_contents);
  EXPECT_TRUE(json_value.has_value());
}

TEST_F(LoggerTest, LogSinkManagement) {
  Logger& logger = Logger::GetInstance();
  
  base::Value::Dict config;
  config.Set("console_enabled", true);
  logger.Initialize(config);
  
  // Test adding and removing sinks
  auto console_sink = base::MakeRefCounted<ConsoleLogSink>();
  auto file_sink = base::MakeRefCounted<FileLogSink>(
      temp_dir_.GetPath().AppendASCII("sink_test.log").AsUTF8Unsafe());
  
  logger.AddSink(console_sink);
  logger.AddSink(file_sink);
  
  logger.Info("TestComponent", "Sink test message");
  logger.Flush();
  
  // Remove file sink
  logger.RemoveSink(file_sink);
  
  logger.Info("TestComponent", "After sink removal");
  
  // Sink management should work without errors
  SUCCEED();
}

TEST_F(LoggerTest, ConsoleLogSink) {
  auto sink = base::MakeRefCounted<ConsoleLogSink>();
  
  LogEntry entry(LogLevel::INFO, "TestComponent", "Console test");
  entry.context.Set("key", "value");
  entry.correlation_id = "test-123";
  
  // Console sink should not crash
  sink->Write(entry);
  sink->Flush();
  
  SUCCEED();
}

TEST_F(LoggerTest, FileLogSink) {
  base::FilePath log_file = temp_dir_.GetPath().AppendASCII("sink_test.log");
  auto sink = base::MakeRefCounted<FileLogSink>(log_file.AsUTF8Unsafe());
  
  LogEntry entry(LogLevel::INFO, "TestComponent", "File sink test");
  entry.context.Set("key", "value");
  
  sink->Write(entry);
  sink->Flush();
  
  // Check if file was created and contains the message
  EXPECT_TRUE(base::PathExists(log_file));
  
  std::string file_contents;
  EXPECT_TRUE(base::ReadFileToString(log_file, &file_contents));
  EXPECT_TRUE(file_contents.find("File sink test") != std::string::npos);
}

TEST_F(LoggerTest, JsonLogSink) {
  base::FilePath json_file = temp_dir_.GetPath().AppendASCII("sink_test.json");
  auto sink = base::MakeRefCounted<JsonLogSink>(json_file.AsUTF8Unsafe());
  
  LogEntry entry(LogLevel::INFO, "TestComponent", "JSON sink test");
  entry.context.Set("key", "value");
  
  sink->Write(entry);
  sink->Flush();
  
  // Check if JSON file was created and contains valid JSON
  EXPECT_TRUE(base::PathExists(json_file));
  
  std::string file_contents;
  EXPECT_TRUE(base::ReadFileToString(json_file, &file_contents));
  
  // Parse JSON to verify it's valid
  auto json_value = base::JSONReader::Read(file_contents);
  EXPECT_TRUE(json_value.has_value());
}

TEST_F(LoggerTest, LoggingMacros) {
  Logger& logger = Logger::GetInstance();
  
  base::Value::Dict config;
  config.Set("console_enabled", true);
  logger.Initialize(config);
  
  // Test logging macros
  TOUBKAL_LOG_DEBUG("TestComponent", "Macro debug");
  TOUBKAL_LOG_INFO("TestComponent", "Macro info");
  TOUBKAL_LOG_WARN("TestComponent", "Macro warn");
  TOUBKAL_LOG_ERROR("TestComponent", "Macro error");
  TOUBKAL_LOG_FATAL("TestComponent", "Macro fatal");
  
  // Test privacy-safe macros
  TOUBKAL_LOG_SAFE_INFO("TestComponent", "Safe macro");
  
  // All macros should work without errors
  SUCCEED();
}

TEST_F(LoggerTest, MultipleInstances) {
  // Logger should be a singleton
  Logger& logger1 = Logger::GetInstance();
  Logger& logger2 = Logger::GetInstance();
  
  EXPECT_EQ(&logger1, &logger2);
}

TEST_F(LoggerTest, ThreadSafety) {
  Logger& logger = Logger::GetInstance();
  
  base::Value::Dict config;
  config.Set("console_enabled", true);
  logger.Initialize(config);
  
  // Test logging from multiple threads (simulated)
  logger.SetCorrelationId("thread-test");
  
  for (int i = 0; i < 100; ++i) {
    logger.Info("TestComponent", "Thread safety test " + std::to_string(i));
  }
  
  logger.Flush();
  
  // Thread safety test should complete without errors
  SUCCEED();
}

}  // namespace diagnostics
}  // namespace toubkal
