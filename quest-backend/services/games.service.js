import * as repo from "../repositories/games.repo.js";

export async function listGames() {
  return repo.list();
}

export async function getGameById(id) {
  return repo.getById(id);
}
export async function createGame(data) {
  const all = await repo.list();

  const maxId = all.length
    ? Math.max(...all.map(g => Number(g.id)))
    : 0;

  const newId = maxId + 1;

  const game = {
    id: String(newId),
    title: data.title,
    minPlayersCount: Number(data.minPlayersCount),
    maxPlayersCount: Number(data.maxPlayersCount),
    complexity: data.complexity,
    category: data.category,
    imageSmall: data.imageSmall,
    imageLarge: data.imageLarge,
    description: data.description,
    time: data.time,
  };

  await repo.create(game);
  return game;
}
export async function replaceGame(id, data) {
  const existing = await repo.getById(id);
  if (!existing) return null;

  // 🔥 перевірка повного набору полів
  const requiredFields = [
    "title",
    "minPlayersCount",
    "maxPlayersCount",
    "complexity",
    "category",
    "imageSmall",
    "imageLarge",
    "description",
    "time"
  ];

  for (const field of requiredFields) {
    if (data[field] === undefined) {
      throw new HttpError(400, `Field '${field}' is required for PUT`);
    }
  }

  if (data.minPlayersCount > data.maxPlayersCount) {
    throw new HttpError(400, "minPlayersCount cannot be greater than maxPlayersCount");
  }

  const replaced = {
    id,
    title: data.title,
    minPlayersCount: data.minPlayersCount,
    maxPlayersCount: data.maxPlayersCount,
    complexity: data.complexity,
    category: data.category,
    imageSmall: data.imageSmall,
    imageLarge: data.imageLarge,
    description: data.description,
    time: data.time,
  };

  await repo.replace(id, replaced);
  return replaced;
}

export async function updateGame(id, patch) {
  const existing = await repo.getById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...patch,
    id, // id міняти не можна
  };

  if (updated.minPlayersCount > updated.maxPlayersCount) {
    throw new HttpError(400, "minPlayersCount cannot be greater than maxPlayersCount");
  }

  await repo.replace(id, updated);
  return updated;
}

export async function deleteGame(id) {
  return repo.remove(id);
}

function generateId() {
  return "game_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}