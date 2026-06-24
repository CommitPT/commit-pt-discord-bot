const MIN_INTERVAL_MS = 5_000; // minimum 5 seconds between XP-earning messages

const lastMessageTimestamps = new Map<string, number>();

export function checkAndActivateCooldown(userId: string): boolean {
  const now = Date.now();
  const last = lastMessageTimestamps.get(userId) ?? 0;

  if (now - last < MIN_INTERVAL_MS) return false;

  lastMessageTimestamps.set(userId, now);
  return true;
}
