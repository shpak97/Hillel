import fs from "node:fs/promises";
import path from "node:path";

export async function ensureJsonFile(filePath, defaultValue = []) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
  }
}

export async function readJson(filePath, defaultValue = []) {
  await ensureJsonFile(filePath, defaultValue);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw); 
}

export async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}