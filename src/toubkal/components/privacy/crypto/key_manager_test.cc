#include "toubkal/components/privacy/crypto/key_manager.h"

#include <gtest/gtest.h>

#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {
namespace privacy {
namespace crypto {

class KeyManagerTest : public testing::Test {
 protected:
  void SetUp() override {
    key_manager_ = std::make_unique<KeyManager>();
  }

  void TearDown() override {
    key_manager_.reset();
  }

  std::unique_ptr<KeyManager> key_manager_;
  base::test::TaskEnvironment task_environment_;
};

TEST_F(KeyManagerTest, GenerateKeyPairReturnsValidKeys) {
  // Act
  auto result = key_manager_->GenerateKeyPair();

  // Assert
  ASSERT_TRUE(result.success) << "Key generation failed: " << result.error;
  EXPECT_FALSE(result.data.public_key.empty());
  EXPECT_FALSE(result.data.private_key.empty());
  EXPECT_EQ(result.data.public_key.size(), 32u);  // Ed25519 public key size
  EXPECT_EQ(result.data.private_key.size(), 32u); // Ed25519 private key size
}

TEST_F(KeyManagerTest, GeneratedKeysAreValid) {
  // Arrange
  auto key_result = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result.success);

  // Act & Assert - Public key validation
  EXPECT_TRUE(key_manager_->IsValidPublicKey(key_result.data.public_key));

  // Act & Assert - Private key validation
  EXPECT_TRUE(key_manager_->IsValidPrivateKey(key_result.data.private_key));
}

TEST_F(KeyManagerTest, SignAndVerifyCycleWorks) {
  // Arrange
  auto key_result = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result.success);

  const std::string test_data = "Hello, World! This is a test message for Ed25519 signing.";

  // Act - Sign the data
  auto sign_result = key_manager_->SignData(test_data, key_result.data.private_key);
  ASSERT_TRUE(sign_result.success) << "Signing failed: " << sign_result.error;

  // Act - Verify the signature
  auto verify_result = key_manager_->VerifySignature(test_data, sign_result.data,
                                                    key_result.data.public_key);
  ASSERT_TRUE(verify_result.success) << "Verification failed: " << verify_result.error;

  // Assert
  EXPECT_TRUE(verify_result.data);
}

TEST_F(KeyManagerTest, VerifyWithWrongDataFails) {
  // Arrange
  auto key_result = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result.success);

  const std::string original_data = "Original message";
  const std::string wrong_data = "Wrong message";

  // Act - Sign original data
  auto sign_result = key_manager_->SignData(original_data, key_result.data.private_key);
  ASSERT_TRUE(sign_result.success);

  // Act - Try to verify with wrong data
  auto verify_result = key_manager_->VerifySignature(wrong_data, sign_result.data,
                                                    key_result.data.public_key);
  ASSERT_TRUE(verify_result.success);

  // Assert - Should fail verification
  EXPECT_FALSE(verify_result.data);
}

TEST_F(KeyManagerTest, VerifyWithWrongKeyFails) {
  // Arrange
  auto key_result1 = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result1.success);

  auto key_result2 = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result2.success);

  const std::string test_data = "Test message";

  // Act - Sign with key1
  auto sign_result = key_manager_->SignData(test_data, key_result1.data.private_key);
  ASSERT_TRUE(sign_result.success);

  // Act - Try to verify with key2's public key
  auto verify_result = key_manager_->VerifySignature(test_data, sign_result.data,
                                                    key_result2.data.public_key);
  ASSERT_TRUE(verify_result.success);

  // Assert - Should fail verification
  EXPECT_FALSE(verify_result.data);
}

TEST_F(KeyManagerTest, SignWithInvalidPrivateKeyFails) {
  // Arrange
  const std::string invalid_private_key = "too_short";
  const std::string test_data = "Test data";

  // Act
  auto result = key_manager_->SignData(test_data, invalid_private_key);

  // Assert
  EXPECT_FALSE(result.success);
  EXPECT_FALSE(result.error.empty());
}

TEST_F(KeyManagerTest, VerifyWithInvalidPublicKeyFails) {
  // Arrange
  const std::string invalid_public_key = "too_short";
  const std::string test_data = "Test data";
  const std::string fake_signature(64, 'A');  // 64 bytes for Ed25519 signature

  // Act
  auto result = key_manager_->VerifySignature(test_data, fake_signature, invalid_public_key);

  // Assert
  EXPECT_FALSE(result.success);
  EXPECT_FALSE(result.error.empty());
}

TEST_F(KeyManagerTest, VerifyWithInvalidSignatureFails) {
  // Arrange
  auto key_result = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result.success);

  const std::string test_data = "Test data";
  const std::string invalid_signature = "too_short";

  // Act
  auto result = key_manager_->VerifySignature(test_data, invalid_signature,
                                             key_result.data.public_key);

  // Assert
  EXPECT_FALSE(result.success);
  EXPECT_FALSE(result.error.empty());
}

TEST_F(KeyManagerTest, KeyValidationFunctions) {
  // Test valid keys
  auto key_result = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result.success);

  EXPECT_TRUE(key_manager_->IsValidPublicKey(key_result.data.public_key));
  EXPECT_TRUE(key_manager_->IsValidPrivateKey(key_result.data.private_key));
  EXPECT_TRUE(key_manager_->IsValidSignature(std::string(64, 'A')));

  // Test invalid keys
  EXPECT_FALSE(key_manager_->IsValidPublicKey(""));
  EXPECT_FALSE(key_manager_->IsValidPublicKey("too_short"));
  EXPECT_FALSE(key_manager_->IsValidPublicKey(std::string(33, 'A')));

  EXPECT_FALSE(key_manager_->IsValidPrivateKey(""));
  EXPECT_FALSE(key_manager_->IsValidPrivateKey("too_short"));
  EXPECT_FALSE(key_manager_->IsValidPrivateKey(std::string(33, 'A')));

  EXPECT_FALSE(key_manager_->IsValidSignature(""));
  EXPECT_FALSE(key_manager_->IsValidSignature("too_short"));
  EXPECT_FALSE(key_manager_->IsValidSignature(std::string(63, 'A')));
  EXPECT_FALSE(key_manager_->IsValidSignature(std::string(65, 'A')));
}

TEST_F(KeyManagerTest, MultipleKeyPairsAreUnique) {
  // Arrange & Act
  auto key_result1 = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result1.success);

  auto key_result2 = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result2.success);

  // Assert - Keys should be different
  EXPECT_NE(key_result1.data.public_key, key_result2.data.public_key);
  EXPECT_NE(key_result1.data.private_key, key_result2.data.private_key);
}

TEST_F(KeyManagerTest, SignaturesAreDeterministic) {
  // Arrange
  auto key_result = key_manager_->GenerateKeyPair();
  ASSERT_TRUE(key_result.success);

  const std::string test_data = "Deterministic signing test";

  // Act - Sign the same data twice
  auto sign_result1 = key_manager_->SignData(test_data, key_result.data.private_key);
  ASSERT_TRUE(sign_result1.success);

  auto sign_result2 = key_manager_->SignData(test_data, key_result.data.private_key);
  ASSERT_TRUE(sign_result2.success);

  // Assert - Signatures should be identical (deterministic)
  EXPECT_EQ(sign_result1.data, sign_result2.data);
}

}  // namespace crypto
}  // namespace privacy
}  // namespace toubkal
