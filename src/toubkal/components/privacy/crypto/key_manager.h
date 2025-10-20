#ifndef TOUBKAL_COMPONENTS_PRIVACY_CRYPTO_KEY_MANAGER_H_
#define TOUBKAL_COMPONENTS_PRIVACY_CRYPTO_KEY_MANAGER_H_

#include <memory>
#include <string>
#include <vector>

#include "third_party/boringssl/src/include/openssl/evp.h"
#include "toubkal/components/privacy/common_types.h"

namespace toubkal {
namespace privacy {
namespace crypto {

// Key pair containing public and private keys
struct KeyPair {
  std::string public_key;
  std::string private_key;

  KeyPair();
  KeyPair(std::string pub, std::string priv);
  ~KeyPair();
};

// Cryptographic result types
using KeyPairResult = Result<KeyPair>;
using SignatureResult = Result<std::string>;
using VerificationResult = Result<bool>;

// KeyManager provides Ed25519 cryptographic operations using BoringSSL
class KeyManager {
 public:
  KeyManager();
  ~KeyManager();

  // Disable copy and assignment
  KeyManager(const KeyManager&) = delete;
  KeyManager& operator=(const KeyManager&) = delete;

  // Generate a new Ed25519 key pair
  KeyPairResult GenerateKeyPair();

  // Sign data using the provided private key
  SignatureResult SignData(const std::string& data,
                          const std::string& private_key);

  // Verify signature using the provided public key
  VerificationResult VerifySignature(const std::string& data,
                                    const std::string& signature,
                                    const std::string& public_key);

  // Utility methods for key validation
  bool IsValidPublicKey(const std::string& public_key);
  bool IsValidPrivateKey(const std::string& private_key);
  bool IsValidSignature(const std::string& signature);

 private:
  // Helper method to create EVP_PKEY from raw key bytes
  bssl::UniquePtr<EVP_PKEY> CreateEd25519KeyFromBytes(
      const uint8_t* key_bytes, size_t key_len, bool is_private);

  // Helper method to extract raw key bytes from EVP_PKEY
  bool ExtractKeyBytes(const EVP_PKEY* key,
                      std::vector<uint8_t>* out_bytes,
                      bool extract_private);
};

}  // namespace crypto
}  // namespace privacy
}  // namespace toubkal

#endif  // TOUBKAL_COMPONENTS_PRIVACY_CRYPTO_KEY_MANAGER_H_
