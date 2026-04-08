import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, writeJson } from "../utils/fileStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.resolve(__dirname, "..", "data", "games.json");

export async function list() {
  const data = await readJson(DATA_FILE, []);
  return Array.isArray(data) ? data : [];
}

export async function getById(id) {
  const all = await list();
  return all.find((g) => String(g.id) === String(id)) ?? null;
}

export async function create(game) {
  const all = await list();
  all.push(game);
  await writeJson(DATA_FILE, all);
  return game;
}

export async function replace(id, game) {
  const all = await list();
  const idx = all.findIndex((g) => String(g.id) === String(id));
  if (idx === -1) return null;

  all[idx] = game;
  await writeJson(DATA_FILE, all);
  return game;
}

export async function remove(id) {
  const all = await list();
  const idx = all.findIndex((g) => String(g.id) === String(id));
  if (idx === -1) return false;

  all.splice(idx, 1);
  await writeJson(DATA_FILE, all);
  return true;
}