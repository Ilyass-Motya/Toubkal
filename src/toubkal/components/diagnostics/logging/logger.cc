// Copyright 2025 Toubkal Browser. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "toubkal/components/diagnostics/logging/logger.h"

#include <fstream>
#include <iomanip>
#include <sstream>

#include "base/files/file_util.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/rand_util.h"
#include "base/strings/string_util.h"
#include "base/strings/stringprintf.h"
#include "base/time/time.h"

namespace toubkal {
namespace diagnostics {

// ConsoleLogSink implementation
void ConsoleLogSink::Write(const LogEntry& entry) {
  std::string level_str;
  switch (entry.level) {
    case LogLevel::DEBUG:
      level_str = "DEBUG";
      break;
    case LogLevel::INFO:
      level_str = "INFO";
      break;
    case LogLevel::WARN:
      level_str = "WARN";
      break;
    case LogLevel::ERROR:
      level_str = "ERROR";
      break;
    case LogLevel::FATAL:
      level_str = "FATAL";
      break;
  }

  std::string timestamp_str = base::TimeFormatWithPattern(
      entry.timestamp, "yyyy-MM-dd HH:mm:ss.SSS");
  
  std::string context_str;
  if (!entry.context.empty()) {
    std::string json_str;
    base::JSONWriter::Write(entry.context, &json_str);
    context_str = " " + json_str;
  }
  
  std::string correlation_str;
  if (!entry.correlation_id.empty()) {
    correlation_str = " [" + entry.correlation_id + "]";
  }

  std::string log_line = base::StringPrintf(
      "[%s] %s %s: %s%s%s",
      timestamp_str.c_str(),
      level_str.c_str(),
      entry.component.c_str(),
      entry.message.c_str(),
      context_str.c_str(),
      correlation_str.c_str());

  // Use Chromium's logging for console output
  switch (entry.level) {
    case LogLevel::DEBUG:
      VLOG(1) << log_line;
      break;
    case LogLevel::INFO:
      LOG(INFO) << log_line;
      break;
    case LogLevel::WARN:
      LOG(WARNING) << log_line;
      break;
    case LogLevel::ERROR:
      LOG(ERROR) << log_line;
      break;
    case LogLevel::FATAL:
      LOG(FATAL) << log_line;
      break;
  }
}

void ConsoleLogSink::Flush() {
  // Console output is automatically flushed
}

// FileLogSink implementation
FileLogSink::FileLogSink(const std::string& file_path) : file_path_(file_path) {
  DCHECK(!file_path_.empty());
}

FileLogSink::~FileLogSink() {
  Flush();
}

void FileLogSink::Write(const LogEntry& entry) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  std::ofstream file(file_path_, std::ios::app);
  if (!file.is_open()) {
    LOG(ERROR) << "Failed to open log file: " << file_path_;
    return;
  }

  std::string level_str;
  switch (entry.level) {
    case LogLevel::DEBUG:
      level_str = "DEBUG";
      break;
    case LogLevel::INFO:
      level_str = "INFO";
      break;
    case LogLevel::WARN:
      level_str = "WARN";
      break;
    case LogLevel::ERROR:
      level_str = "ERROR";
      break;
    case LogLevel::FATAL:
      level_str = "FATAL";
      break;
  }

  std::string timestamp_str = base::TimeFormatWithPattern(
      entry.timestamp, "yyyy-MM-dd HH:mm:ss.SSS");
  
  std::string context_str;
  if (!entry.context.empty()) {
    std::string json_str;
    base::JSONWriter::Write(entry.context, &json_str);
    context_str = " " + json_str;
  }
  
  std::string correlation_str;
  if (!entry.correlation_id.empty()) {
    correlation_str = " [" + entry.correlation_id + "]";
  }

  file << base::StringPrintf(
      "[%s] %s %s: %s%s%s\n",
      timestamp_str.c_str(),
      level_str.c_str(),
      entry.component.c_str(),
      entry.message.c_str(),
      context_str.c_str(),
      correlation_str.c_str());
}

void FileLogSink::Flush() {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  // File is automatically flushed on close
}

// JsonLogSink implementation
JsonLogSink::JsonLogSink(const std::string& file_path) : file_path_(file_path) {
  DCHECK(!file_path_.empty());
}

JsonLogSink::~JsonLogSink() {
  Flush();
}

void JsonLogSink::Write(const LogEntry& entry) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  std::ofstream file(file_path_, std::ios::app);
  if (!file.is_open()) {
    LOG(ERROR) << "Failed to open JSON log file: " << file_path_;
    return;
  }

