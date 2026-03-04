import { sendJson } from "../utils/sendJson.js";
import { readJsonBody } from "../utils/readBody.js";
import * as gamesService from "../services/games.service.js";

/**
 * GET /games
 */
export async function listGames(req, res) {
  const games = await gamesService.listGames();
  return sendJson(res, 200, { data: games });
}

/**
 * GET /games/:id
 */
export async function getGameById(req, res, params) {
  const game = await gamesService.getGameById(params.id);
  if (!game) return sendJson(res, 404, { error: "Game not found" });

  return sendJson(res, 200, { data: game });
}

/**
 * POST /games
 */
export async function createGame(req, res) {
  const body = await readJsonBody(req);

  // Заглушкова валідація
  if (!body?.title) return sendJson(res, 400, { error: "Field 'title' is required" });

  const created = await gamesService.createGame(body);
  // 201 + Location — гарна практика
  res.setHeader("Location", `/games/${created.id}`);
  return sendJson(res, 201, { data: created });
}

/**
 * PUT /games/:id (повна заміна)
 */
export async function replaceGame(req, res, params) {
  const body = await readJsonBody(req);

  // Для PUT зазвичай очікуємо “повний” об’єкт (у нас мінімум title)
  if (!body?.title) return sendJson(res, 400, { error: "Field 'title' is required" });

  const updated = await gamesService.replaceGame(params.id, body);
  if (!updated) return sendJson(res, 404, { error: "Game not found" });

  return sendJson(res, 200, { data: updated });
}

/**
 * PATCH /games/:id (часткова заміна)
 */
export async function updateGame(req, res, params) {
  const patch = await readJsonBody(req);

  if (!patch || typeof patch !== "object") {
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

  const updated = await gamesService.updateGame(params.id, patch);
  if (!updated) return sendJson(res, 404, { error: "Game not found" });

  return sendJson(res, 200, { data: updated });
}

/**
 * DELETE /games/:id
 */
export async function deleteGame(req, res, params) {
  const ok = await gamesService.deleteGame(params.id);
  if (!ok) return sendJson(res, 404, { error: "Game not found" });

  // 204 = без тіла
  res.statusCode = 204;
  res.end();
}