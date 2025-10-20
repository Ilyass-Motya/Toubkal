#ifndef TOUBKAL_COMPONENTS_PRIVACY_CRYPTO_KEY_MANAGER_INTEGRATED_H_
#define TOUBKAL_COMPONENTS_PRIVACY_CRYPTO_KEY_MANAGER_INTEGRATED_H_

#include <memory>
#include <string>

#include "base/files/file_path.h"
#include "toubkal/components/privacy/audit/audit_storage.h"
#include "toubkal/components/privacy/common_types.h"
#include "toubkal/components/privacy/crypto/key_manager.h"

namespace toubkal {
namespace privacy {
namespace crypto {

// Integrated KeyManager that combines crypto operations with persistent storage
class KeyManagerIntegrated {
 public:
  explicit KeyManagerIntegrated(const base::FilePath& storage_path);
  ~KeyManagerIntegrated();

  // Disable copy and assignment
  KeyManagerIntegrated(const KeyManagerIntegrated&) = delete;
  KeyManagerIntegrated& operator=(const KeyManagerIntegrated&) = delete;

  // Initialize the key manager (creates storage if needed)
  Result<bool> Initialize();

  // Generate and persist a new key pair
  Result<std::string> GenerateAndStoreKeyPair();

  // Sign data using the active key
  Result<std::string> SignData(const std::string& data);

  // Verify signature using the active key
  Result<bool> VerifySignature(const std::string& data,
                              const std::string& signature);

  // Key lifecycle management
  Result<bool> RotateKeys();
  Result<std::vector<audit::KeyStorageEntry>> GetAllKeys();
  Result<bool> DeleteKey(const std::string& key_id);

  // Storage maintenance
  Result<bool> CleanupExpiredKeys(int64_t max_age_days = 365);

 private:
  // Generate a unique key ID
  std::string GenerateKeyId();

  // Get or create active key
  Result<audit::KeyStorageEntry> EnsureActiveKey();

  std::unique_ptr<KeyManager> crypto_manager_;
  std::unique_ptr<audit::AuditStorage> storage_;
  bool initialized_;
};

}  // namespace crypto
}  // namespace privacy
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_PRIVACY_CRYPTO_KEY_MANAGER_INTEGRATED_H_
