#ifndef TOUBKAL_COMPONENTS_PRIVACY_AUDIT_AUDIT_STORAGE_H_
#define TOUBKAL_COMPONENTS_PRIVACY_AUDIT_AUDIT_STORAGE_H_

#include <memory>
#include <string>
#include <vector>

#include "base/files/file_path.h"
#include "base/memory/scoped_refptr.h"
#include "third_party/leveldatabase/src/include/leveldb/db.h"
#include "toubkal/components/privacy/common_types.h"

namespace toubkal {
namespace privacy {
namespace audit {

// Key storage entry
struct KeyStorageEntry {
  std::string key_id;
  std::string public_key;
  std::string private_key;  // Encrypted at rest
  int64_t created_timestamp;
  int64_t last_used_timestamp;
  bool is_active;

  KeyStorageEntry();
  KeyStorageEntry(std::string id, std::string pub_key, std::string priv_key);
  ~KeyStorageEntry();
};

// Storage result types
using KeyStorageResult = Result<KeyStorageEntry>;
using KeyListResult = Result<std::vector<KeyStorageEntry>>;
using StorageResult = Result<bool>;

// AuditStorage provides secure key persistence using LevelDB
class AuditStorage {
 public:
  // Storage operation result
  enum class OperationResult {
    SUCCESS,
    NOT_FOUND,
    ALREADY_EXISTS,
    STORAGE_ERROR,
    INVALID_DATA
  };

  explicit AuditStorage(const base::FilePath& db_path);
  ~AuditStorage();

  // Disable copy and assignment
  AuditStorage(const AuditStorage&) = delete;
  AuditStorage& operator=(const AuditStorage&) = delete;

  // Initialize the storage database
  StorageResult Initialize();

  // Key management operations
  StorageResult StoreKey(const KeyStorageEntry& entry);
  KeyStorageResult LoadKey(const std::string& key_id);
  KeyListResult LoadAllKeys();
  StorageResult DeleteKey(const std::string& key_id);
  StorageResult RotateKey(const std::string& old_key_id,
                         const KeyStorageEntry& new_entry);

  // Key lifecycle operations
  KeyStorageResult GetActiveKey();
  StorageResult SetActiveKey(const std::string& key_id);
  KeyListResult GetExpiredKeys(int64_t max_age_days);

  // Storage maintenance
  StorageResult CompactDatabase();
  StorageResult ValidateIntegrity();

 private:
  // Database operations
  bool OpenDatabase();
  void CloseDatabase();

  // Key serialization/deserialization
  StorageResult SerializeKeyEntry(const KeyStorageEntry& entry);
  KeyStorageEntry DeserializeKeyEntry(const std::string& data);
  bool ValidateKeyEntry(const KeyStorageEntry& entry);

  // Encryption for private keys at rest (placeholder for now)
  std::string EncryptPrivateKey(const std::string& private_key);
  std::string DecryptPrivateKey(const std::string& encrypted_key);

  // Database instance
  std::unique_ptr<leveldb::DB> db_;
  base::FilePath db_path_;
  bool initialized_;
};

}  // namespace audit
}  // namespace privacy
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_PRIVACY_AUDIT_AUDIT_STORAGE_H_
