#ifndef TOUBKAL_COMPONENTS_PRIVACY_COMMON_TYPES_H_
#define TOUBKAL_COMPONENTS_PRIVACY_COMMON_TYPES_H_

#include <string>

namespace toubkal {
namespace privacy {

// Result<T> type for operations that can succeed or fail
// Used across all privacy components for consistent error handling
template <typename T>
struct Result {
  bool success;
  T data;
  std::string error;

  // Success constructor
  static Result<T> Success(T value) {
    return {true, std::move(value), ""};
  }

  // Failure constructor
  static Result<T> Failure(std::string error_msg) {
    return {false, T{}, std::move(error_msg)};
  }

  // Check if result is success
  bool ok() const { return success; }

  // Get data (only call if success == true)
  const T& value() const { return data; }
  T& value() { return data; }
};

// Void specialization for operations that don't return data
template <>
struct Result<void> {
  bool success;
  std::string error;

  static Result<void> Success() {
    return {true, ""};
  }

  static Result<void> Failure(std::string error_msg) {
    return {false, std::move(error_msg)};
  }

  bool ok() const { return success; }
};

}  // namespace privacy
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_PRIVACY_COMMON_TYPES_H_
