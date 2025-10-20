#include "toubkal/components/privacy/audit/audit_storage.h"

#include <sstream>

#include "base/json/json_reader.h"
#include "base/json/json_writer.h"
#include "base/logging.h"
#include "base/strings/string_number_conversions.h"
#include "base/time/time.h"
#include "components/os_crypt/sync/os_crypt.h"
#include "third_party/leveldatabase/src/include/leveldb/options.h"
#include "third_party/leveldatabase/src/include/leveldb/status.h"
#include "toubkal/components/privacy/common_types.h"

namespace toubkal {
namespace privacy {
namespace audit {

// KeyStorageEntry implementation
KeyStorageEntry::KeyStorageEntry() = default;

KeyStorageEntry::KeyStorageEntry(std::string id,
                                std::string pub_key,
                                std::string priv_key)
    : key_id(std::move(id)),
      public_key(std::move(pub_key)),
      private_key(std::move(priv_key)),
      created_timestamp(base::Time::Now().ToJavaTime()),
      last_used_timestamp(base::Time::Now().ToJavaTime()),
      is_active(false) {}

KeyStorageEntry::~KeyStorageEntry() = default;

// AuditStorage implementation
AuditStorage::AuditStorage(const base::FilePath& db_path)
    : db_path_(db_path), initialized_(false) {}

AuditStorage::~AuditStorage() {
  CloseDatabase();
}

StorageResult AuditStorage::Initialize() {
  if (initialized_) {
    return StorageResult::Success(true);
  }

  if (!OpenDatabase()) {
    return StorageResult::Failure("Failed to open database");
  }

  initialized_ = true;
  return StorageResult::Success(true);
}

StorageResult AuditStorage::StoreKey(const KeyStorageEntry& entry) {
  if (!initialized_) {
    return StorageResult::Failure("Storage not initialized");
  }

  if (!ValidateKeyEntry(entry)) {
    return StorageResult::Failure("Invalid key entry");
  }

  // Check if key already exists
  std::string existing_data;
  leveldb::Status status = db_->Get(leveldb::ReadOptions(),
                                   "key:" + entry.key_id, &existing_data);
  if (status.ok()) {
    return StorageResult::Failure("Key already exists");
  }

  // Serialize and store
  StorageResult serialize_result = SerializeKeyEntry(entry);
  if (!serialize_result.success) {
    return StorageResult::Failure("Failed to serialize key: " + serialize_result.error);
  }

  status = db_->Put(leveldb::WriteOptions(), "key:" + entry.key_id, serialize_result.data);

  if (!status.ok()) {
    return StorageResult::Failure("Failed to store key: " + status.ToString());
  }

  return StorageResult::Success(true);
}

KeyStorageResult AuditStorage::LoadKey(const std::string& key_id) {
  if (!initialized_) {
    return KeyStorageResult::Failure("Storage not initialized");
  }

  std::string data;
  leveldb::Status status = db_->Get(leveldb::ReadOptions(),
                                   "key:" + key_id, &data);

  if (!status.ok()) {
    if (status.IsNotFound()) {
      return KeyStorageResult::Failure("Key not found");
    }
    return KeyStorageResult::Failure("Database error: " + status.ToString());
  }

  KeyStorageEntry entry = DeserializeKeyEntry(data);
  if (entry.key_id.empty()) {
    return KeyStorageResult::Failure("Invalid stored key data");
  }

  return KeyStorageResult::Success(std::move(entry));
}

KeyListResult AuditStorage::LoadAllKeys() {
  if (!initialized_) {
    return KeyListResult::Failure("Storage not initialized");
  }

  std::vector<KeyStorageEntry> keys;
  std::unique_ptr<leveldb::Iterator> it(db_->NewIterator(leveldb::ReadOptions()));

  for (it->Seek("key:"); it->Valid() && it->key().starts_with("key:"); it->Next()) {
    KeyStorageEntry entry = DeserializeKeyEntry(it->value().ToString());
    if (!entry.key_id.empty()) {
      keys.push_back(std::move(entry));
    }
  }

  if (!it->status().ok()) {
    return KeyListResult::Failure("Iterator error: " + it->status().ToString());
  }

  return KeyListResult::Success(std::move(keys));
}

StorageResult AuditStorage::DeleteKey(const std::string& key_id) {
  if (!initialized_) {
    return StorageResult::Failure("Storage not initialized");
  }

  leveldb::Status status = db_->Delete(leveldb::WriteOptions(), "key:" + key_id);

  if (!status.ok()) {
    return StorageResult::Failure("Failed to delete key: " + status.ToString());
  }

  return StorageResult::Success(true);
}

StorageResult AuditStorage::RotateKey(const std::string& old_key_id,
                                     const KeyStorageEntry& new_entry) {
  if (!initialized_) {
    return StorageResult::Failure("Storage not initialized");
  }

  // Start a batch operation for atomicity
  leveldb::WriteBatch batch;

  // Mark old key as inactive
  std::string old_key_data;
  leveldb::Status status = db_->Get(leveldb::ReadOptions(),
                                   "key:" + old_key_id, &old_key_data);
  if (status.ok()) {
    KeyStorageEntry old_entry = DeserializeKeyEntry(old_key_data);
    old_entry.is_active = false;
    StorageResult old_serialize_result = SerializeKeyEntry(old_entry);
    if (!old_serialize_result.success) {
      return StorageResult::Failure("Failed to serialize old key: " + old_serialize_result.error);
    }
    batch.Put("key:" + old_key_id, old_serialize_result.data);
  }

  // Store new key as active
  KeyStorageEntry active_entry = new_entry;
  active_entry.is_active = true;
  StorageResult new_serialize_result = SerializeKeyEntry(active_entry);
  if (!new_serialize_result.success) {
    return StorageResult::Failure("Failed to serialize new key: " + new_serialize_result.error);
  }
  batch.Put("key:" + new_entry.key_id, new_serialize_result.data);

  status = db_->Write(leveldb::WriteOptions(), &batch);
  if (!status.ok()) {
    return StorageResult::Failure("Failed to rotate keys: " + status.ToString());
  }

  return StorageResult::Success(true);
}

KeyStorageResult AuditStorage::GetActiveKey() {
  if (!initialized_) {
    return KeyStorageResult::Failure("Storage not initialized");
  }

  std::unique_ptr<leveldb::Iterator> it(db_->NewIterator(leveldb::ReadOptions()));

  for (it->Seek("key:"); it->Valid() && it->key().starts_with("key:"); it->Next()) {
    KeyStorageEntry entry = DeserializeKeyEntry(it->value().ToString());
    if (entry.is_active && !entry.key_id.empty()) {
      return KeyStorageResult::Success(std::move(entry));
    }
  }

  return KeyStorageResult::Failure("No active key found");
}

StorageResult AuditStorage::SetActiveKey(const std::string& key_id) {
  if (!initialized_) {
    return StorageResult::Failure("Storage not initialized");
  }

  // First, deactivate all keys
  leveldb::WriteBatch batch;
  std::unique_ptr<leveldb::Iterator> it(db_->NewIterator(leveldb::ReadOptions()));

  for (it->Seek("key:"); it->Valid() && it->key().starts_with("key:"); it->Next()) {
    KeyStorageEntry entry = DeserializeKeyEntry(it->value().ToString());
    if (entry.is_active) {
      entry.is_active = false;
      StorageResult serialize_result = SerializeKeyEntry(entry);
      if (!serialize_result.success) {
        return StorageResult::Failure("Failed to serialize key: " + serialize_result.error);
      }
      batch.Put(it->key().ToString(), serialize_result.data);
    }
  }

  // Activate the specified key
  std::string key_data;
  leveldb::Status status = db_->Get(leveldb::ReadOptions(), "key:" + key_id, &key_data);
  if (!status.ok()) {
    return StorageResult::Failure("Key not found: " + key_id);
  }

  KeyStorageEntry entry = DeserializeKeyEntry(key_data);
  entry.is_active = true;
  StorageResult serialize_result = SerializeKeyEntry(entry);
  if (!serialize_result.success) {
    return StorageResult::Failure("Failed to serialize key: " + serialize_result.error);
  }
  batch.Put("key:" + key_id, serialize_result.data);

  status = db_->Write(leveldb::WriteOptions(), &batch);
  if (!status.ok()) {
    return StorageResult::Failure("Failed to set active key: " + status.ToString());
  }

  return StorageResult::Success(true);
}

KeyListResult AuditStorage::GetExpiredKeys(int64_t max_age_days) {
  if (!initialized_) {
    return KeyListResult::Failure("Storage not initialized");
  }

  int64_t cutoff_time = base::Time::Now().ToJavaTime() - (max_age_days * 24 * 60 * 60 * 1000);
  std::vector<KeyStorageEntry> expired_keys;

  std::unique_ptr<leveldb::Iterator> it(db_->NewIterator(leveldb::ReadOptions()));

  for (it->Seek("key:"); it->Valid() && it->key().starts_with("key:"); it->Next()) {
    KeyStorageEntry entry = DeserializeKeyEntry(it->value().ToString());
    if (!entry.key_id.empty() && entry.created_timestamp < cutoff_time) {
      expired_keys.push_back(std::move(entry));
    }
  }

  return KeyListResult::Success(std::move(expired_keys));
}

StorageResult AuditStorage::CompactDatabase() {
  if (!initialized_) {
    return StorageResult::Failure("Storage not initialized");
  }

  // LevelDB compaction is automatic, but we can force it
  // This is a no-op for now as LevelDB handles compaction automatically
  return StorageResult::Success(true);
}

StorageResult AuditStorage::ValidateIntegrity() {
  if (!initialized_) {
    return StorageResult::Failure("Storage not initialized");
  }

  // Basic integrity check - ensure we can read all keys
  std::unique_ptr<leveldb::Iterator> it(db_->NewIterator(leveldb::ReadOptions()));

  for (it->Seek("key:"); it->Valid() && it->key().starts_with("key:"); it->Next()) {
    KeyStorageEntry entry = DeserializeKeyEntry(it->value().ToString());
    if (entry.key_id.empty() || !ValidateKeyEntry(entry)) {
      return StorageResult::Failure("Integrity check failed for key: " + entry.key_id);
    }
  }

  if (!it->status().ok()) {
    return StorageResult::Failure("Iterator error during integrity check: " + it->status().ToString());
  }

  return StorageResult::Success(true);
}

bool AuditStorage::OpenDatabase() {
  leveldb::Options options;
  options.create_if_missing = true;
  options.error_if_exists = false;

  leveldb::Status status = leveldb::DB::Open(options, db_path_.AsUTF8Unsafe(), &db_);
  if (!status.ok()) {
    LOG(ERROR) << "Failed to open LevelDB: " << status.ToString();
    return false;
  }

  return true;
}

void AuditStorage::CloseDatabase() {
  if (db_) {
    delete db_;
    db_ = nullptr;
  }
  initialized_ = false;
}

StorageResult AuditStorage::SerializeKeyEntry(const KeyStorageEntry& entry) {
  std::string encrypted_private_key = EncryptPrivateKey(entry.private_key);
  if (encrypted_private_key.empty()) {
    return {false, "Failed to encrypt private key for storage"};
  }

  base::Value::Dict dict;
  dict.Set("key_id", entry.key_id);
  dict.Set("public_key", entry.public_key);
  dict.Set("private_key", encrypted_private_key);
  dict.Set("created_timestamp", entry.created_timestamp);
  dict.Set("last_used_timestamp", entry.last_used_timestamp);
  dict.Set("is_active", entry.is_active);

  std::string json;
  if (!base::JSONWriter::Write(dict, &json)) {
    return {false, "Failed to serialize key entry to JSON"};
  }

  return {true, json};
}

KeyStorageEntry AuditStorage::DeserializeKeyEntry(const std::string& data) {
  KeyStorageEntry entry;

  absl::optional<base::Value> parsed = base::JSONReader::Read(data);
  if (!parsed || !parsed->is_dict()) {
    return entry;
  }

  const base::Value::Dict& dict = parsed->GetDict();

  entry.key_id = dict.FindString("key_id").value_or("");
  entry.public_key = dict.FindString("public_key").value_or("");
  std::string encrypted_private = dict.FindString("private_key").value_or("");
  entry.private_key = DecryptPrivateKey(encrypted_private);
  entry.created_timestamp = dict.FindDouble("created_timestamp").value_or(0);
  entry.last_used_timestamp = dict.FindDouble("last_used_timestamp").value_or(0);
  entry.is_active = dict.FindBool("is_active").value_or(false);

  return entry;
}

bool AuditStorage::ValidateKeyEntry(const KeyStorageEntry& entry) {
  return !entry.key_id.empty() &&
         !entry.public_key.empty() &&
         !entry.private_key.empty() &&
         entry.created_timestamp > 0;
}

std::string AuditStorage::EncryptPrivateKey(const std::string& private_key) {
  // Encrypt private key with OS keychain before storage
  // Use Chromium's OS_CRYPT component for cross-platform keychain access
  std::string encrypted_key;

  if (!OSCrypt::EncryptString(private_key, &encrypted_key)) {
    LOG(ERROR) << "Failed to encrypt private key with OS keychain";
    return "";  // Return empty string on encryption failure
  }

  return encrypted_key;
}

std::string AuditStorage::DecryptPrivateKey(const std::string& encrypted_key) {
  // Decrypt private key from OS keychain storage
  // Use Chromium's OS_CRYPT component for cross-platform keychain access
  std::string decrypted_key;

  if (!OSCrypt::DecryptString(encrypted_key, &decrypted_key)) {
    LOG(ERROR) << "Failed to decrypt private key from OS keychain";
    return "";  // Return empty string on decryption failure
  }

  return decrypted_key;
}

}  // namespace audit
}  // namespace privacy
}  // namespace toubkal
