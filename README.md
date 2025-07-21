# Node.js JWKS Demo

This project demonstrates how to implement client credentials grant flow in Node.js using client assertion, public-private key pair and a JWKS endpoint in a microservices setup. Full article explaining the project can be found on [my blog](http://villyg.com/posts/OAuth-client-credentials-with-certificate-in-NodeJS). 

## 🧩 Components

The project includes four Dockerized components:

1. **Bootstrapper** - Generates RSA key pair and JWKS from the public key.
2. **Auth Server** - Signs JWTs and exposes the JWKS (`/.well-known/jwks.json`) endpoint.
3. **API Server** - Verifies JWTs against the Auth server’s JWKS.
4. **Client** - Fetches a JWT and accesses the protected route.

## 📦 Project Structure

```
node-jwks-demo/
├── bootstrapper/
├── auth/
├── api/
├── client/
├── docker-compose.yml
```

## 🚀 Running the Project

### 1. Prerequisites

- Docker
- Docker Compose

### 2. Run the Services

Generate keys 

```bash
docker-compose --profile bootstrap up --build --force-recreate
```

Start the stack

```bash
docker-compose --profile stack up --build --force-recreate
```

This will:

- Generate keys and JWKS via the bootstrapper.
- Start the Auth server on `http://localhost:3001`
- Start the API server on `http://localhost:3002`
- Run the client to request a token and access the API

### 3. Sample Output

```bash
API Response: { message: 'Protected resource accessed' }
```

## 🛠️ Notes

- JWTs are signed using the RSA private key.
- The public key is shared via JWKS so that services can validate tokens securely.
- Uses the [`jose`](https://github.com/panva/jose) library for signing/verifying.

## 🧪 Next Steps

Enhance this setup by adding:

- Token scopes and user roles
- Refresh tokens
- HTTPS with TLS certificates
- Rate limiting and logging

## 📜 License

MIT
