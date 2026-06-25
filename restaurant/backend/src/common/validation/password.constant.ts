/** Same length bounds as password reset; upper + lower (latin) + digit; no whitespace. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,20}$/;

export const PASSWORD_VALIDATION_MESSAGE =
  'Password must contain uppercase and lowercase Latin letters and at least one digit (8–20 characters).';
