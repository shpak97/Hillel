export {};

declare global {
  namespace PrismaJson {
    type UserMeta = {
      password: string;
    };
  }
}
