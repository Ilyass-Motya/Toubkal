#include "toubkal/components/privacy/crypto/key_manager.h"

#include <openssl/err.h>
#include <openssl/evp.h>

#include "base/logging.h"
#include "base/notreached.h"
#include "toubkal/components/privacy/common_types.h"

namespace toubkal {
namespace privacy {
namespace crypto {

// KeyPair implementation
KeyPair::KeyPair() = default;

KeyPair::KeyPair(std::string pub, std::string priv)
    : public_key(std::move(pub)), private_key(std::move(priv)) {}

KeyPair::~KeyPair() = default;

// KeyManager implementation
KeyManager::KeyManager() = default;

KeyManager::~KeyManager() = default;

KeyPairResult KeyManager::GenerateKeyPair() {
  // Create an Ed25519 key pair using EVP interfaces
  bssl::UniquePtr<EVP_PKEY_CTX> ctx(EVP_PKEY_CTX_new_id(EVP_PKEY_ED25519, nullptr));
  if (!ctx) {
    return KeyPairResult::Failure("Failed to create EVP_PKEY_CTX for Ed25519");
  }

  if (EVP_PKEY_keygen_init(ctx.get()) != 1) {
    return KeyPairResult::Failure("Failed to initialize key generation");
  }

  EVP_PKEY* raw_key = nullptr;
  if (EVP_PKEY_keygen(ctx.get(), &raw_key) != 1) {
    return KeyPairResult::Failure("Failed to generate Ed25519 key pair");
  }

  bssl::UniquePtr<EVP_PKEY> key(raw_key);

  // Extract public key
  std::vector<uint8_t> public_key_bytes;
  if (!ExtractKeyBytes(key.get(), &public_key_bytes, false)) {
    return KeyPairResult::Failure("Failed to extract public key");
  }

  // Extract private key
  std::vector<uint8_t> private_key_bytes;
  if (!ExtractKeyBytes(key.get(), &private_key_bytes, true)) {
    return KeyPairResult::Failure("Failed to extract private key");
  }

  KeyPair key_pair(
      std::string(public_key_bytes.begin(), public_key_bytes.end()),
      std::string(private_key_bytes.begin(), private_key_bytes.end()));

  return KeyPairResult::Success(std::move(key_pair));
}

SignatureResult KeyManager::SignData(const std::string& data,
                                    const std::string& private_key) {
  if (!IsValidPrivateKey(private_key)) {
    return SignatureResult::Failure("Invalid private key");
  }

  // Create EVP_PKEY from private key bytes
  std::vector<uint8_t> priv_key_bytes(private_key.begin(), private_key.end());
  auto key = CreateEd25519KeyFromBytes(priv_key_bytes.data(),
                                      priv_key_bytes.size(), true);
  if (!key) {
    return SignatureResult::Failure("Failed to create key from private key bytes");
  }

  // Create signing context
  bssl::UniquePtr<EVP_MD_CTX> ctx(EVP_MD_CTX_new());
  if (!ctx) {
    return SignatureResult::Failure("Failed to create signing context");
  }

  if (EVP_DigestSignInit(ctx.get(), nullptr, nullptr, nullptr, key.get()) != 1) {
    return SignatureResult::Failure("Failed to initialize signing");
  }

  // Sign the data
  size_t signature_len = 0;
  if (EVP_DigestSign(ctx.get(), nullptr, &signature_len,
                    reinterpret_cast<const uint8_t*>(data.data()),
                    data.size()) != 1) {
    return SignatureResult::Failure("Failed to determine signature length");
  }

  std::vector<uint8_t> signature(signature_len);
  if (EVP_DigestSign(ctx.get(), signature.data(), &signature_len,
                    reinterpret_cast<const uint8_t*>(data.data()),
                    data.size()) != 1) {
    return SignatureResult::Failure("Failed to create signature");
  }

  signature.resize(signature_len);
  return SignatureResult::Success(
      std::string(signature.begin(), signature.end()));
}

VerificationResult KeyManager::VerifySignature(const std::string& data,
                                              const std::string& signature,
                                              const std::string& public_key) {
  if (!IsValidPublicKey(public_key)) {
    return VerificationResult::Failure("Invalid public key");
  }

  if (!IsValidSignature(signature)) {
    return VerificationResult::Failure("Invalid signature format");
  }

  // Create EVP_PKEY from public key bytes
  std::vector<uint8_t> pub_key_bytes(public_key.begin(), public_key.end());
  auto key = CreateEd25519KeyFromBytes(pub_key_bytes.data(),
                                      pub_key_bytes.size(), false);
  if (!key) {
    return VerificationResult::Failure("Failed to create key from public key bytes");
  }

  // Create verification context
  bssl::UniquePtr<EVP_MD_CTX> ctx(EVP_MD_CTX_new());
  if (!ctx) {
    return VerificationResult::Failure("Failed to create verification context");
  }

  if (EVP_DigestVerifyInit(ctx.get(), nullptr, nullptr, nullptr, key.get()) != 1) {
    return VerificationResult::Failure("Failed to initialize verification");
  }

  // Verify the signature
  int result = EVP_DigestVerify(ctx.get(),
                               reinterpret_cast<const uint8_t*>(signature.data()),
                               signature.size(),
                               reinterpret_cast<const uint8_t*>(data.data()),
                               data.size());

  if (result == 1) {
    return VerificationResult::Success(true);
  } else if (result == 0) {
    return VerificationResult::Success(false);
  } else {
    return VerificationResult::Failure("Signature verification failed");
  }
}

bool KeyManager::IsValidPublicKey(const std::string& public_key) {
  if (public_key.empty() || public_key.size() != 32) {
    return false;
  }

  // Create EVP_PKEY to validate the key format
  std::vector<uint8_t> pub_key_bytes(public_key.begin(), public_key.end());
  auto key = CreateEd25519KeyFromBytes(pub_key_bytes.data(),
                                      pub_key_bytes.size(), false);
  return key != nullptr;
}

bool KeyManager::IsValidPrivateKey(const std::string& private_key) {
  if (private_key.empty() || private_key.size() != 32) {
    return false;
  }

  // Create EVP_PKEY to validate the key format
  std::vector<uint8_t> priv_key_bytes(private_key.begin(), private_key.end());
  auto key = CreateEd25519KeyFromBytes(priv_key_bytes.data(),
                                      priv_key_bytes.size(), true);
  return key != nullptr;
}

bool KeyManager::IsValidSignature(const std::string& signature) {
  // Ed25519 signatures are always 64 bytes
  return !signature.empty() && signature.size() == 64;
}

bssl::UniquePtr<EVP_PKEY> KeyManager::CreateEd25519KeyFromBytes(
    const uint8_t* key_bytes, size_t key_len, bool is_private) {
  bssl::UniquePtr<EVP_PKEY_CTX> ctx(EVP_PKEY_CTX_new_id(EVP_PKEY_ED25519, nullptr));
  if (!ctx) {
    return nullptr;
  }

  bssl::UniquePtr<EVP_PKEY> key;
  if (is_private) {
    if (EVP_PKEY_keygen_init(ctx.get()) != 1) {
      return nullptr;
    }

    EVP_PKEY* raw_key = nullptr;
    if (EVP_PKEY_keygen(ctx.get(), &raw_key) != 1) {
      return nullptr;
    }

    key.reset(raw_key);

    // Import the private key bytes
    size_t priv_key_len = key_len;
    if (EVP_PKEY_set_raw_private_key(key.get(), key_bytes, priv_key_len) != 1) {
      return nullptr;
    }
  } else {
    // Create public key directly
    EVP_PKEY* raw_key = EVP_PKEY_new_raw_public_key(EVP_PKEY_ED25519,
                                                   nullptr, key_bytes, key_len);
    if (!raw_key) {
      return nullptr;
    }
    key.reset(raw_key);
  }

  return key;
}

bool KeyManager::ExtractKeyBytes(const EVP_PKEY* key,
                                std::vector<uint8_t>* out_bytes,
                                bool extract_private) {
  if (extract_private) {
    size_t priv_key_len = 0;
    if (EVP_PKEY_get_raw_private_key(key, nullptr, &priv_key_len) != 1) {
      return false;
    }

    out_bytes->resize(priv_key_len);
    if (EVP_PKEY_get_raw_private_key(key, out_bytes->data(), &priv_key_len) != 1) {
      return false;
    }
  } else {
    size_t pub_key_len = 0;
    if (EVP_PKEY_get_raw_public_key(key, nullptr, &pub_key_len) != 1) {
      return false;
    }

    out_bytes->resize(pub_key_len);
    if (EVP_PKEY_get_raw_public_key(key, out_bytes->data(), &pub_key_len) != 1) {
      return false;
    }
  }

  return true;
}

}  // namespace crypto
}  // namespace privacy
}  // namespace toubkal
