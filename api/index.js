import express from "express";
import * as jose from "jose";

const app = express();
const port = 3002;
const JWKS_URL = "http://auth:3001/.well-known/jwks.json";
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URL));

app.get("/protected", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      algorithms: ["RS256"],
    });
    res.json({ message: "Protected resource accessed", user: payload.sub });
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.listen(port, () => console.log(`API server running on port ${port}`));
