export const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL: 'email',
  PASSWORD_RESET: 'password_reset',
} as const;

export interface ITokenPayload {
  uid: string;
  type: (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];
}