  base::Value::Dict log_entry;
  log_entry.Set("timestamp", base::TimeFormatWithPattern(
      entry.timestamp, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
  log_entry.Set("level", static_cast<int>(entry.level));
  log_entry.Set("component", entry.component);
  log_entry.Set("message", entry.message);
  
  if (!entry.context.empty()) {
    log_entry.Set("context", entry.context.Clone());
  }
  
  if (!entry.correlation_id.empty()) {
    log_entry.Set("correlation_id", entry.correlation_id);
  }

  std::string json_str;
  base::JSONWriter::Write(log_entry, &json_str);
  file << json_str << "\n";
}

void JsonLogSink::Flush() {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  // File is automatically flushed on close
}

// Logger implementation
Logger& Logger::GetInstance() {
  static Logger instance;
  return instance;
}

void Logger::Initialize(const base::Value::Dict& config) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  // Clear existing sinks
  sinks_.clear();
  
  // Add console sink if enabled
  if (config.FindBool("console_enabled").value_or(true)) {
    AddSink(base::MakeRefCounted<ConsoleLogSink>());
  }
  
  // Add file sink if configured
  if (const std::string* file_path = config.FindString("file_path")) {
    AddSink(base::MakeRefCounted<FileLogSink>(*file_path));
  }
  
  // Add JSON sink if configured
  if (const std::string* json_path = config.FindString("json_path")) {
    AddSink(base::MakeRefCounted<JsonLogSink>(*json_path));
  }
}

void Logger::Log(LogLevel level, const std::string& component,
                 const std::string& message, const base::Value::Dict& context) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  LogEntry entry(level, component, message);
  entry.context = context.Clone();
  entry.correlation_id = correlation_id_;
  
  for (const auto& sink : sinks_) {
    sink->Write(entry);
  }
}

void Logger::Debug(const std::string& component, const std::string& message,
                   const base::Value::Dict& context) {
  Log(LogLevel::DEBUG, component, message, context);
}

void Logger::Info(const std::string& component, const std::string& message,
                  const base::Value::Dict& context) {
  Log(LogLevel::INFO, component, message, context);
}

void Logger::Warn(const std::string& component, const std::string& message,
                  const base::Value::Dict& context) {
  Log(LogLevel::WARN, component, message, context);
}

void Logger::Error(const std::string& component, const std::string& message,
                   const base::Value::Dict& context) {
  Log(LogLevel::ERROR, component, message, context);
}

void Logger::Fatal(const std::string& component, const std::string& message,
                   const base::Value::Dict& context) {
  Log(LogLevel::FATAL, component, message, context);
}

void Logger::AddSink(scoped_refptr<LogSink> sink) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  DCHECK(sink);
  sinks_.push_back(sink);
}

void Logger::RemoveSink(scoped_refptr<LogSink> sink) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  auto it = std::find(sinks_.begin(), sinks_.end(), sink);
  if (it != sinks_.end()) {
    sinks_.erase(it);
  }
}

void Logger::LogSafe(LogLevel level, const std::string& component,
                     const std::string& message, const base::Value::Dict& context) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  
  base::Value::Dict safe_context = RedactPII(context);
  Log(level, component, message, safe_context);
}

void Logger::SetCorrelationId(const std::string& correlation_id) {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  correlation_id_ = correlation_id;
}

std::string Logger::GetCorrelationId() const {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  return correlation_id_;
}

void Logger::Flush() {
  DCHECK_CALLED_ON_VALID_THREAD(thread_checker_);
  for (const auto& sink : sinks_) {
    sink->Flush();
  }
}

base::Value::Dict Logger::RedactPII(const base::Value::Dict& context) {
  base::Value::Dict redacted = context.Clone();
  
  // Redact common PII fields
  const std::vector<std::string> pii_fields = {
    "email", "phone", "ssn", "credit_card", "password", "token",
    "user_id", "session_id", "ip_address", "url", "query"
  };
  
  for (const auto& field : pii_fields) {
    if (redacted.contains(field)) {
      redacted.Set(field, "[REDACTED]");
    }
  }
  
  return redacted;
}

std::string Logger::GenerateCorrelationId() {
  return base::StringPrintf("%08x-%04x-%04x-%04x-%012x",
                            base::RandUint64() & 0xffffffff,
                            base::RandUint64() & 0xffff,
                            base::RandUint64() & 0xffff,
                            base::RandUint64() & 0xffff,
                            base::RandUint64() & 0xffffffffffff);
}

}  // namespace diagnostics
}  // namespace toubkal
