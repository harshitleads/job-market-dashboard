import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const CACHE_DIR = "/tmp/fred-cache";
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true });
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const filePath = join(CACHE_DIR, `${key}.json`);
    const raw = await readFile(filePath, "utf-8");
    const entry: CacheEntry<T> = JSON.parse(raw);

    if (Date.now() - entry.timestamp > DEFAULT_TTL) {
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export async function setCached<T>(
  key: string,
  data: T,
  _ttlMs = DEFAULT_TTL
): Promise<void> {
  await ensureCacheDir();
  const filePath = join(CACHE_DIR, `${key}.json`);
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  await writeFile(filePath, JSON.stringify(entry));
}
