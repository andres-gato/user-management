export function readJsonArray<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function writeJsonArray<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}
