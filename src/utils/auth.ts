// src/utils/validateJWT.ts

import jwt, { JwtPayload, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient, { JwksClient, SigningKey } from 'jwks-rsa';
import { providers } from '../config/constants';

/**
 * Interface for the JWT payload.
 * Extend this based on your application's needs.
 */
interface CustomJwtPayload extends JwtPayload {
  sub: string;
  email?: string;
  // Add other custom claims as needed
}

/**
 * Configuration for each provider.
 */
interface ProviderConfig {
  jwksUri: string;
  audience?: string | string[];
  issuer: string;
}

/**
 * Mapping of providers to their respective configurations.
 */
const providerConfigs: Record<string, ProviderConfig> = {
  [providers.APPLE]: {
    jwksUri: 'https://appleid.apple.com/auth/keys',
    // Apple typically doesn't require audience validation, but set if needed
    // audience: 'urn:your-app:client-id', // TODO: Replace with your actual audience if required
    issuer: 'https://appleid.apple.com',
  },
  // Add other providers here if necessary
};

/**
 * Retrieves the Cognito configuration dynamically.
 * This is separated to handle Cognito's dynamic parameters.
 */
const getCognitoConfig = (): ProviderConfig => ({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  audience: [process.env.COGNITO_CLIENT_ID_APP as string, process.env.COGNITO_CLIENT_ID_LAMBDA as string],
  issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
});

/**
 * Main function to validate JWT tokens.
 *
 * @param token - The JWT token string to validate.
 * @param provider - The provider name (e.g., 'APPLE', 'COGNITO').
 * @returns A promise that resolves to the decoded JWT payload if valid.
 * @throws An error if the token is invalid or verification fails.
 */
export async function validateJWT(token: string, provider: string): Promise<CustomJwtPayload> {
  let config: ProviderConfig;

  switch (provider) {
    case providers.APPLE:
      config = providerConfigs[providers.APPLE];
      break;
    default:
      config = getCognitoConfig();
      break;
  }

  // Initialize JWKS client
  const client: JwksClient = jwksClient({
    jwksUri: config.jwksUri,
    cache: true, // Enable caching
    cacheMaxEntries: 10, // Adjust as needed
    cacheMaxAge: 60 * 60 * 1000, // 1 hour
  });

  /**
   * Function to retrieve the signing key.
   *
   * @param header - The JWT header.
   * @param callback - The callback function.
   */
  function getKey(header: jwt.JwtHeader, callback: SigningKeyCallback): void {
    if (!header.kid) {
      return callback(new Error('Missing kid in token header'), undefined);
    }

    client.getSigningKey(header.kid, (err: Error | null, key: SigningKey | undefined) => {
      if (err) {
        return callback(err, undefined);
      }

      if (!key) {
        return callback(new Error('Signing key not found'), undefined);
      }

      const signingKey = key.getPublicKey();

      // Ensure signingKey is a string
      if (typeof signingKey !== 'string') {
        return callback(new Error('Invalid signing key type'), undefined);
      }

      callback(null, signingKey);
    });
  }

  return new Promise<CustomJwtPayload>((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: config.audience,
        issuer: config.issuer,
        algorithms: ['RS256'], // Adjust based on your provider's algorithm
      },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }

        // Type assertion since we've ensured it's a CustomJwtPayload
        resolve(decoded as CustomJwtPayload);
      }
    );
  });
}
