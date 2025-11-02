// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef TOUBKAL_COMPONENTS_DIAGNOSTICS_LOGGING_LOGGER_H_
#define TOUBKAL_COMPONENTS_DIAGNOSTICS_LOGGING_LOGGER_H_

#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

#include "base/logging.h"
#include "base/memory/ref_counted.h"
#include "base/values.h"
#include "base/threading/thread_checker.h"

namespace toubkal {
namespace diagnostics {

// Log levels for structured logging
enum class LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
};

// Structured log entry with context
struct LogEntry {
  LogLevel level;
  std::string component;
  std::string message;
  base::Value::Dict context;
  std::string correlation_id;
  base::Time timestamp;
  
  LogEntry(LogLevel l, const std::string& c, const std::string& m)
      : level(l), component(c), message(m), timestamp(base::Time::Now()) {}
};

// Log sink interface for different output destinations
class LogSink : public base::RefCountedThreadSafe<LogSink> {
 public:
  virtual ~LogSink() = default;
  virtual void Write(const LogEntry& entry) = 0;
  virtual void Flush() = 0;

 protected:
  friend class base::RefCountedThreadSafe<LogSink>;
};

// Console log sink for development
class ConsoleLogSink : public LogSink {
 public:
  void Write(const LogEntry& entry) override;
  void Flush() override;
};

// File log sink for persistent logging
class FileLogSink : public LogSink {
 public:
  explicit FileLogSink(const std::string& file_path);
  ~FileLogSink() override;
  
  void Write(const LogEntry& entry) override;
  void Flush() override;

 private:
  std::string file_path_;
  base::ThreadChecker thread_checker_;
};

// JSON log sink for structured output
class JsonLogSink : public LogSink {
 public:
  explicit JsonLogSink(const std::string& file_path);
  ~JsonLogSink() override;
  
  void Write(const LogEntry& entry) override;
  void Flush() override;

 private:
  std::string file_path_;
  base::ThreadChecker thread_checker_;
};

// Main logger class with structured logging support
class Logger {
 public:
  static Logger& GetInstance();
  
  // Initialize logger with configuration
  void Initialize(const base::Value::Dict& config);
  
  // Logging methods with structured context
  void Log(LogLevel level, const std::string& component, 
           const std::string& message, const base::Value::Dict& context = {});
  
  // Convenience methods
  void Debug(const std::string& component, const std::string& message,
             const base::Value::Dict& context = {});
  void Info(const std::string& component, const std::string& message,
            const base::Value::Dict& context = {});
  void Warn(const std::string& component, const std::string& message,
            const base::Value::Dict& context = {});
  void Error(const std::string& component, const std::string& message,
             const base::Value::Dict& context = {});
  void Fatal(const std::string& component, const std::string& message,
             const base::Value::Dict& context = {});
  
  // Add/remove log sinks
  void AddSink(scoped_refptr<LogSink> sink);
  void RemoveSink(scoped_refptr<LogSink> sink);
  
  // Privacy-safe logging (redacts PII)
  void LogSafe(LogLevel level, const std::string& component,
               const std::string& message, const base::Value::Dict& context = {});
  
  // Set correlation ID for request tracing
  void SetCorrelationId(const std::string& correlation_id);
  std::string GetCorrelationId() const;
  
  // Flush all sinks
  void Flush();

 private:
  Logger() = default;
  ~Logger() = default;
  
  // Disable copy and assignment
  Logger(const Logger&) = delete;
  Logger& operator=(const Logger&) = delete;
  
  // Redact PII from context
  base::Value::Dict RedactPII(const base::Value::Dict& context);
  
  // Generate correlation ID
  std::string GenerateCorrelationId();
  
  std::vector<scoped_refptr<LogSink>> sinks_;
  std::string correlation_id_;
  base::ThreadChecker thread_checker_;
};

// Convenience macros for logging
#define TOUBKAL_LOG_DEBUG(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().Debug(component, message, __VA_ARGS__)

#define TOUBKAL_LOG_INFO(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().Info(component, message, __VA_ARGS__)

#define TOUBKAL_LOG_WARN(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().Warn(component, message, __VA_ARGS__)

#define TOUBKAL_LOG_ERROR(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().Error(component, message, __VA_ARGS__)

#define TOUBKAL_LOG_FATAL(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().Fatal(component, message, __VA_ARGS__)

// Privacy-safe logging macros
#define TOUBKAL_LOG_SAFE_DEBUG(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().LogSafe( \
      toubkal::diagnostics::LogLevel::DEBUG, component, message, __VA_ARGS__)

#define TOUBKAL_LOG_SAFE_INFO(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().LogSafe( \
      toubkal::diagnostics::LogLevel::INFO, component, message, __VA_ARGS__)

#define TOUBKAL_LOG_SAFE_WARN(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().LogSafe( \
      toubkal::diagnostics::LogLevel::WARN, component, message, __VA_ARGS__)

#define TOUBKAL_LOG_SAFE_ERROR(component, message, ...) \
  toubkal::diagnostics::Logger::GetInstance().LogSafe( \
      toubkal::diagnostics::LogLevel::ERROR, component, message, __VA_ARGS__)

}  // namespace diagnostics
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_DIAGNOSTICS_LOGGING_LOGGER_H_
