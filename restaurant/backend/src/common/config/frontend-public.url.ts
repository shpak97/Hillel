export function getFrontendPublicUrl(): string {
  const baseUrl = process.env.FRONTEND_PUBLIC_URL?.trim();

  if (!baseUrl) {
    throw new Error('FRONTEND_PUBLIC_URL environment variable is required');
  }

  return baseUrl.replace(/\/$/, '');
}
