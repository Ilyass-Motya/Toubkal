#include "toubkal/components/privacy/audit/audit_storage.h"

#include <gtest/gtest.h>

#include "base/files/file_util.h"
#include "base/files/scoped_temp_dir.h"
#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {
namespace privacy {
namespace audit {

class AuditStorageTest : public testing::Test {
 protected:
  void SetUp() override {
    ASSERT_TRUE(temp_dir_.CreateUniqueTempDir());
    db_path_ = temp_dir_.GetPath().AppendASCII("test_key_storage");

    storage_ = std::make_unique<AuditStorage>(db_path_);
    auto init_result = storage_->Initialize();
    ASSERT_TRUE(init_result.success) << "Failed to initialize storage: " << init_result.error;
  }

  void TearDown() override {
    storage_.reset();
    // Clean up test directory
    base::DeletePathRecursively(temp_dir_.GetPath());
  }

  base::ScopedTempDir temp_dir_;
  base::FilePath db_path_;
  std::unique_ptr<AuditStorage> storage_;
};

TEST_F(AuditStorageTest, StoreAndLoadKey) {
  // Arrange
  KeyStorageEntry entry("test-key-1", "pub_key_data", "priv_key_data");

  // Act - Store key
  auto store_result = storage_->StoreKey(entry);
  ASSERT_TRUE(store_result.success) << "Store failed: " << store_result.error;

  // Act - Load key
  auto load_result = storage_->LoadKey("test-key-1");
  ASSERT_TRUE(load_result.success) << "Load failed: " << load_result.error;

  // Assert
  EXPECT_EQ(load_result.data.key_id, "test-key-1");
  EXPECT_EQ(load_result.data.public_key, "pub_key_data");
  EXPECT_EQ(load_result.data.private_key, "priv_key_data");
  EXPECT_GT(load_result.data.created_timestamp, 0);
  EXPECT_FALSE(load_result.data.is_active);
}

TEST_F(AuditStorageTest, StoreDuplicateKeyFails) {
  // Arrange
  KeyStorageEntry entry("test-key-1", "pub_key_data", "priv_key_data");

  // Act - Store key first time
  auto store_result1 = storage_->StoreKey(entry);
  ASSERT_TRUE(store_result1.success);

  // Act - Try to store same key again
  auto store_result2 = storage_->StoreKey(entry);

  // Assert - Should fail
  EXPECT_FALSE(store_result2.success);
  EXPECT_FALSE(store_result2.error.empty());
}

TEST_F(AuditStorageTest, LoadNonExistentKeyFails) {
  // Act
  auto result = storage_->LoadKey("non-existent-key");

  // Assert
  EXPECT_FALSE(result.success);
  EXPECT_FALSE(result.error.empty());
}

TEST_F(AuditStorageTest, LoadAllKeysReturnsStoredKeys) {
  // Arrange
  KeyStorageEntry entry1("key-1", "pub1", "priv1");
  KeyStorageEntry entry2("key-2", "pub2", "priv2");

  storage_->StoreKey(entry1);
  storage_->StoreKey(entry2);

  // Act
  auto result = storage_->LoadAllKeys();
  ASSERT_TRUE(result.success);

  // Assert
  ASSERT_EQ(result.data.size(), 2u);

  // Find our keys (order may vary)
  bool found_key1 = false, found_key2 = false;
  for (const auto& key : result.data) {
    if (key.key_id == "key-1") {
      EXPECT_EQ(key.public_key, "pub1");
      EXPECT_EQ(key.private_key, "priv1");
      found_key1 = true;
    } else if (key.key_id == "key-2") {
      EXPECT_EQ(key.public_key, "pub2");
      EXPECT_EQ(key.private_key, "priv2");
      found_key2 = true;
    }
  }

  EXPECT_TRUE(found_key1);
  EXPECT_TRUE(found_key2);
}

TEST_F(AuditStorageTest, DeleteKey) {
  // Arrange
  KeyStorageEntry entry("test-key", "pub", "priv");
  storage_->StoreKey(entry);

  // Verify key exists
  auto load_result1 = storage_->LoadKey("test-key");
  ASSERT_TRUE(load_result1.success);

  // Act
  auto delete_result = storage_->DeleteKey("test-key");
  ASSERT_TRUE(delete_result.success);

  // Assert - Key should no longer exist
  auto load_result2 = storage_->LoadKey("test-key");
  EXPECT_FALSE(load_result2.success);
}

TEST_F(AuditStorageTest, SetAndGetActiveKey) {
  // Arrange
  KeyStorageEntry entry1("key-1", "pub1", "priv1");
  KeyStorageEntry entry2("key-2", "pub2", "priv2");

  storage_->StoreKey(entry1);
  storage_->StoreKey(entry2);

  // Act - Set key-2 as active
  auto set_result = storage_->SetActiveKey("key-2");
  ASSERT_TRUE(set_result.success);

  // Act - Get active key
  auto get_result = storage_->GetActiveKey();
  ASSERT_TRUE(get_result.success);

  // Assert
  EXPECT_EQ(get_result.data.key_id, "key-2");
  EXPECT_TRUE(get_result.data.is_active);
}

TEST_F(AuditStorageTest, RotateKeys) {
  // Arrange
  KeyStorageEntry old_entry("old-key", "old-pub", "old-priv");
  storage_->StoreKey(old_entry);
  storage_->SetActiveKey("old-key");

  KeyStorageEntry new_entry("new-key", "new-pub", "new-priv");

  // Act
  auto rotate_result = storage_->RotateKey("old-key", new_entry);
  ASSERT_TRUE(rotate_result.success);

  // Assert - New key should be active
  auto active_result = storage_->GetActiveKey();
  ASSERT_TRUE(active_result.success);
  EXPECT_EQ(active_result.data.key_id, "new-key");
  EXPECT_TRUE(active_result.data.is_active);

  // Assert - Old key should be inactive
  auto old_result = storage_->LoadKey("old-key");
  ASSERT_TRUE(old_result.success);
  EXPECT_FALSE(old_result.data.is_active);
}

TEST_F(AuditStorageTest, GetExpiredKeys) {
  // Arrange - Create a key with old timestamp
  KeyStorageEntry old_entry("old-key", "pub", "priv");
  // Set created timestamp to 400 days ago
  old_entry.created_timestamp = base::Time::Now().ToJavaTime() - (400LL * 24 * 60 * 60 * 1000);
  storage_->StoreKey(old_entry);

  KeyStorageEntry new_entry("new-key", "pub", "priv");
  storage_->StoreKey(new_entry);

  // Act - Get keys older than 365 days
  auto result = storage_->GetExpiredKeys(365);
  ASSERT_TRUE(result.success);

  // Assert - Should find the old key
  ASSERT_EQ(result.data.size(), 1u);
  EXPECT_EQ(result.data[0].key_id, "old-key");
}

TEST_F(AuditStorageTest, ValidateIntegrity) {
  // Arrange - Store some valid keys
  KeyStorageEntry entry1("key-1", "pub1", "priv1");
  KeyStorageEntry entry2("key-2", "pub2", "priv2");

  storage_->StoreKey(entry1);
  storage_->StoreKey(entry2);

  // Act
  auto result = storage_->ValidateIntegrity();

  // Assert
  EXPECT_TRUE(result.success);
}

TEST_F(AuditStorageTest, KeyValidation) {
  // Test valid entry
  KeyStorageEntry valid_entry("valid-key", "pub_key_data", "priv_key_data");
  EXPECT_TRUE(storage_->ValidateKeyEntry(valid_entry));

  // Test invalid entries
  KeyStorageEntry invalid_entry1("", "pub", "priv");  // Empty key_id
  EXPECT_FALSE(storage_->ValidateKeyEntry(invalid_entry1));

  KeyStorageEntry invalid_entry2("key", "", "priv");  // Empty public key
  EXPECT_FALSE(storage_->ValidateKeyEntry(invalid_entry2));

  KeyStorageEntry invalid_entry3("key", "pub", "");  // Empty private key
  EXPECT_FALSE(storage_->ValidateKeyEntry(invalid_entry3));

  KeyStorageEntry invalid_entry4("key", "pub", "priv");
  invalid_entry4.created_timestamp = 0;  // Invalid timestamp
  EXPECT_FALSE(storage_->ValidateKeyEntry(invalid_entry4));
}

}  // namespace audit
}  // namespace privacy
}  // namespace toubkal
