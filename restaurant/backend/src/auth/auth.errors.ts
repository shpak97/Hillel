export type AuthErrorBody = {
  code: string;
  message: string;
};

export const AUTH_ERRORS = {
  ACCESS_DENIED: {
    code: 'ACCESS_DENIED',
    message: 'Invalid email or password.',
  },
  EMAIL_NOT_VERIFIED: {
    code: 'EMAIL_NOT_VERIFIED',
    message:
      'Email is not verified. Check your inbox or request a new verification email.',
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'A user with this email is already registered.',
  },
  RESEND_COOLDOWN: {
    code: 'RESEND_COOLDOWN',
    message: 'Please wait one minute before requesting another email.',
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Invalid token.',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Token has expired.',
  },
  INVALID_REFRESH_TOKEN: {
    code: 'INVALID_REFRESH_TOKEN',
    message: 'Invalid refresh token.',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Unauthorized.',
  },
  MISSING_ACCESS_TOKEN: {
    code: 'MISSING_ACCESS_TOKEN',
    message: 'Access token is required.',
  },
  INVALID_ACCESS_TOKEN: {
    code: 'INVALID_ACCESS_TOKEN',
    message: 'Invalid or expired access token.',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found.',
  },
  LOGIN_FAILED: {
    code: 'LOGIN_FAILED',
    message: 'Could not sign in.',
  },
  REGISTRATION_FAILED: {
    code: 'REGISTRATION_FAILED',
    message: 'Could not complete registration.',
  },
  VERIFICATION_EMAIL_FAILED: {
    code: 'VERIFICATION_EMAIL_FAILED',
    message: 'Could not send verification email.',
  },
  PASSWORD_RESET_EMAIL_FAILED: {
    code: 'PASSWORD_RESET_EMAIL_FAILED',
    message: 'Could not send password reset email.',
  },
  REFRESH_TOKEN_FAILED: {
    code: 'REFRESH_TOKEN_FAILED',
    message: 'Could not refresh access token.',
  },
} as const satisfies Record<string, AuthErrorBody>;
