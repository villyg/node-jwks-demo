import { writeFileSync } from "fs";
import { generateKeyPair, exportSPKI, exportPKCS8, exportJWK } from "jose";

// Define the path where keys will be saved
const path = "../keys/";

async function generateAndSaveKeys() {
  // Generate a key pair (RSA or EC — we'll use RSA here)
  const { publicKey, privateKey } = await generateKeyPair("RS256", {
    modulusLength: 2048, // recommended key size
    extractable: true,
  });

  // Export the public/private keys to PEM format
  const publicPem = await exportKeyToPEM(publicKey);
  const privatePem = await exportKeyToPEM(privateKey);

  // Export the public key to JWK format
  const jwk = await exportKeyToJWK(publicKey);

  // 4. Optionally add desired metadata
  jwk.use = "sig";
  jwk.alg = "RS256";
  jwk.kid = "my-key-id"; // optional, but recommended

  // Wrap in JWKS format
  const jwks = {
    keys: [jwk],
  };

  // Write keys to files
  writeFileSync(`${path}public_key.pem`, publicPem);
  writeFileSync(`${path}private_key.pem`, privatePem);
  writeFileSync(`${path}jwks.json`, JSON.stringify(jwks));

  console.log(
    `✅ Keys generated and saved to ${path} as public_key.pem and private_key.pem`
  );
}

async function exportKeyToPEM(key) {
  const pem = await exportSPKI(key).catch(() => exportPKCS8(key));
  return pem;
}

async function exportKeyToJWK(key) {
  const jwk = await exportJWK(key);
  return jwk;
}

generateAndSaveKeys().catch(console.error);
