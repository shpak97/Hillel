export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return secret;
}

export const JWT_TOKEN_EXPIRATION = {
  ACCESS: '1d',
  REFRESH: '7d',
  EMAIL: '24h',
  PASSWORD_RESET: '1h',
} as const;

export const JWT_SIGN_OPTIONS = {
  expiresIn: JWT_TOKEN_EXPIRATION.ACCESS,
} as const;
