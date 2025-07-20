import jwksjson from "../keys/jwks.json" with { type: "json" };
import express from "express";
import * as jose from "jose";
import fs from "fs";

const app = express();
const port = 3001;

const pathToPrivateKeyFile = new URL("../keys/private_key.pem", import.meta.url)
  .pathname;
const privateKeyFile = fs.readFileSync(pathToPrivateKeyFile, "utf8");

const privateKey = await jose.importPKCS8(privateKeyFile, "RS256");


const pathToPublicKeyFile = new URL("../keys/public_key.pem", import.meta.url)
  .pathname;

const publicKeyFile = fs.readFileSync(pathToPublicKeyFile, "utf8");

const publicKey = await jose.importSPKI(publicKeyFile, "RS256");



app.post("/token", async (req, res) => {
  // Check to see if the request body is present
  if (!req.body) {
    return res.status(400).json({ error: "Request body is required" });
  }

  // Check to see if the client_assertion is present in the request body
  if (!req.body.client_assertion) {
    return res.status(400).json({ error: "Missing client_assertion" });
  }

  const { client_assertion } = req.body.client_assertion;

  try {

    const { payload } = await jose.jwtVerify(client_assertion, publicKey, {
      issuer: 'client',
      audience: 'auth',
    });

    const token = await new jose.SignJWT({ sub: payload.sub, user: "exampleUser" })
      .setProtectedHeader({ alg: 'RS256', kid: 'auth-server-key' })
      .setIssuedAt()
      .setIssuer('auth')
      .setAudience('api')
      .setExpirationTime('2h')
      .sign(privateKey);

    res.json({ token: token });
  } catch (err) {
    console.error('Invalid client_assertion:', err.message);
    res.status(401).json({ error: 'Invalid client_assertion' });
  }
});



/**
 * Endpoint to serve the JWKS (JSON Web Key Set) for public key retrieval.
 * This is typically used for verifying JWTs (JSON Web Tokens).
 */
app.get("/.well-known/jwks.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(jwksjson);
});

app.listen(port, () => console.log(`Auth server running on port ${port}`));
