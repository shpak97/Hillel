export {};

declare global {
  namespace PrismaJson {
    type UserMeta = {
      password: string;
      accessToken?: string;
      emailVerified?: boolean;
      verifyEmailLastSentAt?: number;
      refreshToken?: string;
    };
  }
}
