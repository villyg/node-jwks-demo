import axios from "axios";
import * as jose from "jose";
import fs from "fs";

async function runClient() {
  console.info("Generating client assertion...");

  const pathToPrivateKeyFile = new URL(
    "../keys/private_key.pem",
    import.meta.url
  ).pathname;
  const privateKeyFile = fs.readFileSync(pathToPrivateKeyFile, "utf8");

  const privateKey = await jose.importPKCS8(privateKeyFile, "RS256");

  const now = Math.floor(Date.now() / 1000);

  const clientAssertion = await new jose.SignJWT({ sub: "client" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now)
    .setIssuer("client")
    .setAudience("auth")
    .setExpirationTime("5m")
    .sign(privateKey);

  console.info("Client Assertion generated successfully");
  console.log("Client Assertion:", clientAssertion);

  try {
    console.info(
      "Exchanging client assertion for access_token from Auth server..."
    );

    const tokenResponse = await axios.post(
      "http://auth:3001/token",
      {
        client_assertion: clientAssertion,
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_id: "client",
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const token = tokenResponse.data.token;

    console.info("Access_token received successfully:");
    console.log("Token:", token);

    console.info("Accessing protected API...");

    const apiResponse = await axios.get("http://api:3002/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.info("Protected API accessed successfully");

    console.log("API Response received:", apiResponse.data);
  } catch (error) {
    console.error(
      "Client error:",
      error.response ? error.response.data : error.message
    );
  }
}

runClient();
