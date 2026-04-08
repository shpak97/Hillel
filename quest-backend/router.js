import { parseUrl } from "./utils/parseUrl.js";
import { sendJson } from "./utils/sendJson.js";
import { gamesRoutes } from "./routes/games.routes.js";

const routes = [
  ...gamesRoutes,
  // ...usersRoutes, ...playersRoutes, ...
];

export async function router(req, res) {
  const { method, url } = req;

  // нормалізуємо шлях: /games і /games/ -> однаково
  const { pathname } = parseUrl(url);

  // 1) знайти перший маршрут, який підходить по method + path
  for (const route of routes) {
    if (route.method !== method) continue;

    const match = matchPath(route.path, pathname);
    if (!match) continue;

    // 2) виклик handler(req, res, params)
    return route.handler(req, res, match.params);
  }

  // 3) якщо метод існує для цього path, але інший -> 405
  const hasPathButDifferentMethod = routes.some((r) => matchPath(r.path, pathname));
  if (hasPathButDifferentMethod) {
    return sendJson(res, 405, { error: "Method Not Allowed" });
  }

  // 4) інакше 404
  return sendJson(res, 404, { error: "Not Found" });
}

function matchPath(pattern, actualPath) {
  const pSeg = pattern.split('/').filter(Boolean);
  const aSeg = actualPath.split('/').filter(Boolean);

  if (pSeg.length !== aSeg.length) return null;

  const params = {};

  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(':')) {
      params[pSeg[i].slice(1)] = aSeg[i];
      continue;
    }

    if (pSeg[i] !== aSeg[i]) return null;
  }

  return { params };
}
