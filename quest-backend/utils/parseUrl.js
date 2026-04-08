export function parseUrl(url) {
  // base потрібен, бо req.url = "/games?x=1" без домену
  const u = new URL(url, "http://localhost");
  return {
    pathname: u.pathname,     // "/games/1/"
    searchParams: u.searchParams, // query params
  };
}