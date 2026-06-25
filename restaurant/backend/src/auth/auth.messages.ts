export const AUTH_MESSAGES = {
  EMAIL_VERIFICATION_SENT:
    'If the account exists and the email is not yet verified, a verification email will be sent.',
  PASSWORD_RESET_SENT:
    'If the account exists, a password reset email will be sent.',
  EMAIL_VERIFICATION_SUBJECT: 'Verify your email',
  PASSWORD_RESET_SUBJECT: 'Reset your password',
} as const;

export function buildEmailVerificationHtml(verifyUrl: string): string {
  return `<p>Confirm your email using this link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
}

export function buildPasswordResetHtml(resetUrl: string): string {
  return `<p>To set a new password, follow this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>The link is valid for 1 hour.</p>`;
}
