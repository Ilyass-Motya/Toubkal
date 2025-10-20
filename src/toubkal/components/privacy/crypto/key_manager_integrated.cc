#include "toubkal/components/privacy/crypto/key_manager_integrated.h"

#include "base/guid.h"
#include "base/logging.h"
#include "toubkal/components/privacy/common_types.h"

namespace toubkal {
namespace privacy {
namespace crypto {

KeyManagerIntegrated::KeyManagerIntegrated(const base::FilePath& storage_path)
    : crypto_manager_(std::make_unique<KeyManager>()),
      storage_(std::make_unique<audit::AuditStorage>(storage_path)),
      initialized_(false) {}

KeyManagerIntegrated::~KeyManagerIntegrated() = default;

Result<bool> KeyManagerIntegrated::Initialize() {
  if (initialized_) {
    return Result<bool>::Success(true);
  }

  // Initialize storage
  auto storage_result = storage_->Initialize();
  if (!storage_result.success) {
    return Result<bool>::Failure("Failed to initialize storage: " + storage_result.error);
  }

  initialized_ = true;
  return Result<bool>::Success(true);
}

Result<std::string> KeyManagerIntegrated::GenerateAndStoreKeyPair() {
  if (!initialized_) {
    return Result<std::string>::Failure("KeyManager not initialized");
  }

  // Generate key pair using crypto manager
  auto key_result = crypto_manager_->GenerateKeyPair();
  if (!key_result.success) {
    return Result<std::string>::Failure("Failed to generate key pair: " + key_result.error);
  }

  // Create storage entry
  std::string key_id = GenerateKeyId();
  audit::KeyStorageEntry entry(key_id,
                              key_result.data.public_key,
                              key_result.data.private_key);

  // Store the key
  auto store_result = storage_->StoreKey(entry);
  if (!store_result.success) {
    return Result<std::string>::Failure("Failed to store key: " + store_result.error);
  }

  // Set as active if no active key exists
  auto active_result = storage_->GetActiveKey();
  if (!active_result.success) {
    // No active key, set this one as active
    auto set_active_result = storage_->SetActiveKey(key_id);
    if (!set_active_result.success) {
      LOG(WARNING) << "Failed to set key as active: " << set_active_result.error;
      // Don't fail the operation, just log the warning
    }
  }

  return Result<std::string>::Success(key_id);
}

Result<std::string> KeyManagerIntegrated::SignData(const std::string& data) {
  if (!initialized_) {
    return Result<std::string>::Failure("KeyManager not initialized");
  }

  // Get active key
  auto active_result = EnsureActiveKey();
  if (!active_result.success) {
    return Result<std::string>::Failure("No active key available: " + active_result.error);
  }

  // Sign using crypto manager
  auto sign_result = crypto_manager_->SignData(data, active_result.data.private_key);
  if (!sign_result.success) {
    return Result<std::string>::Failure("Failed to sign data: " + sign_result.error);
  }

  // Update last used timestamp
  active_result.data.last_used_timestamp = base::Time::Now().ToJavaTime();
  auto update_result = storage_->StoreKey(active_result.data);
  if (!update_result.success) {
    LOG(WARNING) << "Failed to update key usage timestamp: " << update_result.error;
  }

  return Result<std::string>::Success(sign_result.data);
}

Result<bool> KeyManagerIntegrated::VerifySignature(const std::string& data,
                                                  const std::string& signature) {
  if (!initialized_) {
    return Result<bool>::Failure("KeyManager not initialized");
  }

  // Get active key
  auto active_result = EnsureActiveKey();
  if (!active_result.success) {
    return Result<bool>::Failure("No active key available: " + active_result.error);
  }

  // Verify using crypto manager
  auto verify_result = crypto_manager_->VerifySignature(data, signature,
                                                       active_result.data.public_key);
  return verify_result;
}

Result<bool> KeyManagerIntegrated::RotateKeys() {
  if (!initialized_) {
    return Result<bool>::Failure("KeyManager not initialized");
  }

  // Generate new key pair
  auto new_key_result = GenerateAndStoreKeyPair();
  if (!new_key_result.success) {
    return Result<bool>::Failure("Failed to generate new key: " + new_key_result.error);
  }

  // Get current active key
  auto active_result = storage_->GetActiveKey();
  if (active_result.success) {
    // Rotate: new key becomes active, old key remains but inactive
    auto rotate_result = storage_->RotateKey(active_result.data.key_id,
                                            audit::KeyStorageEntry(new_key_result.data, "", ""));
    if (!rotate_result.success) {
      return Result<bool>::Failure("Failed to rotate keys: " + rotate_result.error);
    }
  }

  return Result<bool>::Success(true);
}

Result<std::vector<audit::KeyStorageEntry>> KeyManagerIntegrated::GetAllKeys() {
  if (!initialized_) {
    return Result<std::vector<audit::KeyStorageEntry>>::Failure("KeyManager not initialized");
  }

  return storage_->LoadAllKeys();
}

Result<bool> KeyManagerIntegrated::DeleteKey(const std::string& key_id) {
  if (!initialized_) {
    return Result<bool>::Failure("KeyManager not initialized");
  }

  // Don't allow deletion of active key
  auto active_result = storage_->GetActiveKey();
  if (active_result.success && active_result.data.key_id == key_id) {
    return Result<bool>::Failure("Cannot delete active key");
  }

  return storage_->DeleteKey(key_id);
}

Result<bool> KeyManagerIntegrated::CleanupExpiredKeys(int64_t max_age_days) {
  if (!initialized_) {
    return Result<bool>::Failure("KeyManager not initialized");
  }

  // Get expired keys
  auto expired_result = storage_->GetExpiredKeys(max_age_days);
  if (!expired_result.success) {
    return Result<bool>::Failure("Failed to get expired keys: " + expired_result.error);
  }

  // Delete expired keys (but not active ones)
  for (const auto& key : expired_result.data) {
    if (!key.is_active) {
      auto delete_result = storage_->DeleteKey(key.key_id);
      if (!delete_result.success) {
        LOG(WARNING) << "Failed to delete expired key " << key.key_id << ": " << delete_result.error;
      }
    }
  }

  return Result<bool>::Success(true);
}

std::string KeyManagerIntegrated::GenerateKeyId() {
  return base::GenerateGUID();
}

Result<audit::KeyStorageEntry> KeyManagerIntegrated::EnsureActiveKey() {
  // Try to get existing active key
  auto active_result = storage_->GetActiveKey();
  if (active_result.success) {
    return active_result;
  }

  // No active key, try to generate one
  auto generate_result = GenerateAndStoreKeyPair();
  if (!generate_result.success) {
    return Result<audit::KeyStorageEntry>::Failure("Failed to create active key: " + generate_result.error);
  }

  // Get the newly created active key
  active_result = storage_->GetActiveKey();
  if (!active_result.success) {
    return Result<audit::KeyStorageEntry>::Failure("Failed to retrieve newly created active key");
  }

  return active_result;
}

}  // namespace crypto
}  // namespace privacy
}  // namespace toubkal
