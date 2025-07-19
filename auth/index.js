import jwksjson from '../keys/jwks.json' with { type: 'json' }; // Make sure to init first if this fails
import express from "express";
import * as jose from "jose";
import fs from "fs";

const app = express();
const port = 3001;

const path = "../keys/";

const privateKeyPem = fs.readFileSync(`${path}private_key.pem`, 'utf8');


app.get('/token', async (req, res) => {
  try {
    const privateKey = await getPrivateKey();

    const token = await new jose.SignJWT({ user: 'exampleUser' }) // payload
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    res.json({ token: token });
  } catch (err) {
    console.error('Error generating token:', err);
    res.status(500).json({ error: 'Token generation failed' });
  }
});


app.get('/secure', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await verifyToken(token);
    res.json({ message: 'Access granted', user: payload });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});



// Convert PEM to CryptoKey using jose
async function getPrivateKey() {
  return await jose.importPKCS8(privateKeyPem, 'RS256');
}


/**
 * Endpoint to serve the JWKS (JSON Web Key Set) for public key retrieval.
 * This is typically used for verifying JWTs (JSON Web Tokens).
 */
app.get("/jwks.json", (req, res) => {

  res.setHeader('Content-Type', 'application/json');
  res.send(jwksjson);
});



app.listen(port, () => console.log(`Auth server running on port ${port}`));