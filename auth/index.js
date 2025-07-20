import jwksjson from "../keys/jwks.json" with { type: "json" };
import express from "express";
import * as jose from "jose";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
const port = 3001;

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded();

const pathToPrivateKeyFile = new URL("../keys/private_key.pem", import.meta.url)
  .pathname;
const privateKeyFile = fs.readFileSync(pathToPrivateKeyFile, "utf8");

const privateKey = await jose.importPKCS8(privateKeyFile, "RS256");

const pathToPublicKeyFile = new URL("../keys/public_key.pem", import.meta.url)
  .pathname;

const publicKeyFile = fs.readFileSync(pathToPublicKeyFile, "utf8");

const publicKey = await jose.importSPKI(publicKeyFile, "RS256");

app.post("/token", urlencodedParser, async (req, res) => {
  console.info("Received request to /token endpoint");

  console.info("Validating request body...");

  // Check to see if the request body is present
  if (!req.body) {
    console.error("Request body is missing");
    return res.status(400).json({ error: "Request body is required" });
  }

  // Check to see if the client_id is present in the request body
  if (!req.body.client_id && req.body.client_id !== "client") {
    // ADD additional check for valid client_id here if needed
    console.error("Missing or invalid client_id in request body");
    return res.status(400).json({ error: "Missing or invalid client_id" });
  }

  // Check to see if the client_assertion_type is present in the request body
  if (
    !req.body.client_assertion_type &&
    req.body.client_assertion_type !==
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
  ) {
    console.error("Missing or invalid client_assertion_type in request body");
    return res
      .status(400)
      .json({ error: "Missing or invalid client_assertion_type" });
  }

  // Check to see if the client_assertion is present in the request body
  if (!req.body.client_assertion) {
    console.error("Missing client_assertion in request body");
    return res.status(400).json({ error: "Missing client_assertion" });
  }

  console.info("Request body validation successful");

  const client_assertion = req.body.client_assertion;

  console.log("client_assertion:", client_assertion);

  // Verify the client_assertion
  console.info("Verifying client_assertion...");
  try {
    const payload = await jose.jwtVerify(client_assertion, publicKey, {
      issuer: "client",
      audience: "auth",
    });

    console.info("client_assertion successfully verified");
    console.log("Verified client_assertion payload:", payload);

    console.info("Generating access token...");
    const access_token = await new jose.SignJWT({
      sub: payload.sub,
      user: "exampleUser",
    })
      .setProtectedHeader({ alg: "RS256", kid: "client-key" })
      .setIssuedAt()
      .setIssuer("auth")
      .setAudience("api")
      .setExpirationTime("2h")
      .sign(privateKey);

    console.info("Access token generated successfully");
    console.info("Returning access token to client...");
    res.json({ token: access_token });
  } catch (err) {
    console.error("Invalid client_assertion:", err.message);
    res.status(401).json({ error: "Invalid client_assertion" });
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

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => console.log(`Auth server running on port ${port}`));
