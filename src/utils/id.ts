export function randomId(prefix: string): string {
  const anyCrypto = globalThis.crypto as
    | undefined
    | { randomUUID?: () => string };
  if (anyCrypto?.randomUUID) return `${prefix}_${anyCrypto.randomUUID()}`;
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
